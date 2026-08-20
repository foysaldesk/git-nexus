const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const path = require('path');
const gitService = require('./git-service');
const terminalService = require('./terminal-service');

let mainWindow = null;

function createWindow() {
  // Disable default menu bar
  Menu.setApplicationMenu(null);

  const iconPath = process.platform === 'win32'
    ? path.join(__dirname, '../../assets/icon.ico')
    : path.join(__dirname, '../../assets/icon.png');

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

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Initialize terminal service with the main window
  terminalService.init(mainWindow);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    terminalService.killSession();
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

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

ipcMain.handle('git:getAheadCommits', async (_, repoPath, branchName, targetBranch) => {
  return await gitService.getAheadCommits(repoPath, branchName, targetBranch);
});

ipcMain.handle('git:createBranch', async (_, repoPath, branchName, baseBranch, checkout) => {
  return await gitService.createBranch(repoPath, branchName, baseBranch, checkout);
});

ipcMain.handle('git:checkoutBranch', async (_, repoPath, branchName, createIfMissing) => {
  return await gitService.checkoutBranch(repoPath, branchName, createIfMissing);
});

ipcMain.handle('git:deleteBranch', async (_, repoPath, branchName, isRemote, force) => {
  return await gitService.deleteBranch(repoPath, branchName, isRemote, force);
});

ipcMain.handle('git:mergeBranch', async (_, repoPath, sourceBranch, options) => {
  return await gitService.mergeBranch(repoPath, sourceBranch, options);
});

ipcMain.handle('git:fetch', async (_, repoPath, remote, prune) => {
  return await gitService.fetch(repoPath, remote, prune);
});

ipcMain.handle('git:pull', async (_, repoPath, remote, branch) => {
  return await gitService.pull(repoPath, remote, branch);
});

ipcMain.handle('git:push', async (_, repoPath, remote, branch, setUpstream, force) => {
  return await gitService.push(repoPath, remote, branch, setUpstream, force);
});

ipcMain.handle('git:stageFiles', async (_, repoPath, files) => {
  return await gitService.stageFiles(repoPath, files);
});

ipcMain.handle('git:unstageFiles', async (_, repoPath, files) => {
  return await gitService.unstageFiles(repoPath, files);
});

ipcMain.handle('git:discardChanges', async (_, repoPath, filePath, isUntracked) => {
  return await gitService.discardChanges(repoPath, filePath, isUntracked);
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
ipcMain.handle('terminal:start', async (event, cwd) => {
  terminalService.init(event.sender);
  return terminalService.startSession(cwd);
});

ipcMain.on('terminal:write', (event, data) => {
  terminalService.init(event.sender);
  terminalService.write(data);
});

ipcMain.handle('terminal:setCwd', async (event, cwd) => {
  terminalService.init(event.sender);
  terminalService.setCwd(cwd);
  return { success: true };
});

ipcMain.handle('terminal:clear', async (event) => {
  terminalService.init(event.sender);
  return terminalService.clearSession();
});

