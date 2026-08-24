const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const userProfile = process.env.USERPROFILE || 'C:\\Users\\USER';
const desktopDir = path.join(userProfile, 'Desktop');
const shortcutPath = path.join(desktopDir, 'Git Nexus Terminal.lnk');
const projectRoot = path.resolve(__dirname, '..');
const iconPath = path.join(projectRoot, 'assets', 'terminal-icon.ico');

// Find electron or target executable
const electronExe = path.join(projectRoot, 'node_modules', 'electron', 'dist', 'electron.exe');
const installedExe = 'C:\\Users\\USER\\AppData\\Local\\Programs\\Git Nexus\\Git Nexus.exe';
const targetExe = fs.existsSync(installedExe) ? installedExe : electronExe;
const args = targetExe === installedExe ? '--terminal' : `"${projectRoot}" --terminal`;

console.log('Shortcut Path:', shortcutPath);
console.log('Target Exe:', targetExe);
console.log('Args:', args);
console.log('Icon Path:', iconPath, 'Exists:', fs.existsSync(iconPath));

const psCommand = `
$wsh = New-Object -ComObject WScript.Shell
$sc = $wsh.CreateShortcut('${shortcutPath.replace(/'/g, "''")}')
$sc.TargetPath = '${targetExe.replace(/'/g, "''")}'
$sc.Arguments = '${args.replace(/'/g, "''")}'
$sc.IconLocation = '${iconPath.replace(/'/g, "''")},0'
$sc.Description = 'Git Nexus - Integrated Multi-Tab Terminal'
$sc.WorkingDirectory = '${userProfile.replace(/'/g, "''")}'
$sc.Save()

# Force Windows Explorer to refresh icon cache
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($wsh) | Out-Null
`;

const encoded = Buffer.from(psCommand, 'utf16le').toString('base64');
execSync(`powershell -NoProfile -NonInteractive -EncodedCommand ${encoded}`);

// Tell Windows Shell to notify association/icon change
try {
  const refreshPs = `
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class ShellRefresh {
    [DllImport("shell32.dll")]
    public static extern void SHChangeNotify(int wEventId, int uFlags, IntPtr dwItem1, IntPtr dwItem2);
}
"@
[ShellRefresh]::SHChangeNotify(0x08000000, 0, [IntPtr]::Zero, [IntPtr]::Zero)
`;
  const refreshEncoded = Buffer.from(refreshPs, 'utf16le').toString('base64');
  execSync(`powershell -NoProfile -NonInteractive -EncodedCommand ${refreshEncoded}`);
} catch (e) {
  console.log('Refresh notify:', e.message);
}

console.log('Shortcut updated successfully!');
