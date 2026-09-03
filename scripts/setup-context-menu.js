const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const menuKeyName = 'GitNexusTerminal';
const menuTitle = 'Open in Git Nexus Terminal';
const projectRoot = path.resolve(__dirname, '..');

if (process.platform === 'win32') {
  const iconPath = path.join(projectRoot, 'assets', 'terminal-icon.ico');
  const electronPath = path.join(projectRoot, 'node_modules', 'electron', 'dist', 'electron.exe');
  const targetExe = fs.existsSync(electronPath) ? electronPath : process.execPath;
  const commandStr = `"${targetExe}" "${projectRoot}" --terminal "%V"`;

  const folderKey = `HKCU\\Software\\Classes\\Directory\\shell\\${menuKeyName}`;
  const bgKey = `HKCU\\Software\\Classes\\Directory\\Background\\shell\\${menuKeyName}`;

  console.log('Registering Windows Explorer Right-Click Context Menu for Git Nexus Terminal...');
  console.log('Icon:', iconPath);
  console.log('Command:', commandStr);

  try {
    execSync(`reg add "${folderKey}" /ve /d "${menuTitle}" /f`, { stdio: 'inherit' });
    execSync(`reg add "${folderKey}" /v "Icon" /d "${iconPath}" /f`, { stdio: 'inherit' });
    execSync(`reg add "${folderKey}\\command" /ve /d "${commandStr}" /f`, { stdio: 'inherit' });

    execSync(`reg add "${bgKey}" /ve /d "${menuTitle}" /f`, { stdio: 'inherit' });
    execSync(`reg add "${bgKey}" /v "Icon" /d "${iconPath}" /f`, { stdio: 'inherit' });
    execSync(`reg add "${bgKey}\\command" /ve /d "${commandStr}" /f`, { stdio: 'inherit' });

    console.log('\n[SUCCESS] "Open in Git Nexus Terminal" has been registered to your Windows right-click context menu!');
  } catch (e) {
    console.error('\n[ERROR] Failed to register context menu:', e.message);
    process.exit(1);
  }
} else if (process.platform === 'darwin') {
  console.log('Registering macOS Finder Context Menu / Quick Action for Git Nexus Terminal...');

  const homeDir = os.homedir();
  const servicesDir = path.join(homeDir, 'Library', 'Services');
  const workflowName = 'Open in Git Nexus Terminal.workflow';
  const workflowDir = path.join(servicesDir, workflowName, 'Contents');

  const electronPath = path.join(projectRoot, 'node_modules', 'electron', 'dist', 'Electron.app', 'Contents', 'MacOS', 'Electron');
  const devRunCmd = fs.existsSync(electronPath)
    ? `"${electronPath}" "${projectRoot}" --terminal "$TARGET_DIR"`
    : `open -n -a "Git Nexus" --args --terminal "$TARGET_DIR"`;

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
    ${devRunCmd}
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
    console.log('\n[SUCCESS] "Open in Git Nexus Terminal" macOS Quick Action installed to ~/Library/Services!');
  } catch (e) {
    console.error('\n[ERROR] Failed to register macOS Quick Action:', e.message);
    process.exit(1);
  }
} else {
  console.log('Context menu registration is currently supported on Windows and macOS.');
}

