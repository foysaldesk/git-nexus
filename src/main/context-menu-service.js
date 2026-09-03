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
    if (process.platform === 'win32') {
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
    } else if (process.platform === 'darwin') {
      const homeDir = app ? app.getPath('home') : (process.env.HOME || '/Users/' + process.env.USER);
      const servicesDir = path.join(homeDir, 'Library', 'Services');
      const workflowName = 'Open in Git Nexus Terminal.workflow';
      const workflowDir = path.join(servicesDir, workflowName, 'Contents');

      const isPackaged = Boolean(app && app.isPackaged);
      const projectRoot = path.resolve(__dirname, '../../');
      const devElectronPath = path.resolve(__dirname, '../../node_modules/electron/dist/Electron.app/Contents/MacOS/Electron');

      let launchCmd = '';
      if (isPackaged) {
        launchCmd = `open -n -a "${app.getPath('exe')}" --args --terminal "$TARGET_DIR"`;
      } else if (fs.existsSync(devElectronPath)) {
        launchCmd = `"${devElectronPath}" "${projectRoot}" --terminal "$TARGET_DIR"`;
      } else {
        launchCmd = `open -n -a "Git Nexus" --args --terminal "$TARGET_DIR"`;
      }

      const shellScript = `for arg in "$@"; do
    if [ -n "$arg" ] && [ -d "$arg" ]; then
        TARGET_DIR="$arg"
        break
    fi
done

if [ -z "$TARGET_DIR" ]; then
    TARGET_DIR=$(osascript -e 'tell application "Finder" to if exists Finder window 1 then return POSIX path of (target of Finder window 1 as alias)' 2>/dev/null)
fi

if [ -z "$TARGET_DIR" ]; then
    TARGET_DIR="$HOME"
fi

if [ -d "/Applications/Git Nexus.app" ]; then
    open -n -a "/Applications/Git Nexus.app" --args --terminal "$TARGET_DIR"
else
    ${launchCmd}
fi`;

      const escapedScript = shellScript
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

      const documentWflow = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>AMApplicationBuild</key>
	<string>523</string>
	<key>AMApplicationVersion</key>
	<string>2.10</string>
	<key>AMDocumentVersion</key>
	<string>2</string>
	<key>actions</key>
	<array>
		<dict>
			<key>action</key>
			<dict>
				<key>AMAccepts</key>
				<dict>
					<key>Container</key>
					<string>List</string>
					<key>Optional</key>
					<true/>
					<key>Types</key>
					<array>
						<string>com.apple.cocoa.path</string>
					</array>
				</dict>
				<key>AMActionVersion</key>
				<string>2.0.3</string>
				<key>AMApplication</key>
				<array>
					<string>Automator</string>
				</array>
				<key>AMParameterProperties</key>
				<dict>
					<key>COMMAND_STRING</key>
					<dict/>
					<key>CheckedForUserDefaultShell</key>
					<dict/>
					<key>inputMethod</key>
					<dict/>
					<key>shell</key>
					<dict/>
					<key>source</key>
					<dict/>
				</dict>
				<key>AMProvides</key>
				<dict>
					<key>Container</key>
					<string>List</string>
					<key>Types</key>
					<array>
						<string>com.apple.cocoa.path</string>
					</array>
				</dict>
				<key>ActionBundlePath</key>
				<string>/System/Library/Automator/Run Shell Script.action</string>
				<key>ActionName</key>
				<string>Run Shell Script</string>
				<key>ActionParameters</key>
				<dict>
					<key>COMMAND_STRING</key>
					<string>${escapedScript}</string>
					<key>CheckedForUserDefaultShell</key>
					<true/>
					<key>inputMethod</key>
					<integer>1</integer>
					<key>shell</key>
					<string>/bin/zsh</string>
					<key>source</key>
					<string></string>
				</dict>
				<key>BundleIdentifier</key>
				<string>com.apple.Automator.ProvidedSwitchedRunShellScript</string>
				<key>CFBundleVersion</key>
				<string>2.0.3</string>
				<key>CanShowSelectedItemsWhenRun</key>
				<false/>
				<key>CanShowWhenRun</key>
				<true/>
				<key>Category</key>
				<array>
					<string>AMCategoryUtilities</string>
				</array>
				<key>Class Name</key>
				<string>RunShellScriptAction</string>
				<key>InputUUID</key>
				<string>3A87B2C5-9F3E-4B1D-8A7C-4E2F1A0B9D8E</string>
				<key>Keywords</key>
				<array>
					<string>Shell</string>
					<string>Script</string>
					<string>Command</string>
					<string>Run</string>
				</array>
				<key>OutputUUID</key>
				<string>7B9A1C2D-3E4F-5A6B-7C8D-9E0F1A2B3C4D</string>
				<key>UUID</key>
				<string>1A2B3C4D-5E6F-7A8B-9C0D-1E2F3A4B5C6D</string>
			</dict>
		</dict>
	</array>
	<key>connectors</key>
	<dict/>
	<key>workflowMetaData</key>
	<dict>
		<key>applicationBundleID</key>
		<string>com.apple.finder</string>
		<key>applicationBundleIDsByProcessName</key>
		<dict>
			<key>Finder</key>
			<string>com.apple.finder</string>
		</dict>
		<key>fileObjectTypeIdentifier</key>
		<string>com.apple.Automator.fileSystemObject.folder</string>
		<key>inputTypeIdentifier</key>
		<string>com.apple.Automator.fileSystemObject.folder</string>
		<key>outputTypeIdentifier</key>
		<string>com.apple.Automator.nothing</string>
		<key>presentationMode</key>
		<integer>15</integer>
		<key>resultTypeIdentifier</key>
		<string>com.apple.Automator.nothing</string>
		<key>serviceApplicationBundleID</key>
		<string>com.apple.finder</string>
		<key>serviceApplicationPath</key>
		<string>/System/Library/CoreServices/Finder.app</string>
		<key>serviceInputTypeIdentifier</key>
		<string>com.apple.Automator.fileSystemObject.folder</string>
		<key>serviceOutputTypeIdentifier</key>
		<string>com.apple.Automator.nothing</string>
		<key>serviceProcessesInput</key>
		<false/>
		<key>systemImageName</key>
		<string>NSTerminal</string>
		<key>useAutomaticInputType</key>
		<false/>
		<key>workflowTypeIdentifier</key>
		<string>com.apple.Automator.servicesMenu</string>
	</dict>
</dict>
</plist>`;

      const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>NSServices</key>
	<array>
		<dict>
			<key>NSBackgroundColorName</key>
			<string>background</string>
			<key>NSCategory</key>
			<string>public.category.utilities</string>
			<key>NSIconName</key>
			<string>Terminal</string>
			<key>NSMenuItem</key>
			<dict>
				<key>default</key>
				<string>Open in Git Nexus Terminal</string>
			</dict>
			<key>NSMessage</key>
			<string>runWorkflowAsService</string>
			<key>NSSendFileTypes</key>
			<array>
				<string>public.folder</string>
				<string>public.directory</string>
			</array>
		</dict>
	</array>
</dict>
</plist>`;

      try {
        fs.mkdirSync(workflowDir, { recursive: true });
        fs.writeFileSync(path.join(workflowDir, 'Info.plist'), infoPlist);
        fs.writeFileSync(path.join(workflowDir, 'document.wflow'), documentWflow);
        return { success: true, message: 'macOS Finder Quick Action successfully installed!' };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    return { success: false, error: 'Platform not supported for context menu.' };
  }

  async unregister() {
    if (process.platform === 'win32') {
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
    } else if (process.platform === 'darwin') {
      const homeDir = app ? app.getPath('home') : (process.env.HOME || '/Users/' + process.env.USER);
      const workflowPath = path.join(homeDir, 'Library', 'Services', 'Open in Git Nexus Terminal.workflow');

      try {
        if (fs.existsSync(workflowPath)) {
          fs.rmSync(workflowPath, { recursive: true, force: true });
        }
        return { success: true, message: 'macOS Finder Quick Action removed.' };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    return { success: false, error: 'Platform not supported.' };
  }

  async isRegistered() {
    if (process.platform === 'win32') {
      const folderKey = `HKCU\\Software\\Classes\\Directory\\shell\\${this.menuKeyName}`;
      return new Promise((resolve) => {
        exec(`reg query "${folderKey}"`, (error) => {
          resolve(!error);
        });
      });
    } else if (process.platform === 'darwin') {
      const homeDir = app ? app.getPath('home') : (process.env.HOME || '/Users/' + process.env.USER);
      const workflowPath = path.join(homeDir, 'Library', 'Services', 'Open in Git Nexus Terminal.workflow');
      return fs.existsSync(workflowPath);
    }
    return false;
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
