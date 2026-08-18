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

class TerminalService {
  constructor() {
    this.currentCwd = process.cwd();
    this.sender = null;
    this.activeChild = null;
    this.history = [];
    this.historyIndex = -1;
    this.currentLine = '';
    this.cursorPos = 0;
  }

  init(windowOrWebContents) {
    if (!windowOrWebContents) return;
    if (windowOrWebContents.webContents) {
      this.sender = windowOrWebContents.webContents;
    } else {
      this.sender = windowOrWebContents;
    }
  }

  emitData(data) {
    if (!this.sender) return;
    try {
      if (!this.sender.isDestroyed()) {
        if (typeof this.sender.send === 'function') {
          this.sender.send('terminal:data', data);
        } else if (this.sender.webContents && typeof this.sender.webContents.send === 'function') {
          this.sender.webContents.send('terminal:data', data);
        }
      }
    } catch (e) {
      console.error('Failed to emit terminal data:', e);
    }
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

  getPrompt(withLeadingNewline = true) {
    const cleanPath = this.getCleanPath();
    const prefix = withLeadingNewline ? '\r\n' : '';
    return `${prefix}\x1b[1;34m${cleanPath}\x1b[0m\x1b[1;32m$\x1b[0m `;
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

  emitSuggestions(inputLine = '') {
    const trimmed = inputLine.trim();
    let suggestions = [];

    if (!trimmed || trimmed === 'g' || trimmed === 'gi' || trimmed === 'git') {
      suggestions = [
        { cmd: 'git status', label: 'git status', desc: 'Working tree status' },
        { cmd: 'git log --oneline -n 10', label: 'git log', desc: 'Recent commits' },
        { cmd: 'git branch -a', label: 'git branch', desc: 'List branches' },
        { cmd: 'git diff', label: 'git diff', desc: 'Inspect changes' },
        { cmd: 'git add .', label: 'git add .', desc: 'Stage all files' },
        { cmd: 'git commit -m ""', label: 'git commit', desc: 'Commit staged' },
        { cmd: 'git push origin', label: 'git push', desc: 'Push to remote' },
        { cmd: 'git pull origin', label: 'git pull', desc: 'Pull changes' },
        { cmd: 'git stash', label: 'git stash', desc: 'Save uncommitted work' }
      ];
    } else {
      const lower = trimmed.toLowerCase();
      
      // 1. Match from standard GIT_COMMANDS
      const cmdMatches = GIT_COMMANDS.filter(item => 
        item.cmd.toLowerCase().startsWith(lower) || item.cmd.toLowerCase().includes(lower)
      ).map(item => ({ cmd: item.cmd, label: item.cmd, desc: item.desc }));

      // 2. Branch contextual suggestions for branch operations
      const branchMatches = [];
      const branchKeywords = ['checkout', 'switch', 'merge', 'rebase', 'pull', 'push', 'branch'];
      if (branchKeywords.some(kw => lower.includes(kw))) {
        const branches = this.getRepoBranches();
        const parts = trimmed.split(/\s+/);
        const lastToken = parts.length > 2 ? parts[parts.length - 1] : '';
        const matchingBranches = branches.filter(b => !lastToken || b.toLowerCase().startsWith(lastToken.toLowerCase()));
        
        for (const b of matchingBranches.slice(0, 5)) {
          let fullCmd = parts.join(' ');
          if (lastToken) {
            fullCmd = parts.slice(0, -1).join(' ') + ' ' + b;
          } else {
            fullCmd = trimmed + (trimmed.endsWith(' ') ? '' : ' ') + b;
          }
          branchMatches.push({ cmd: fullCmd.trim(), label: b, desc: `Branch: ${b}` });
        }
      }

      suggestions = [...cmdMatches, ...branchMatches].slice(0, 10);
    }

    if (this.sender && !this.sender.isDestroyed()) {
      try {
        if (typeof this.sender.send === 'function') {
          this.sender.send('terminal:suggestions', suggestions);
        } else if (this.sender.webContents && typeof this.sender.webContents.send === 'function') {
          this.sender.webContents.send('terminal:suggestions', suggestions);
        }
      } catch (e) { /* ignore */ }
    }
  }

  startSession(cwd = process.cwd()) {
    this.killSession();
    this.currentCwd = cwd;
    this.currentLine = '';
    this.cursorPos = 0;
    this.historyIndex = this.history.length;

    const cleanPath = this.getCleanPath();

    // Clear previous screen to avoid duplicated prompt lines
    this.emitData(`\x1b[2J\x1b[H\x1b[1;34m${cleanPath}\x1b[0m\x1b[1;32m$\x1b[0m `);
    this.emitSuggestions('');

    return { success: true, cwd: this.currentCwd };
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
        // If a full command was sent by clicking a suggestion chip,
        // clear whatever partial line was currently typed on screen and in buffer
        if (this.currentLine) {
          let clearStr = '';
          if (this.cursorPos > 0) {
            clearStr += `\x1b[${this.cursorPos}D`;
          }
          clearStr += '\x1b[K';
          this.emitData(clearStr);
        }
        this.currentLine = incomingCmd;
        this.cursorPos = incomingCmd.length;
        this.emitData(incomingCmd);
      }

      const command = this.currentLine.trim();
      this.emitData('\r\n');

      if (command) {
        this.history.push(command);
        if (this.history.length > 200) this.history.shift();
        this.historyIndex = this.history.length;
        this.executeCommand(command);
      } else {
        this.emitData(this.getPrompt(false));
      }

      this.currentLine = '';
      this.cursorPos = 0;
      this.emitSuggestions('');
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
        this.emitSuggestions(this.currentLine);
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
        this.emitSuggestions(this.currentLine);
      }
      return;
    }

    // 4. Ctrl+C (\x03)
    if (data === '\x03') {
      this.currentLine = '';
      this.cursorPos = 0;
      this.historyIndex = this.history.length;
      this.emitData('^C' + this.getPrompt(true));
      this.emitSuggestions('');
      return;
    }

    // 5. Ctrl+L (\x0c) -> Clear screen
    if (data === '\x0c') {
      this.emitData(`\x1b[2J\x1b[H${this.getPrompt(false)}${this.currentLine}`);
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

    // 9. Right Arrow (\x1b[C) -> Autosuggestion completion if at end of line
    if (data === '\x1b[C') {
      if (this.cursorPos === this.currentLine.length && this.currentLine.trim()) {
        const match = GIT_COMMANDS.find(item => item.cmd.startsWith(this.currentLine.trim()));
        if (match && match.cmd !== this.currentLine) {
          this.replaceCurrentLine(match.cmd);
          return;
        }
      }

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

        this.emitSuggestions(this.currentLine);
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
    this.emitSuggestions(this.currentLine);
  }

  handleTabCompletion() {
    const current = this.currentLine.trim();
    if (!current) {
      // Show top git suggestions
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
        this.emitData(`${this.currentCwd}\r\n${this.getPrompt(false)}`);
        this.emitSuggestions('');
        return;
      }

      // Strip Windows /d flag and quotes
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
        // Ensure \n without \r is converted to \r\n for xterm cursor positioning
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

  setCwd(newCwd) {
    if (newCwd && fs.existsSync(newCwd)) {
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
