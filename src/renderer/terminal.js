// Terminal Controller using xterm.js
class TerminalManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.terminal = null;
    this.fitAddon = null;
    this.isInitialized = false;
    this.unsubscribe = null;
  }

  init(initialCwd = null) {
    if (this.isInitialized || !this.container) return;

    if (typeof Terminal === 'undefined') {
      console.error('xterm library not loaded');
      return;
    }

    this.terminal = new Terminal({
      cursorBlink: true,
      cursorStyle: 'block',
      fontFamily: '"Ubuntu Mono", "DejaVu Sans Mono", Consolas, "Fira Code", monospace',
      fontSize: 13.5,
      lineHeight: 1.25,
      theme: {
        background: '#300a24',
        foreground: '#ffffff',
        cursor: '#ffffff',
        cursorAccent: '#300a24',
        selectionBackground: 'rgba(233, 84, 32, 0.5)',
        selectionForeground: '#ffffff',
        black: '#2e3436',
        red: '#cc0000',
        green: '#4e9a06',
        yellow: '#c4a000',
        blue: '#3465a4',
        magenta: '#75507b',
        cyan: '#06989a',
        white: '#d3d7cf',
        brightBlack: '#555753',
        brightRed: '#ef2929',
        brightGreen: '#8ae234',
        brightYellow: '#fce94f',
        brightBlue: '#729fcf',
        brightMagenta: '#ad7fa8',
        brightCyan: '#34e2e2',
        brightWhite: '#eeeeec'
      }
    });

    if (typeof FitAddon !== 'undefined' && FitAddon.FitAddon) {
      this.fitAddon = new FitAddon.FitAddon();
      this.terminal.loadAddon(this.fitAddon);
    }

    this.terminal.open(this.container);

    // Clicking anywhere in container focuses terminal
    this.container.addEventListener('click', () => {
      if (this.terminal) this.terminal.focus();
    });

    // Send user keystrokes to main process
    this.terminal.onData(data => {
      window.api.writeTerminal(data);
    });

    // Listen for terminal output from main process
    this.unsubscribe = window.api.onTerminalData(data => {
      this.terminal.write(data);
    });

    this.isInitialized = true;
    setTimeout(() => this.fit(), 50);

    // Explicitly start terminal session in main process
    window.api.startTerminal(initialCwd || undefined);

    window.addEventListener('resize', () => this.fit());
  }

  fit() {
    if (this.fitAddon && this.isInitialized && this.container.offsetHeight > 0) {
      try {
        this.fitAddon.fit();
      } catch (e) {
        // ignore resize during hidden
      }
    }
  }

  sendQuickCommand(cmd) {
    if (this.isInitialized) {
      window.api.writeTerminal(`${cmd}\r`);
    }
  }

  clear() {
    if (this.terminal) {
      this.terminal.clear();
    }
  }

  setTheme(themeName) {
    // Keep iconic Ubuntu Aubergine styling for all modes
    if (!this.terminal) return;
    this.terminal.options.theme = {
      background: '#300a24',
      foreground: '#ffffff',
      cursor: '#ffffff',
      cursorAccent: '#300a24',
      selectionBackground: 'rgba(233, 84, 32, 0.5)',
      selectionForeground: '#ffffff',
      black: '#2e3436',
      red: '#cc0000',
      green: '#4e9a06',
      yellow: '#c4a000',
      blue: '#3465a4',
      magenta: '#75507b',
      cyan: '#06989a',
      white: '#d3d7cf',
      brightBlack: '#555753',
      brightRed: '#ef2929',
      brightGreen: '#8ae234',
      brightYellow: '#fce94f',
      brightBlue: '#729fcf',
      brightMagenta: '#ad7fa8',
      brightCyan: '#34e2e2',
      brightWhite: '#eeeeec'
    };
  }

  focus() {
    if (this.terminal) {
      this.terminal.focus();
    }
  }
}

window.TerminalManager = TerminalManager;
