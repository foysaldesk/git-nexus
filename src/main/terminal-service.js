const { spawn } = require('child_process');
const os = require('os');
const path = require('path');

class TerminalService {
  constructor() {
    this.shellProcess = null;
    this.currentCwd = process.cwd();
    this.senderWindow = null;
  }

  init(window) {
    this.senderWindow = window;
  }

  startSession(cwd = process.cwd()) {
    this.killSession();
    this.currentCwd = cwd;

    const isWindows = process.platform === 'win32';
    // On Windows, use powershell.exe with UTF-8 encoding configured
    const shell = isWindows ? (process.env.COMSPEC || 'powershell.exe') : (process.env.SHELL || '/bin/bash');
    const args = isWindows ? ['-NoLogo'] : ['-i'];

    try {
      this.shellProcess = spawn(shell, args, {
        cwd: this.currentCwd,
        env: {
          ...process.env,
          TERM: 'xterm-256color',
          COLORTERM: 'truecolor'
        },
        shell: false
      });

      this.shellProcess.stdout.on('data', (data) => {
        if (this.senderWindow && !this.senderWindow.isDestroyed()) {
          this.senderWindow.webContents.send('terminal:data', data.toString());
        }
      });

      this.shellProcess.stderr.on('data', (data) => {
        if (this.senderWindow && !this.senderWindow.isDestroyed()) {
          this.senderWindow.webContents.send('terminal:data', data.toString());
        }
      });

      this.shellProcess.on('exit', (code) => {
        if (this.senderWindow && !this.senderWindow.isDestroyed()) {
          this.senderWindow.webContents.send('terminal:data', `\r\n[Process exited with code ${code}]\r\n`);
        }
      });

      this.shellProcess.on('error', (err) => {
        if (this.senderWindow && !this.senderWindow.isDestroyed()) {
          this.senderWindow.webContents.send('terminal:data', `\r\n[Terminal error: ${err.message}]\r\n`);
        }
      });

      return { success: true, cwd: this.currentCwd };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  write(data) {
    if (this.shellProcess && this.shellProcess.stdin && !this.shellProcess.stdin.destroyed) {
      try {
        this.shellProcess.stdin.write(data);
      } catch (err) {
        console.error('Failed to write to terminal process:', err);
      }
    }
  }

  setCwd(newCwd) {
    if (newCwd && newCwd !== this.currentCwd) {
      this.startSession(newCwd);
    }
  }

  killSession() {
    if (this.shellProcess) {
      try {
        this.shellProcess.kill();
      } catch (e) {
        // ignore
      }
      this.shellProcess = null;
    }
  }
}

module.exports = new TerminalService();
