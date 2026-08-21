const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

const GIT_COMMANDS = [
  { cmd: 'git status', desc: 'Show working tree status' },
  { cmd: 'git log --oneline -n 10', desc: 'Compact commit history' },
  { cmd: 'git log --graph --oneline --all', desc: 'Visual branch commit graph' },
  { cmd: 'git branch -a', desc: 'List all local and remote branches' },
  { cmd: 'git branch -d', desc: 'Delete a local branch' },
  { cmd: 'git checkout', desc: 'Switch branch or restore working files' },
  { cmd: 'git checkout -b', desc: 'Create and switch to new branch' },
  { cmd: 'git switch', desc: 'Switch branches' },
  { cmd: 'git switch -c', desc: 'Create and switch to new branch' },
  { cmd: 'git add .', desc: 'Stage all modified and new files' },
  { cmd: 'git add -p', desc: 'Interactively select chunks to stage' },
  { cmd: 'git commit -m ""', desc: 'Commit staged changes with message' },
  { cmd: 'git commit --amend', desc: 'Amend previous commit' },
  { cmd: 'git push origin', desc: 'Push commits to remote origin' },
  { cmd: 'git push -u origin', desc: 'Push and set upstream tracking' },
  { cmd: 'git push --force-with-lease', desc: 'Safely force push to remote' },
  { cmd: 'git pull origin', desc: 'Pull and integrate changes from remote' },
  { cmd: 'git pull --rebase', desc: 'Pull and rebase local commits' },
  { cmd: 'git fetch --all --prune', desc: 'Fetch all remotes and prune branches' },
  { cmd: 'git merge', desc: 'Merge a branch into current branch' },
  { cmd: 'git merge --no-ff', desc: 'Merge creating explicit merge commit' },
  { cmd: 'git rebase', desc: 'Reapply commits onto another branch' },
  { cmd: 'git stash', desc: 'Save uncommitted changes to stash' },
  { cmd: 'git stash pop', desc: 'Apply and remove latest stash' },
  { cmd: 'git stash list', desc: 'List all stashed changes' },
  { cmd: 'git diff', desc: 'Show unstaged changes' },
  { cmd: 'git diff --staged', desc: 'Show staged changes' },
  { cmd: 'git remote -v', desc: 'List remote repository URLs' },
  { cmd: 'git reset HEAD~1', desc: 'Undo latest commit keeping changes' },
  { cmd: 'git reset --hard HEAD', desc: 'Discard all uncommitted changes' },
  { cmd: 'git restore .', desc: 'Discard all working directory changes' },
  { cmd: 'git restore --staged .', desc: 'Unstage all staged files' },
  { cmd: 'git cherry-pick', desc: 'Apply specific commit to current branch' },
  { cmd: 'git clean -fd', desc: 'Force remove untracked files & directories' },
  { cmd: 'git show HEAD', desc: 'Show details of latest commit' }
];

class TerminalSession {
  constructor(id, cwd, service) {
    this.id = id;
    this.currentCwd = cwd || process.cwd();
    this.service = service;
    this.activeChild = null;
    this.history = [];
    this.historyIndex = -1;
    this.currentLine = '';
    this.cursorPos = 0;
    this.currentGhostSuggestion = '';
  }

  emitData(data) {
    this.service.emitData(data, this.id);
  }

  emitSuggestions(suggestions) {
    this.service.emitSuggestions(suggestions, this.id);
  }

  getCleanPath() {
    let cleanPath = this.currentCwd.replace(/\\/g, '/');
    try {
      const userHome = os.homedir().replace(/\\/g, '/');
      if (cleanPath.toLowerCase().startsWith(userHome.toLowerCase())) {
        cleanPath = '~' + cleanPath.slice(userHome.length);
      }
    } catch (e) { /* ignore */ }
    return cleanPath;
  }

  getCurrentBranch() {
    try {
      const gitDir = path.join(this.currentCwd, '.git');
      if (fs.existsSync(gitDir)) {
        const headFile = path.join(gitDir, 'HEAD');
        if (fs.existsSync(headFile)) {
          const content = fs.readFileSync(headFile, 'utf8').trim();
          const match = content.match(/ref:\s*refs\/heads\/(.+)$/);
          if (match) {
            return match[1];
          }
          if (content.length >= 7) return content.slice(0, 7);
        }
      }
    } catch (e) { /* ignore */ }
    return '';
  }

  getPrompt(withLeadingNewline = true) {
    const cleanPath = this.getCleanPath();
    const branch = this.getCurrentBranch();
    const branchStr = branch ? ` \x1b[38;5;214m(${branch})\x1b[0m` : '';
    const prefix = withLeadingNewline ? '\r\n' : '';
    return `${prefix}\x1b[1;34m${cleanPath}\x1b[0m${branchStr}\x1b[1;32m$\x1b[0m `;
  }

  getRepoBranches() {
    const branches = [];
    try {
      const gitDir = path.join(this.currentCwd, '.git');
      if (fs.existsSync(gitDir)) {
        // Local heads
        const headsDir = path.join(gitDir, 'refs', 'heads');
        if (fs.existsSync(headsDir)) {
          const scanDir = (dir, prefix = '') => {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            for (const item of items) {
              if (item.isDirectory()) {
                scanDir(path.join(dir, item.name), `${prefix}${item.name}/`);
              } else {
                branches.push(`${prefix}${item.name}`);
              }
            }
          };
          scanDir(headsDir);
        }

        // Remotes
        const remotesDir = path.join(gitDir, 'refs', 'remotes');
        if (fs.existsSync(remotesDir)) {
          const scanDir = (dir, prefix = '') => {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            for (const item of items) {
              if (item.isDirectory()) {
                scanDir(path.join(dir, item.name), `${prefix}${item.name}/`);
              } else if (item.name !== 'HEAD') {
                branches.push(`${prefix}${item.name}`);
              }
            }
          };
          scanDir(remotesDir);
        }

        // Packed refs
        const packedRefs = path.join(gitDir, 'packed-refs');
        if (fs.existsSync(packedRefs)) {
          const lines = fs.readFileSync(packedRefs, 'utf8').split('\n');
          for (const line of lines) {
            const match = line.match(/refs\/(heads|remotes)\/(.+)$/);
            if (match && !branches.includes(match[2])) {
              branches.push(match[2]);
            }
          }
        }
      }
    } catch (e) { /* ignore */ }
    return Array.from(new Set(branches));
  }

  getGhostSuggestion(line) {
    if (!line || !line.trim()) return '';
    const trimmed = line;
    const lower = trimmed.toLowerCase();

    // 1. Match from history (newest to oldest)
    for (let i = this.history.length - 1; i >= 0; i--) {
      const h = this.history[i];
      if (h && h.toLowerCase().startsWith(lower) && h.length > line.length) {
        return line + h.slice(line.length);
      }
    }

    // 2. Match from GIT_COMMANDS
    for (const item of GIT_COMMANDS) {
      if (item.cmd.toLowerCase().startsWith(lower) && item.cmd.length > line.length) {
        return line + item.cmd.slice(line.length);
      }
    }

    // 3. Match from branches for branch operations
    const branchKeywords = ['checkout', 'switch', 'merge', 'rebase', 'pull', 'push', 'branch'];
    if (branchKeywords.some(kw => lower.includes(kw))) {
      const branches = this.getRepoBranches();
      const parts = line.split(/\s+/);
      const isTrailingSpace = line.endsWith(' ');
      const lastToken = isTrailingSpace ? '' : parts[parts.length - 1];

      for (const b of branches) {
        if (!lastToken || b.toLowerCase().startsWith(lastToken.toLowerCase())) {
          let fullCmd = '';
          if (isTrailingSpace) {
            fullCmd = line + b;
          } else {
            fullCmd = parts.slice(0, -1).join(' ') + (parts.length > 1 ? ' ' : '') + b;
          }
          if (fullCmd.length > line.length && fullCmd.toLowerCase().startsWith(lower)) {
            return line + fullCmd.slice(line.length);
          }
        }
      }
    }

    // 4. Match from repo files for file operations
    if (lower.startsWith('git add ') || lower.startsWith('git diff ') || lower.startsWith('git restore ') || lower.startsWith('cat ') || lower.startsWith('ls ')) {
      try {
        const parts = line.split(/\s+/);
        const isTrailingSpace = line.endsWith(' ');
        const lastToken = isTrailingSpace ? '' : parts[parts.length - 1];
        const files = fs.readdirSync(this.currentCwd);
        for (const f of files) {
          if (!lastToken || f.toLowerCase().startsWith(lastToken.toLowerCase())) {
            let fullCmd = '';
            if (isTrailingSpace) {
              fullCmd = line + f;
            } else {
              fullCmd = parts.slice(0, -1).join(' ') + (parts.length > 1 ? ' ' : '') + f;
            }
            if (fullCmd.length > line.length && fullCmd.toLowerCase().startsWith(lower)) {
              return line + fullCmd.slice(line.length);
            }
          }
        }
      } catch (e) { /* ignore */ }
    }

    return '';
  }

  renderLine(oldCursorPos = this.cursorPos) {
    let output = '';
    // Move cursor back to beginning of line
    if (oldCursorPos > 0) {
      output += `\x1b[${oldCursorPos}D`;
    }
    // Clear from cursor to end of screen line
    output += '\x1b[K';

    // Output current typed line in normal color
    output += this.currentLine;

    // Calculate ghost suggestion
    const ghostFull = this.getGhostSuggestion(this.currentLine);
    this.currentGhostSuggestion = ghostFull;
    let ghostSuffix = '';

    if (ghostFull && ghostFull.startsWith(this.currentLine) && ghostFull.length > this.currentLine.length) {
      ghostSuffix = ghostFull.slice(this.currentLine.length);
      output += `\x1b[90m${ghostSuffix}\x1b[0m`;
    }

    // Move cursor back to this.cursorPos
    const totalBack = ghostSuffix.length + (this.currentLine.length - this.cursorPos);
    if (totalBack > 0) {
      output += `\x1b[${totalBack}D`;
    }

    this.emitData(output);
    this.emitSuggestions(this.currentLine);
  }

  startSession(cwd = this.currentCwd) {
    this.killSession();
    this.currentCwd = cwd;
    this.currentLine = '';
    this.cursorPos = 0;
    this.currentGhostSuggestion = '';
    this.historyIndex = this.history.length;

    // Clear previous screen and print prompt
    this.emitData(`\x1b[2J\x1b[3J\x1b[H${this.getPrompt(false)}`);
    this.emitSuggestions('');

    return { success: true, cwd: this.currentCwd, tabId: this.id };
  }

  clearSession() {
    this.killSession();
    this.currentLine = '';
    this.cursorPos = 0;
    this.currentGhostSuggestion = '';
    this.historyIndex = this.history.length;
    this.emitData(`\x1b[2J\x1b[3J\x1b[H${this.getPrompt(false)}`);
    this.emitSuggestions('');
    return { success: true, tabId: this.id };
  }

  write(data) {
    if (this.activeChild) {
      if (this.activeChild.killed || this.activeChild.exitCode !== null) {
        this.activeChild = null;
      }
    }

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
        this.activeChild = null;
        this.emitData('^C' + this.getPrompt(true));
        this.emitSuggestions('');
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
    // 1. Enter key (\r or \n) or command string with trailing newline
    if (data === '\r' || data === '\n' || data === '\r\n' || data.endsWith('\r') || data.endsWith('\n')) {
      const incomingCmd = data.replace(/[\r\n]+$/, '');
      if (incomingCmd) {
        // Full command sent via chip click or shortcut
        if (this.cursorPos > 0) {
          this.emitData(`\x1b[${this.cursorPos}D`);
        }
        this.emitData('\x1b[K');
        this.currentLine = incomingCmd;
        this.cursorPos = incomingCmd.length;
        this.emitData(incomingCmd);
      }

      // Clear any ghost text sitting after typed text
      this.emitData('\x1b[K\r\n');

      const command = this.currentLine.trim();

      if (command) {
        this.history.push(command);
        if (this.history.length > 200) this.history.shift();
        this.historyIndex = this.history.length;
        this.executeCommand(command);
      } else {
        this.emitData(this.getPrompt(false));
        this.emitSuggestions('');
      }

      this.currentLine = '';
      this.cursorPos = 0;
      this.currentGhostSuggestion = '';
      return;
    }

    // 2. Backspace (\x7f or \x08)
    if (data === '\x7f' || data === '\x08') {
      if (this.cursorPos > 0) {
        const oldPos = this.cursorPos;
        this.currentLine = this.currentLine.slice(0, this.cursorPos - 1) + this.currentLine.slice(this.cursorPos);
        this.cursorPos--;
        this.renderLine(oldPos);
      }
      return;
    }

    // 3. Delete key (\x1b[3~)
    if (data === '\x1b[3~') {
      if (this.cursorPos < this.currentLine.length) {
        const oldPos = this.cursorPos;
        this.currentLine = this.currentLine.slice(0, this.cursorPos) + this.currentLine.slice(this.cursorPos + 1);
        this.renderLine(oldPos);
      }
      return;
    }

    // 4. Ctrl+C (\x03) -> Cancel current prompt line
    if (data === '\x03') {
      this.currentLine = '';
      this.cursorPos = 0;
      this.currentGhostSuggestion = '';
      this.emitData('^C' + this.getPrompt(true));
      this.emitSuggestions('');
      return;
    }

    // 5. Ctrl+L (\x0c) -> Clear Screen
    if (data === '\x0c') {
      this.emitData(`\x1b[2J\x1b[3J\x1b[H${this.getPrompt(false)}`);
      this.renderLine(0);
      return;
    }

    // 5b. Ctrl+U (\x15) -> Clear line from cursor to start
    if (data === '\x15') {
      if (this.cursorPos > 0) {
        const oldPos = this.cursorPos;
        this.currentLine = this.currentLine.slice(this.cursorPos);
        this.cursorPos = 0;
        this.renderLine(oldPos);
      }
      return;
    }

    // 5c. Ctrl+K (\x0b) -> Clear line from cursor to end
    if (data === '\x0b') {
      const oldPos = this.cursorPos;
      this.currentLine = this.currentLine.slice(0, this.cursorPos);
      this.renderLine(oldPos);
      return;
    }

    // 5d. Ctrl+W (\x17) -> Delete previous word
    if (data === '\x17') {
      if (this.cursorPos > 0) {
        const oldPos = this.cursorPos;
        const before = this.currentLine.slice(0, this.cursorPos);
        const match = before.match(/(\s*\S+|\s+)$/);
        const delLen = match ? match[0].length : 1;
        const newBefore = before.slice(0, before.length - delLen);
        const after = this.currentLine.slice(this.cursorPos);
        this.currentLine = newBefore + after;
        this.cursorPos -= delLen;
        this.renderLine(oldPos);
      }
      return;
    }

    // 6. Up Arrow (\x1b[A) -> Previous history
    if (data === '\x1b[A') {
      if (this.history.length > 0 && this.historyIndex > 0) {
        const oldPos = this.cursorPos;
        this.historyIndex--;
        this.currentLine = this.history[this.historyIndex];
        this.cursorPos = this.currentLine.length;
        this.renderLine(oldPos);
      }
      return;
    }

    // 7. Down Arrow (\x1b[B) -> Next history
    if (data === '\x1b[B') {
      const oldPos = this.cursorPos;
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.currentLine = this.history[this.historyIndex];
        this.cursorPos = this.currentLine.length;
        this.renderLine(oldPos);
      } else if (this.historyIndex === this.history.length - 1) {
        this.historyIndex = this.history.length;
        this.currentLine = '';
        this.cursorPos = 0;
        this.renderLine(oldPos);
      }
      return;
    }

    // 8. Left Arrow (\x1b[D)
    if (data === '\x1b[D') {
      if (this.cursorPos > 0) {
        const oldPos = this.cursorPos;
        this.cursorPos--;
        this.renderLine(oldPos);
      }
      return;
    }

    // 9. Right Arrow (\x1b[C) -> Accept ghost suggestion if at end
    if (data === '\x1b[C') {
      if (this.cursorPos === this.currentLine.length && this.currentGhostSuggestion && this.currentGhostSuggestion !== this.currentLine) {
        const oldPos = this.cursorPos;
        this.currentLine = this.currentGhostSuggestion;
        this.cursorPos = this.currentLine.length;
        this.renderLine(oldPos);
        return;
      }

      if (this.cursorPos < this.currentLine.length) {
        const oldPos = this.cursorPos;
        this.cursorPos++;
        this.renderLine(oldPos);
      }
      return;
    }

    // 10. Home key (\x1b[H or \x1b[1~)
    if (data === '\x1b[H' || data === '\x1b[1~') {
      if (this.cursorPos > 0) {
        const oldPos = this.cursorPos;
        this.cursorPos = 0;
        this.renderLine(oldPos);
      }
      return;
    }

    // 11. End key (\x1b[F or \x1b[4~)
    if (data === '\x1b[F' || data === '\x1b[4~') {
      if (this.cursorPos < this.currentLine.length) {
        const oldPos = this.cursorPos;
        this.cursorPos = this.currentLine.length;
        this.renderLine(oldPos);
      }
      return;
    }

    // 12. Tab completion (\t)
    if (data === '\t') {
      if (this.currentGhostSuggestion && this.currentGhostSuggestion !== this.currentLine) {
        const oldPos = this.cursorPos;
        this.currentLine = this.currentGhostSuggestion;
        this.cursorPos = this.currentLine.length;
        this.renderLine(oldPos);
        return;
      }

      this.handleTabCompletion();
      return;
    }

    // 13. Regular printable characters or pasted string
    if (data.length >= 1 && !data.startsWith('\x1b')) {
      const cleanData = data.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '');
      if (cleanData.length > 0) {
        const oldPos = this.cursorPos;
        const before = this.currentLine.slice(0, this.cursorPos);
        const after = this.currentLine.slice(this.cursorPos);
        this.currentLine = before + cleanData + after;
        this.cursorPos += cleanData.length;
        this.renderLine(oldPos);
      }
    }
  }

  replaceCurrentLine(newLine) {
    const oldPos = this.cursorPos;
    this.currentLine = newLine;
    this.cursorPos = newLine.length;
    this.renderLine(oldPos);
  }

  handleTabCompletion() {
    const current = this.currentLine.trim();
    if (!current) {
      this.emitData(`\r\n\x1b[1;36mGit Suggestions:\x1b[0m status, log, branch, checkout, commit, diff, push, pull, stash\r\n`);
      this.emitData(this.getPrompt(false) + this.currentLine);
      return;
    }

    try {
      const parts = current.split(/\s+/);
      const isTrailingSpace = this.currentLine.endsWith(' ');
      const token = isTrailingSpace ? '' : parts[parts.length - 1];

      // 1. Complete top-level git subcommands
      if (parts[0] === 'git' && (parts.length === 1 || (parts.length === 2 && !isTrailingSpace))) {
        const subcommands = [
          'status', 'log', 'branch', 'checkout', 'switch', 'commit', 'diff',
          'push', 'pull', 'fetch', 'merge', 'rebase', 'stash', 'remote',
          'reset', 'restore', 'cherry-pick', 'tag', 'init', 'clone', 'add', 'clean', 'show'
        ];
        const matches = subcommands.filter(c => c.startsWith(token));
        if (matches.length === 1) {
          this.replaceCurrentLine(`git ${matches[0]} `);
          return;
        } else if (matches.length > 1) {
          this.emitData(`\r\n\x1b[1;36mCompletions:\x1b[0m ${matches.join('   ')}\r\n`);
          this.emitData(this.getPrompt(false) + this.currentLine);
          return;
        }
      }

      // 2. Complete branch names for branch commands
      const branchKeywords = ['checkout', 'switch', 'merge', 'rebase', 'pull', 'push', 'branch'];
      if (parts.length >= 2 && branchKeywords.includes(parts[1])) {
        const branches = this.getRepoBranches();
        const matches = branches.filter(b => !token || b.startsWith(token));
        if (matches.length === 1) {
          const prefix = isTrailingSpace ? current : parts.slice(0, -1).join(' ');
          this.replaceCurrentLine(`${prefix} ${matches[0]} `);
          return;
        } else if (matches.length > 1) {
          this.emitData(`\r\n\x1b[1;33mBranches:\x1b[0m ${matches.join('   ')}\r\n`);
          this.emitData(this.getPrompt(false) + this.currentLine);
          return;
        }
      }

      // 3. Complete file paths in repository
      const files = fs.readdirSync(this.currentCwd);
      const matches = files.filter(f => f.toLowerCase().startsWith(token.toLowerCase()));
      if (matches.length === 1) {
        const prefix = isTrailingSpace ? current : parts.slice(0, -1).join(' ');
        this.replaceCurrentLine(`${prefix} ${matches[0]}`);
      } else if (matches.length > 1) {
        this.emitData(`\r\n\x1b[1;32mFiles:\x1b[0m ${matches.join('   ')}\r\n`);
        this.emitData(this.getPrompt(false) + this.currentLine);
      }
    } catch (e) { /* ignore */ }
  }

  executeCommand(cmd) {
    const trimmed = cmd.trim();

    // 1. Built-in: cd
    if (/^cd(\s+.*)?$/i.test(trimmed)) {
      let target = trimmed.slice(2).trim();
      if (!target) {
        this.emitData(`${this.currentCwd}\r\n${this.getPrompt(false)}`);
        this.emitSuggestions('');
        return;
      }

      target = target.replace(/^\/d\s+/i, '').replace(/^["']|["']$/g, '');
      const newPath = path.resolve(this.currentCwd, target);

      if (fs.existsSync(newPath) && fs.statSync(newPath).isDirectory()) {
        this.currentCwd = newPath;
      } else {
        this.emitData(`bash: cd: ${target}: No such file or directory\r\n`);
      }

      this.emitData(this.getPrompt(false));
      this.emitSuggestions('');
      return;
    }

    // 2. Built-in: Windows drive switch (e.g. D: or E:)
    if (/^[a-zA-Z]:$/.test(trimmed)) {
      const drive = trimmed.toUpperCase() + '\\';
      if (fs.existsSync(drive)) {
        this.currentCwd = drive;
      }
      this.emitData(this.getPrompt(false));
      this.emitSuggestions('');
      return;
    }

    // 3. Built-in: cls / clear
    if (trimmed.toLowerCase() === 'cls' || trimmed.toLowerCase() === 'clear') {
      this.emitData(`\x1b[2J\x1b[H${this.getPrompt(false)}`);
      this.emitSuggestions('');
      return;
    }

    // 4. Built-in: exit
    if (trimmed.toLowerCase() === 'exit') {
      this.emitData(`Session reset.\r\n${this.getPrompt(false)}`);
      this.emitSuggestions('');
      return;
    }

    // 5. Spawn external command with live streaming
    try {
      this.activeChild = spawn(cmd, [], {
        cwd: this.currentCwd,
        shell: true,
        env: {
          ...process.env,
          FORCE_COLOR: '1',
          TERM: 'xterm-256color'
        }
      });

      this.activeChild.stdout.on('data', (d) => {
        const formatted = d.toString().replace(/\r?\n/g, '\r\n');
        this.emitData(formatted);
      });

      this.activeChild.stderr.on('data', (d) => {
        const formatted = d.toString().replace(/\r?\n/g, '\r\n');
        this.emitData(formatted);
      });

      let closed = false;
      const onFinished = () => {
        if (closed) return;
        closed = true;
        this.activeChild = null;
        this.emitData(this.getPrompt(true));
        this.emitSuggestions('');
      };

      this.activeChild.on('close', onFinished);
      this.activeChild.on('exit', onFinished);

      this.activeChild.on('error', (err) => {
        if (closed) return;
        closed = true;
        this.activeChild = null;
        this.emitData(`\r\nError executing command: ${err.message}\r\n${this.getPrompt(true)}`);
        this.emitSuggestions('');
      });
    } catch (err) {
      this.activeChild = null;
      this.emitData(`\r\nExecution error: ${err.message}\r\n${this.getPrompt(true)}`);
      this.emitSuggestions('');
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

class TerminalService {
  constructor() {
    this.defaultCwd = process.cwd();
    this.senders = new Set();
    this.sessions = new Map(); // tabId -> TerminalSession
  }

  init(windowOrWebContents) {
    if (!windowOrWebContents) return;
    try {
      let wc = null;
      try {
        wc = windowOrWebContents.webContents || windowOrWebContents;
      } catch (e) {
        return;
      }
      if (wc && !wc.isDestroyed() && typeof wc.send === 'function') {
        this.senders.add(wc);
      }
    } catch (e) { /* ignore */ }
  }

  removeSender(windowOrWebContents) {
    if (!windowOrWebContents) return;
    try {
      let wc = null;
      try {
        wc = windowOrWebContents.webContents || windowOrWebContents;
      } catch (e) { /* window might already be destroyed */ }
      if (wc) {
        this.senders.delete(wc);
      }
    } catch (e) { /* ignore */ }
    this.cleanSenders();
  }

  cleanSenders() {
    for (const sender of Array.from(this.senders)) {
      try {
        if (!sender || sender.isDestroyed()) {
          this.senders.delete(sender);
        }
      } catch (e) {
        this.senders.delete(sender);
      }
    }
  }

  emitData(data, tabId = 'tab-1') {
    for (const sender of Array.from(this.senders)) {
      try {
        if (sender && !sender.isDestroyed() && typeof sender.send === 'function') {
          sender.send('terminal:data', { data, tabId });
        } else {
          this.senders.delete(sender);
        }
      } catch (e) {
        this.senders.delete(sender);
      }
    }
  }

  emitSuggestions(suggestions, tabId = 'tab-1') {
    for (const sender of Array.from(this.senders)) {
      try {
        if (sender && !sender.isDestroyed() && typeof sender.send === 'function') {
          sender.send('terminal:suggestions', { suggestions, tabId });
        } else {
          this.senders.delete(sender);
        }
      } catch (e) {
        this.senders.delete(sender);
      }
    }
  }

  getSession(tabId = 'tab-1', createIfMissing = true, initialCwd = null) {
    if (this.sessions.has(tabId)) {
      return this.sessions.get(tabId);
    }
    if (createIfMissing) {
      const cwd = initialCwd || this.defaultCwd || process.cwd();
      const session = new TerminalSession(tabId, cwd, this);
      this.sessions.set(tabId, session);
      return session;
    }
    return null;
  }

  startSession(cwd = this.defaultCwd, tabId = 'tab-1') {
    if (cwd) this.defaultCwd = cwd;
    let session = this.sessions.get(tabId);
    if (!session) {
      session = new TerminalSession(tabId, cwd || this.defaultCwd, this);
      this.sessions.set(tabId, session);
    }
    return session.startSession(cwd || this.defaultCwd);
  }

  clearSession(tabId = 'tab-1') {
    const session = this.getSession(tabId, false);
    if (session) {
      return session.clearSession();
    }
    return { success: true, tabId };
  }

  closeTab(tabId) {
    if (tabId && this.sessions.has(tabId)) {
      const session = this.sessions.get(tabId);
      session.killSession();
      this.sessions.delete(tabId);
      return { success: true, tabId };
    }
    return { success: false, error: 'Tab not found' };
  }

  write(data, tabId = 'tab-1') {
    const session = this.getSession(tabId, true);
    session.write(data);
  }

  setCwd(newCwd, tabId = null) {
    if (newCwd && fs.existsSync(newCwd)) {
      this.defaultCwd = newCwd;
      if (tabId) {
        const session = this.getSession(tabId, true, newCwd);
        session.startSession(newCwd);
      } else {
        // If tabId is not specified, update tab-1 or start it
        const session = this.getSession('tab-1', true, newCwd);
        session.startSession(newCwd);
      }
    }
  }

  openSystemTerminal(cwd = this.defaultCwd, terminalType = 'default') {
    const targetCwd = cwd || this.defaultCwd || process.cwd();
    const platform = process.platform;

    if (platform === 'win32') {
      if (terminalType === 'git-bash' || terminalType === 'default') {
        const gitBashCandidates = [
          path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Git', 'git-bash.exe'),
          path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'Git', 'git-bash.exe'),
          path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Git', 'git-bash.exe'),
          path.join(process.env.ProgramW6432 || 'C:\\Program Files', 'Git', 'git-bash.exe')
        ];

        let foundPath = null;
        for (const p of gitBashCandidates) {
          if (fs.existsSync(p)) {
            foundPath = p;
            break;
          }
        }

        if (!foundPath && terminalType === 'git-bash') {
          foundPath = 'git-bash.exe';
        }

        if (foundPath) {
          try {
            const child = spawn(foundPath, [`--cd=${targetCwd}`], {
              detached: true,
              stdio: 'ignore',
              windowsHide: false
            });
            child.unref();
            return { success: true, terminal: 'git-bash' };
          } catch (e) {
            if (terminalType === 'git-bash') {
              return { success: false, error: `Could not launch Git Bash: ${e.message}` };
            }
          }
        }
      }

      if (terminalType === 'wt') {
        try {
          const child = spawn('wt.exe', ['-d', targetCwd], {
            detached: true,
            stdio: 'ignore',
            windowsHide: false
          });
          child.unref();
          return { success: true, terminal: 'wt' };
        } catch (e) {
          if (terminalType === 'wt') {
            return { success: false, error: `Could not launch Windows Terminal: ${e.message}` };
          }
        }
      }

      if (terminalType === 'powershell' || terminalType === 'default') {
        try {
          const child = spawn('powershell.exe', ['-NoExit', '-Command', `Set-Location -LiteralPath '${targetCwd}'`], {
            detached: true,
            stdio: 'ignore',
            windowsHide: false
          });
          child.unref();
          return { success: true, terminal: 'powershell' };
        } catch (e) {
          // fallback to cmd
        }
      }

      try {
        const child = spawn('cmd.exe', ['/k', `cd /d "${targetCwd}"`], {
          detached: true,
          stdio: 'ignore',
          windowsHide: false
        });
        child.unref();
        return { success: true, terminal: 'cmd' };
      } catch (e) {
        return { success: false, error: e.message };
      }
    } else if (platform === 'darwin') {
      try {
        const child = spawn('open', ['-a', 'Terminal', targetCwd], {
          detached: true,
          stdio: 'ignore'
        });
        child.unref();
        return { success: true, terminal: 'Terminal.app' };
      } catch (e) {
        return { success: false, error: e.message };
      }
    } else {
      const terminals = ['x-terminal-emulator', 'gnome-terminal', 'konsole', 'xfce4-terminal', 'xterm'];
      for (const t of terminals) {
        try {
          const child = spawn(t, { cwd: targetCwd, detached: true, stdio: 'ignore' });
          child.unref();
          return { success: true, terminal: t };
        } catch (e) {
          // try next
        }
      }
      return { success: false, error: 'No suitable terminal found' };
    }
  }

  killSession() {
    for (const session of this.sessions.values()) {
      session.killSession();
    }
  }
}

module.exports = new TerminalService();
