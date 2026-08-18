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
      fontFamily: 'Consolas, "Fira Code", monospace, "Segoe UI"',
      fontSize: 13,
      lineHeight: 1.2,
      theme: {
        background: '#0d1117',
        foreground: '#c9d1d9',
        cursor: '#58a6ff',
        cursorAccent: '#0d1117',
        selectionBackground: '#264f78',
        black: '#484f58',
        red: '#ff7b72',
        green: '#3fb950',
        yellow: '#d29922',
        blue: '#58a6ff',
        magenta: '#bc8cff',
        cyan: '#39c5cf',
        white: '#b1bac4',
        brightBlack: '#6e7681',
        brightRed: '#ffa198',
        brightGreen: '#56d364',
        brightYellow: '#e3b341',
        brightBlue: '#79c0ff',
        brightMagenta: '#d2a8ff',
        brightCyan: '#56d4dd',
        brightWhite: '#f0f6fc'
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
    if (!this.terminal) return;
    const isLight = themeName === 'light';
    this.terminal.options.theme = isLight
      ? {
          background: '#ffffff',
          foreground: '#24292f',
          cursor: '#0969da',
          cursorAccent: '#ffffff',
          selectionBackground: '#b6d7fe',
          black: '#24292f',
          red: '#cf222e',
          green: '#116329',
          yellow: '#4d2d00',
          blue: '#0969da',
          magenta: '#8250df',
          cyan: '#1b7c83',
          white: '#6e7781',
          brightBlack: '#57606a',
          brightRed: '#a40e26',
          brightGreen: '#1a7f37',
          brightYellow: '#633c01',
          brightBlue: '#218bff',
          brightMagenta: '#a475f9',
          brightCyan: '#3192aa',
          brightWhite: '#8c959f'
        }
      : {
          background: '#0d1117',
          foreground: '#c9d1d9',
          cursor: '#58a6ff',
          cursorAccent: '#0d1117',
          selectionBackground: '#264f78',
          black: '#484f58',
          red: '#ff7b72',
          green: '#3fb950',
          yellow: '#d29922',
          blue: '#58a6ff',
          magenta: '#bc8cff',
          cyan: '#39c5cf',
          white: '#b1bac4',
          brightBlack: '#6e7681',
          brightRed: '#ffa198',
          brightGreen: '#56d364',
          brightYellow: '#e3b341',
          brightBlue: '#79c0ff',
          brightMagenta: '#d2a8ff',
          brightCyan: '#56d4dd',
          brightWhite: '#f0f6fc'
        };
  }

  focus() {
    if (this.terminal) {
      this.terminal.focus();
    }
  }
}

window.TerminalManager = TerminalManager;
