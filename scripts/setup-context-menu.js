const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const menuKeyName = 'GitNexusTerminal';
const menuTitle = 'Open in Git Nexus Terminal';
const projectRoot = path.resolve(__dirname, '..');
const iconPath = path.join(projectRoot, 'assets', 'terminal-icon.ico');

// Find electron executable
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
