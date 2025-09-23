const { callClaudeHeadless } = require('./claude');

const diffIdSet = new Set();

function withAI(devServer, projectRoot) {
  devServer.app.use('/_ai_coding', (req, res, next) => {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          req.body = JSON.parse(body);
          next();
        } catch (err) {
          res.status(400).json({ error: 'Invalid JSON' });
        }
      });
    } else {
      next();
    }
  });

  // Git diff 获取中间件 - 必须在其他路由之前
  devServer.app.get('/_ai_coding/diff', async (request, response) => {
    if (!diffIdSet.has(true)) {
      return response.json({
        success: true,
        message: 'No changes detected',
        files: [],
        hasChanges: false,
        needCheckDiff: false,
      });
    }
    try {
      console.log('📊 Getting git diff...');

      const { spawn } = require('child_process');

      // 获取 git diff
      const gitDiff = spawn('git', ['diff', '--name-status'], {
        cwd: projectRoot,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let diffOutput = '';
      let diffError = '';

      gitDiff.stdout.on('data', (data) => {
        diffOutput += data.toString();
      });

      gitDiff.stderr.on('data', (data) => {
        diffError += data.toString();
      });

      gitDiff.on('close', async (code) => {
        if (code !== 0) {
          console.error('❌ Git diff failed:', diffError);
          return response.status(500).json({
            success: false,
            error: diffError || 'Git diff command failed',
            code
          });
        }

        // 解析文件状态
        const files = diffOutput.trim().split('\n').filter(line => line.trim()).map(line => {
          const parts = line.trim().split('\t');
          const status = parts[0];
          const filename = parts[1];

          let statusText = '';
          switch (status[0]) {
            case 'M': statusText = 'Modified'; break;
            case 'A': statusText = 'Added'; break;
            case 'D': statusText = 'Deleted'; break;
            case 'R': statusText = 'Renamed'; break;
            case 'C': statusText = 'Copied'; break;
            default: statusText = 'Unknown';
          }

          return {
            status: status[0],
            statusText,
            filename
          };
        });

        if (files.length === 0) {
          return response.json({
            success: true,
            message: 'No changes detected',
            files: [],
            hasChanges: false
          });
        }

        // 获取每个文件的详细 diff
        const diffPromises = files.map(file => {
          return new Promise((resolve) => {
            const diffProcess = spawn('git', ['diff', 'HEAD', '--', file.filename], {
              cwd: projectRoot,
              stdio: ['pipe', 'pipe', 'pipe']
            });

            let diffContent = '';
            let diffErr = '';

            diffProcess.stdout.on('data', data => diffContent += data.toString());
            diffProcess.stderr.on('data', data => diffErr += data.toString());

            diffProcess.on('close', code => {
              if (code !== 0) {
                console.error(`Error getting diff for ${file.filename}: ${diffErr}`);
                resolve({ ...file, diff: `Error: ${diffErr}` });
              } else {
                resolve({ ...file, diff: diffContent });
              }
            });
          });
        });

        const filesWithDiff = await Promise.all(diffPromises);

        console.log(`✅ Found ${files.length} changed files with diffs`);

        response.json({
          success: true,
          files: filesWithDiff,
          hasChanges: files.length > 0,
          summary: {
            totalFiles: files.length,
            modified: files.filter(f => f.status === 'M').length,
            added: files.filter(f => f.status === 'A').length,
            deleted: files.filter(f => f.status === 'D').length
          }
        });
      });

    } catch (error) {
      console.error('❌ Git diff error:', error);
      response.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      });
    }
  });

  // Git revert file middleware
  devServer.app.post('/_ai_coding/revert', (request, response) => {
    try {
      const { filename } = request.body;

      if (!filename) {
        return response.status(400).json({
          success: false,
          error: 'Filename is required'
        });
      }

      console.log(`🔄 Reverting file: ${filename}`);

      const { spawn } = require('child_process');
      const revertProcess = spawn('git', ['checkout', 'HEAD', '--', filename], {
        cwd: projectRoot,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stderr = '';
      revertProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      revertProcess.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ Successfully reverted ${filename}`);
          response.json({
            success: true,
            message: `File ${filename} has been reverted.`
          });
        } else {
          console.error(`❌ Failed to revert ${filename}:`, stderr);
          response.status(500).json({
            success: false,
            error: stderr || `Failed to revert file with exit code ${code}`
          });
        }
      });

    } catch (error) {
      console.error('❌ Revert file error:', error);
      response.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      });
    }
  });

  // 新的 POST 处理 - AI Coding 功能
  devServer.app.post('/_ai_coding', async (request, response) => {
    try {
      const { prompt, inspPath, test } = request.body;

      if (!prompt) {
        return response.status(400).json({
          success: false,
          error: 'Prompt is required'
        });
      }

      console.log('📝 Received AI coding request:', {
        prompt: prompt.substring(0, 100) + '...',
        inspPath,
        test: test || false
      });

      // 测试模式：直接返回模拟结果
      if (test) {
        console.log('🧪 Test mode enabled, returning mock result');
        return response.json({
          success: true,
          output: `Mock response for prompt: "${prompt.substring(0, 50)}..."\nInspected path: ${inspPath}`,
          code: 0,
          test: true
        });
      }

      // 首先检查 claude 命令是否可用
      console.log('🔍 Checking if claude command is available...');
      const { spawn } = require('child_process');
      const checkProcess = spawn('which', ['claude'], { stdio: 'pipe' });

      checkProcess.on('close', async (code) => {
        if (code !== 0) {
          console.log('❌ Claude command not found in PATH');
          return response.status(500).json({
            success: false,
            error: 'Claude command not found. Please ensure claude is installed and available in PATH.',
            code: -1
          });
        }

        console.log('✅ Claude command found, proceeding with execution');

        try {
          // 调用 Claude 无头模式
          const result = await callClaudeHeadless(diffIdSet, prompt, inspPath, projectRoot);
          response.json(result);
        } catch (error) {
          console.error('❌ AI Coding error:', error);
          response.status(500).json({
            success: false,
            error: error.message || 'Internal server error',
            details: error.error || error,
            code: error.code || -1
          });
        }
      });

    } catch (error) {
      console.error('❌ AI Coding request error:', error);
      response.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
        details: error
      });
    }
  });
}

module.exports = withAI;
