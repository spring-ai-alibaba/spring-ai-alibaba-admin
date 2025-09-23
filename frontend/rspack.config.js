const rspack = require('@rspack/core');
const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const fs = require('fs');
const { spawn } = require('child_process');
const htmlFile = path.resolve(__dirname, "./index.html");
const { codeInspectorPlugin } = require('code-inspector-plugin');
const withAI = require('./server/middleware/router');

const entryFile = path.resolve(__dirname, "./src/index.jsx");
// 将 node_modules/_pseudomap@1.0.2@pseudomap/map.js 内容改为 module.exports = require('./pseudomap')

// Claude 无头模式调用函数
async function callClaudeHeadless(prompt, inspPath, projectRoot = __dirname) {
  return new Promise((resolve, reject) => {
    console.log('🤖 Calling Claude with:', {
      prompt: prompt.substring(0, 100) + '...',
      inspPath,
      projectRoot
    });

    // 如果有 inspPath，添加到提示词中
    const fullPrompt = inspPath
      ? `${prompt}\n\n关注文件路径: ${inspPath}`
      : prompt;

    console.log('📝 Full prompt:', fullPrompt.substring(0, 200) + '...');

    // 构建命令参数
    const args = ['-p', projectRoot, '--permission-mode', 'bypassPermissions'];
    console.log('🚀 Spawning claude with args:', args);
    console.log('📂 Working directory:', projectRoot);

    const claudeProcess = spawn('claude', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: projectRoot,
      env: {
        ...process.env,
        ANTHROPIC_BASE_URL: 'https://dashscope.aliyuncs.com/api/v2/apps/claude-code-proxy'
      },
      shell: false
    });

    // 设置超时处理
    const timeout = setTimeout(() => {
      console.log('⏰ Claude process timeout, killing...');
      claudeProcess.kill('SIGTERM');
      reject({
        success: false,
        error: 'Process timeout after 30 seconds',
        code: -2
      });
    }, 100000); // 100秒超时

    let stdout = '';
    let stderr = '';

    // 立即写入提示词到 stdin
    console.log('✍️ Writing prompt to claude stdin...');
    claudeProcess.stdin.write(fullPrompt);
    claudeProcess.stdin.end();

    if (!diffIdSet.has(true)) {
      diffIdSet.add(true)
    }
    claudeProcess.stdout.on('data', (data) => {
      const chunk = data.toString();
      console.log('📤 Claude stdout:', chunk.substring(0, 200));
      stdout += chunk;
    });

    claudeProcess.stderr.on('data', (data) => {
      const chunk = data.toString();
      console.log('📤 Claude stderr:', chunk.substring(0, 200));
      stderr += chunk;
    });

    claudeProcess.on('spawn', () => {
      console.log('✅ Claude process spawned successfully');
    });

    claudeProcess.on('error', (err) => {
      clearTimeout(timeout);
      console.error('❌ Failed to start Claude process:', err);
      reject({
        success: false,
        error: `Failed to start claude: ${err.message}. Make sure claude command is available in PATH.`,
        code: -1
      });
    });

    claudeProcess.on('close', (code, signal) => {
      clearTimeout(timeout);
      console.log(`🏁 Claude process closed with code: ${code}, signal: ${signal}`);
      if (code === 0) {
        console.log('✅ Claude execution completed successfully');
        resolve({
          success: true,
          output: stdout,
          error: stderr,
          code: code
        });
      } else {
        console.error('❌ Claude execution failed with code:', code);
        reject({
          success: false,
          error: stderr || `Process exited with code ${code}`,
          output: stdout,
          code: code
        });
      }
    });

    claudeProcess.on('exit', (code, signal) => {
      console.log(`🚪 Claude process exited with code: ${code}, signal: ${signal}`);
    });
  });
}

const diffIdSet = new Set();

/**
 * @type {import('@rspack/core').Configuration}
 */
module.exports = {
  target: 'web',
  entry: {
    main: entryFile,
  },
  experiments: {
    css: true
  },
  // module: {
  //   parser: {
  //     'css/auto': {
  //       namedExports: false,
  //     },
  //   },
  // },
  resolve: {
    extensions: ["...", '.tsx', '.ts', '.js', '.jsx', '.d.ts'],
  },
  devServer: {
    client: {
      overlay: false,
    },
    allowedHosts: 'all',
    proxy: [
      {
        context: ["/api"],
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
      }
    ],
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('@rspack/dev-server is not defined');
      }

      withAI(devServer, __dirname);

      return middlewares;
    },
  },
  plugins: [
    new rspack.HtmlRspackPlugin({
      template: htmlFile,
    }),
    new NodePolyfillPlugin(),
    codeInspectorPlugin({
      bundler: "rspack",
    }),
    new rspack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
      'process.platform': JSON.stringify(process.platform),
    }),
  ],
  module: {
    parser: {
      'css/auto': {
        namedExports: false,
      },
    },
    rules: [
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        use: ['@svgr/webpack'],
      },
      {
        test: /\.css$/,
        use: ["postcss-loader"],
        type: "css",
      },
      {
        test: /\.(tsx?|jsx?)$/,
        exclude: [/node_modules/],
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            parser: {
              syntax: 'typescript',
              decorators: true,
              tsx: true,
            },
            transform: {
              react: {
                runtime: "automatic",
              }
            }
          },
        },
        type: 'javascript/auto',
      }
    ],
  },
  ignoreWarnings: [/warning/, () => true],
};
