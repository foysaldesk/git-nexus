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
    if (app && app.isPackaged) {
      return process.execPath;
    }
    // In development mode: electron.exe from node_modules
    const devElectron = path.resolve(__dirname, '../../node_modules/electron/dist/electron.exe');
    if (fs.existsSync(devElectron)) {
      return devElectron;
    }
    return process.execPath;
  }

  getCommandString() {
    const exePath = this.getExecutablePath();
    if (app && app.isPackaged) {
      return `"${exePath}" --terminal "%V"`;
    }
    // Development mode needs project root directory
    const projectRoot = path.resolve(__dirname, '../../');
    return `"${exePath}" "${projectRoot}" --terminal "%V"`;
  }

  getIconPath() {
    const defaultDevPath = path.resolve(__dirname, '../../assets/terminal-icon.ico');

    // In packaged app (inside asar), Windows Shell/Registry cannot read files inside app.asar.
    if (app && app.isPackaged) {
      // Check asar.unpacked first
      const unpackedPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'assets', 'terminal-icon.ico');
      if (fs.existsSync(unpackedPath)) {
        return unpackedPath;
      }

      // Check resources/assets
      const resourcesPath = path.join(process.resourcesPath, 'assets', 'terminal-icon.ico');
      if (fs.existsSync(resourcesPath)) {
        return resourcesPath;
      }

      // Extract to userData directory so Windows OS has a guaranteed physical icon file on disk
      try {
        const userDataIcon = path.join(app.getPath('userData'), 'icons', 'terminal-icon.ico');
        if (!fs.existsSync(userDataIcon)) {
          fs.mkdirSync(path.dirname(userDataIcon), { recursive: true });
          if (fs.existsSync(defaultDevPath)) {
            fs.writeFileSync(userDataIcon, fs.readFileSync(defaultDevPath));
          }
        }
        if (fs.existsSync(userDataIcon)) {
          return userDataIcon;
        }
      } catch (e) {
        console.error('Failed to extract terminal icon to userData:', e);
      }
    }

    return defaultDevPath;
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

  async createDesktopShortcut() {
    const desktopPath = path.join(
      process.env.USERPROFILE || process.env.HOME || (process.platform === 'win32' ? 'C:\\Users\\Public\\Desktop' : '/tmp'),
      'Desktop'
    );

    if (process.platform === 'win32') {
      const shortcutPath = path.join(desktopPath, 'Git Nexus Terminal.lnk');
      const exePath = this.getExecutablePath();
      const projectRoot = path.resolve(__dirname, '../../');
      const isPackaged = Boolean(app && app.isPackaged);
      const args = isPackaged ? '--terminal' : `"${projectRoot}" --terminal`;
      const iconPath = this.getIconPath();
      const workingDir = process.env.USERPROFILE || 'C:\\Users\\Public';

      const psScript = [
        `$WshShell = New-Object -ComObject WScript.Shell`,
        `$Shortcut = $WshShell.CreateShortcut('${shortcutPath.replace(/'/g, "''")}')`,
        `$Shortcut.TargetPath = '${exePath.replace(/'/g, "''")}'`,
        `$Shortcut.Arguments = '${args.replace(/'/g, "''")}'`,
        `$Shortcut.IconLocation = '${iconPath.replace(/'/g, "''")},0'`,
        `$Shortcut.Description = 'Git Nexus - Integrated Multi-Tab Terminal'`,
        `$Shortcut.WorkingDirectory = '${workingDir.replace(/'/g, "''")}'`,
        `$Shortcut.Save()`,
        `[System.Runtime.InteropServices.Marshal]::ReleaseComObject($WshShell) | Out-Null`,
        `Add-Type -TypeDefinition @"\r\nusing System;\r\nusing System.Runtime.InteropServices;\r\npublic class ShellRefresh {\r\n    [DllImport("shell32.dll")]\r\n    public static extern void SHChangeNotify(int wEventId, int uFlags, IntPtr dwItem1, IntPtr dwItem2);\r\n}\r\n"@ -ErrorAction SilentlyContinue`,
        `[ShellRefresh]::SHChangeNotify(0x08000000, 0, [IntPtr]::Zero, [IntPtr]::Zero)`
      ].join('\r\n');

      const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
      return new Promise((resolve) => {
        exec(`powershell -NoProfile -NonInteractive -EncodedCommand ${encoded}`, (error, stdout, stderr) => {
          if (error) {
            resolve({ success: false, error: stderr || error.message });
          } else {
            resolve({ success: true, message: 'Desktop shortcut successfully created on your Desktop!' });
          }
        });
      });
    } else if (process.platform === 'darwin') {
      // macOS Desktop Command Launcher
      const commandPath = path.join(desktopPath, 'Git Nexus Terminal.command');
      const isPackaged = Boolean(app && app.isPackaged);
      const exePath = isPackaged 
        ? path.join(process.execPath, '../../MacOS/Git Nexus') 
        : process.execPath;
      const projectRoot = path.resolve(__dirname, '../../');
      const scriptContent = `#!/bin/bash\nexec "${exePath}" ${isPackaged ? '' : `"${projectRoot}"`} --terminal "$@"\n`;

      try {
        fs.writeFileSync(commandPath, scriptContent, { mode: 0o755 });
        return { success: true, message: 'macOS terminal launcher created on your Desktop: Git Nexus Terminal.command' };
      } catch (err) {
        return { success: false, error: err.message };
      }
    } else {
      // Linux Desktop Entry
      const desktopFile = path.join(desktopPath, 'git-nexus-terminal.desktop');
      const exePath = this.getExecutablePath();
      const projectRoot = path.resolve(__dirname, '../../');
      const isPackaged = Boolean(app && app.isPackaged);
      const iconPath = path.resolve(__dirname, '../../assets/terminal-icon.png');
      const execLine = isPackaged 
        ? `"${exePath}" --terminal` 
        : `"${exePath}" "${projectRoot}" --terminal`;

      const content = [
        '[Desktop Entry]',
        'Type=Application',
        'Name=Git Nexus Terminal',
        'Comment=Git Nexus Integrated Terminal Window',
        `Exec=${execLine}`,
        `Icon=${iconPath}`,
        'Terminal=false',
        'Categories=Development;Utility;'
      ].join('\n');

      try {
        fs.writeFileSync(desktopFile, content, { mode: 0o755 });
        return { success: true, message: 'Linux Desktop entry created on your Desktop!' };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }
  }
}

module.exports = new ContextMenuService();
