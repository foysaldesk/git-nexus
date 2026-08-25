const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const menuKeyName = 'GitNexusTerminal';

if (process.platform === 'win32') {
  const folderKey = `HKCU\\Software\\Classes\\Directory\\shell\\${menuKeyName}`;
  const bgKey = `HKCU\\Software\\Classes\\Directory\\Background\\shell\\${menuKeyName}`;

  console.log('Removing Windows Explorer Right-Click Context Menu for Git Nexus Terminal...');

  try {
    try { execSync(`reg delete "${folderKey}" /f`, { stdio: 'ignore' }); } catch (e) {}
    try { execSync(`reg delete "${bgKey}" /f`, { stdio: 'ignore' }); } catch (e) {}
    console.log('\n[SUCCESS] "Open in Git Nexus Terminal" has been removed from your Windows context menu.');
  } catch (e) {
    console.error('\n[ERROR] Failed to remove context menu:', e.message);
  }
} else if (process.platform === 'darwin') {
  console.log('Removing macOS Finder Context Menu / Quick Action for Git Nexus Terminal...');

  const homeDir = os.homedir();
  const servicesDir = path.join(homeDir, 'Library', 'Services');
  const workflowPath = path.join(servicesDir, 'Open in Git Nexus Terminal.workflow');

  try {
    if (fs.existsSync(workflowPath)) {
      fs.rmSync(workflowPath, { recursive: true, force: true });
    }
    console.log('\n[SUCCESS] "Open in Git Nexus Terminal" Quick Action removed from ~/Library/Services.');
  } catch (e) {
    console.error('\n[ERROR] Failed to remove macOS Quick Action:', e.message);
  }
}

