const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const gitService = require('./git-service');
const terminalService = require('./terminal-service');
const contextMenuService = require('./context-menu-service');

// Set Application User Model ID for Windows
if (process.platform === 'win32') {
  app.setAppUserModelId('com.gitnexus.desktop');
}

let mainWindow = null;
let terminalWindow = null;

function getAssetPath(...relativePaths) {
  if (app.isPackaged) {
    const unpackedPath = path.join(process.resourcesPath, 'app.asar.unpacked', ...relativePaths);
    if (fs.existsSync(unpackedPath)) {
      return unpackedPath;
    }
  }
  return path.join(__dirname, '../../', ...relativePaths);
}

function parseLaunchArgs(argv) {
  let isTerminalLaunch = false;
  let targetPath = null;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--terminal' || arg === '-t') {
      isTerminalLaunch = true;
      if (i + 1 < argv.length && !argv[i + 1].startsWith('-')) {
        targetPath = argv[i + 1];
      }
    } else if (typeof arg === 'string' && arg.startsWith('--terminal=')) {
      isTerminalLaunch = true;
      targetPath = arg.split('=')[1];
    } else if (i > 0 && typeof arg === 'string' && !arg.startsWith('-') && !arg.includes('node_modules') && !arg.endsWith('git-manager') && !arg.endsWith('.js') && !arg.endsWith('.json')) {
      try {
        if (fs.existsSync(arg) && fs.statSync(arg).isDirectory()) {
          targetPath = arg;
        }
      } catch (e) {}
    }
  }

  return { isTerminalLaunch, targetPath };
}

function createWindow(initialRepoPath = null) {
  // Disable default menu bar
  Menu.setApplicationMenu(null);

  const iconPath = process.platform === 'win32'
    ? getAssetPath('assets', 'icon.ico')
    : getAssetPath('assets', 'icon.png');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 960,
    minHeight: 600,
    icon: iconPath,
    autoHideMenuBar: true,
    backgroundColor: '#011c46ff',
    title: 'Git Nexus - Repository Manager',
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  if (process.platform === 'win32') {
    mainWindow.setAppDetails({
      appId: 'com.gitnexus.desktop',
      appIconPath: iconPath,
      appIconIndex: 0,
      relaunchCommand: app.isPackaged
        ? `"${process.execPath}"`
        : `"${process.execPath}" "${path.resolve(__dirname, '../../')}"`,
      relaunchDisplayName: 'Git Nexus'
    });
  }

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Initialize terminal service with the main window
  terminalService.init(mainWindow);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (!terminalWindow || terminalWindow.isDestroyed()) {
      terminalService.killSession();
    }
  });
}

function openTerminalWindow(cwd = null) {
  if (terminalWindow && !terminalWindow.isDestroyed()) {
    if (terminalWindow.isMinimized()) terminalWindow.restore();
    terminalWindow.focus();
    if (cwd) {
      terminalWindow.webContents.send('terminal:openNewTab', cwd);
    }
    return { success: true, windowId: terminalWindow.id };
  }

  const terminalIconPath = process.platform === 'win32'
    ? getAssetPath('assets', 'terminal-icon.ico')
    : getAssetPath('assets', 'terminal-icon.png');

  terminalWindow = new BrowserWindow({
    width: 960,
    height: 600,
    minWidth: 540,
    minHeight: 340,
    icon: terminalIconPath,
    autoHideMenuBar: true,
    backgroundColor: '#300a24',
    title: 'Git Nexus - Terminal',
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  if (process.platform === 'win32') {
    terminalWindow.setAppDetails({
      appId: 'com.gitnexus.desktop.terminal',
      appIconPath: terminalIconPath,
      appIconIndex: 0,
      relaunchCommand: app.isPackaged
        ? `"${process.execPath}" --terminal`
        : `"${process.execPath}" "${path.resolve(__dirname, '../../')}" --terminal`,
      relaunchDisplayName: 'Git Nexus Terminal'
    });
  }

  terminalWindow.setMenuBarVisibility(false);
  terminalWindow.loadFile(path.join(__dirname, '../renderer/terminal-window.html'), {
    query: cwd ? { cwd } : {}
  });

  const termWc = terminalWindow.webContents;

  terminalWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  terminalWindow.on('closed', () => {
    terminalService.removeSender(termWc);
    terminalWindow = null;
    if (mainWindow && !mainWindow.isDestroyed()) {
      try {
        mainWindow.webContents.send('terminal:windowClosed');
      } catch (e) { /* ignore */ }
    } else {
      terminalService.killSession();
    }
  });

  terminalService.init(terminalWindow);

  return { success: true, windowId: terminalWindow.id };
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    const { isTerminalLaunch, targetPath } = parseLaunchArgs(commandLine);
    const resolvedPath = targetPath || workingDirectory;

    if (isTerminalLaunch) {
      if (terminalWindow && !terminalWindow.isDestroyed()) {
        if (terminalWindow.isMinimized()) terminalWindow.restore();
        terminalWindow.focus();
        if (resolvedPath) {
          terminalWindow.webContents.send('terminal:openNewTab', resolvedPath);
        }
      } else {
        openTerminalWindow(resolvedPath);
      }
    } else {
      if (mainWindow && !mainWindow.isDestroyed()) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
        if (resolvedPath) {
          mainWindow.webContents.send('repo:openPath', resolvedPath);
        }
      } else {
        createWindow(resolvedPath);
      }
    }
  });

  // App lifecycle
  app.whenReady().then(() => {
    const { isTerminalLaunch, targetPath } = parseLaunchArgs(process.argv);

    if (isTerminalLaunch) {
      openTerminalWindow(targetPath || process.cwd());
    } else {
      createWindow(targetPath);
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers: Dialogs
ipcMain.handle('dialog:openFolder', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Select Git Repository Directory'
  });

  if (result.canceled || !result.filePaths.length) {
    return null;
  }
  return result.filePaths[0];
});

// IPC Handlers: Git Service Operations
ipcMain.handle('git:checkIsRepo', async (_, repoPath) => {
  return await gitService.checkIsRepo(repoPath);
});

ipcMain.handle('git:initRepo', async (_, repoPath) => {
  return await gitService.initRepo(repoPath);
});

ipcMain.handle('git:getStatus', async (_, repoPath) => {
  return await gitService.getStatus(repoPath);
});

ipcMain.handle('git:getBranches', async (_, repoPath) => {
  return await gitService.getBranches(repoPath);
});

ipcMain.handle('git:getTags', async (_, repoPath) => {
  return await gitService.getTags(repoPath);
});

ipcMain.handle('git:createTag', async (_, repoPath, tagName, message) => {
  return await gitService.createTag(repoPath, tagName, message);
});

ipcMain.handle('git:deleteTag', async (_, repoPath, tagName) => {
  return await gitService.deleteTag(repoPath, tagName);
});

ipcMain.handle('git:getAheadCommits', async (_, repoPath, branchName, targetBranch) => {
  return await gitService.getAheadCommits(repoPath, branchName, targetBranch);
});

ipcMain.handle('git:getBehindCommits', async (_, repoPath, branchName, targetBranch) => {
  return await gitService.getBehindCommits(repoPath, branchName, targetBranch);
});

ipcMain.handle('git:getBranchStatusDetails', async (_, repoPath) => {
  return await gitService.getBranchStatusDetails(repoPath);
});

ipcMain.handle('git:createBranch', async (_, repoPath, branchName, baseBranch, checkout) => {
  return await gitService.createBranch(repoPath, branchName, baseBranch, checkout);
});

ipcMain.handle('git:checkoutBranch', async (_, repoPath, branchName) => {
  return await gitService.checkoutBranch(repoPath, branchName);
});

ipcMain.handle('git:checkoutCommit', async (_, repoPath, commitHash, createBranch, branchName) => {
  return await gitService.checkoutCommit(repoPath, commitHash, createBranch, branchName);
});

ipcMain.handle('git:deleteBranch', async (_, repoPath, branchName, force) => {
  return await gitService.deleteBranch(repoPath, branchName, force);
});

ipcMain.handle('git:mergeBranch', async (_, repoPath, sourceBranch, options) => {
  return await gitService.mergeBranch(repoPath, sourceBranch, options);
});

ipcMain.handle('git:fetch', async (_, repoPath, remote) => {
  return await gitService.fetch(repoPath, remote);
});

ipcMain.handle('git:pull', async (_, repoPath, remote, branch) => {
  return await gitService.pull(repoPath, remote, branch);
});

ipcMain.handle('git:push', async (_, repoPath, remote, branch, options) => {
  return await gitService.push(repoPath, remote, branch, options);
});

ipcMain.handle('git:stageFile', async (_, repoPath, filePath) => {
  return await gitService.stageFile(repoPath, filePath);
});

ipcMain.handle('git:stageAll', async (_, repoPath) => {
  return await gitService.stageAll(repoPath);
});

ipcMain.handle('git:unstageFile', async (_, repoPath, filePath) => {
  return await gitService.unstageFile(repoPath, filePath);
});

ipcMain.handle('git:unstageAll', async (_, repoPath) => {
  return await gitService.unstageAll(repoPath);
});

ipcMain.handle('git:discardFileChanges', async (_, repoPath, filePath, isUntracked) => {
  return await gitService.discardFileChanges(repoPath, filePath, isUntracked);
});

ipcMain.handle('git:commit', async (_, repoPath, message, description) => {
  return await gitService.commit(repoPath, message, description);
});

ipcMain.handle('git:getDiff', async (_, repoPath, filePath, isStaged) => {
  return await gitService.getDiff(repoPath, filePath, isStaged);
});

ipcMain.handle('git:getHistory', async (_, repoPath, options) => {
  return await gitService.getHistory(repoPath, options);
});

ipcMain.handle('git:getCommitDetail', async (_, repoPath, hash) => {
  return await gitService.getCommitDetail(repoPath, hash);
});

ipcMain.handle('git:getCommitFileDiff', async (_, repoPath, hash, filePath) => {
  return await gitService.getCommitFileDiff(repoPath, hash, filePath);
});

ipcMain.handle('git:getFileHistory', async (_, repoPath, filePath, maxCount) => {
  return await gitService.getFileHistory(repoPath, filePath, maxCount);
});

ipcMain.handle('git:getFileContentAtCommit', async (_, repoPath, hash, filePath) => {
  return await gitService.getFileContentAtCommit(repoPath, hash, filePath);
});

ipcMain.handle('git:getAllRepoFiles', async (_, repoPath) => {
  return await gitService.getAllRepoFiles(repoPath);
});

// IPC Handlers: Terminal
ipcMain.handle('terminal:start', async (event, payload) => {
  terminalService.init(event.sender);
  const cwd = typeof payload === 'string' ? payload : (payload?.cwd);
  const tabId = typeof payload === 'object' ? payload?.tabId : 'tab-1';
  return terminalService.startSession(cwd, tabId || 'tab-1');
});

ipcMain.on('terminal:write', (event, payload) => {
  terminalService.init(event.sender);
  if (typeof payload === 'object' && payload !== null && payload.data !== undefined) {
    terminalService.write(payload.data, payload.tabId || 'tab-1');
  } else {
    terminalService.write(payload, 'tab-1');
  }
});

ipcMain.handle('terminal:setCwd', async (event, payload) => {
  terminalService.init(event.sender);
  const cwd = typeof payload === 'string' ? payload : (payload?.cwd);
  const tabId = typeof payload === 'object' ? payload?.tabId : null;
  terminalService.setCwd(cwd, tabId);
  return { success: true };
});

ipcMain.handle('terminal:clear', async (event, tabId) => {
  terminalService.init(event.sender);
  return terminalService.clearSession(typeof tabId === 'string' ? tabId : 'tab-1');
});

ipcMain.handle('terminal:closeTab', async (event, tabId) => {
  terminalService.init(event.sender);
  return terminalService.closeTab(tabId);
});

ipcMain.handle('terminal:openExternalWindow', async (event, cwd) => {
  return openTerminalWindow(cwd);
});

ipcMain.handle('terminal:focusExternalWindow', async () => {
  if (terminalWindow && !terminalWindow.isDestroyed()) {
    try {
      if (terminalWindow.isMinimized()) terminalWindow.restore();
      terminalWindow.focus();
      return { success: true };
    } catch (e) { /* ignore */ }
  }
  return { success: false };
});

ipcMain.handle('terminal:closeExternalWindow', async () => {
  if (terminalWindow && !terminalWindow.isDestroyed()) {
    try {
      terminalWindow.close();
    } catch (e) { /* ignore */ }
  }
  if (mainWindow && !mainWindow.isDestroyed()) {
    try {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    } catch (e) { /* ignore */ }
  }
  return { success: true };
});

ipcMain.handle('terminal:isExternalWindowOpen', async () => {
  return Boolean(terminalWindow && !terminalWindow.isDestroyed());
});

ipcMain.handle('terminal:setAlwaysOnTop', async (event, flag) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win && !win.isDestroyed()) {
    win.setAlwaysOnTop(Boolean(flag));
    return { success: true, isAlwaysOnTop: win.isAlwaysOnTop() };
  }
  return { success: false };
});

ipcMain.handle('terminal:openSystemTerminal', async (_, { cwd, type }) => {
  return terminalService.openSystemTerminal(cwd, type);
});

// IPC Handlers: Context Menu Registration
ipcMain.handle('contextMenu:register', async () => {
  return await contextMenuService.register();
});

ipcMain.handle('contextMenu:unregister', async () => {
  return await contextMenuService.unregister();
});

ipcMain.handle('contextMenu:isRegistered', async () => {
  return await contextMenuService.isRegistered();
});

// IPC Handlers: Application Information
ipcMain.handle('app:getInfo', async () => {
  const packageJson = require('../../package.json');
  return {
    name: packageJson.productName || 'Git Nexus',
    version: packageJson.version || '1.0.2',
    description: packageJson.description || 'Modern Graphical Git Repository Manager and Terminal',
    electron: process.versions.electron || '34.2.0',
    chrome: process.versions.chrome || '',
    node: process.versions.node || '',
    platform: process.platform === 'darwin' ? 'macOS' : (process.platform === 'win32' ? 'Windows' : process.platform),
    arch: process.arch
  };
});

// IPC Handlers: Desktop / System Shortcuts
ipcMain.handle('system:createDesktopShortcut', async () => {
  return await contextMenuService.createDesktopShortcut();
});

