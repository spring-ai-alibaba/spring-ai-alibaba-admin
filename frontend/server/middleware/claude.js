const { spawn } = require('child_process');


async function callClaudeHeadless(diffIdSet, prompt, inspPath, projectRoot = __dirname) {
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

module.exports = {
  callClaudeHeadless
};
