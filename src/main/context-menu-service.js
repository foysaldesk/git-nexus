const { app } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

class ContextMenuService {
  constructor() {
    this.menuKeyName = 'GitNexusTerminal';
    this.menuTitle = 'Open in Git Nexus Terminal';
  }

  getExecutablePath() {
    if (app.isPackaged) {
      return process.execPath;
    }
    // In development mode: electron.exe
    return process.execPath;
  }

  getCommandString() {
    const exePath = this.getExecutablePath();
    if (app.isPackaged) {
      return `"${exePath}" --terminal "%V"`;
    }
    // Development mode needs project root directory
    const projectRoot = path.resolve(__dirname, '../../');
    return `"${exePath}" "${projectRoot}" --terminal "%V"`;
  }

  getIconPath() {
    return path.resolve(__dirname, '../../assets/terminal-icon.ico');
  }

  async register() {
    if (process.platform !== 'win32') {
      return { success: false, error: 'Context menu integration is currently supported on Windows.' };
    }

    const commandStr = this.getCommandString().replace(/"/g, '\\"');
    const iconPath = this.getIconPath().replace(/"/g, '\\"');

    // Registry keys in HKCU (No administrator / UAC elevation needed!)
    const folderKey = `HKCU\\Software\\Classes\\Directory\\shell\\${this.menuKeyName}`;
    const bgKey = `HKCU\\Software\\Classes\\Directory\\Background\\shell\\${this.menuKeyName}`;

    const batchCommands = [
      `reg add "${folderKey}" /ve /d "${this.menuTitle}" /f`,
      `reg add "${folderKey}" /v "Icon" /d "${iconPath}" /f`,
      `reg add "${folderKey}\\command" /ve /d "${commandStr}" /f`,
      `reg add "${bgKey}" /ve /d "${this.menuTitle}" /f`,
      `reg add "${bgKey}" /v "Icon" /d "${iconPath}" /f`,
      `reg add "${bgKey}\\command" /ve /d "${commandStr}" /f`
    ].join(' && ');

    return new Promise((resolve) => {
      exec(batchCommands, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: stderr || error.message });
        } else {
          resolve({ success: true, message: 'Context menu successfully added to Windows Explorer!' });
        }
      });
    });
  }

  async unregister() {
    if (process.platform !== 'win32') {
      return { success: false, error: 'Context menu integration is currently supported on Windows.' };
    }

    const folderKey = `HKCU\\Software\\Classes\\Directory\\shell\\${this.menuKeyName}`;
    const bgKey = `HKCU\\Software\\Classes\\Directory\\Background\\shell\\${this.menuKeyName}`;

    const batchCommands = [
      `reg delete "${folderKey}" /f`,
      `reg delete "${bgKey}" /f`
    ].join(' & ');

    return new Promise((resolve) => {
      exec(batchCommands, (error, stdout, stderr) => {
        resolve({ success: true, message: 'Context menu removed from Windows Explorer.' });
      });
    });
  }

  async isRegistered() {
    if (process.platform !== 'win32') return false;
    const folderKey = `HKCU\\Software\\Classes\\Directory\\shell\\${this.menuKeyName}`;
    return new Promise((resolve) => {
      exec(`reg query "${folderKey}"`, (error) => {
        resolve(!error);
      });
    });
  }
}

module.exports = new ContextMenuService();
