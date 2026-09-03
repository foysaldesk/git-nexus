const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Folder Dialog
  openFolderDialog: () => ipcRenderer.invoke('dialog:openFolder'),

  // Git Core Operations
  checkIsRepo: (repoPath) => ipcRenderer.invoke('git:checkIsRepo', repoPath),
  initRepo: (repoPath) => ipcRenderer.invoke('git:initRepo', repoPath),
  getStatus: (repoPath) => ipcRenderer.invoke('git:getStatus', repoPath),
  getBranches: (repoPath) => ipcRenderer.invoke('git:getBranches', repoPath),
  getTags: (repoPath) => ipcRenderer.invoke('git:getTags', repoPath),
  createTag: (repoPath, tagName, message) => ipcRenderer.invoke('git:createTag', repoPath, tagName, message),
  deleteTag: (repoPath, tagName) => ipcRenderer.invoke('git:deleteTag', repoPath, tagName),
  getAheadCommits: (repoPath, branchName, targetBranch) =>
    ipcRenderer.invoke('git:getAheadCommits', repoPath, branchName, targetBranch),
  createBranch: (repoPath, branchName, baseBranch, checkout) =>
    ipcRenderer.invoke('git:createBranch', repoPath, branchName, baseBranch, checkout),
  checkoutBranch: (repoPath, branchName, createIfMissing) =>
    ipcRenderer.invoke('git:checkoutBranch', repoPath, branchName, createIfMissing),
  checkoutCommit: (repoPath, commitHash, createBranch, branchName) =>
    ipcRenderer.invoke('git:checkoutCommit', repoPath, commitHash, createBranch, branchName),
  deleteBranch: (repoPath, branchName, isRemote, force) =>
    ipcRenderer.invoke('git:deleteBranch', repoPath, branchName, isRemote, force),
  mergeBranch: (repoPath, sourceBranch, options) =>
    ipcRenderer.invoke('git:mergeBranch', repoPath, sourceBranch, options),
  fetch: (repoPath, remote, prune) => ipcRenderer.invoke('git:fetch', repoPath, remote, prune),
  pull: (repoPath, remote, branch) => ipcRenderer.invoke('git:pull', repoPath, remote, branch),
  push: (repoPath, remote, branch, setUpstream, force) =>
    ipcRenderer.invoke('git:push', repoPath, remote, branch, setUpstream, force),
  stageFiles: (repoPath, files) => ipcRenderer.invoke('git:stageFiles', repoPath, files),
  unstageFiles: (repoPath, files) => ipcRenderer.invoke('git:unstageFiles', repoPath, files),
  discardChanges: (repoPath, filePath, isUntracked) =>
    ipcRenderer.invoke('git:discardChanges', repoPath, filePath, isUntracked),
  commit: (repoPath, message, description) =>
    ipcRenderer.invoke('git:commit', repoPath, message, description),
  getDiff: (repoPath, filePath, isStaged) =>
    ipcRenderer.invoke('git:getDiff', repoPath, filePath, isStaged),
  getHistory: (repoPath, options) => ipcRenderer.invoke('git:getHistory', repoPath, options),
  getCommitDetail: (repoPath, hash) => ipcRenderer.invoke('git:getCommitDetail', repoPath, hash),
  getCommitFileDiff: (repoPath, hash, filePath) =>
    ipcRenderer.invoke('git:getCommitFileDiff', repoPath, hash, filePath),
  getFileHistory: (repoPath, filePath, maxCount) =>
    ipcRenderer.invoke('git:getFileHistory', repoPath, filePath, maxCount),
  getFileContentAtCommit: (repoPath, hash, filePath) =>
    ipcRenderer.invoke('git:getFileContentAtCommit', repoPath, hash, filePath),
  getAllRepoFiles: (repoPath) => ipcRenderer.invoke('git:getAllRepoFiles', repoPath),

  // Terminal Operations
  startTerminal: (cwd, tabId = 'tab-1') => ipcRenderer.invoke('terminal:start', { cwd, tabId }),
  writeTerminal: (data, tabId = 'tab-1') => ipcRenderer.send('terminal:write', { data, tabId }),
  clearTerminal: (tabId = 'tab-1') => ipcRenderer.invoke('terminal:clear', tabId),
  closeTerminalTab: (tabId) => ipcRenderer.invoke('terminal:closeTab', tabId),
  setTerminalCwd: (cwd, tabId = null) => ipcRenderer.invoke('terminal:setCwd', { cwd, tabId }),
  openTerminalWindow: (cwd) => ipcRenderer.invoke('terminal:openExternalWindow', cwd),
  focusTerminalWindow: () => ipcRenderer.invoke('terminal:focusExternalWindow'),
  closeTerminalWindow: () => ipcRenderer.invoke('terminal:closeExternalWindow'),
  isTerminalWindowOpen: () => ipcRenderer.invoke('terminal:isExternalWindowOpen'),
  setAlwaysOnTop: (flag) => ipcRenderer.invoke('terminal:setAlwaysOnTop', flag),
  openSystemTerminal: (cwd, type) => ipcRenderer.invoke('terminal:openSystemTerminal', { cwd, type }),
  onTerminalWindowClosed: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('terminal:windowClosed', handler);
    return () => ipcRenderer.removeListener('terminal:windowClosed', handler);
  },
  onTerminalData: (callback) => {
    const handler = (_, payload) => callback(payload);
    ipcRenderer.on('terminal:data', handler);
    return () => ipcRenderer.removeListener('terminal:data', handler);
  },
  onTerminalSuggestions: (callback) => {
    const handler = (_, payload) => callback(payload);
    ipcRenderer.on('terminal:suggestions', handler);
    return () => ipcRenderer.removeListener('terminal:suggestions', handler);
  },
  onTerminalOpenNewTab: (callback) => {
    const handler = (_, newCwd) => callback(newCwd);
    ipcRenderer.on('terminal:openNewTab', handler);
    return () => ipcRenderer.removeListener('terminal:openNewTab', handler);
  },
  onTerminalCwdChanged: (callback) => {
    const handler = (_, payload) => callback(payload);
    ipcRenderer.on('terminal:cwdChanged', handler);
    return () => ipcRenderer.removeListener('terminal:cwdChanged', handler);
  },
  onRepoOpenPath: (callback) => {
    const handler = (_, repoPath) => callback(repoPath);
    ipcRenderer.on('repo:openPath', handler);
    return () => ipcRenderer.removeListener('repo:openPath', handler);
  },

  // Context Menu & Shortcuts Integration
  registerContextMenu: () => ipcRenderer.invoke('contextMenu:register'),
  unregisterContextMenu: () => ipcRenderer.invoke('contextMenu:unregister'),
  isContextMenuRegistered: () => ipcRenderer.invoke('contextMenu:isRegistered'),
  createDesktopShortcut: () => ipcRenderer.invoke('system:createDesktopShortcut'),
  getAppInfo: () => ipcRenderer.invoke('app:getInfo')
});

