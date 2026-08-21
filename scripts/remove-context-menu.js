const { execSync } = require('child_process');

const menuKeyName = 'GitNexusTerminal';
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
