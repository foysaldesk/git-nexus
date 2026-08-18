const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

class TerminalService {
  constructor() {
    this.currentCwd = process.cwd();
    this.senderWindow = null;
    this.activeChild = null;
    this.history = [];
    this.historyIndex = -1;
    this.currentLine = '';
    this.cursorPos = 0;
  }

  init(window) {
    this.senderWindow = window;
  }

  emitData(data) {
    if (this.senderWindow && !this.senderWindow.isDestroyed()) {
      this.senderWindow.webContents.send('terminal:data', data);
    }
  }

  getPrompt() {
    return `\r\n${this.currentCwd}>`;
  }

  startSession(cwd = process.cwd()) {
    this.killSession();
    this.currentCwd = cwd;
    this.currentLine = '';
    this.cursorPos = 0;
    this.historyIndex = this.history.length;

    // Send banner and initial prompt
    this.emitData(`\x1b[1;36mGit Nexus Terminal\x1b[0m [Interactive Shell]\r\n`);
    this.emitData(`Type commands or use quick action buttons above.\r\n`);
    this.emitData(`${this.currentCwd}>`);

    return { success: true, cwd: this.currentCwd };
  }

  write(data) {
    // If a command is actively running, pipe raw data directly to it
    if (this.activeChild) {
      if (data === '\x03') { // Ctrl+C: kill active process
        try {
          if (process.platform === 'win32') {
            spawn('taskkill', ['/pid', this.activeChild.pid.toString(), '/f', '/t']);
          } else {
            this.activeChild.kill('SIGINT');
          }
        } catch (e) {
          try { this.activeChild.kill(); } catch (err) { /* ignore */ }
        }
        return;
      }

      if (this.activeChild.stdin && !this.activeChild.stdin.destroyed) {
        try {
          this.activeChild.stdin.write(data);
        } catch (err) {
          console.error('Failed to write to child process:', err);
        }
      }
      return;
    }

    // Handle input at interactive prompt
    this.handleInteractiveInput(data);
  }

  handleInteractiveInput(data) {
    // 1. Enter key (\r or \n)
    if (data === '\r' || data === '\n' || data === '\r\n') {
      const command = this.currentLine.trim();
      this.emitData('\r\n');

      if (command) {
        this.history.push(command);
        if (this.history.length > 200) this.history.shift();
        this.historyIndex = this.history.length;
        this.executeCommand(command);
      } else {
        this.emitData(`${this.currentCwd}>`);
      }

      this.currentLine = '';
      this.cursorPos = 0;
      return;
    }

    // 2. Backspace key (\x7f or \x08)
    if (data === '\x7f' || data === '\x08') {
      if (this.cursorPos > 0) {
        const before = this.currentLine.slice(0, this.cursorPos - 1);
        const after = this.currentLine.slice(this.cursorPos);
        this.currentLine = before + after;
        this.cursorPos--;

        // Redraw remainder of line and position cursor back
        let redraw = '\b' + after + ' ';
        for (let i = 0; i <= after.length; i++) {
          redraw += '\b';
        }
        this.emitData(redraw);
      }
      return;
    }

    // 3. Delete key (\x1b[3~)
    if (data === '\x1b[3~') {
      if (this.cursorPos < this.currentLine.length) {
        const before = this.currentLine.slice(0, this.cursorPos);
        const after = this.currentLine.slice(this.cursorPos + 1);
        this.currentLine = before + after;

        let redraw = after + ' ';
        for (let i = 0; i <= after.length; i++) {
          redraw += '\b';
        }
        this.emitData(redraw);
      }
      return;
    }

    // 4. Ctrl+C (\x03)
    if (data === '\x03') {
      this.currentLine = '';
      this.cursorPos = 0;
      this.historyIndex = this.history.length;
      this.emitData(`^C\r\n${this.currentCwd}>`);
      return;
    }

    // 5. Ctrl+L (\x0c) -> Clear screen
    if (data === '\x0c') {
      this.emitData(`\x1b[2J\x1b[H${this.currentCwd}>${this.currentLine}`);
      return;
    }

    // 6. Up Arrow (\x1b[A) -> Previous history
    if (data === '\x1b[A') {
      if (this.history.length > 0 && this.historyIndex > 0) {
        this.historyIndex--;
        this.replaceCurrentLine(this.history[this.historyIndex]);
      }
      return;
    }

    // 7. Down Arrow (\x1b[B) -> Next history
    if (data === '\x1b[B') {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.replaceCurrentLine(this.history[this.historyIndex]);
      } else if (this.historyIndex === this.history.length - 1) {
        this.historyIndex = this.history.length;
        this.replaceCurrentLine('');
      }
      return;
    }

    // 8. Left Arrow (\x1b[D)
    if (data === '\x1b[D') {
      if (this.cursorPos > 0) {
        this.cursorPos--;
        this.emitData('\x1b[D');
      }
      return;
    }

    // 9. Right Arrow (\x1b[C)
    if (data === '\x1b[C') {
      if (this.cursorPos < this.currentLine.length) {
        this.cursorPos++;
        this.emitData('\x1b[C');
      }
      return;
    }

    // 10. Home key (\x1b[H or \x1b[1~)
    if (data === '\x1b[H' || data === '\x1b[1~') {
      if (this.cursorPos > 0) {
        this.emitData(`\x1b[${this.cursorPos}D`);
        this.cursorPos = 0;
      }
      return;
    }

    // 11. End key (\x1b[F or \x1b[4~)
    if (data === '\x1b[F' || data === '\x1b[4~') {
      const diff = this.currentLine.length - this.cursorPos;
      if (diff > 0) {
        this.emitData(`\x1b[${diff}C`);
        this.cursorPos = this.currentLine.length;
      }
      return;
    }

    // 12. Tab completion (\t)
    if (data === '\t') {
      this.handleTabCompletion();
      return;
    }

    // 13. Regular printable characters or pasted string
    if (data.length >= 1 && !data.startsWith('\x1b')) {
      // Filter out non-printable control chars except spaces
      const cleanData = data.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '');
      if (cleanData.length > 0) {
        const before = this.currentLine.slice(0, this.cursorPos);
        const after = this.currentLine.slice(this.cursorPos);
        this.currentLine = before + cleanData + after;
        this.cursorPos += cleanData.length;

        if (after.length === 0) {
          this.emitData(cleanData);
        } else {
          let redraw = cleanData + after;
          for (let i = 0; i < after.length; i++) {
            redraw += '\b';
          }
          this.emitData(redraw);
        }
      }
    }
  }

  replaceCurrentLine(newLine) {
    // Move cursor back to beginning of line
    let clearStr = '';
    if (this.cursorPos > 0) {
      clearStr += `\x1b[${this.cursorPos}D`;
    }
    // Clear to end of line
    clearStr += '\x1b[K';
    this.currentLine = newLine;
    this.cursorPos = newLine.length;
    this.emitData(clearStr + newLine);
  }

  handleTabCompletion() {
    const current = this.currentLine.trim();
    if (!current) return;

    try {
      const parts = current.split(/\s+/);
      const lastToken = parts[parts.length - 1];

      // Git subcommand completion
      if (parts.length === 2 && parts[0] === 'git') {
        const gitCommands = [
          'status', 'log', 'branch', 'checkout', 'commit', 'diff',
          'push', 'pull', 'fetch', 'merge', 'rebase', 'stash', 'remote',
          'reset', 'restore', 'tag', 'init', 'clone', 'add'
        ];
        const matches = gitCommands.filter(c => c.startsWith(lastToken));
        if (matches.length === 1) {
          const completed = current + matches[0].slice(lastToken.length) + ' ';
          this.replaceCurrentLine(completed);
          return;
        }
      }

      // File path completion in current directory
      const files = fs.readdirSync(this.currentCwd);
      const matches = files.filter(f => f.toLowerCase().startsWith(lastToken.toLowerCase()));
      if (matches.length === 1) {
        const completed = current + matches[0].slice(lastToken.length);
        this.replaceCurrentLine(completed);
      }
    } catch (e) {
      // ignore
    }
  }

  executeCommand(cmd) {
    const trimmed = cmd.trim();

    // 1. Built-in: cd
    if (/^cd(\s+.*)?$/i.test(trimmed)) {
      let target = trimmed.slice(2).trim();
      if (!target) {
        // print current directory
        this.emitData(`${this.currentCwd}\r\n${this.currentCwd}>`);
        return;
      }

      // Strip Windows /d flag and quotes
      target = target.replace(/^\/d\s+/i, '').replace(/^["']|["']$/g, '');
      const newPath = path.resolve(this.currentCwd, target);

      if (fs.existsSync(newPath) && fs.statSync(newPath).isDirectory()) {
        this.currentCwd = newPath;
      } else {
        this.emitData(`The system cannot find the path specified: ${target}\r\n`);
      }

      this.emitData(`${this.currentCwd}>`);
      return;
    }

    // 2. Built-in: Windows drive switch (e.g. D: or E:)
    if (/^[a-zA-Z]:$/.test(trimmed)) {
      const drive = trimmed.toUpperCase() + '\\';
      if (fs.existsSync(drive)) {
        this.currentCwd = drive;
      }
      this.emitData(`${this.currentCwd}>`);
      return;
    }

    // 3. Built-in: cls / clear
    if (trimmed.toLowerCase() === 'cls' || trimmed.toLowerCase() === 'clear') {
      this.emitData(`\x1b[2J\x1b[H${this.currentCwd}>`);
      return;
    }

    // 4. Built-in: exit
    if (trimmed.toLowerCase() === 'exit') {
      this.emitData(`Session reset.\r\n${this.currentCwd}>`);
      return;
    }

    // 5. Spawn external command with live streaming
    const isWindows = process.platform === 'win32';
    const shellCmd = isWindows ? 'cmd.exe' : '/bin/sh';
    const shellArgs = isWindows ? ['/d', '/s', '/c', cmd] : ['-c', cmd];

    try {
      this.activeChild = spawn(shellCmd, shellArgs, {
        cwd: this.currentCwd,
        env: {
          ...process.env,
          FORCE_COLOR: '1',
          TERM: 'xterm-256color'
        },
        windowsVerbatimArguments: true
      });

      this.activeChild.stdout.on('data', (d) => {
        // Ensure \n without \r is converted to \r\n for xterm cursor positioning
        const formatted = d.toString().replace(/\r?\n/g, '\r\n');
        this.emitData(formatted);
      });

      this.activeChild.stderr.on('data', (d) => {
        const formatted = d.toString().replace(/\r?\n/g, '\r\n');
        this.emitData(formatted);
      });

      this.activeChild.on('close', (code) => {
        this.activeChild = null;
        this.emitData(`${this.getPrompt()}`);
      });

      this.activeChild.on('error', (err) => {
        this.activeChild = null;
        this.emitData(`\r\nError executing command: ${err.message}\r\n${this.getPrompt()}`);
      });
    } catch (err) {
      this.activeChild = null;
      this.emitData(`\r\nExecution error: ${err.message}\r\n${this.getPrompt()}`);
    }
  }

  setCwd(newCwd) {
    if (newCwd && newCwd !== this.currentCwd && fs.existsSync(newCwd)) {
      this.startSession(newCwd);
    }
  }

  killSession() {
    if (this.activeChild) {
      try {
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', this.activeChild.pid.toString(), '/f', '/t']);
        } else {
          this.activeChild.kill('SIGINT');
        }
      } catch (e) {
        try { this.activeChild.kill(); } catch (err) { /* ignore */ }
      }
      this.activeChild = null;
    }
  }
}

module.exports = new TerminalService();
