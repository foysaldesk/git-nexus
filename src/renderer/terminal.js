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

    // Copy & Paste setup (Keyboard shortcuts, Right-click Context Menu, Middle click)
    this.setupCopyPaste();

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
      this.terminal.reset();
      if (window.api && window.api.clearTerminal) {
        window.api.clearTerminal();
      } else if (window.api && window.api.writeTerminal) {
        window.api.writeTerminal('\x0c');
      }
      this.focus();
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

  setupCopyPaste() {
    if (!this.terminal || !this.container) return;
    const term = this.terminal;
    const viewportEl = this.container;

    // 1. Keyboard Copy & Paste Shortcuts
    term.attachCustomKeyEventHandler((event) => {
      // Preserve Tab key handling
      if (event.key === 'Tab' && event.type === 'keydown') {
        window.api.writeTerminal('\t');
        event.preventDefault();
        return false;
      }

      if (event.type === 'keydown') {
        const isCtrlOrCmd = event.ctrlKey || event.metaKey;
        const keyLower = event.key.toLowerCase();

        // Copy: Ctrl+C / Cmd+C / Ctrl+Shift+C / Cmd+Shift+C
        if (isCtrlOrCmd && keyLower === 'c') {
          if (term.hasSelection()) {
            const selection = term.getSelection();
            if (selection) {
              navigator.clipboard.writeText(selection);
            }
            event.preventDefault();
            return false; // Suppress SIGINT interrupt signal when copying text
          } else if (event.shiftKey) {
            event.preventDefault();
            return false;
          }
          // If no selection and plain Ctrl+C, let xterm send SIGINT (\x03)
          return true;
        }

        // Paste: Ctrl+V / Cmd+V / Ctrl+Shift+V / Cmd+Shift+V
        if (isCtrlOrCmd && keyLower === 'v') {
          event.preventDefault();
          navigator.clipboard.readText().then((text) => {
            if (text) {
              window.api.writeTerminal(text);
            }
          }).catch((err) => {
            console.error('Clipboard paste failed:', err);
          });
          return false;
        }
      }

      return true;
    });

    // 2. Right-Click Context Menu & Auto-Copy on Right Click
    viewportEl.addEventListener('contextmenu', (e) => {
      e.preventDefault();

      // Auto-copy selection if text is selected when right clicking
      if (term.hasSelection()) {
        const selectedText = term.getSelection();
        if (selectedText) {
          navigator.clipboard.writeText(selectedText);
        }
      }

      const menu = this.getOrCreateContextMenu();
      const btnCopy = menu.querySelector('#ctx-term-copy');
      const btnPaste = menu.querySelector('#ctx-term-paste');
      const btnSelectAll = menu.querySelector('#ctx-term-select-all');
      const btnClear = menu.querySelector('#ctx-term-clear');

      btnCopy.disabled = !term.hasSelection();

      btnCopy.onclick = () => {
        if (term.hasSelection()) {
          navigator.clipboard.writeText(term.getSelection());
        }
        menu.classList.remove('open');
        term.focus();
      };

      btnPaste.onclick = () => {
        menu.classList.remove('open');
        navigator.clipboard.readText().then((text) => {
          if (text) {
            window.api.writeTerminal(text);
          }
        }).catch((err) => console.error(err));
        term.focus();
      };

      btnSelectAll.onclick = () => {
        menu.classList.remove('open');
        term.selectAll();
        term.focus();
      };

      btnClear.onclick = () => {
        menu.classList.remove('open');
        this.clear();
        term.focus();
      };

      menu.classList.add('open');

      const menuWidth = menu.offsetWidth || 175;
      const menuHeight = menu.offsetHeight || 140;
      let x = e.clientX;
      let y = e.clientY;

      if (x + menuWidth > window.innerWidth) {
        x = window.innerWidth - menuWidth - 8;
      }
      if (y + menuHeight > window.innerHeight) {
        y = window.innerHeight - menuHeight - 8;
      }

      menu.style.left = `${Math.max(5, x)}px`;
      menu.style.top = `${Math.max(5, y)}px`;
    });

    // 3. Middle-Click Paste
    viewportEl.addEventListener('auxclick', (e) => {
      if (e.button === 1) { // Middle mouse button
        e.preventDefault();
        navigator.clipboard.readText().then((text) => {
          if (text) {
            window.api.writeTerminal(text);
          }
        }).catch((err) => console.error(err));
      }
    });
  }

  getOrCreateContextMenu() {
    let menu = document.getElementById('terminal-context-menu');
    if (!menu) {
      menu = document.createElement('div');
      menu.id = 'terminal-context-menu';
      menu.className = 'terminal-context-menu';
      menu.innerHTML = `
        <button class="context-menu-item" id="ctx-term-copy">
          <span>📋 Copy</span>
          <span class="context-menu-shortcut">Ctrl+C</span>
        </button>
        <button class="context-menu-item" id="ctx-term-paste">
          <span>📥 Paste</span>
          <span class="context-menu-shortcut">Ctrl+V</span>
        </button>
        <div class="context-menu-divider"></div>
        <button class="context-menu-item" id="ctx-term-select-all">
          <span>🔍 Select All</span>
        </button>
        <button class="context-menu-item" id="ctx-term-clear">
          <span>🧹 Clear Terminal</span>
        </button>
      `;
      document.body.appendChild(menu);

      document.addEventListener('click', (e) => {
        if (!menu.contains(e.target)) {
          menu.classList.remove('open');
        }
      });

      window.addEventListener('resize', () => menu.classList.remove('open'));
    }
    return menu;
  }
}

window.TerminalManager = TerminalManager;
