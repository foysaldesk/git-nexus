const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Folder Dialog
  openFolderDialog: () => ipcRenderer.invoke('dialog:openFolder'),

  // Git Core Operations
  checkIsRepo: (repoPath) => ipcRenderer.invoke('git:checkIsRepo', repoPath),
  initRepo: (repoPath) => ipcRenderer.invoke('git:initRepo', repoPath),
  getStatus: (repoPath) => ipcRenderer.invoke('git:getStatus', repoPath),
  getBranches: (repoPath) => ipcRenderer.invoke('git:getBranches', repoPath),
  createBranch: (repoPath, branchName, baseBranch, checkout) =>
    ipcRenderer.invoke('git:createBranch', repoPath, branchName, baseBranch, checkout),
  checkoutBranch: (repoPath, branchName, createIfMissing) =>
    ipcRenderer.invoke('git:checkoutBranch', repoPath, branchName, createIfMissing),
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
  startTerminal: (cwd) => ipcRenderer.invoke('terminal:start', cwd),
  writeTerminal: (data) => ipcRenderer.send('terminal:write', data),
  setTerminalCwd: (cwd) => ipcRenderer.invoke('terminal:setCwd', cwd),
  onTerminalData: (callback) => {
    const handler = (_, data) => callback(data);
    ipcRenderer.on('terminal:data', handler);
    return () => ipcRenderer.removeListener('terminal:data', handler);
  },
  onTerminalSuggestions: (callback) => {
    const handler = (_, suggestions) => callback(suggestions);
    ipcRenderer.on('terminal:suggestions', handler);
    return () => ipcRenderer.removeListener('terminal:suggestions', handler);
  }
});
