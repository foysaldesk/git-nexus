// Ubuntu Dark Color Palette for xterm.js
const UBUNTU_THEME = {
  background: '#300a24',
  foreground: '#ffffff',
  cursor: '#ffffff',
  cursorAccent: '#300a24',
  selectionBackground: 'rgba(233, 84, 32, 0.45)',
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

class MultiTabTerminalManager {
  constructor() {
    this.tabs = [];
    this.activeTabId = null;
    this.tabCounter = 0;
    this.currentCwd = null;

    this.tabsListEl = document.getElementById('terminal-tabs-list');
    this.viewportsContainerEl = document.getElementById('standalone-terminal-container');
    this.chipsBarEl = document.getElementById('standalone-chips-bar');
    this.cwdBadgeEl = document.getElementById('terminal-cwd-badge');
    this.cwdTextEl = document.getElementById('terminal-cwd-text');
    this.btnAddTab = document.getElementById('btn-add-tab');
  }

  init() {
    // Initial Tab
    this.createTab();

    // Add Tab Button
    if (this.btnAddTab) {
      this.btnAddTab.addEventListener('click', () => this.createTab());
    }

    // Window Resize -> Fit all active terminals
    window.addEventListener('resize', () => {
      this.fitActive();
    });

    // Listen to IPC Data stream
    if (window.api.onTerminalData) {
      window.api.onTerminalData((payload) => {
        let tabId = 'tab-1';
        let data = payload;
        if (payload && typeof payload === 'object' && payload.data !== undefined) {
          tabId = payload.tabId || 'tab-1';
          data = payload.data;
        }

        const tab = this.tabs.find(t => t.id === tabId);
        if (tab && tab.term) {
          tab.term.write(data);
        }
      });
    }

    // Listen to IPC Suggestions stream
    if (window.api.onTerminalSuggestions) {
      window.api.onTerminalSuggestions((payload) => {
        let tabId = 'tab-1';
        let suggestions = payload;
        if (payload && typeof payload === 'object' && payload.suggestions !== undefined) {
          tabId = payload.tabId || 'tab-1';
          suggestions = payload.suggestions;
        }

        if (tabId === this.activeTabId && Array.isArray(suggestions)) {
          this.renderSuggestionChips(suggestions);
        }
      });
    }

    // Listen to Open New Tab request (e.g. from Windows Explorer context menu)
    if (window.api.onTerminalOpenNewTab) {
      window.api.onTerminalOpenNewTab((newCwd) => {
        if (newCwd) {
          const folderName = newCwd.split(/[\\/]/).filter(Boolean).pop() || newCwd;
          this.createTab(folderName, newCwd);
          this.setCwd(newCwd);
        }
      });
    }

    // Setup Global Shortcuts
    this.setupShortcuts();
  }

  createTab(title = null, initialCwd = null) {
    this.tabCounter++;
    const tabId = `tab-${this.tabCounter}`;
    const tabNumber = this.tabCounter;
    const tabTitle = title || `Terminal ${tabNumber}`;
    const cwd = initialCwd || this.currentCwd || null;

    // 1. Create Tab DOM Pill
    const tabEl = document.createElement('div');
    tabEl.className = 'term-tab';
    tabEl.setAttribute('data-tab-id', tabId);
    tabEl.innerHTML = `
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="4 17 10 11 4 5"></polyline>
        <line x1="12" y1="19" x2="20" y2="19"></line>
      </svg>
      <span class="term-tab-title" title="${tabTitle}">${tabTitle}</span>
      <button class="term-tab-close" title="Close Tab (Ctrl+W)">✕</button>
    `;

    // Tab Click Event
    tabEl.addEventListener('click', (e) => {
      if (e.target.closest('.term-tab-close')) return;
      this.switchTab(tabId);
    });

    // Close Tab Event
    const closeBtn = tabEl.querySelector('.term-tab-close');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeTab(tabId);
    });

    this.tabsListEl.appendChild(tabEl);

    // 2. Create Viewport Container
    const viewportEl = document.createElement('div');
    viewportEl.className = 'tab-viewport';
    viewportEl.id = `viewport-${tabId}`;
    this.viewportsContainerEl.appendChild(viewportEl);

    // 3. Initialize xterm.js instance
    const term = new Terminal({
      theme: UBUNTU_THEME,
      fontFamily: '"Ubuntu Mono", "Cascadia Code", "Fira Code", Consolas, "Courier New", monospace',
      fontSize: 13.5,
      lineHeight: 1.25,
      cursorBlink: true,
      cursorStyle: 'block',
      convertEol: true,
      scrollback: 5000,
      allowTransparency: true
    });

    const fitAddon = new FitAddon.FitAddon();
    term.loadAddon(fitAddon);
    term.open(viewportEl);

    // Keystroke input
    term.onData((data) => {
      window.api.writeTerminal(data, tabId);
    });

    // Store Tab Object
    const tabObj = {
      id: tabId,
      number: tabNumber,
      title: tabTitle,
      term,
      fitAddon,
      tabEl,
      viewportEl,
      cwd
    };

    this.tabs.push(tabObj);

    // Start Backend Session
    window.api.startTerminal(cwd, tabId);

    // Switch to new tab
    this.switchTab(tabId);

    return tabObj;
  }

  switchTab(tabId) {
    const targetTab = this.tabs.find(t => t.id === tabId);
    if (!targetTab) return;

    this.activeTabId = tabId;

    // Update Tab DOM states
    this.tabs.forEach(t => {
      if (t.id === tabId) {
        t.tabEl.classList.add('active');
        t.viewportEl.classList.add('active');
      } else {
        t.tabEl.classList.remove('active');
        t.viewportEl.classList.remove('active');
      }
    });

    // Auto scroll tab into view
    targetTab.tabEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });

    // Fit & Focus
    setTimeout(() => {
      targetTab.fitAddon.fit();
      targetTab.term.focus();
    }, 40);
  }

  closeTab(tabId) {
    const tabIndex = this.tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return;

    const tab = this.tabs[tabIndex];

    // If only 1 tab is open, close the external window
    if (this.tabs.length === 1) {
      window.api.closeTerminalWindow();
      return;
    }

    // Clean up DOM and xterm
    tab.tabEl.remove();
    tab.viewportEl.remove();
    try {
      tab.term.dispose();
    } catch (e) { /* ignore */ }

    // Tell backend to destroy child session
    window.api.closeTerminalTab(tabId);

    this.tabs.splice(tabIndex, 1);

    // If active tab was closed, switch to adjacent tab
    if (this.activeTabId === tabId) {
      const nextIndex = Math.min(tabIndex, this.tabs.length - 1);
      if (this.tabs[nextIndex]) {
        this.switchTab(this.tabs[nextIndex].id);
      }
    }
  }

  nextTab() {
    if (this.tabs.length <= 1) return;
    const currentIndex = this.tabs.findIndex(t => t.id === this.activeTabId);
    const nextIndex = (currentIndex + 1) % this.tabs.length;
    this.switchTab(this.tabs[nextIndex].id);
  }

  prevTab() {
    if (this.tabs.length <= 1) return;
    const currentIndex = this.tabs.findIndex(t => t.id === this.activeTabId);
    const prevIndex = (currentIndex - 1 + this.tabs.length) % this.tabs.length;
    this.switchTab(this.tabs[prevIndex].id);
  }

  switchToTabIndex(index) {
    if (index >= 0 && index < this.tabs.length) {
      this.switchTab(this.tabs[index].id);
    }
  }

  fitActive() {
    const activeTab = this.tabs.find(t => t.id === this.activeTabId);
    if (activeTab && activeTab.fitAddon) {
      try {
        activeTab.fitAddon.fit();
      } catch (e) { /* ignore */ }
    }
  }

  sendQuickCommand(cmd) {
    if (!this.activeTabId) return;
    window.api.writeTerminal(cmd + '\r', this.activeTabId);
    const activeTab = this.tabs.find(t => t.id === this.activeTabId);
    if (activeTab) {
      activeTab.term.focus();
    }
  }

  clearActive() {
    if (!this.activeTabId) return;
    window.api.clearTerminal(this.activeTabId);
    const activeTab = this.tabs.find(t => t.id === this.activeTabId);
    if (activeTab) {
      activeTab.term.focus();
    }
  }

  setCwd(repoPath) {
    this.currentCwd = repoPath;
    if (repoPath) {
      const folderName = repoPath.split(/[\\/]/).filter(Boolean).pop() || repoPath;
      if (this.cwdTextEl) this.cwdTextEl.textContent = folderName;
      if (this.cwdBadgeEl) this.cwdBadgeEl.title = repoPath;
      document.title = `Git Nexus Terminal - ${repoPath}`;
    }
  }

  renderSuggestionChips(suggestions) {
    if (!this.chipsBarEl) return;
    this.chipsBarEl.innerHTML = '';
    suggestions.forEach(item => {
      const chip = document.createElement('button');
      chip.className = 'cmd-chip ubuntu-chip';
      chip.setAttribute('data-cmd', item.cmd);
      chip.title = item.desc || item.cmd;
      chip.textContent = item.label || item.cmd;
      chip.addEventListener('click', () => {
        this.sendQuickCommand(item.cmd);
      });
      this.chipsBarEl.appendChild(chip);
    });
  }

  setupShortcuts() {
    window.addEventListener('keydown', (e) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // 1. New Tab: Ctrl+T or Ctrl+Shift+T
      if (isCtrlOrMeta && e.key.toLowerCase() === 't') {
        e.preventDefault();
        this.createTab();
        return;
      }

      // 2. Close Tab: Ctrl+W or Ctrl+Shift+W
      if (isCtrlOrMeta && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        if (this.activeTabId) {
          this.closeTab(this.activeTabId);
        }
        return;
      }

      // 3. Tab Switching: Ctrl+Tab (next) / Ctrl+Shift+Tab (prev)
      if (isCtrlOrMeta && e.key === 'Tab') {
        e.preventDefault();
        if (e.shiftKey) {
          this.prevTab();
        } else {
          this.nextTab();
        }
        return;
      }

      // 4. Tab Switching with PageUp / PageDown
      if (isCtrlOrMeta && (e.key === 'PageDown' || e.key === 'pagedown')) {
        e.preventDefault();
        this.nextTab();
        return;
      }
      if (isCtrlOrMeta && (e.key === 'PageUp' || e.key === 'pageup')) {
        e.preventDefault();
        this.prevTab();
        return;
      }

      // 5. Direct tab switch: Ctrl+1 through Ctrl+9
      if (isCtrlOrMeta && !e.shiftKey && e.key >= '1' && e.key <= '9') {
        const num = parseInt(e.key, 10);
        if (num > 0 && num <= this.tabs.length) {
          e.preventDefault();
          this.switchToTabIndex(num - 1);
          return;
        }
      }
    });
  }
}

// Initialise Controller on DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
  const manager = new MultiTabTerminalManager();
  manager.init();

  // Read URL query params for initial cwd/repo
  const params = new URLSearchParams(window.location.search);
  const initialCwd = params.get('cwd') || null;
  if (initialCwd) {
    manager.setCwd(initialCwd);
  }

  // Header Actions
  const btnClear = document.getElementById('btn-standalone-clear');
  const btnPin = document.getElementById('btn-standalone-pin');
  const btnSystem = document.getElementById('btn-standalone-system-term');
  const systemMenu = document.getElementById('standalone-system-menu');
  const btnClose = document.getElementById('btn-standalone-close');

  // Clear Terminal
  if (btnClear) {
    btnClear.addEventListener('click', () => manager.clearActive());
  }

  // Pin Always-on-Top
  let isPinned = false;
  if (btnPin) {
    btnPin.addEventListener('click', async () => {
      isPinned = !isPinned;
      const res = await window.api.setAlwaysOnTop(isPinned);
      if (res && res.success) {
        btnPin.classList.toggle('pinned', isPinned);
        const pinText = document.getElementById('pin-text');
        if (pinText) pinText.textContent = isPinned ? 'Pinned' : 'Pin';
      }
    });
  }

  // System Terminals Dropdown
  if (btnSystem && systemMenu) {
    btnSystem.addEventListener('click', (e) => {
      e.stopPropagation();
      systemMenu.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!systemMenu.contains(e.target) && e.target !== btnSystem) {
        systemMenu.classList.remove('open');
      }
    });

    systemMenu.querySelectorAll('.system-term-item').forEach(item => {
      item.addEventListener('click', async () => {
        const type = item.getAttribute('data-type');
        systemMenu.classList.remove('open');
        await window.api.openSystemTerminal(manager.currentCwd, type);
      });
    });
  }

  // Close Window
  if (btnClose) {
    btnClose.addEventListener('click', async () => {
      await window.api.closeTerminalWindow();
    });
  }

  // Command chips click delegation
  document.querySelectorAll('.cmd-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const cmd = chip.getAttribute('data-cmd');
      if (cmd) manager.sendQuickCommand(cmd);
    });
  });
});
