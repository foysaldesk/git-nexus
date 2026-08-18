# Git Nexus ⚡ - Modern Desktop Git GUI Manager

A modern, high-performance, and visually sleek Git repository manager and terminal desktop application built with **Electron**, **Node.js**, and **xterm.js**.

---

## ✨ Features

- 📂 **Directory & Repository Browser**:
  - Open any existing Git repository folder with a single click.
  - Automatically initialize brand new Git repositories.
  - Recent repositories drawer for instantaneous workspace switching.

- 🌿 **Branch Management**:
  - Complete list of **Local Branches** and **Remote Branches**.
  - **Switch / Checkout**: Single-click branch switching.
  - **Create New Branch**: Create branch from current or custom base branch with auto-checkout.
  - **Delete Branch**: Safe deletion of local and remote branches (with force delete `-D` option).
  - **Merge Branch**: Merge any source branch into current branch with `--no-ff` or `--squash` flags and conflict feedback.

- 📝 **Staging & Visual Diff Viewer**:
  - Split lists for **Unstaged Changes** (Modified, Untracked, Deleted) and **Staged Changes**.
  - One-click **Stage All** / **Unstage All** and individual file stage/discard actions.
  - Interactive **Diff Viewer** showing line numbers, addition (`+`) and deletion (`-`) highlights with chunk navigation.
  - Commit message summary and extended description box with `Ctrl+Enter` shortcut.

- 🔄 **Git Sync Operations**:
  - One-click **Fetch** (with prune).
  - **Pull** from remote (with live behind-commit badge).
  - **Push** to remote with upstream tracking (`-u`) and force-push safety flags (with ahead-commit badge).

- 📜 **Interactive GitHub-Style Commit Timeline & Changes**:
  - Visual timeline of past commits grouped by date, with search filter, branch filter, author filter, and relative timestamps.
  - GitHub-style commit detail view with file tree sidebar, statistics bar, and on-demand file diff streaming (supporting 10,000+ files and merge commits).
  - One-click copy commit SHA to clipboard.

- 🔍 **File-Wise Change History Explorer**:
  - Dedicated **File History Modal** (`Ctrl+H` or `📜 History` button).
  - Follows the complete revision history of any specific file (`git log --follow -- <filePath>`).
  - Search or pick any tracked file across the repository.
  - Timeline of all commits that touched that file.
  - Switch between **🔀 Diff in this commit** and **📄 Full File Content at this commit**.
  - Direct 1-click **📜 File History** button from:
    - Changes & Staging file items
    - Diff viewer header
    - Commit changed files tree
    - Header action bar

- 🎨 **Theme Customization (Dark / Light / System)**:
  - **🌙 Dark**: GitHub-style obsidian dark aesthetic.
  - **☀️ Light**: Crisp, clean, high-contrast light design.
  - **💻 System**: Automatically syncs with your operating system's color mode in real time.
  - Full theme synchronization including the integrated terminal emulator.

- 💻 **Integrated Interactive Terminal**:
  - Full-fidelity terminal drawer powered by `@xterm/xterm`.
  - Operates directly inside the active repository working directory.
  - Quick action chips for common commands (`git status`, `git log`, `git branch -a`, `git remote -v`).
  - Resizable and collapsible with `Ctrl+` ` shortcut.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- [Git](https://git-scm.com/) installed and available in PATH

### Running Locally

```bash
# Install dependencies
npm install

# Start the application
npm start
```

### Keyboard Shortcuts
- `Ctrl + R` / `Cmd + R`: Refresh Git status
- `Ctrl + O` / `Cmd + O`: Open / Browse repository directory
- `Ctrl + ` ` / `Cmd + ` `: Toggle integrated terminal drawer
- `Ctrl + Enter` / `Cmd + Enter`: Commit staged changes
