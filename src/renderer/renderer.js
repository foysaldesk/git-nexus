// Git Nexus Main Renderer Process
document.addEventListener('DOMContentLoaded', async () => {
  // Application State
  const state = {
    currentRepoPath: null,
    statusData: null,
    branchesData: null,
    historyData: [],
    filteredHistoryData: [],
    selectedFile: null,
    selectedCommit: null,
    currentCommitDetail: null,
    activeTab: 'changes',
    historyViewMode: 'list', // 'list' | 'detail'
    recentRepos: JSON.parse(localStorage.getItem('gitnexus_recent_repos') || '[]'),
    branchToDelete: null,
    fileHistoryTarget: null,
    fileHistoryCommits: [],
    fileHistorySelectedCommit: null,
    fileHistoryViewMode: 'diff', // 'diff' | 'full'
    branchFilterAhead: false,
    branchViewMode: 'flat', // 'flat' | 'tree'
    collapsedBranchFolders: new Set(),
    historyDisplayMode: 'tree', // 'tree' | 'timeline'
    allRepoFiles: [],
    activeFhDropdownIndex: -1,
    filteredRepoFiles: [],
    operationLogs: [],
    unreadErrorsCount: 0,
    logsFilter: 'all', // 'all' | 'error' | 'success'
    logsSearchQuery: '',
    sidebarSearchQuery: '',
    tagsData: []
  };

  // Top Header Elements
  const btnBrowseRepo = document.getElementById('btn-browse-repo');
  const btnRefresh = document.getElementById('btn-refresh');
  const btnFetch = document.getElementById('btn-fetch');
  const btnPull = document.getElementById('btn-pull');
  const btnPush = document.getElementById('btn-push');
  const btnModalBranch = document.getElementById('btn-modal-branch');
  const btnAddBranchQuick = document.getElementById('btn-add-branch-quick');
  const btnModalMerge = document.getElementById('btn-modal-merge');
  const btnFileHistoryQuick = document.getElementById('btn-file-history-quick');
  const btnToggleTerminal = document.getElementById('btn-toggle-terminal');
  const btnOpenErrorLogs = document.getElementById('btn-open-error-logs');
  const btnAbout = document.getElementById('btn-about');
  const brandSection = document.getElementById('brand-section');
  const headerErrorBadge = document.getElementById('header-error-badge');

  // About Modal Elements
  const modalAbout = document.getElementById('modal-about');
  const btnToggleContextMenuAbout = document.getElementById('btn-toggle-context-menu-about');
  const aboutAppVersionBadge = document.getElementById('about-app-version-badge');
  const aboutElectronVer = document.getElementById('about-electron-ver');
  const aboutNodeVer = document.getElementById('about-node-ver');
  const aboutPlatformName = document.getElementById('about-platform-name');
  const cmBoxTitle = document.getElementById('cm-box-title');
  const cmBoxDesc = document.getElementById('cm-box-desc');

  // Error Logs Modal Elements
  const modalErrorLogs = document.getElementById('modal-error-logs');
  const errorLogsContainer = document.getElementById('error-logs-container');
  const btnFilterLogsAll = document.getElementById('btn-filter-logs-all');
  const btnFilterLogsErrors = document.getElementById('btn-filter-logs-errors');
  const btnFilterLogsSuccess = document.getElementById('btn-filter-logs-success');
  const inputSearchLogs = document.getElementById('input-search-logs');
  const btnCopyAllLogs = document.getElementById('btn-copy-all-logs');
  const btnClearLogs = document.getElementById('btn-clear-logs');
  const logsStatusSummary = document.getElementById('logs-status-summary');

  const activeRepoPill = document.getElementById('active-repo-pill');
  const activeRepoName = document.getElementById('active-repo-name');
  const activeRepoBranch = document.getElementById('active-repo-branch');
  const badgeAhead = document.getElementById('badge-ahead');
  const badgeBehind = document.getElementById('badge-behind');
  const repoStatusIndicator = document.getElementById('status-text');

  // Sidebar Elements & Controls (Matching Reference Mockup)
  const sidebarSearchInput = document.getElementById('sidebar-search-input');
  const btnClearSidebarSearch = document.getElementById('btn-clear-sidebar-search');
  const sidebarRemoteUrlWrapper = document.getElementById('sidebar-remote-url-wrapper');
  const btnCopyRemoteUrl = document.getElementById('btn-copy-remote-url');
  const sidebarRemoteUrlText = document.getElementById('sidebar-remote-url-text');
  const btnCopyRemoteUrlIcon = document.getElementById('btn-copy-remote-url-icon');

  const sectionBranches = document.getElementById('section-branches');
  const headerBranches = document.getElementById('header-branches');
  const localBranchList = document.getElementById('local-branch-list');
  const btnToggleBranchTree = document.getElementById('btn-toggle-branch-tree');

  const sectionTags = document.getElementById('section-tags');
  const headerTags = document.getElementById('header-tags');
  const tagsList = document.getElementById('tags-list');
  const tagsCountBadge = document.getElementById('tags-count-badge');
  const btnAddTagQuick = document.getElementById('btn-add-tag-quick');

  const sectionRemotes = document.getElementById('section-remotes');
  const headerRemotes = document.getElementById('header-remotes');
  const remoteBranchList = document.getElementById('remote-branch-list');
  const btnQuickFetchRemotes = document.getElementById('btn-quick-fetch-remotes');

  const sectionRecentRepos = document.getElementById('section-recent-repos');
  const headerRecentRepos = document.getElementById('header-recent-repos');
  const recentReposList = document.getElementById('recent-repos-list');

  // Tag Modal Elements
  const modalCreateTag = document.getElementById('modal-create-tag');
  const inputNewTagName = document.getElementById('input-new-tag-name');
  const inputNewTagMsg = document.getElementById('input-new-tag-msg');
  const btnConfirmCreateTag = document.getElementById('btn-confirm-create-tag');

  // Workspace Tabs
  const tabChanges = document.getElementById('tab-changes');
  const tabHistory = document.getElementById('tab-history');
  const viewChanges = document.getElementById('view-changes');
  const viewHistory = document.getElementById('view-history');
  const noRepoView = document.getElementById('no-repo-view');

  // Changes & Staging Elements
  const badgeChangesCount = document.getElementById('badge-changes-count');
  const unstagedCount = document.getElementById('unstaged-count');
  const stagedCount = document.getElementById('staged-count');
  const unstagedFilesList = document.getElementById('unstaged-files-list');
  const stagedFilesList = document.getElementById('staged-files-list');
  const btnStageAll = document.getElementById('btn-stage-all');
  const btnUnstageAll = document.getElementById('btn-unstage-all');

  const commitSummary = document.getElementById('commit-summary');
  const commitDescription = document.getElementById('commit-description');
  const btnCommit = document.getElementById('btn-commit');
  const btnCommitLabel = document.getElementById('btn-commit-label');

  const diffFileName = document.getElementById('diff-file-name');
  const diffContainer = document.getElementById('diff-container');
  const diffFileActions = document.getElementById('diff-file-actions');
  const btnDiffStage = document.getElementById('btn-diff-stage');
  const btnDiffFileHistory = document.getElementById('btn-diff-file-history');

  // Staging Branch Ahead Graph Elements
  const stagingBranchGraphSection = document.getElementById('staging-branch-graph-section');
  const headerToggleStagingGraph = document.getElementById('header-toggle-staging-graph');
  const btnToggleStagingGraph = document.getElementById('btn-toggle-staging-graph');
  const stagingBranchGraphContainer = document.getElementById('staging-branch-graph-container');

  // GitHub Commits List & Git Graph Tree Elements
  const commitsListPage = document.getElementById('commits-list-page');
  const commitDetailPage = document.getElementById('commit-detail-page');
  const selectHistoryBranch = document.getElementById('select-history-branch');
  const inputSearchCommits = document.getElementById('input-search-commits');
  const selectHistoryAuthor = document.getElementById('select-history-author');
  const selectHistoryTime = document.getElementById('select-history-time');
  const btnViewGraphTree = document.getElementById('btn-view-graph-tree');
  const btnViewTimeline = document.getElementById('btn-view-timeline');
  const gitGraphTreeContainer = document.getElementById('git-graph-tree-container');
  const commitsTimelineContainer = document.getElementById('commits-timeline-container');

  // GitHub Commit Detail Elements
  const btnBackToCommits = document.getElementById('btn-back-to-commits');
  const cdTitle = document.getElementById('cd-title');
  const cdParents = document.getElementById('cd-parents');
  const cdHashShort = document.getElementById('cd-hash-short');
  const btnCdCopyHash = document.getElementById('btn-cd-copy-hash');
  const btnCdCheckoutCommit = document.getElementById('btn-cd-checkout-commit');
  const cdBranchTag = document.getElementById('cd-branch-tag');
  const cdAvatar = document.getElementById('cd-avatar');
  const cdAuthor = document.getElementById('cd-author');
  const cdDate = document.getElementById('cd-date');
  const cdBody = document.getElementById('cd-body');
  const cdFilesCount = document.getElementById('cd-files-count');
  const cdAdditions = document.getElementById('cd-additions');
  const cdDeletions = document.getElementById('cd-deletions');
  const cdDiffBar = document.getElementById('cd-diff-bar');
  const inputFilterCommitFiles = document.getElementById('input-filter-commit-files');
  const commitFilesTree = document.getElementById('commit-files-tree');
  const commitDiffsStream = document.getElementById('commit-diffs-stream');

  // Checkout Commit Modal Elements
  const modalCheckoutCommit = document.getElementById('modal-checkout-commit');
  const checkoutCommitHashText = document.getElementById('checkout-commit-hash-text');
  const checkoutCommitAuthorDate = document.getElementById('checkout-commit-author-date');
  const checkoutCommitMsgText = document.getElementById('checkout-commit-msg-text');
  const radioCheckoutDetached = document.getElementById('radio-checkout-detached');
  const radioCheckoutNewBranch = document.getElementById('radio-checkout-new-branch');
  const labelCheckoutDetached = document.getElementById('label-checkout-detached');
  const labelCheckoutNewBranch = document.getElementById('label-checkout-new-branch');
  const groupCheckoutNewBranchName = document.getElementById('group-checkout-new-branch-name');
  const inputCheckoutNewBranchName = document.getElementById('input-checkout-new-branch-name');
  const btnConfirmCheckoutCommit = document.getElementById('btn-confirm-checkout-commit');

  // File History Modal Elements
  const modalFileHistory = document.getElementById('modal-file-history');
  const fhFilePathBadge = document.getElementById('fh-file-path-badge');
  const fhSearchWrapper = document.getElementById('fh-search-wrapper');
  const inputFhSearchFile = document.getElementById('input-fh-search-file');
  const btnClearFhSearch = document.getElementById('btn-clear-fh-search');
  const fhSearchDropdownMenu = document.getElementById('fh-search-dropdown-menu');
  const fhSearchMatchesCount = document.getElementById('fh-search-matches-count');
  const fhSearchResultsList = document.getElementById('fh-search-results-list');
  const fhRevisionsCount = document.getElementById('fh-revisions-count');
  const fhCommitsList = document.getElementById('fh-commits-list');
  const fhSelectedCommitInfo = document.getElementById('fh-selected-commit-info');
  const btnFhViewDiff = document.getElementById('btn-fh-view-diff');
  const btnFhViewFull = document.getElementById('btn-fh-view-full');
  const fhDiffContainer = document.getElementById('fh-diff-container');

  const btnWelcomeOpen = document.getElementById('btn-welcome-open');
  const btnWelcomeInit = document.getElementById('btn-welcome-init');

  // Modals
  const modalCreateBranch = document.getElementById('modal-create-branch');
  const inputNewBranchName = document.getElementById('input-new-branch-name');
  const selectBaseBranch = document.getElementById('select-base-branch');
  const chkCheckoutBranch = document.getElementById('chk-checkout-branch');
  const btnConfirmCreateBranch = document.getElementById('btn-confirm-create-branch');

  const modalMerge = document.getElementById('modal-merge');
  const mergeTargetBranch = document.getElementById('merge-target-branch');
  const selectMergeSource = document.getElementById('select-merge-source');
  const chkMergeNoFF = document.getElementById('chk-merge-no-ff');
  const chkMergeSquash = document.getElementById('chk-merge-squash');
  const btnConfirmMerge = document.getElementById('btn-confirm-merge');

  const modalDeleteBranch = document.getElementById('modal-delete-branch');
  const deleteBranchTargetName = document.getElementById('delete-branch-target-name');
  const chkForceDelete = document.getElementById('chk-force-delete');
  const btnConfirmDeleteBranch = document.getElementById('btn-confirm-delete-branch');

  const modalPush = document.getElementById('modal-push');
  const selectPushRemote = document.getElementById('select-push-remote');
  const inputPushBranch = document.getElementById('input-push-branch');
  const chkPushUpstream = document.getElementById('chk-push-upstream');
  const chkPushForce = document.getElementById('chk-push-force');
  const btnConfirmPush = document.getElementById('btn-confirm-push');

  // Theme Manager (Dark, Light, System)
  const selectTheme = document.getElementById('select-theme');
  const savedTheme = localStorage.getItem('gitnexus_theme') || 'dark';
  if (selectTheme) {
    selectTheme.value = savedTheme;
  }

  function applyTheme(themeMode) {
    let effectiveTheme = themeMode;
    if (themeMode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = prefersDark ? 'dark' : 'light';
    }

    document.documentElement.setAttribute('data-theme', effectiveTheme);
    localStorage.setItem('gitnexus_theme', themeMode);
  }

  if (selectTheme) {
    selectTheme.addEventListener('change', (e) => {
      applyTheme(e.target.value);
    });
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (selectTheme && selectTheme.value === 'system') {
      applyTheme('system');
    }
  });

  // Apply initial theme
  applyTheme(savedTheme);

  // Smart Git Error Formatter
  function formatGitErrorMessage(rawError) {
    if (!rawError) return { title: 'Operation Notice', message: 'An unexpected notice occurred.' };

    const str = String(rawError).trim();

    // 1. Uncommitted changes blocking checkout / switch / merge / pull
    if (/overwritten by (checkout|merge|pull|rebase)/i.test(str) || (/local changes/i.test(str) && /commit.*stash/i.test(str))) {
      const fileMatches = str.match(/error:\s*Your local changes to the following files would be overwritten by [^:]+:\s*([\s\S]+?)\s*Please commit/i);
      let countText = '';
      if (fileMatches && fileMatches[1]) {
        const files = fileMatches[1].trim().split(/\s+/).filter(Boolean);
        countText = ` in ${files.length} file${files.length > 1 ? 's' : ''}`;
      }
      return {
        title: 'Uncommitted Changes Conflict',
        message: `Local modifications${countText} would be overwritten. Please commit or stash them first.`,
        raw: str
      };
    }

    // 2. Automatic merge conflicts
    if (/Automatic merge failed/i.test(str) || /fix conflicts and then commit/i.test(str) || /merge conflict in/i.test(str)) {
      return {
        title: 'Merge Conflict Detected',
        message: 'Automatic merge encountered conflicting changes. Please resolve conflicts or abort.',
        raw: str
      };
    }

    // 3. Push rejected (remote has new commits)
    if (/Updates were rejected because the remote contains work/i.test(str) || /\[rejected\].*fetch first/i.test(str) || /non-fast-forward/i.test(str)) {
      return {
        title: 'Push Rejected (Remote Ahead)',
        message: 'Remote branch contains new commits. Please Pull first before pushing.',
        raw: str
      };
    }

    // 4. No upstream branch configured
    if (/has no upstream branch/i.test(str) || /set-upstream/i.test(str) || /no tracking information/i.test(str)) {
      const branchMatch = str.match(/current branch\s+([^\s]+)\s+has no upstream/i);
      const branchName = branchMatch ? branchMatch[1] : '';
      return {
        title: 'No Upstream Branch',
        message: branchName ? `Branch '${branchName}' has no remote tracking branch. Use 'Push with Upstream'.` : 'No remote tracking branch configured. Publish branch with upstream.',
        raw: str
      };
    }

    // 5. Branch already exists
    if (/a branch named ['"]?([^'"]+)['"]? already exists/i.test(str)) {
      const match = str.match(/a branch named ['"]?([^'"]+)['"]? already exists/i);
      return {
        title: 'Branch Already Exists',
        message: `A branch named '${match[1]}' already exists in this repository.`,
        raw: str
      };
    }

    // 6. Branch or pathspec not found
    if (/pathspec ['"]?([^'"]+)['"]? did not match any file/i.test(str) || /cannot find branch/i.test(str)) {
      return {
        title: 'Branch / Reference Not Found',
        message: 'The requested branch or commit reference could not be found.',
        raw: str
      };
    }

    // 7. Authentication / SSH / Permission failure
    if (/Permission denied \(publickey\)/i.test(str) || /Authentication failed/i.test(str) || /could not read Username/i.test(str) || /Invalid username or password/i.test(str)) {
      return {
        title: 'Authentication Failed',
        message: 'Git credentials or SSH key could not be verified for the remote repository.',
        raw: str
      };
    }

    // 8. Remote repository not found
    if (/repository ['"]?([^'"]+)['"]? not found/i.test(str)) {
      return {
        title: 'Remote Repository Not Found',
        message: 'The remote repository was not found or access is restricted.',
        raw: str
      };
    }

    // 9. Git lock file exists
    if (/Another git process seems to be running/i.test(str) || /index\.lock': File exists/i.test(str)) {
      return {
        title: 'Git Repository Locked',
        message: 'Another Git process is running, or a stale .git/index.lock file exists.',
        raw: str
      };
    }

    // 10. Untracked working tree files would be overwritten
    if (/The following untracked working tree files would be overwritten/i.test(str)) {
      return {
        title: 'Untracked Files Conflict',
        message: 'Untracked files would be overwritten. Please move or discard them first.',
        raw: str
      };
    }

    // 11. Generic clean-up for other messages:
    let cleaned = str
      .replace(/^error:\s*/i, '')
      .replace(/^fatal:\s*/i, '')
      .replace(/^(checkout|push|pull|merge|commit|fetch|stage|unstage|discard)\s+failed:\s*(error:\s*|fatal:\s*)?/i, '')
      .trim();

    // Take only the first clean line/sentence
    const lines = cleaned.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let summary = lines[0] || cleaned;
    if (summary.length > 120) {
      summary = summary.slice(0, 117) + '...';
    }

    return {
      title: 'Action Notice',
      message: summary,
      raw: str
    };
  }

  // Toast Notification System
  function showToast(messageOrPayload, type = 'info', customTitle = null) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    let title = customTitle;
    let message = '';
    let rawError = null;

    if (typeof messageOrPayload === 'object' && messageOrPayload !== null) {
      title = messageOrPayload.title || title;
      message = messageOrPayload.message || '';
      rawError = messageOrPayload.raw || null;
    } else {
      message = String(messageOrPayload || '');
      if (type === 'error') {
        const parsed = formatGitErrorMessage(message);
        title = title || parsed.title;
        message = parsed.message;
        rawError = parsed.raw;
      }
    }

    if (!title) {
      if (type === 'success') title = 'Success';
      else if (type === 'error') title = 'Action Failed';
      else if (type === 'warning') title = 'Warning';
      else title = 'Notice';
    }

    // Limit maximum active toasts in container to 3 (auto-remove oldest)
    while (container.children.length >= 3) {
      container.firstChild.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else if (type === 'warning') {
      iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else {
      iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
      <div class="toast-icon-wrap">${iconSvg}</div>
      <div class="toast-content-wrap">
        <div class="toast-title-text">${escapeHtml(title)}</div>
        <div class="toast-msg-text">${escapeHtml(message)}</div>
      </div>
      <div class="toast-actions-wrap">
        ${rawError ? `<button class="toast-btn-action toast-copy-btn" title="Copy full error details"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>` : ''}
        <button class="toast-btn-action toast-close-btn" title="Dismiss">✕</button>
      </div>
    `;

    // Automatically record into persistent session log store
    addOperationLog({
      type,
      action: customTitle || (type === 'error' ? 'Git Operation Failed' : 'Git Operation'),
      title,
      message,
      raw: rawError
    });

    if (rawError) {
      const copyBtn = toast.querySelector('.toast-copy-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(rawError);
          copyBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
          setTimeout(() => {
            copyBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
          }, 1500);
        });
      }
    }

    const closeBtn = toast.querySelector('.toast-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        dismissToast(toast);
      });
    }

    container.appendChild(toast);

    let dismissTimer = setTimeout(() => {
      dismissToast(toast);
    }, 4500);

    toast.addEventListener('mouseenter', () => {
      if (dismissTimer) clearTimeout(dismissTimer);
    });

    toast.addEventListener('mouseleave', () => {
      dismissTimer = setTimeout(() => {
        dismissToast(toast);
      }, 2000);
    });
  }

  function dismissToast(toastEl) {
    if (!toastEl || !toastEl.parentElement) return;
    toastEl.style.opacity = '0';
    toastEl.style.transform = 'translateY(8px) scale(0.96)';
    toastEl.style.transition = 'all 0.22s ease';
    setTimeout(() => {
      if (toastEl.parentElement) toastEl.remove();
    }, 220);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ==========================================
  // Error & Operation Logs Management System
  // ==========================================
  function addOperationLog({ type = 'info', action = 'General', title = '', message = '', raw = null }) {
    const logEntry = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: new Date(),
      timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type, // 'error' | 'success' | 'warning' | 'info'
      action,
      title: title || (type === 'error' ? 'Error' : 'Notice'),
      message: message || '',
      raw: raw ? String(raw).trim() : null
    };

    state.operationLogs.unshift(logEntry);
    if (state.operationLogs.length > 200) {
      state.operationLogs.pop();
    }

    if (type === 'error') {
      state.unreadErrorsCount++;
      updateHeaderErrorBadge();
    }

    updateLogsCountBadges();

    // If modal is open, re-render
    if (modalErrorLogs && modalErrorLogs.classList.contains('active')) {
      renderErrorLogs();
    }

    return logEntry;
  }

  function updateHeaderErrorBadge() {
    if (!headerErrorBadge) return;
    const activeBadge = document.getElementById('logs-active-badge');
    if (state.unreadErrorsCount > 0) {
      const text = state.unreadErrorsCount > 99 ? '99+' : state.unreadErrorsCount;
      headerErrorBadge.textContent = text;
      headerErrorBadge.style.display = 'inline-block';
      if (activeBadge) {
        activeBadge.textContent = `${text} Error${state.unreadErrorsCount > 1 ? 's' : ''}`;
        activeBadge.style.display = 'inline-block';
      }
    } else {
      headerErrorBadge.style.display = 'none';
      if (activeBadge) activeBadge.style.display = 'none';
    }
  }

  function updateLogsCountBadges() {
    const elAll = document.getElementById('logs-count-all');
    const elErrors = document.getElementById('logs-count-errors');
    const elSuccess = document.getElementById('logs-count-success');

    const total = state.operationLogs.length;
    const errors = state.operationLogs.filter(l => l.type === 'error').length;
    const success = state.operationLogs.filter(l => l.type === 'success' || l.type === 'info').length;

    if (elAll) elAll.textContent = total;
    if (elErrors) elErrors.textContent = errors;
    if (elSuccess) elSuccess.textContent = success;
    if (logsStatusSummary) {
      logsStatusSummary.textContent = `${total} log entries recorded (${errors} error${errors === 1 ? '' : 's'})`;
    }
  }

  function openErrorLogsModal() {
    state.unreadErrorsCount = 0;
    updateHeaderErrorBadge();
    updateLogsCountBadges();

    // Select latest error or first item if none selected
    if (!state.selectedLogId && state.operationLogs.length > 0) {
      const firstError = state.operationLogs.find(l => l.type === 'error');
      state.selectedLogId = firstError ? firstError.id : state.operationLogs[0].id;
    }

    modalErrorLogs.classList.add('active');
    renderErrorLogs();
  }

  function renderErrorLogs() {
    const listContainer = document.getElementById('error-logs-list');
    if (!listContainer) return;

    let filtered = state.operationLogs;

    // Filter by tab mode
    if (state.logsFilter === 'error') {
      filtered = filtered.filter(l => l.type === 'error');
    } else if (state.logsFilter === 'success') {
      filtered = filtered.filter(l => l.type === 'success' || l.type === 'info');
    }

    // Filter by search keyword
    if (state.logsSearchQuery) {
      const q = state.logsSearchQuery.toLowerCase();
      filtered = filtered.filter(l => 
        (l.title && l.title.toLowerCase().includes(q)) ||
        (l.message && l.message.toLowerCase().includes(q)) ||
        (l.action && l.action.toLowerCase().includes(q)) ||
        (l.raw && l.raw.toLowerCase().includes(q))
      );
    }

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="logs-empty-placeholder" style="padding: 36px 12px;">
          <div class="logs-empty-icon" style="font-size: 24px;">📋</div>
          <div class="fw-semibold text-12" style="color: var(--text-primary);">No matching logs</div>
          <p class="text-11 text-muted mb-0">No logs found for current filter.</p>
        </div>
      `;
      renderLogInspector(null);
      return;
    }

    // Ensure a valid selected item exists
    if (!filtered.some(l => l.id === state.selectedLogId)) {
      state.selectedLogId = filtered[0].id;
    }

    listContainer.innerHTML = filtered.map(log => {
      const isSelected = log.id === state.selectedLogId;
      return `
        <div class="log-entry-row type-${escapeHtml(log.type)} ${isSelected ? 'selected' : ''}" data-id="${escapeHtml(log.id)}">
          <div class="log-row-top">
            <span class="log-row-badge">${escapeHtml(log.type)}</span>
            <span class="log-row-time">${escapeHtml(log.timeFormatted)}</span>
          </div>
          <div class="log-row-action">${escapeHtml(log.action || 'Git Operation')}</div>
          <div class="log-row-snippet" title="${escapeHtml(log.message)}">${escapeHtml(log.title)}: ${escapeHtml(log.message)}</div>
        </div>
      `;
    }).join('');

    // Attach click listeners to rows
    listContainer.querySelectorAll('.log-entry-row').forEach(row => {
      row.addEventListener('click', () => {
        const id = row.getAttribute('data-id');
        state.selectedLogId = id;
        listContainer.querySelectorAll('.log-entry-row').forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
        const selectedLog = state.operationLogs.find(l => l.id === id);
        renderLogInspector(selectedLog);
      });
    });

    const activeLog = state.operationLogs.find(l => l.id === state.selectedLogId) || filtered[0];
    renderLogInspector(activeLog);
  }

  function renderLogInspector(log) {
    const inspector = document.getElementById('logs-inspector-content');
    if (!inspector) return;

    if (!log) {
      inspector.innerHTML = `
        <div class="error-logs-empty-inspector">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--text-muted); opacity: 0.5;">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Select a Log Entry</div>
          <p style="font-size: 12px; color: var(--text-muted); max-width: 320px;">Choose an operation or error on the left to inspect full diagnostics, CLI traces, and recommendations.</p>
        </div>
      `;
      return;
    }

    // Smart Recommended Resolutions
    let solutionHtml = '';
    const rawLower = (log.raw || log.message || '').toLowerCase();

    if (rawLower.includes('overwritten by checkout') || rawLower.includes('commit your changes or stash')) {
      solutionHtml = `
        <div class="inspector-solution-box">
          <div class="solution-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
            <span>Recommended Resolution</span>
          </div>
          <div class="solution-body">
            You have active uncommitted files that would be modified or overwritten by switching branches.<br>
            • <strong>Option A (Stash):</strong> Run <code>git stash</code> in the terminal to temporarily shelve your changes, switch branches, and later run <code>git stash pop</code>.<br>
            • <strong>Option B (Commit):</strong> Stage and commit your current work to the current branch before checking out the target branch.
          </div>
        </div>
      `;
    } else if (rawLower.includes('merge conflict') || rawLower.includes('automatic merge failed')) {
      solutionHtml = `
        <div class="inspector-solution-box">
          <div class="solution-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
            <span>Recommended Resolution</span>
          </div>
          <div class="solution-body">
            Both branches contain changes to the same lines in one or more files.<br>
            • Open the <strong>Changes &amp; Staging</strong> tab to inspect the conflicting files.<br>
            • Resolve the conflict markers or abort using <code>git merge --abort</code>.
          </div>
        </div>
      `;
    } else if (rawLower.includes('rejected') || rawLower.includes('fetch first') || rawLower.includes('non-fast-forward')) {
      solutionHtml = `
        <div class="inspector-solution-box">
          <div class="solution-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
            <span>Recommended Resolution</span>
          </div>
          <div class="solution-body">
            The remote branch contains commits that your local branch does not have.<br>
            • Click the <strong>Pull</strong> button in the top header to integrate remote changes before pushing.<br>
            • Or use <strong>Terminal</strong> to rebase your branch on top of origin.
          </div>
        </div>
      `;
    }

    inspector.innerHTML = `
      <div class="inspector-header-card type-${escapeHtml(log.type)}">
        <div class="inspector-title-row">
          <div class="inspector-title-main">
            <span class="log-type-tag">${escapeHtml(log.type)}</span>
            <span>${escapeHtml(log.action || 'Git Operation')}</span>
          </div>
          <span style="font-size: 11.5px; color: var(--text-muted); font-family: var(--font-mono, monospace);">${escapeHtml(log.timeFormatted)}</span>
        </div>
        <div class="inspector-explanation-box">
          <strong style="color: var(--text-primary); font-size: 13.5px; display: block; margin-bottom: 4px;">${escapeHtml(log.title)}</strong>
          <span>${escapeHtml(log.message)}</span>
        </div>
        ${solutionHtml}
      </div>

      ${log.raw ? `
        <div class="inspector-terminal-card">
          <div class="terminal-card-header">
            <div class="terminal-header-title">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
              <span>Git CLI Diagnostic Stream (stderr/stdout)</span>
            </div>
            <div class="terminal-actions-group">
              <button id="btn-toggle-wrap" class="btn-terminal-action" title="Toggle word wrapping">Wrap: ON</button>
              <button id="btn-copy-inspector-raw" class="btn-terminal-action" title="Copy raw output to clipboard">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <span>Copy Output</span>
              </button>
            </div>
          </div>
          <div id="inspector-terminal-viewport" class="terminal-viewport-box">${escapeHtml(log.raw)}</div>
        </div>
      ` : ''}

      <div style="display: flex; gap: 12px; font-size: 11.5px; color: var(--text-muted); padding: 10px 14px; background: var(--bg-panel); border-radius: 8px; border: 1px solid var(--border-color);">
        <div><strong>Repository:</strong> <span style="color: var(--text-primary); font-family: var(--font-mono, monospace);">${escapeHtml(state.currentRepoPath || 'None')}</span></div>
        <div>&bull;</div>
        <div><strong>Branch:</strong> <span style="color: var(--text-primary); font-family: var(--font-mono, monospace);">${escapeHtml(state.branchesData?.current || 'main')}</span></div>
      </div>
    `;

    // Hook buttons inside inspector
    const copyRawBtn = document.getElementById('btn-copy-inspector-raw');
    if (copyRawBtn && log.raw) {
      copyRawBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(log.raw);
        const span = copyRawBtn.querySelector('span');
        if (span) span.textContent = 'Copied!';
        setTimeout(() => {
          if (copyRawBtn.querySelector('span')) copyRawBtn.querySelector('span').textContent = 'Copy Output';
        }, 1500);
      });
    }

    const toggleWrapBtn = document.getElementById('btn-toggle-wrap');
    const viewport = document.getElementById('inspector-terminal-viewport');
    if (toggleWrapBtn && viewport) {
      toggleWrapBtn.addEventListener('click', () => {
        const isNowrap = viewport.classList.toggle('nowrap');
        toggleWrapBtn.textContent = isNowrap ? 'Wrap: OFF' : 'Wrap: ON';
      });
    }
  }

  // Hook Logs Toolbar Controls
  if (btnOpenErrorLogs) {
    btnOpenErrorLogs.addEventListener('click', openErrorLogsModal);
  }

  // Hook About Modal Controls
  async function updateAboutModalInfo() {
    try {
      if (window.api && window.api.getAppInfo) {
        const info = await window.api.getAppInfo();
        if (aboutAppVersionBadge) aboutAppVersionBadge.textContent = `v${info.version}`;
        if (aboutElectronVer) aboutElectronVer.textContent = `v${info.electron}`;
        if (aboutNodeVer) aboutNodeVer.textContent = `v${info.node}`;
        if (aboutPlatformName) aboutPlatformName.textContent = info.platform;
      }
    } catch (e) {
      console.warn('Failed to load app info:', e);
    }

    try {
      if (window.api && window.api.isContextMenuRegistered) {
        const isReg = await window.api.isContextMenuRegistered();
        const isMac = window.navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        
        if (cmBoxTitle) {
          cmBoxTitle.textContent = isMac 
            ? 'macOS Finder Quick Action Integration' 
            : 'Windows Explorer Context Menu Integration';
        }
        if (cmBoxDesc) {
          cmBoxDesc.textContent = isMac 
            ? 'Adds "Open in Git Nexus Terminal" to your Finder Quick Actions & Services menu.' 
            : 'Adds "Open in Git Nexus Terminal" to your Windows Explorer right-click context menu.';
        }
        
        if (btnToggleContextMenuAbout) {
          if (isReg) {
            btnToggleContextMenuAbout.textContent = 'Disable Integration';
            btnToggleContextMenuAbout.className = 'btn btn-sm btn-outline-danger';
          } else {
            btnToggleContextMenuAbout.textContent = 'Enable Integration';
            btnToggleContextMenuAbout.className = 'btn btn-sm btn-primary';
          }
        }
      }
    } catch (e) {
      console.warn('Failed to check context menu status:', e);
    }
  }

  function openAboutModal() {
    if (modalAbout) {
      updateAboutModalInfo();
      modalAbout.classList.add('active');
    }
  }

  if (brandSection) brandSection.addEventListener('click', openAboutModal);
  if (btnAbout) btnAbout.addEventListener('click', openAboutModal);

  if (btnToggleContextMenuAbout) {
    btnToggleContextMenuAbout.addEventListener('click', async () => {
      try {
        const isReg = await window.api.isContextMenuRegistered();
        btnToggleContextMenuAbout.disabled = true;
        
        if (isReg) {
          const res = await window.api.unregisterContextMenu();
          if (res.success) {
            showToast('Context menu integration removed', 'info');
          } else {
            showToast(res.error || 'Failed to remove context menu', 'error');
          }
        } else {
          const res = await window.api.registerContextMenu();
          if (res.success) {
            showToast('Context menu integration registered successfully!', 'success');
          } else {
            showToast(res.error || 'Failed to register context menu', 'error');
          }
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        btnToggleContextMenuAbout.disabled = false;
        updateAboutModalInfo();
      }
    });
  }

  [btnFilterLogsAll, btnFilterLogsErrors, btnFilterLogsSuccess].forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      [btnFilterLogsAll, btnFilterLogsErrors, btnFilterLogsSuccess].forEach(b => b?.classList.remove('active'));
      btn.classList.add('active');
      state.logsFilter = btn.getAttribute('data-filter') || 'all';
      renderErrorLogs();
    });
  });

  if (inputSearchLogs) {
    inputSearchLogs.addEventListener('input', (e) => {
      state.logsSearchQuery = e.target.value.trim();
      renderErrorLogs();
    });
  }

  if (btnCopyAllLogs) {
    btnCopyAllLogs.addEventListener('click', () => {
      if (state.operationLogs.length === 0) {
        showToast('No logs available to copy', 'info');
        return;
      }
      const dump = state.operationLogs.map(l => {
        let text = `[${l.timeFormatted}] [${l.type.toUpperCase()}] [${l.action}] ${l.title} - ${l.message}`;
        if (l.raw) text += `\nRaw output:\n${l.raw}`;
        return text;
      }).join('\n\n---\n\n');

      navigator.clipboard.writeText(dump);
      showToast('All operation logs copied to clipboard', 'success');
    });
  }

  if (btnClearLogs) {
    btnClearLogs.addEventListener('click', () => {
      state.operationLogs = [];
      state.unreadErrorsCount = 0;
      state.selectedLogId = null;
      updateHeaderErrorBadge();
      updateLogsCountBadges();
      renderErrorLogs();
      showToast('Log history cleared', 'info');
    });
  }

  // Task Loader & Background Processing Manager
  let activeTaskCount = 0;
  const globalProgressBar = document.getElementById('global-progress-bar');
  const globalTaskIndicator = document.getElementById('global-task-indicator');
  const globalTaskLabel = document.getElementById('global-task-label');
  const originalButtonStates = new WeakMap();

  function startGlobalProgress(taskName = 'Processing...') {
    activeTaskCount++;
    if (globalProgressBar) globalProgressBar.style.display = 'block';
    if (globalTaskIndicator) {
      globalTaskIndicator.style.display = 'inline-flex';
      if (globalTaskLabel) globalTaskLabel.textContent = taskName;
      globalTaskIndicator.title = taskName;
    }
  }

  function stopGlobalProgress() {
    activeTaskCount = Math.max(0, activeTaskCount - 1);
    if (activeTaskCount === 0) {
      if (globalProgressBar) globalProgressBar.style.display = 'none';
      if (globalTaskIndicator) globalTaskIndicator.style.display = 'none';
    }
  }

  function setButtonLoading(btn, isLoading, loadingText = 'Processing...') {
    if (!btn) return;
    
    if (isLoading) {
      if (!originalButtonStates.has(btn)) {
        originalButtonStates.set(btn, {
          html: btn.innerHTML,
          disabled: btn.disabled,
          minWidth: btn.style.minWidth
        });
      }
      
      const currentWidth = btn.offsetWidth;
      if (currentWidth > 0) {
        btn.style.minWidth = `${currentWidth}px`;
      }
      
      btn.disabled = true;
      btn.classList.add('btn-loading');
      
      btn.innerHTML = `
        <svg class="btn-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25" stroke-width="2.5"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"></path>
        </svg>
        <span>${escapeHtml(loadingText)}</span>
      `;

      const modal = btn.closest('.modal-backdrop');
      if (modal) {
        modal.querySelectorAll('button, input, select, textarea').forEach(el => {
          if (el !== btn) {
            el.dataset.prevDisabled = el.disabled ? 'true' : 'false';
            el.disabled = true;
          }
        });
      }
    } else {
      btn.classList.remove('btn-loading');
      const saved = originalButtonStates.get(btn);
      if (saved) {
        btn.innerHTML = saved.html;
        btn.disabled = saved.disabled;
        btn.style.minWidth = saved.minWidth;
        originalButtonStates.delete(btn);
      } else {
        btn.disabled = false;
      }

      const modal = btn.closest('.modal-backdrop');
      if (modal) {
        modal.querySelectorAll('button, input, select, textarea').forEach(el => {
          if (el !== btn) {
            if (el.dataset.prevDisabled === 'true') {
              el.disabled = true;
            } else {
              el.disabled = false;
            }
            delete el.dataset.prevDisabled;
          }
        });
      }
    }
  }

  async function withTaskLoader(taskName, btn, loadingText, actionFn) {
    startGlobalProgress(taskName);
    if (btn) setButtonLoading(btn, true, loadingText || taskName);
    try {
      return await actionFn();
    } finally {
      if (btn) setButtonLoading(btn, false);
      stopGlobalProgress();
    }
  }

  function formatRelativeTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return 'just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}d ago`;
    return date.toLocaleDateString();
  }

  function formatCommitTimestamp(dateStr) {
    if (!dateStr) return { relStr: '', fullStr: '' };
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return { relStr: String(dateStr), fullStr: String(dateStr) };

    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    const pad = n => String(n).padStart(2, '0');
    const fullStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

    let relStr = '';
    if (diffSec < 60) {
      relStr = 'just now';
    } else if (diffSec < 3600) {
      relStr = `${Math.floor(diffSec / 60)}m ago`;
    } else if (diffSec < 86400) {
      relStr = `${Math.floor(diffSec / 3600)}h ago`;
    } else if (diffSec < 604800) {
      relStr = `${Math.floor(diffSec / 86400)}d ago`;
    } else {
      const isCurrentYear = date.getFullYear() === now.getFullYear();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const m = monthNames[date.getMonth()];
      const d = date.getDate();
      const timeStr = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
      relStr = isCurrentYear ? `${d} ${m}, ${timeStr}` : `${d} ${m} ${date.getFullYear()}`;
    }

    return { relStr, fullStr };
  }

  function formatDateGroup(dateStr) {
    if (!dateStr) return 'Recent Commits';
    const date = new Date(dateStr);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  function getInitials(name) {
    if (!name) return 'U';
    // Clean symbols like _, -, ., @ from edges
    const clean = name.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '').trim();
    if (!clean) return name.slice(0, 2).toUpperCase();
    const parts = clean.split(/[\s._-]+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  }

  function getAvatarColor(name) {
    if (!name) return '#2f81f7';
    const colors = [
      '#2f81f7', '#388bfd', '#238636', '#8957e5',
      '#d29922', '#db61a2', '#f78166', '#0969da',
      '#1a7f37', '#8250df', '#9a6700', '#bf3989'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  // Save Recent Repositories
  function saveRecentRepo(repoPath) {
    let recents = state.recentRepos.filter(p => p !== repoPath);
    recents.unshift(repoPath);
    if (recents.length > 8) recents = recents.slice(0, 8);
    state.recentRepos = recents;
    localStorage.setItem('gitnexus_recent_repos', JSON.stringify(recents));
    renderRecentRepos();
  }

  function renderRecentRepos() {
    recentReposList.innerHTML = '';
    if (state.recentRepos.length === 0) {
      recentReposList.innerHTML = '<li class="branch-item" style="color: var(--text-muted);">No recent repos</li>';
      return;
    }

    state.recentRepos.forEach(repoPath => {
      const li = document.createElement('li');
      li.className = `branch-item ${repoPath === state.currentRepoPath ? 'active' : ''}`;
      const folderName = repoPath.split(/[\\/]/).filter(Boolean).pop() || repoPath;
      li.innerHTML = `
        <div class="branch-name-box" title="${repoPath}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
          <span class="branch-name-text">${escapeHtml(folderName)}</span>
        </div>
      `;
      li.addEventListener('click', () => openRepository(repoPath));
      recentReposList.appendChild(li);
    });
  }

  // Open & Load Repository
  async function openRepository(repoPath) {
    if (!repoPath) return;

    const isRepo = await window.api.checkIsRepo(repoPath);
    if (!isRepo) {
      const shouldInit = confirm(`"${repoPath}" is not a Git repository. Would you like to initialize it as a new Git repository?`);
      if (shouldInit) {
        const res = await window.api.initRepo(repoPath);
        if (!res.success) {
          showToast(`Failed to initialize repository: ${res.error}`, 'error');
          return;
        }
        showToast('Initialized new Git repository', 'success');
      } else {
        return;
      }
    }

    state.currentRepoPath = repoPath;
    state.selectedFile = null;
    state.selectedCommit = null;
    state.historyViewMode = 'list';

    saveRecentRepo(repoPath);

    // Update Header Pill
    const folderName = repoPath.split(/[\\/]/).filter(Boolean).pop() || repoPath;
    activeRepoName.textContent = folderName;
    activeRepoPill.style.display = 'flex';
    activeRepoPill.title = repoPath;

    // Populate Datalist for File Search
    populateRepoFilesDatalist();

    // Switch view if no-repo view was shown
    noRepoView.style.display = 'none';
    if (state.activeTab === 'changes') {
      viewChanges.classList.add('active');
      viewHistory.classList.remove('active');
    } else {
      viewHistory.classList.add('active');
      viewChanges.classList.remove('active');
    }

    await refreshRepository();
    showToast(`Loaded repository: ${folderName}`, 'info');
  }

  // Populate Repo Files List Cache
  async function populateRepoFilesDatalist() {
    if (!state.currentRepoPath) return;
    try {
      const res = await window.api.getAllRepoFiles(state.currentRepoPath);
      if (res.success && res.files) {
        state.allRepoFiles = res.files;
      }
    } catch (e) {
      // ignore
    }
  }

  // Refresh All Git State
  async function refreshRepository() {
    if (!state.currentRepoPath) return;

    btnRefresh.classList.add('rotating');
    startGlobalProgress('Refreshing repository...');

    try {
      const selectedBranch = selectHistoryBranch.value || null;
      const [statusRes, branchesRes, historyRes, tagsRes] = await Promise.all([
        window.api.getStatus(state.currentRepoPath).catch(e => ({ success: false, error: e.message })),
        window.api.getBranches(state.currentRepoPath).catch(e => ({ success: false, error: e.message })),
        window.api.getHistory(state.currentRepoPath, { maxCount: 300, branch: selectedBranch, all: !selectedBranch }).catch(e => ({ success: false, error: e.message })),
        (window.api.getTags ? window.api.getTags(state.currentRepoPath) : Promise.resolve({ success: true, data: [] })).catch(() => ({ success: true, data: [] }))
      ]);

      if (statusRes.success) {
        state.statusData = statusRes.data;
        updateStatusUI();
      } else {
        showToast(`Status error: ${statusRes.error}`, 'error');
      }

      if (branchesRes.success) {
        state.branchesData = branchesRes.data;
        renderBranches();
        populateHistoryBranchDropdown();
      }

      if (tagsRes && tagsRes.success) {
        state.tagsData = tagsRes.data || [];
        renderTags();
      }

      if (historyRes.success) {
        state.historyData = historyRes.data;
        renderStagingBranchGraph(state.historyData);
        populateHistoryAuthorDropdown();
        applyHistoryFilters();
      }

      // Re-render current diff if a file is selected
      if (state.selectedFile) {
        loadDiff(state.selectedFile);
      } else {
        diffFileName.textContent = 'Select a file to view diff';
        diffFileActions.style.display = 'none';
        diffContainer.innerHTML = `
          <div class="diff-empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <p>Select a file from the list to preview diff</p>
          </div>
        `;
      }
    } catch (err) {
      showToast(`Error refreshing: ${err.message}`, 'error');
    } finally {
      btnRefresh.classList.remove('rotating');
      stopGlobalProgress();
    }
  }

  // Populate History Branch Filter Dropdown
  function populateHistoryBranchDropdown() {
    if (!state.branchesData) return;
    const currentVal = selectHistoryBranch.value;
    selectHistoryBranch.innerHTML = '';

    const allOpt = document.createElement('option');
    allOpt.value = '';
    allOpt.textContent = 'All Branches (Tree Graph)';
    selectHistoryBranch.appendChild(allOpt);

    const currentHeadOpt = document.createElement('option');
    currentHeadOpt.value = state.branchesData.current || 'HEAD';
    currentHeadOpt.textContent = `Current: ${state.branchesData.current || 'HEAD'}`;
    selectHistoryBranch.appendChild(currentHeadOpt);

    state.branchesData.all.forEach(b => {
      if (b !== state.branchesData.current) {
        const opt = document.createElement('option');
        opt.value = b;
        opt.textContent = b;
        if (b === currentVal) opt.selected = true;
        selectHistoryBranch.appendChild(opt);
      }
    });

    if (currentVal && Array.from(selectHistoryBranch.options).some(o => o.value === currentVal)) {
      selectHistoryBranch.value = currentVal;
    }
  }

  // Populate History Authors Dropdown
  function populateHistoryAuthorDropdown() {
    const currentAuthor = selectHistoryAuthor.value;
    const authors = [...new Set(state.historyData.map(c => c.author_name).filter(Boolean))];
    selectHistoryAuthor.innerHTML = '<option value="">All users</option>';

    authors.forEach(auth => {
      const opt = document.createElement('option');
      opt.value = auth;
      opt.textContent = auth;
      if (auth === currentAuthor) opt.selected = true;
      selectHistoryAuthor.appendChild(opt);
    });
  }

  // Apply History Filters (Search, Author, Time)
  function applyHistoryFilters() {
    const searchQuery = inputSearchCommits.value.trim().toLowerCase();
    const authorFilter = selectHistoryAuthor.value;
    const timeFilter = selectHistoryTime.value;

    const now = new Date();

    state.filteredHistoryData = state.historyData.filter(commit => {
      if (searchQuery) {
        const matchesMsg = (commit.message || '').toLowerCase().includes(searchQuery);
        const matchesAuthor = (commit.author_name || '').toLowerCase().includes(searchQuery);
        const matchesHash = (commit.hash || '').toLowerCase().includes(searchQuery);
        const matchesRefs = (commit.refs || '').toLowerCase().includes(searchQuery);
        if (!matchesMsg && !matchesAuthor && !matchesHash && !matchesRefs) return false;
      }

      if (authorFilter && commit.author_name !== authorFilter) {
        return false;
      }

      if (timeFilter !== 'all') {
        const commitDate = new Date(commit.date || commit.authorDate);
        const diffHours = (now - commitDate) / (1000 * 60 * 60);
        if (timeFilter === 'today' && diffHours > 24) return false;
        if (timeFilter === 'week' && diffHours > 24 * 7) return false;
        if (timeFilter === 'month' && diffHours > 24 * 30) return false;
      }

      return true;
    });

    renderHistoryView(state.filteredHistoryData);
  }

  // Event Listeners for History Filters
  selectHistoryBranch.addEventListener('change', refreshRepository);
  inputSearchCommits.addEventListener('input', applyHistoryFilters);
  selectHistoryAuthor.addEventListener('change', applyHistoryFilters);
  selectHistoryTime.addEventListener('change', applyHistoryFilters);

  if (btnViewGraphTree) {
    btnViewGraphTree.addEventListener('click', () => {
      state.historyDisplayMode = 'tree';
      renderHistoryView(state.filteredHistoryData);
    });
  }

  if (btnViewTimeline) {
    btnViewTimeline.addEventListener('click', () => {
      state.historyDisplayMode = 'timeline';
      renderHistoryView(state.filteredHistoryData);
    });
  }

  // Render unified History View based on active mode
  function renderHistoryView(commits) {
    if (state.historyDisplayMode === 'tree') {
      if (gitGraphTreeContainer) gitGraphTreeContainer.style.display = 'block';
      if (commitsTimelineContainer) commitsTimelineContainer.style.display = 'none';
      if (btnViewGraphTree) btnViewGraphTree.classList.add('active');
      if (btnViewTimeline) btnViewTimeline.classList.remove('active');
      renderGitGraphTree(commits);
    } else {
      if (gitGraphTreeContainer) gitGraphTreeContainer.style.display = 'none';
      if (commitsTimelineContainer) commitsTimelineContainer.style.display = 'flex';
      if (btnViewTimeline) btnViewTimeline.classList.add('active');
      if (btnViewGraphTree) btnViewGraphTree.classList.remove('active');
      renderGitHubCommitsList(commits);
    }
  }

  // Git DAG Color Palette for Branch Tree Tracks (matching Ahead Graph Mockup)
  const DAG_COLORS = [
    '#00bcd4', // Cyan / Teal (Left track)
    '#22c55e', // Emerald / Green
    '#3b82f6', // Blue (Main)
    '#ec4899', // Pink / Magenta (Merge track)
    '#ef4444', // Red / Coral
    '#eab308', // Amber / Gold
    '#8b5cf6', // Purple
    '#f97316'  // Orange
  ];

  // Calculate Git DAG Graph lanes, routes, and connections
  function calculateGitGraph(commits) {
    const lanes = [];
    const rows = [];

    commits.forEach((commit, rowIndex) => {
      let lane = lanes.indexOf(commit.hash);
      if (lane === -1) {
        lane = lanes.indexOf(null);
        if (lane === -1) {
          lane = lanes.length;
          lanes.push(commit.hash);
        } else {
          lanes[lane] = commit.hash;
        }
      }

      const parents = commit.parents || [];
      const routes = [];
      const passingLanes = [];

      lanes.forEach((h, l) => {
        if (h && l !== lane) {
          passingLanes.push(l);
        }
      });

      if (parents.length === 0) {
        lanes[lane] = null;
      } else if (parents.length === 1) {
        const parentHash = parents[0];
        const existingParentLane = lanes.indexOf(parentHash);
        if (existingParentLane !== -1 && existingParentLane !== lane) {
          routes.push({ fromLane: lane, toLane: existingParentLane, type: 'merge' });
          lanes[lane] = null;
        } else {
          lanes[lane] = parentHash;
          routes.push({ fromLane: lane, toLane: lane, type: 'straight' });
        }
      } else {
        parents.forEach((parentHash, pIdx) => {
          const existingParentLane = lanes.indexOf(parentHash);
          if (pIdx === 0) {
            if (existingParentLane !== -1 && existingParentLane !== lane) {
              routes.push({ fromLane: lane, toLane: existingParentLane, type: 'merge' });
              lanes[lane] = null;
            } else {
              lanes[lane] = parentHash;
              routes.push({ fromLane: lane, toLane: lane, type: 'straight' });
            }
          } else {
            if (existingParentLane !== -1) {
              routes.push({ fromLane: lane, toLane: existingParentLane, type: 'fork' });
            } else {
              let newLane = lanes.indexOf(null);
              if (newLane === -1) {
                newLane = lanes.length;
                lanes.push(parentHash);
              } else {
                lanes[newLane] = parentHash;
              }
              routes.push({ fromLane: lane, toLane: newLane, type: 'fork' });
            }
          }
        });
      }

      while (lanes.length > 0 && lanes[lanes.length - 1] === null) {
        lanes.pop();
      }

      rows.push({
        commit,
        lane,
        color: DAG_COLORS[lane % DAG_COLORS.length],
        routes,
        passingLanes,
        maxLanes: Math.max(lanes.length, lane + 1)
      });
    });

    return rows;
  }

  // Parse Git Refs into structured branch / head / tag descriptors
  function parseCommitRefs(refsStr) {
    if (!refsStr) return [];
    const items = refsStr.split(',').map(s => s.trim()).filter(Boolean);
    const result = [];

    items.forEach(item => {
      if (item.startsWith('HEAD -> ')) {
        result.push({ type: 'head', name: item.replace('HEAD -> ', '') });
      } else if (item === 'HEAD') {
        result.push({ type: 'head', name: 'HEAD' });
      } else if (item.startsWith('tag: ')) {
        result.push({ type: 'tag', name: item.replace('tag: ', '') });
      } else if (item.startsWith('refs/tags/')) {
        result.push({ type: 'tag', name: item.replace('refs/tags/', '') });
      } else if (item.includes('origin/') || item.startsWith('remotes/')) {
        result.push({ type: 'remote', name: item.replace(/^remotes\//, '') });
      } else {
        result.push({ type: 'branch', name: item });
      }
    });

    return result;
  }

  // Build Ref Badges HTML matching Ahead Mockup
  function createRefBadgesHtml(parsedRefs, isAhead) {
    let badgesHtml = '';
    if (isAhead) {
      badgesHtml += `<span class="gitk-badge gitk-badge-ahead" title="Ahead commit (unpushed)">▲ Ahead</span>`;
    }
    parsedRefs.forEach(r => {
      if (r.type === 'head') {
        badgesHtml += `<span class="gitk-badge-head-pill" title="HEAD Active Branch">${escapeHtml(r.name)} <span class="head-subtag">HEAD</span></span>`;
      } else if (r.type === 'tag') {
        badgesHtml += `<span class="gitk-badge-yellow-tag" title="Tag: ${escapeHtml(r.name)}">${escapeHtml(r.name)}</span>`;
      } else if (r.type === 'remote') {
        badgesHtml += `<span class="gitk-badge gitk-badge-remote" title="Remote Branch: ${escapeHtml(r.name)}">${escapeHtml(r.name)}</span>`;
      } else {
        badgesHtml += `<span class="gitk-badge-green-pill" title="Local Branch: ${escapeHtml(r.name)}">${escapeHtml(r.name)}</span>`;
      }
    });
    return badgesHtml;
  }

  // Render Visual Git DAG Branch Tree Graph in History View
  function renderGitGraphTree(commits) {
    if (!gitGraphTreeContainer) return;
    gitGraphTreeContainer.innerHTML = '';

    if (!commits || commits.length === 0) {
      gitGraphTreeContainer.innerHTML = `
        <div class="diff-empty-state" style="margin-top: 60px;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>No commits match the selected filters</p>
        </div>
      `;
      return;
    }

    const graphRows = calculateGitGraph(commits);
    let overallMaxLanes = 1;
    graphRows.forEach(r => {
      if (r.maxLanes > overallMaxLanes) overallMaxLanes = r.maxLanes;
    });

    const ROW_HEIGHT = 34;
    const LANE_WIDTH = 18;
    const START_X = 16;
    const svgWidth = START_X + overallMaxLanes * LANE_WIDTH + 10;

    const table = document.createElement('div');
    table.className = 'git-graph-table';

    // Find current branch ahead commits
    const currentLocalBranch = state.branchesData?.local?.find(b => b.name === (selectHistoryBranch.value || state.branchesData.current));
    const aheadCount = currentLocalBranch ? (currentLocalBranch.ahead || 0) : 0;
    const aheadHashes = new Set();
    if (aheadCount > 0 && state.historyData && state.historyData.length > 0) {
      for (let i = 0; i < Math.min(aheadCount, state.historyData.length); i++) {
        aheadHashes.add(state.historyData[i].hash);
      }
    }

    graphRows.forEach((row, idx) => {
      const c = row.commit;
      const parsedRefs = parseCommitRefs(c.refs);
      const isHead = parsedRefs.some(r => r.type === 'head');
      const isAhead = aheadHashes.has(c.hash);
      const nodeX = START_X + row.lane * LANE_WIDTH;
      const nodeY = ROW_HEIGHT / 2;

      // Build SVG paths for this row
      let svgContent = '';

      // 1. Passing lines from parent/child branches
      row.passingLanes.forEach(pLane => {
        const px = START_X + pLane * LANE_WIDTH;
        const pColor = DAG_COLORS[pLane % DAG_COLORS.length];
        svgContent += `<line x1="${px}" y1="0" x2="${px}" y2="${ROW_HEIGHT}" stroke="${pColor}" stroke-width="2.5" stroke-linecap="round" />`;
      });

      // 2. Incoming and Outgoing routes
      row.routes.forEach(route => {
        const fromX = START_X + route.fromLane * LANE_WIDTH;
        const toX = START_X + route.toLane * LANE_WIDTH;
        const routeColor = DAG_COLORS[route.fromLane % DAG_COLORS.length];

        if (route.fromLane === route.toLane) {
          svgContent += `<line x1="${fromX}" y1="${nodeY}" x2="${fromX}" y2="${ROW_HEIGHT}" stroke="${routeColor}" stroke-width="2.5" stroke-linecap="round" />`;
        } else {
          // Smooth bezier curve for branch fork / merge
          svgContent += `<path d="M ${fromX} ${nodeY} C ${fromX} ${nodeY + 12}, ${toX} ${ROW_HEIGHT - 12}, ${toX} ${ROW_HEIGHT}" fill="none" stroke="${routeColor}" stroke-width="2.5" stroke-linecap="round" />`;
        }
      });

      // Line from top of row to node
      if (idx > 0) {
        svgContent += `<line x1="${nodeX}" y1="0" x2="${nodeX}" y2="${nodeY}" stroke="${row.color}" stroke-width="2.5" stroke-linecap="round" />`;
      }

      // 3. Node Circle (Dot)
      const dotFill = isHead ? '#f1e05a' : (isAhead ? '#22c55e' : '#3b82f6');
      const dotStroke = isHead ? '#ffffff' : '#0d1117';
      const isMerge = (c.parents || []).length > 1;
      const dotRadius = isMerge ? 5.5 : 4.5;

      svgContent += `<circle cx="${nodeX}" cy="${nodeY}" r="${dotRadius}" fill="${dotFill}" stroke="${dotStroke}" stroke-width="2" />`;
      if (isMerge) {
        svgContent += `<circle cx="${nodeX}" cy="${nodeY}" r="2" fill="#ffffff" />`;
      }

      const badgesHtml = createRefBadgesHtml(parsedRefs, isAhead);

      const rowEl = document.createElement('div');
      rowEl.className = `graph-row ${isAhead ? 'is-ahead-row' : ''} ${state.selectedCommit?.hash === c.hash ? 'selected' : ''}`;
      rowEl.setAttribute('data-hash', c.hash);

      const dateInfo = formatCommitTimestamp(c.date || c.authorDate);
      const shortHash = c.shortHash || (c.hash ? c.hash.slice(0, 7) : '');

      rowEl.innerHTML = `
        <div class="graph-track-cell" style="width: ${svgWidth}px;">
          <svg class="graph-svg" width="${svgWidth}" height="${ROW_HEIGHT}">
            ${svgContent}
          </svg>
        </div>
        <div class="graph-info-cell">
          <div class="graph-commit-left-section">
            ${badgesHtml ? `<div class="graph-refs-container">${badgesHtml}</div>` : ''}
            <span class="graph-commit-subject" title="${escapeHtml(c.message)}">${escapeHtml(c.message)}</span>
          </div>
          <div class="graph-commit-right-meta">
            <span class="graph-commit-author" title="Author: ${escapeHtml(c.author_name)}">${escapeHtml(c.author_name)}</span>
            <span class="graph-commit-date" title="Timestamp: ${dateInfo.fullStr} (${dateInfo.relStr})">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity: 0.6; flex-shrink: 0;">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>${dateInfo.relStr}</span>
            </span>
            <span class="graph-commit-hash" title="Commit SHA: ${c.hash}">${shortHash}</span>
            <div class="commit-action-btn-group">
              <button class="branch-action-mini-btn btn-row-checkout-commit" title="Checkout commit ${shortHash}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 14 4 9 9 4"></polyline>
                  <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
                </svg>
              </button>
              <button class="branch-action-mini-btn btn-row-copy-hash" title="Copy full SHA">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;

      const btnRowCheckout = rowEl.querySelector('.btn-row-checkout-commit');
      if (btnRowCheckout) {
        btnRowCheckout.addEventListener('click', (e) => {
          e.stopPropagation();
          openCheckoutCommitModal(c);
        });
      }

      const btnRowCopy = rowEl.querySelector('.btn-row-copy-hash');
      if (btnRowCopy) {
        btnRowCopy.addEventListener('click', (e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(c.hash);
          showToast(`Copied SHA: ${shortHash}`, 'info');
        });
      }

      rowEl.addEventListener('click', () => {
        openCommitDetailPage(c);
      });

      table.appendChild(rowEl);
    });

    gitGraphTreeContainer.appendChild(table);
  }

  // Render Visual Branch Ahead DAG Tree Graph in Staging Panel (matching exact Ahead Mockup)
  function renderStagingBranchGraph(commits) {
    if (!stagingBranchGraphContainer) return;
    stagingBranchGraphContainer.innerHTML = '';

    if (!commits || commits.length === 0) {
      stagingBranchGraphContainer.innerHTML = `
        <div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 11px;">
          No commits in repository
        </div>
      `;
      return;
    }

    const graphRows = calculateGitGraph(commits.slice(0, 50));
    let overallMaxLanes = 1;
    graphRows.forEach(r => {
      if (r.maxLanes > overallMaxLanes) overallMaxLanes = r.maxLanes;
    });

    const ROW_HEIGHT = 28;
    const LANE_WIDTH = 14;
    const START_X = 12;
    const svgWidth = START_X + overallMaxLanes * LANE_WIDTH + 8;

    const table = document.createElement('div');
    table.className = 'staging-graph-table';

    const currentHeadBranch = state.branchesData?.current || '';
    const currentLocalBranch = state.branchesData?.local?.find(b => b.name === currentHeadBranch);
    const aheadCount = currentLocalBranch ? (currentLocalBranch.ahead || 0) : 0;
    const aheadHashes = new Set();
    if (aheadCount > 0 && state.historyData && state.historyData.length > 0) {
      for (let i = 0; i < Math.min(aheadCount, state.historyData.length); i++) {
        aheadHashes.add(state.historyData[i].hash);
      }
    }

    graphRows.forEach((row, idx) => {
      const c = row.commit;
      const parsedRefs = parseCommitRefs(c.refs);
      const isHead = parsedRefs.some(r => r.type === 'head') || c.refs.includes(currentHeadBranch);
      const isAhead = aheadHashes.has(c.hash);
      const nodeX = START_X + row.lane * LANE_WIDTH;
      const nodeY = ROW_HEIGHT / 2;

      let svgContent = '';

      // 1. Passing lines
      row.passingLanes.forEach(pLane => {
        const px = START_X + pLane * LANE_WIDTH;
        const pColor = DAG_COLORS[pLane % DAG_COLORS.length];
        svgContent += `<line x1="${px}" y1="0" x2="${px}" y2="${ROW_HEIGHT}" stroke="${pColor}" stroke-width="2.2" stroke-linecap="round" />`;
      });

      // 2. Incoming and Outgoing routes
      row.routes.forEach(route => {
        const fromX = START_X + route.fromLane * LANE_WIDTH;
        const toX = START_X + route.toLane * LANE_WIDTH;
        const routeColor = DAG_COLORS[route.fromLane % DAG_COLORS.length];

        if (route.fromLane === route.toLane) {
          svgContent += `<line x1="${fromX}" y1="${nodeY}" x2="${fromX}" y2="${ROW_HEIGHT}" stroke="${routeColor}" stroke-width="2.2" stroke-linecap="round" />`;
        } else {
          svgContent += `<path d="M ${fromX} ${nodeY} C ${fromX} ${nodeY + 10}, ${toX} ${ROW_HEIGHT - 10}, ${toX} ${ROW_HEIGHT}" fill="none" stroke="${routeColor}" stroke-width="2.2" stroke-linecap="round" />`;
        }
      });

      if (idx > 0) {
        svgContent += `<line x1="${nodeX}" y1="0" x2="${nodeX}" y2="${nodeY}" stroke="${row.color}" stroke-width="2.2" stroke-linecap="round" />`;
      }

      // 3. Node circle dot
      const dotFill = isHead ? '#f1e05a' : (isAhead ? '#22c55e' : '#3b82f6');
      const dotStroke = '#0d1117';
      const isMerge = (c.parents || []).length > 1;
      const dotRadius = isMerge ? 4.5 : 3.8;

      svgContent += `<circle cx="${nodeX}" cy="${nodeY}" r="${dotRadius}" fill="${dotFill}" stroke="${dotStroke}" stroke-width="1.8" />`;
      if (isMerge) {
        svgContent += `<circle cx="${nodeX}" cy="${nodeY}" r="1.5" fill="#ffffff" />`;
      }

      const badgesHtml = createRefBadgesHtml(parsedRefs, isAhead);

      const rowEl = document.createElement('div');
      rowEl.className = `staging-graph-row ${isHead ? 'is-head' : ''} ${isAhead ? 'is-ahead-row' : ''}`;
      rowEl.title = `Commit ${c.shortHash || c.hash.slice(0, 7)}: ${c.message}\nAuthor: ${c.author_name}`;

      rowEl.innerHTML = `
        <div class="staging-graph-track" style="width: ${svgWidth}px;">
          <svg width="${svgWidth}" height="${ROW_HEIGHT}">
            ${svgContent}
          </svg>
        </div>
        <div class="staging-graph-info">
          ${badgesHtml}
          <span class="staging-graph-subject">${escapeHtml(c.message)}</span>
        </div>
      `;

      rowEl.addEventListener('click', () => {
        tabHistory.click();
        openCommitDetailPage(c);
      });

      table.appendChild(rowEl);
    });

    stagingBranchGraphContainer.appendChild(table);
  }

  // Toggle Staging Branch Graph collapse
  if (headerToggleStagingGraph) {
    headerToggleStagingGraph.addEventListener('click', () => {
      if (stagingBranchGraphSection) {
        stagingBranchGraphSection.classList.toggle('collapsed');
      }
    });
  }

  // Render GitHub-Style Commits List View (Timeline)
  function renderGitHubCommitsList(commits) {
    commitsTimelineContainer.innerHTML = '';

    if (!commits || commits.length === 0) {
      commitsTimelineContainer.innerHTML = `
        <div class="diff-empty-state" style="margin-top: 60px;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>No commits match the selected filters</p>
        </div>
      `;
      return;
    }

    // Determine unpushed ahead commits for current history branch
    const viewedBranchName = selectHistoryBranch.value || state.branchesData?.current;
    const currentLocalBranch = state.branchesData?.local?.find(b => b.name === viewedBranchName);
    const aheadCount = currentLocalBranch ? (currentLocalBranch.ahead || 0) : 0;
    const aheadHashes = new Set();
    if (aheadCount > 0 && state.historyData && state.historyData.length > 0) {
      for (let i = 0; i < Math.min(aheadCount, state.historyData.length); i++) {
        aheadHashes.add(state.historyData[i].hash);
      }
    }

    const groups = {};
    commits.forEach(commit => {
      const dateKey = formatDateGroup(commit.date);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(commit);
    });

    Object.keys(groups).forEach(dateLabel => {
      const groupEl = document.createElement('div');
      groupEl.className = 'commit-timeline-group';

      groupEl.innerHTML = `
        <div class="commit-group-header">
          <div class="timeline-node"></div>
          <span>Commits on ${dateLabel}</span>
        </div>
      `;

      const cardsContainer = document.createElement('div');
      cardsContainer.className = 'commit-group-cards';

      groups[dateLabel].forEach(commit => {
        const row = document.createElement('div');
        row.className = 'github-commit-row';
        const initials = getInitials(commit.author_name);
        const relTime = formatRelativeTime(commit.date);
        const shortHash = commit.shortHash || commit.hash.slice(0, 7);
        const isAhead = aheadHashes.has(commit.hash);
        const aheadBadgeHtml = isAhead
          ? `<span class="badge-unpushed-commit" title="Ahead commit: not yet pushed to ${escapeHtml(currentLocalBranch?.upstream || 'remote')}">▲ Ahead</span>`
          : '';

        row.innerHTML = `
          <div class="gh-commit-left">
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              <span class="gh-commit-title">${escapeHtml(commit.message)}</span>
              ${aheadBadgeHtml}
            </div>
            <div class="gh-commit-meta">
              <div class="avatar-circle">${initials}</div>
              <span style="font-weight: 500; color: #c9d1d9;">${escapeHtml(commit.author_name)}</span>
              <span>committed ${relTime}</span>
            </div>
          </div>
          <div class="gh-commit-right">
            <button class="btn-hash-pill" title="View commit changes (${shortHash})">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="opacity: 0.85;">
                <circle cx="12" cy="12" r="4"></circle>
                <line x1="1.05" y1="12" x2="7" y2="12"></line>
                <line x1="17.01" y1="12" x2="22.96" y2="12"></line>
              </svg>
              <span>${shortHash}</span>
            </button>
            <div class="commit-action-btn-group">
              <button class="branch-btn-icon btn-gh-checkout-commit" title="Checkout commit ${shortHash} (Switch / Detached HEAD)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 14 4 9 9 4"></polyline>
                  <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
                </svg>
              </button>
              <button class="branch-btn-icon btn-gh-copy-hash" title="Copy full SHA (${commit.hash})">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>
        `;

        const btnGhCheckout = row.querySelector('.btn-gh-checkout-commit');
        if (btnGhCheckout) {
          btnGhCheckout.addEventListener('click', (e) => {
            e.stopPropagation();
            openCheckoutCommitModal(commit);
          });
        }

        row.querySelector('.btn-gh-copy-hash').addEventListener('click', (e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(commit.hash);
          showToast(`Copied SHA: ${shortHash}`, 'info');
        });

        row.addEventListener('click', () => {
          openCommitDetailPage(commit);
        });

        cardsContainer.appendChild(row);
      });

      groupEl.appendChild(cardsContainer);
      commitsTimelineContainer.appendChild(groupEl);
    });
  }

  // Open GitHub-Style Commit Changes Detail View
  async function openCommitDetailPage(commit) {
    state.selectedCommit = commit;
    state.historyViewMode = 'detail';

    commitsListPage.style.display = 'none';
    commitDetailPage.style.display = 'flex';

    // Populate Top Banner Info
    cdTitle.textContent = commit.message || '';
    const shortHash = commit.shortHash || (commit.hash ? commit.hash.slice(0, 7) : '');
    cdHashShort.textContent = shortHash;
    cdBranchTag.textContent = state.branchesData?.current || 'main';
    cdAuthor.textContent = commit.author_name || 'Unknown';
    cdAvatar.textContent = getInitials(commit.author_name || 'Unknown');
    const commitDate = commit.date || commit.authorDate || '';
    cdDate.textContent = commitDate ? `committed on ${formatDateGroup(commitDate)} (${formatRelativeTime(commitDate)})` : '';

    const pArray = Array.isArray(commit.parents)
      ? commit.parents
      : (typeof commit.parents === 'string' ? commit.parents.trim().split(/\s+/).filter(Boolean) : []);
    cdParents.textContent = `${pArray.length} parent${pArray.length === 1 ? '' : 's'}`;

    if (commit.body && commit.body.trim()) {
      cdBody.textContent = commit.body;
      cdBody.style.display = 'block';
    } else {
      cdBody.style.display = 'none';
    }

    btnCdCopyHash.onclick = () => {
      navigator.clipboard.writeText(commit.hash);
      showToast(`Copied commit SHA: ${commit.hash}`, 'info');
    };

    if (btnCdCheckoutCommit) {
      btnCdCheckoutCommit.onclick = () => {
        openCheckoutCommitModal(commit);
      };
    }

    // Load Commit Detailed Changes & Diff
    commitFilesTree.innerHTML = '<div style="padding: 12px; color: var(--text-muted); font-size: 11px;">Loading changed files...</div>';
    commitDiffsStream.innerHTML = '<div style="padding: 20px; color: var(--text-muted); font-size: 12px;">Loading diffs...</div>';

    const detailRes = await window.api.getCommitDetail(state.currentRepoPath, commit.hash);
    if (!detailRes.success) {
      commitFilesTree.innerHTML = '<div style="padding: 12px; color: var(--red-hover); font-size: 11px;">Failed to load files</div>';
      commitDiffsStream.innerHTML = `<div class="diff-empty-state"><p style="color: var(--red-hover);">Failed to load commit changes: ${detailRes.error}</p></div>`;
      return;
    }

    if (detailRes.data.meta) {
      const m = detailRes.data.meta;
      if (m.message) cdTitle.textContent = m.message;
      if (m.author_name) cdAuthor.textContent = m.author_name;
      if (m.date) cdDate.textContent = `committed on ${formatDateGroup(m.date)} (${formatRelativeTime(m.date)})`;
      if (m.body) {
        cdBody.textContent = m.body;
        cdBody.style.display = 'block';
      }
      if (m.parents) {
        const pList = m.parents.trim().split(/\s+/).filter(Boolean);
        cdParents.textContent = `${pList.length} parent${pList.length === 1 ? '' : 's'}`;
      }
    }

    state.currentCommitDetail = detailRes.data;
    renderCommitChangesView(detailRes.data);
  }

  // Render Commit Changes (File Tree + Focused or Stacked Diff Cards)
  async function renderCommitChangesView(detail) {
    const { files, totalAdditions, totalDeletions, fileDiffs, isLargeCommit } = detail;
    state.commitFilesList = files;
    state.currentCommitFileIndex = 0;
    if (!state.commitViewMode) state.commitViewMode = 'focused';

    // Update Stats Bar
    cdFilesCount.textContent = `${files.length.toLocaleString()} changed file${files.length === 1 ? '' : 's'}`;
    cdAdditions.textContent = `+${totalAdditions.toLocaleString()}`;
    cdDeletions.textContent = `-${totalDeletions.toLocaleString()}`;

    const totalLines = totalAdditions + totalDeletions;
    const greenPercent = totalLines > 0 ? (totalAdditions / totalLines) * 100 : 100;
    cdDiffBar.innerHTML = `<div class="diff-ratio-green" style="width: ${greenPercent}%;"></div>`;

    // Render Left Changed Files Tree
    renderCommitFilesTree(files);

    // Refresh right pane based on view mode
    renderCommitRightPane();
  }

  function renderCommitRightPane() {
    if (!state.currentCommitDetail) return;
    const { files, fileDiffs, isLargeCommit } = state.currentCommitDetail;
    commitDiffsStream.innerHTML = '';

    // Diff Map
    const diffMap = new Map();
    if (fileDiffs) {
      fileDiffs.forEach(fd => diffMap.set(fd.filePath, fd.diff));
    }

    // Toolbar with View Mode switcher (Focused File vs Stacked Stream)
    const toolbar = document.createElement('div');
    toolbar.className = 'diff-stream-toolbar';

    const isFocused = state.commitViewMode === 'focused';

    toolbar.innerHTML = `
      <div class="diff-stream-toolbar-left">
        <span><strong>${files.length}</strong> changed files</span>
        <div class="view-mode-pill-group">
          <button id="btn-mode-focused" class="view-mode-pill ${isFocused ? 'active' : ''}">📄 Selected File</button>
          <button id="btn-mode-stream" class="view-mode-pill ${!isFocused ? 'active' : ''}">📜 All Files</button>
        </div>
      </div>
      <div class="diff-stream-toolbar-actions">
        ${isFocused ? `
          <span style="font-size: 11px; color: var(--text-muted); margin-right: 4px;">File ${state.currentCommitFileIndex + 1} of ${files.length}</span>
          <button id="btn-file-prev" class="btn" style="padding: 2px 8px; font-size: 11px;" ${state.currentCommitFileIndex === 0 ? 'disabled' : ''}>← Prev</button>
          <button id="btn-file-next" class="btn" style="padding: 2px 8px; font-size: 11px;" ${state.currentCommitFileIndex >= files.length - 1 ? 'disabled' : ''}>Next →</button>
        ` : `
          <button id="btn-stream-expand-all" class="btn-diff-action" title="Expand all file diffs">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="7 13 12 18 17 13"></polyline>
              <polyline points="7 6 12 11 17 6"></polyline>
            </svg>
            <span>Expand All</span>
          </button>
          <button id="btn-stream-collapse-all" class="btn-diff-action" title="Collapse all file diffs">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="7 11 12 6 17 11"></polyline>
              <polyline points="7 18 12 13 17 18"></polyline>
            </svg>
            <span>Collapse All</span>
          </button>
        `}
      </div>
    `;

    commitDiffsStream.appendChild(toolbar);

    // Switch View Mode Event Listeners
    toolbar.querySelector('#btn-mode-focused').addEventListener('click', () => {
      state.commitViewMode = 'focused';
      renderCommitRightPane();
    });

    toolbar.querySelector('#btn-mode-stream').addEventListener('click', () => {
      state.commitViewMode = 'stream';
      renderCommitRightPane();
    });

    if (isFocused) {
      // Focused Single File View
      const currentFile = files[state.currentCommitFileIndex] || files[0];
      if (currentFile) {
        const focusedContainer = createFocusedDiffView(currentFile, diffMap.get(currentFile.path));
        commitDiffsStream.appendChild(focusedContainer);

        // Prev / Next button listeners
        const btnPrev = toolbar.querySelector('#btn-file-prev');
        const btnNext = toolbar.querySelector('#btn-file-next');

        if (btnPrev) {
          btnPrev.addEventListener('click', () => {
            if (state.currentCommitFileIndex > 0) {
              selectCommitFileByIndex(state.currentCommitFileIndex - 1);
            }
          });
        }

        if (btnNext) {
          btnNext.addEventListener('click', () => {
            if (state.currentCommitFileIndex < files.length - 1) {
              selectCommitFileByIndex(state.currentCommitFileIndex + 1);
            }
          });
        }
      }
    } else {
      // Stacked All Files View
      if (isLargeCommit) {
        const warning = document.createElement('div');
        warning.className = 'commit-large-warning';
        warning.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>Large Commit (${files.length.toLocaleString()} files). Diffs load on demand when you expand cards.</span>
        `;
        commitDiffsStream.appendChild(warning);
      }

      const autoExpandCount = files.length <= 15 ? files.length : 5;

      files.forEach((file, index) => {
        const shouldExpand = index < autoExpandCount;
        const preloadedDiff = diffMap.get(file.path);
        const card = createDiffCard(file, shouldExpand, preloadedDiff);
        commitDiffsStream.appendChild(card);
      });

      toolbar.querySelector('#btn-stream-expand-all').addEventListener('click', async () => {
        const cards = Array.from(commitDiffsStream.querySelectorAll('.file-diff-card'));
        await Promise.all(cards.map(c => expandCard(c)));
      });

      toolbar.querySelector('#btn-stream-collapse-all').addEventListener('click', () => {
        const cards = commitDiffsStream.querySelectorAll('.file-diff-card');
        cards.forEach(c => collapseCard(c));
      });
    }
  }

  // Get File Extension Tag & Badge Class
  function getFileExtBadge(path) {
    const lower = (path || '').toLowerCase();
    if (lower.endsWith('.blade.php')) return { ext: 'BLADE', cls: 'ext-blade' };
    if (lower.endsWith('.php')) return { ext: 'PHP', cls: 'ext-php' };
    if (lower.endsWith('.js') || lower.endsWith('.jsx') || lower.endsWith('.mjs') || lower.endsWith('.cjs')) return { ext: 'JS', cls: 'ext-js' };
    if (lower.endsWith('.ts') || lower.endsWith('.tsx')) return { ext: 'TS', cls: 'ext-ts' };
    if (lower.endsWith('.json')) return { ext: 'JSON', cls: 'ext-json' };
    if (lower.endsWith('.css') || lower.endsWith('.scss') || lower.endsWith('.sass') || lower.endsWith('.less')) return { ext: 'CSS', cls: 'ext-css' };
    if (lower.endsWith('.html') || lower.endsWith('.htm')) return { ext: 'HTML', cls: 'ext-html' };
    if (lower.endsWith('.md') || lower.endsWith('.markdown')) return { ext: 'MD', cls: 'ext-md' };
    if (lower.endsWith('.py')) return { ext: 'PY', cls: 'ext-py' };
    if (lower.endsWith('.go')) return { ext: 'GO', cls: 'ext-go' };
    if (lower.endsWith('.rs')) return { ext: 'RS', cls: 'ext-rs' };
    if (lower.endsWith('.svg')) return { ext: 'SVG', cls: 'ext-svg' };
    const parts = lower.split('/');
    const filename = parts[parts.length - 1];
    const fileParts = filename.split('.');
    const ext = fileParts.length > 1 ? fileParts[fileParts.length - 1].slice(0, 5) : 'FILE';
    return { ext: ext.toUpperCase(), cls: 'ext-default' };
  }

  // Create Focused Single-File Diff View
  function createFocusedDiffView(file, preloadedDiff = null) {
    const container = document.createElement('div');
    container.className = 'commit-focused-file-container';

    const lastSlash = file.path.lastIndexOf('/');
    const dirPart = lastSlash !== -1 ? file.path.substring(0, lastSlash + 1) : '';
    const filePart = lastSlash !== -1 ? file.path.substring(lastSlash + 1) : file.path;
    const extBadge = getFileExtBadge(file.path);

    container.innerHTML = `
      <div class="focused-file-header">
        <div class="focused-file-info">
          <span class="file-type-pill ${extBadge.cls}">${extBadge.ext}</span>
          <div class="file-diff-path-text" title="${escapeHtml(file.path)}">
            ${dirPart ? `<span class="diff-path-dir">${escapeHtml(dirPart)}</span>` : ''}<span class="diff-path-name">${escapeHtml(filePart)}</span>
          </div>
          <button class="branch-btn-icon btn-copy-filepath" title="Copy file path">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>
        <div class="focused-file-actions">
          <button class="btn btn-file-history-card" title="View file history">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 14 14"></polyline>
            </svg>
            <span>History</span>
          </button>
          <div class="diff-stat-badges">
            ${file.isBinary ? '<span class="diff-stat-binary">BIN</span>' : `
              <span class="diff-stat-add">+${file.additions}</span>
              <span class="diff-stat-del">-${file.deletions}</span>
            `}
          </div>
        </div>
      </div>
      <div class="focused-file-body">
        ${preloadedDiff ? '' : '<div style="padding: 20px; color: var(--text-muted);">Loading file diff...</div>'}
      </div>
    `;

    const bodyEl = container.querySelector('.focused-file-body');

    if (preloadedDiff) {
      DiffViewer.render(preloadedDiff, bodyEl, file.path);
    } else {
      loadFocusedDiff(file.path, bodyEl);
    }

    container.querySelector('.btn-copy-filepath').addEventListener('click', () => {
      navigator.clipboard.writeText(file.path);
      showToast(`Copied path: ${file.path}`, 'info');
    });

    container.querySelector('.btn-file-history-card').addEventListener('click', () => {
      openFileHistoryModal(file.path);
    });

    return container;
  }

  async function loadFocusedDiff(filePath, targetEl) {
    if (!state.currentRepoPath || !state.selectedCommit || !filePath) return;
    const res = await window.api.getCommitFileDiff(state.currentRepoPath, state.selectedCommit.hash, filePath);
    if (res.success) {
      DiffViewer.render(res.diff, targetEl, filePath);
    } else {
      targetEl.innerHTML = `<div style="padding: 20px; color: var(--red-hover);">Failed to load diff: ${res.error}</div>`;
    }
  }

  function selectCommitFileByIndex(index) {
    if (!state.currentCommitDetail || !state.currentCommitDetail.files[index]) return;
    state.currentCommitFileIndex = index;
    const file = state.currentCommitDetail.files[index];

    // Highlight in sidebar
    document.querySelectorAll('.tree-file-item').forEach(item => item.classList.remove('selected'));
    const safeId = `tree-item-${escapeHtml(file.path).replace(/[^a-zA-Z0-9]/g, '_')}`;
    const treeItem = document.getElementById(safeId);
    if (treeItem) {
      treeItem.classList.add('selected');
      treeItem.scrollIntoView({ block: 'nearest' });
    }

    if (state.commitViewMode === 'focused') {
      renderCommitRightPane();
    } else {
      loadFileDiffIntoStream(file);
    }
  }

  // Create Diff Card with Expand / Collapse and on-demand fetch
  function createDiffCard(file, isExpanded = true, preloadedDiff = null) {
    const safeId = `diff-card-${escapeHtml(file.path).replace(/[^a-zA-Z0-9]/g, '_')}`;
    const card = document.createElement('div');
    card.className = `file-diff-card ${isExpanded ? '' : 'collapsed'}`;
    card.id = safeId;
    card.dataset.filePath = file.path;
    card.dataset.loaded = preloadedDiff ? 'true' : 'false';

    const lastSlash = file.path.lastIndexOf('/');
    const dirPart = lastSlash !== -1 ? file.path.substring(0, lastSlash + 1) : '';
    const filePart = lastSlash !== -1 ? file.path.substring(lastSlash + 1) : file.path;
    const extBadge = getFileExtBadge(file.path);

    card.innerHTML = `
      <div class="file-diff-card-header" title="Click to ${isExpanded ? 'collapse' : 'expand'}">
        <div class="file-diff-card-title">
          <span class="diff-toggle-chevron">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
          <span class="file-type-pill ${extBadge.cls}">${extBadge.ext}</span>
          <div class="file-diff-path-text" title="${escapeHtml(file.path)}">
            ${dirPart ? `<span class="diff-path-dir">${escapeHtml(dirPart)}</span>` : ''}<span class="diff-path-name">${escapeHtml(filePart)}</span>
          </div>
          <button class="branch-btn-icon btn-copy-filepath" title="Copy file path">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <span class="collapsed-status-tag">Collapsed</span>
        </div>
        <div class="file-diff-card-actions">
          <button class="btn btn-file-history-card" title="View file history">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 14 14"></polyline>
            </svg>
            <span>History</span>
          </button>
          <div class="diff-stat-badges">
            ${file.isBinary ? '<span class="diff-stat-binary">BIN</span>' : `
              <span class="diff-stat-add">+${file.additions}</span>
              <span class="diff-stat-del">-${file.deletions}</span>
            `}
          </div>
        </div>
      </div>
      <div class="file-diff-card-body">
        ${preloadedDiff ? '' : '<div style="padding: 16px; color: var(--text-muted);">Loading file diff...</div>'}
      </div>
    `;

    const bodyEl = card.querySelector('.file-diff-card-body');

    if (preloadedDiff) {
      DiffViewer.render(preloadedDiff, bodyEl, file.path);
    } else if (isExpanded) {
      loadCardDiff(card, file.path);
    }

    // Copy File Path
    card.querySelector('.btn-copy-filepath').addEventListener('click', (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(file.path);
      showToast(`Copied path: ${file.path}`, 'info');
    });

    // File History
    card.querySelector('.btn-file-history-card').addEventListener('click', (e) => {
      e.stopPropagation();
      openFileHistoryModal(file.path);
    });

    // Click on entire header to toggle expand/collapse
    const header = card.querySelector('.file-diff-card-header');
    header.addEventListener('click', async (e) => {
      if (e.target.closest('button')) return;
      if (card.classList.contains('collapsed')) {
        await expandCard(card);
      } else {
        collapseCard(card);
      }
    });

    return card;
  }

  // Expand Diff Card and Fetch Content if not loaded
  async function expandCard(card) {
    if (!card) return;
    const header = card.querySelector('.file-diff-card-header');
    const filePath = card.dataset.filePath;

    card.classList.remove('collapsed');
    if (header) header.title = 'Click to collapse';

    if (card.dataset.loaded !== 'true' && filePath) {
      await loadCardDiff(card, filePath);
    }
  }

  // Collapse Diff Card
  function collapseCard(card) {
    if (!card) return;
    const header = card.querySelector('.file-diff-card-header');

    card.classList.add('collapsed');
    if (header) header.title = 'Click to expand';
  }

  // Load Diff for a Single Card
  async function loadCardDiff(card, filePath) {
    if (!card || !filePath || !state.currentRepoPath || !state.selectedCommit) return;
    const bodyEl = card.querySelector('.file-diff-card-body');
    bodyEl.innerHTML = '<div style="padding: 16px; color: var(--text-muted);">Loading file diff...</div>';

    const diffRes = await window.api.getCommitFileDiff(state.currentRepoPath, state.selectedCommit.hash, filePath);
    if (diffRes.success) {
      DiffViewer.render(diffRes.diff, bodyEl, filePath);
      card.dataset.loaded = 'true';
    } else {
      bodyEl.innerHTML = `<div style="padding: 16px; color: var(--red-hover);">Failed to load diff: ${diffRes.error}</div>`;
    }
  }

  // Render Changed Files Sidebar Tree
  function renderCommitFilesTree(files) {
    commitFilesTree.innerHTML = '';
    const filterTerm = inputFilterCommitFiles.value.trim().toLowerCase();

    const filteredFiles = files.filter(f => !filterTerm || f.path.toLowerCase().includes(filterTerm));

    if (filteredFiles.length === 0) {
      commitFilesTree.innerHTML = '<div style="padding: 10px; color: var(--text-muted); font-size: 11px;">No files match filter</div>';
      return;
    }

    filteredFiles.forEach((f, idx) => {
      const li = document.createElement('div');
      const isSelected = idx === state.currentCommitFileIndex;
      li.className = `tree-file-item ${isSelected ? 'selected' : ''}`;
      li.id = `tree-item-${escapeHtml(f.path).replace(/[^a-zA-Z0-9]/g, '_')}`;

      // Extract file extension
      const ext = f.path.includes('.') ? f.path.split('.').pop().slice(0, 4) : 'FILE';

      li.innerHTML = `
        <div class="tree-file-name-box" title="${escapeHtml(f.path)}">
          <span class="tree-file-ext-badge">${escapeHtml(ext)}</span>
          <span>${escapeHtml(f.path)}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
          <button class="branch-btn-icon btn-file-history-item" title="View file history" style="padding: 1px 3px;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 14 14"></polyline>
            </svg>
          </button>
          <span class="tree-stat-pill ${f.additions > 0 ? 'diff-stat-add' : 'diff-stat-del'}">
            ${f.isBinary ? 'BIN' : `+${f.additions}`}
          </span>
        </div>
      `;

      li.querySelector('.btn-file-history-item').addEventListener('click', (e) => {
        e.stopPropagation();
        openFileHistoryModal(f.path);
      });

      li.addEventListener('click', () => {
        const originalIndex = files.indexOf(f);
        if (originalIndex !== -1) {
          selectCommitFileByIndex(originalIndex);
        }
      });

      commitFilesTree.appendChild(li);
    });
  }

  inputFilterCommitFiles.addEventListener('input', () => {
    if (state.currentCommitDetail) {
      renderCommitFilesTree(state.currentCommitDetail.files);
    }
  });

  // Load a single file diff dynamically into the right stream
  async function loadFileDiffIntoStream(file) {
    if (!state.currentRepoPath || !state.selectedCommit || !file) return;

    const safeId = `diff-card-${escapeHtml(file.path).replace(/[^a-zA-Z0-9]/g, '_')}`;
    let card = document.getElementById(safeId);

    document.querySelectorAll('.file-diff-card').forEach(c => c.classList.remove('active-target'));

    if (card) {
      card.classList.add('active-target');
      await expandCard(card);
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Back to Commits List Button
  btnBackToCommits.addEventListener('click', () => {
    state.historyViewMode = 'list';
    commitDetailPage.style.display = 'none';
    commitsListPage.style.display = 'flex';
  });

  // ==========================================
  // File-Wise History Modal Controller
  // ==========================================
  // ==========================================
  // File-Wise History Modal Controller
  // ==========================================
  async function openFileHistoryModal(filePath = null) {
    if (!state.currentRepoPath) {
      showToast('Please open a repository first', 'error');
      return;
    }

    modalFileHistory.classList.add('active');

    // Ensure repo files cache is loaded
    if (!state.allRepoFiles || state.allRepoFiles.length === 0) {
      await populateRepoFilesDatalist();
    }

    let targetPath = filePath;
    if (!targetPath && state.selectedFile) {
      targetPath = state.selectedFile.path;
    }

    if (targetPath) {
      inputFhSearchFile.value = targetPath;
      btnClearFhSearch.style.display = 'flex';
      hideFhSearchDropdown();
      await loadFileHistory(targetPath);
    } else {
      fhFilePathBadge.textContent = 'Select or search a file';
      fhRevisionsCount.textContent = '0 Revisions';
      fhCommitsList.innerHTML = '<li style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 12px;">Type or search a file to inspect its full revision history</li>';
      fhDiffContainer.innerHTML = '<div class="diff-empty-state"><p>Search or pick a file to view its revision history</p></div>';
      inputFhSearchFile.value = '';
      btnClearFhSearch.style.display = 'none';
      inputFhSearchFile.focus();
      showFhSearchDropdown('');
    }
  }



  // Highlight matched query substring
  function highlightSearchQuery(text, query) {
    if (!query) return escapeHtml(text);
    const escapedText = escapeHtml(text);
    const escapedQuery = escapeHtml(query);
    const idx = escapedText.toLowerCase().indexOf(escapedQuery.toLowerCase());
    if (idx === -1) return escapedText;
    const match = escapedText.substring(idx, idx + escapedQuery.length);
    return `${escapedText.substring(0, idx)}<span class="fh-match-highlight">${match}</span>${escapedText.substring(idx + escapedQuery.length)}`;
  }

  // Show Custom Floating Search Dropdown
  function showFhSearchDropdown(query = '') {
    if (!state.allRepoFiles || state.allRepoFiles.length === 0) return;

    const trimmed = query.trim().toLowerCase();
    btnClearFhSearch.style.display = trimmed ? 'flex' : 'none';

    let matches = [];
    if (!trimmed) {
      matches = state.allRepoFiles.slice(0, 35);
    } else {
      // Score and rank matches: matches in filename rank higher than matches in folder path
      matches = state.allRepoFiles
        .filter(f => f.toLowerCase().includes(trimmed))
        .map(f => {
          const parts = f.split('/');
          const filename = parts[parts.length - 1];
          const filenameLower = filename.toLowerCase();
          const inFilename = filenameLower.includes(trimmed);
          const exactFilename = filenameLower === trimmed;
          const startsWith = filenameLower.startsWith(trimmed);
          let score = 0;
          if (exactFilename) score = 100;
          else if (startsWith) score = 50;
          else if (inFilename) score = 25;
          else score = 10;
          return { path: f, score };
        })
        .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path))
        .map(item => item.path)
        .slice(0, 45);
    }

    state.filteredRepoFiles = matches;
    state.activeFhDropdownIndex = matches.length > 0 ? 0 : -1;
    fhSearchMatchesCount.textContent = `Matching Files (${matches.length})`;
    fhSearchResultsList.innerHTML = '';

    if (matches.length === 0) {
      fhSearchResultsList.innerHTML = `
        <div class="fh-search-empty">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span>No repository files match "${escapeHtml(query)}"</span>
        </div>
      `;
      fhSearchDropdownMenu.style.display = 'flex';
      return;
    }

    matches.forEach((filePath, idx) => {
      const parts = filePath.split('/');
      const filename = parts[parts.length - 1];
      const dirPath = parts.length > 1 ? parts.slice(0, -1).join('/') + '/' : '';

      const { ext, cls } = getFileExtBadge(filePath);
      const highlightedFilename = highlightSearchQuery(filename, query);
      const highlightedDir = highlightSearchQuery(dirPath, query);

      const itemEl = document.createElement('div');
      itemEl.className = `fh-search-item ${idx === state.activeFhDropdownIndex ? 'active-item' : ''}`;
      itemEl.setAttribute('data-index', idx);
      itemEl.setAttribute('data-path', filePath);

      itemEl.innerHTML = `
        <span class="fh-file-ext-badge ${cls}">${ext}</span>
        <div class="fh-search-item-info">
          <span class="fh-search-filename">${highlightedFilename}</span>
          ${dirPath ? `<span class="fh-search-dirpath">${highlightedDir}</span>` : ''}
        </div>
      `;

      itemEl.addEventListener('mouseenter', () => {
        state.activeFhDropdownIndex = idx;
        updateActiveDropdownItem();
      });

      itemEl.addEventListener('mousedown', (e) => {
        e.preventDefault();
        selectFileFromDropdown(filePath);
      });

      fhSearchResultsList.appendChild(itemEl);
    });

    fhSearchDropdownMenu.style.display = 'flex';
  }

  function updateActiveDropdownItem() {
    const items = fhSearchResultsList.querySelectorAll('.fh-search-item');
    items.forEach((it, i) => {
      it.classList.toggle('active-item', i === state.activeFhDropdownIndex);
      if (i === state.activeFhDropdownIndex) {
        it.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  function hideFhSearchDropdown() {
    fhSearchDropdownMenu.style.display = 'none';
    state.activeFhDropdownIndex = -1;
  }

  function selectFileFromDropdown(filePath) {
    inputFhSearchFile.value = filePath;
    btnClearFhSearch.style.display = 'flex';
    hideFhSearchDropdown();
    loadFileHistory(filePath);
  }

  // Load File History Timeline & Initial Diff
  async function loadFileHistory(filePath) {
    if (!filePath || !state.currentRepoPath) return;

    state.fileHistoryTarget = filePath;
    fhFilePathBadge.textContent = filePath;
    fhRevisionsCount.textContent = 'Loading...';
    fhCommitsList.innerHTML = '<li style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 12px;">Fetching file revision timeline...</li>';
    fhDiffContainer.innerHTML = '<div class="diff-empty-state"><p>Loading diff...</p></div>';

    const res = await window.api.getFileHistory(state.currentRepoPath, filePath, 100);
    if (!res.success) {
      fhRevisionsCount.textContent = '0 Revisions';
      fhCommitsList.innerHTML = `<li style="padding: 20px; text-align: center; color: var(--red-hover); font-size: 12px;">Error: ${escapeHtml(res.error)}</li>`;
      return;
    }

    state.fileHistoryCommits = res.data;
    fhRevisionsCount.textContent = `${res.data.length} Revision${res.data.length === 1 ? '' : 's'}`;

    if (res.data.length === 0) {
      fhCommitsList.innerHTML = '<li style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 12px;">No commit history found for this file.</li>';
      fhDiffContainer.innerHTML = '<div class="diff-empty-state"><p>No commit history available for this file</p></div>';
      return;
    }

    fhCommitsList.innerHTML = '';
    res.data.forEach((c, idx) => {
      const li = document.createElement('li');
      li.className = `fh-commit-item ${idx === 0 ? 'selected' : ''}`;
      const initials = getInitials(c.author_name);
      const avatarColor = getAvatarColor(c.author_name);
      const relTime = formatRelativeTime(c.date);
      const shortHash = c.shortHash || (c.hash ? c.hash.slice(0, 7) : '');

      li.innerHTML = `
        <div class="fh-commit-title">${escapeHtml(c.message)}</div>
        <div class="fh-commit-meta">
          <div class="commit-author-group">
            <div class="avatar-circle" style="background: ${avatarColor};">${initials}</div>
            <span class="fh-author-name">${escapeHtml(c.author_name)}</span>
            <span class="fh-date-text">· ${relTime}</span>
          </div>
          <span class="commit-hash-pill" title="Commit ${shortHash}">${shortHash}</span>
        </div>
      `;

      li.addEventListener('click', () => {
        document.querySelectorAll('.fh-commit-item').forEach(item => item.classList.remove('selected'));
        li.classList.add('selected');
        loadFileRevision(c, state.fileHistoryViewMode);
      });

      fhCommitsList.appendChild(li);
    });

    // Automatically load first commit
    loadFileRevision(res.data[0], state.fileHistoryViewMode);
  }

  async function loadFileRevision(commit, mode = 'diff') {
    if (!commit || !state.fileHistoryTarget) return;

    state.fileHistorySelectedCommit = commit;
    state.fileHistoryViewMode = mode;

    btnFhViewDiff.classList.toggle('active', mode === 'diff');
    btnFhViewFull.classList.toggle('active', mode === 'full');

    const shortHash = commit.shortHash || (commit.hash ? commit.hash.slice(0, 7) : '');
    const initials = getInitials(commit.author_name);
    const avatarColor = getAvatarColor(commit.author_name);
    const relTime = formatRelativeTime(commit.date);

    fhSelectedCommitInfo.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1;">
        <div class="avatar-circle" style="background: ${avatarColor};">${initials}</div>
        <span style="font-weight: 600; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(commit.message)}</span>
        <span style="color: var(--text-muted); font-size: 11px; flex-shrink: 0;">· ${escapeHtml(commit.author_name)} · ${relTime}</span>
        <span class="commit-hash-pill" style="margin-left: auto;" title="Copy commit hash">${shortHash}</span>
      </div>
    `;

    fhDiffContainer.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 12px;">Loading changes...</div>';

    if (mode === 'diff') {
      const diffRes = await window.api.getCommitFileDiff(state.currentRepoPath, commit.hash, state.fileHistoryTarget);
      if (diffRes.success) {
        DiffViewer.render(diffRes.diff, fhDiffContainer, state.fileHistoryTarget);
      } else {
        fhDiffContainer.innerHTML = `<div class="diff-empty-state"><p style="color: var(--red-hover);">Diff error: ${escapeHtml(diffRes.error)}</p></div>`;
      }
    } else {
      // Full file content at commit with code viewer & syntax highlighting
      const contentRes = await window.api.getFileContentAtCommit(state.currentRepoPath, commit.hash, state.fileHistoryTarget);
      if (contentRes.success) {
        DiffViewer.renderFullFile(contentRes.content, fhDiffContainer, state.fileHistoryTarget);
      } else {
        fhDiffContainer.innerHTML = `<div class="diff-empty-state"><p style="color: var(--red-hover);">Content error: ${escapeHtml(contentRes.error)}</p></div>`;
      }
    }
  }

  // File History Search & Navigation Event Listeners
  btnFileHistoryQuick.addEventListener('click', () => openFileHistoryModal());
  btnDiffFileHistory.addEventListener('click', () => {
    if (state.selectedFile) openFileHistoryModal(state.selectedFile.path);
    else openFileHistoryModal();
  });

  inputFhSearchFile.addEventListener('focus', () => {
    showFhSearchDropdown(inputFhSearchFile.value);
  });

  inputFhSearchFile.addEventListener('input', () => {
    showFhSearchDropdown(inputFhSearchFile.value);
  });

  inputFhSearchFile.addEventListener('keydown', (e) => {
    if (fhSearchDropdownMenu.style.display === 'flex' && state.filteredRepoFiles.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        state.activeFhDropdownIndex = (state.activeFhDropdownIndex + 1) % state.filteredRepoFiles.length;
        updateActiveDropdownItem();
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        state.activeFhDropdownIndex = (state.activeFhDropdownIndex - 1 + state.filteredRepoFiles.length) % state.filteredRepoFiles.length;
        updateActiveDropdownItem();
        return;
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (state.activeFhDropdownIndex >= 0 && state.activeFhDropdownIndex < state.filteredRepoFiles.length) {
          selectFileFromDropdown(state.filteredRepoFiles[state.activeFhDropdownIndex]);
        } else {
          const val = inputFhSearchFile.value.trim();
          if (val) {
            hideFhSearchDropdown();
            loadFileHistory(val);
          }
        }
        return;
      } else if (e.key === 'Escape') {
        e.preventDefault();
        hideFhSearchDropdown();
        return;
      }
    } else if (e.key === 'Enter') {
      const val = inputFhSearchFile.value.trim();
      if (val) {
        hideFhSearchDropdown();
        loadFileHistory(val);
      }
    }
  });

  btnClearFhSearch.addEventListener('click', (e) => {
    e.stopPropagation();
    inputFhSearchFile.value = '';
    btnClearFhSearch.style.display = 'none';
    showFhSearchDropdown('');
    inputFhSearchFile.focus();
  });

  document.addEventListener('click', (e) => {
    if (fhSearchWrapper && !fhSearchWrapper.contains(e.target)) {
      hideFhSearchDropdown();
    }
  });

  const btnCopyFhPath = document.getElementById('btn-copy-fh-path');
  if (btnCopyFhPath) {
    btnCopyFhPath.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.fileHistoryTarget) {
        navigator.clipboard.writeText(state.fileHistoryTarget);
        showToast(`Copied file path: ${state.fileHistoryTarget}`, 'info');
      }
    });
  }

  const fhTargetPathWrapper = document.getElementById('fh-target-path-wrapper');
  if (fhTargetPathWrapper) {
    fhTargetPathWrapper.addEventListener('click', () => {
      if (state.fileHistoryTarget) {
        navigator.clipboard.writeText(state.fileHistoryTarget);
        showToast(`Copied file path: ${state.fileHistoryTarget}`, 'info');
      }
    });
  }

  btnFhViewDiff.addEventListener('click', () => {
    if (state.fileHistorySelectedCommit) loadFileRevision(state.fileHistorySelectedCommit, 'diff');
  });

  btnFhViewFull.addEventListener('click', () => {
    if (state.fileHistorySelectedCommit) loadFileRevision(state.fileHistorySelectedCommit, 'full');
  });

  // Update Status & File Lists
  function updateStatusUI() {
    const s = state.statusData;
    if (!s) return;

    // Remote Origin URL in Sidebar
    const remotes = s.remotes || [];
    const originRemote = remotes.find(r => r.name === 'origin') || remotes[0];
    const originUrl = originRemote ? (originRemote.fetchUrl || originRemote.pushUrl || '') : '';

    if (sidebarRemoteUrlWrapper && sidebarRemoteUrlText) {
      if (originUrl) {
        sidebarRemoteUrlText.textContent = originUrl;
        sidebarRemoteUrlWrapper.style.display = 'block';
        sidebarRemoteUrlWrapper.title = `Remote: ${originUrl}\nClick to copy`;
      } else {
        sidebarRemoteUrlWrapper.style.display = 'none';
      }
    }

    activeRepoBranch.textContent = s.currentBranch;
    btnCommitLabel.textContent = `Commit to ${s.currentBranch}`;

    if (s.ahead > 0) {
      badgeAhead.textContent = `▲ ${s.ahead}`;
      badgeAhead.style.display = 'inline-flex';
    } else {
      badgeAhead.style.display = 'none';
    }

    if (s.behind > 0) {
      badgeBehind.textContent = `▼ ${s.behind}`;
      badgeBehind.style.display = 'inline-flex';
    } else {
      badgeBehind.style.display = 'none';
    }

    const totalChanges = s.unstaged.length + s.untracked.length + s.staged.length;
    badgeChangesCount.textContent = totalChanges;

    if (s.isClean) {
      repoStatusIndicator.textContent = 'Clean';
      repoStatusIndicator.style.color = '#3fb950';
    } else {
      repoStatusIndicator.textContent = `${totalChanges} modified`;
      repoStatusIndicator.style.color = '#d29922';
    }

    // Render Unstaged Files List
    const allUnstaged = [...s.untracked, ...s.unstaged];
    unstagedCount.textContent = allUnstaged.length;
    unstagedFilesList.innerHTML = '';

    if (allUnstaged.length === 0) {
      unstagedFilesList.innerHTML = '<li style="padding: 10px; color: var(--text-muted); font-size: 11px;">No unstaged changes</li>';
    } else {
      allUnstaged.forEach(file => {
        const li = document.createElement('li');
        const isSelected = state.selectedFile && state.selectedFile.path === file.path && !state.selectedFile.isStaged;
        li.className = `file-item ${isSelected ? 'selected' : ''}`;

        const badgeClass = file.status === 'added' || file.status === 'untracked' ? 'added' : file.status === 'deleted' ? 'deleted' : 'modified';
        const badgeLabel = file.status === 'untracked' ? 'U' : file.status === 'added' ? 'A' : file.status === 'deleted' ? 'D' : 'M';

        li.innerHTML = `
          <div class="file-name-group" title="${escapeHtml(file.path)}">
            <span class="status-badge ${badgeClass}">${badgeLabel}</span>
            <span class="file-name-text">${escapeHtml(file.path)}</span>
          </div>
          <div class="file-actions">
            <button class="branch-btn-icon btn-file-hist" title="View file history">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 14 14"></polyline>
              </svg>
            </button>
            <button class="branch-btn-icon btn-stage-single" title="Stage File">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button class="branch-btn-icon delete-btn btn-discard-single" title="Discard Changes">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        `;

        li.querySelector('.btn-file-hist').addEventListener('click', (e) => {
          e.stopPropagation();
          openFileHistoryModal(file.path);
        });

        li.addEventListener('click', (e) => {
          if (e.target.closest('.file-actions')) return;
          state.selectedFile = { ...file, isStaged: false };
          loadDiff(state.selectedFile);
          updateStatusUI();
        });

        li.querySelector('.btn-stage-single').addEventListener('click', async () => {
          await withTaskLoader(`Staging ${file.path}...`, null, null, async () => {
            const res = await window.api.stageFiles(state.currentRepoPath, [file.path]);
            if (res.success) {
              await refreshRepository();
            } else {
              showToast(`Stage error: ${res.error}`, 'error');
            }
          });
        });

        li.querySelector('.btn-discard-single').addEventListener('click', async () => {
          const confirmDiscard = confirm(`Discard changes in ${file.path}?`);
          if (!confirmDiscard) return;
          const isUntracked = file.status === 'untracked';
          await withTaskLoader(`Discarding ${file.path}...`, null, null, async () => {
            const res = await window.api.discardChanges(state.currentRepoPath, file.path, isUntracked);
            if (res.success) {
              showToast(`Discarded ${file.path}`, 'info');
              await refreshRepository();
            } else {
              showToast(`Discard error: ${res.error}`, 'error');
            }
          });
        });

        unstagedFilesList.appendChild(li);
      });
    }

    // Render Staged Files List
    stagedCount.textContent = s.staged.length;
    stagedFilesList.innerHTML = '';

    if (s.staged.length === 0) {
      stagedFilesList.innerHTML = '<li style="padding: 10px; color: var(--text-muted); font-size: 11px;">No staged changes</li>';
    } else {
      s.staged.forEach(file => {
        const li = document.createElement('li');
        const isSelected = state.selectedFile && state.selectedFile.path === file.path && state.selectedFile.isStaged;
        li.className = `file-item ${isSelected ? 'selected' : ''}`;

        const badgeClass = file.status === 'added' ? 'added' : file.status === 'deleted' ? 'deleted' : 'modified';
        const badgeLabel = file.status === 'added' ? 'A' : file.status === 'deleted' ? 'D' : 'M';

        li.innerHTML = `
          <div class="file-name-group" title="${escapeHtml(file.path)}">
            <span class="status-badge ${badgeClass}">${badgeLabel}</span>
            <span class="file-name-text">${escapeHtml(file.path)}</span>
          </div>
          <div class="file-actions">
            <button class="branch-btn-icon btn-file-hist" title="View file history">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 14 14"></polyline>
              </svg>
            </button>
            <button class="branch-btn-icon btn-unstage-single" title="Unstage File">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
        `;

        li.querySelector('.btn-file-hist').addEventListener('click', (e) => {
          e.stopPropagation();
          openFileHistoryModal(file.path);
        });

        li.addEventListener('click', (e) => {
          if (e.target.closest('.file-actions')) return;
          state.selectedFile = { ...file, isStaged: true };
          loadDiff(state.selectedFile);
          updateStatusUI();
        });

        li.querySelector('.btn-unstage-single').addEventListener('click', async () => {
          await withTaskLoader(`Unstaging ${file.path}...`, null, null, async () => {
            const res = await window.api.unstageFiles(state.currentRepoPath, [file.path]);
            if (res.success) {
              await refreshRepository();
            } else {
              showToast(`Unstage error: ${res.error}`, 'error');
            }
          });
        });

        stagedFilesList.appendChild(li);
      });
    }
  }

  // Load Diff for Selected File (Changes Tab)
  async function loadDiff(file) {
    if (!state.currentRepoPath || !file) return;

    diffFileName.textContent = `${file.path} (${file.isStaged ? 'Staged' : 'Unstaged'})`;
    diffFileActions.style.display = 'flex';
    btnDiffStage.textContent = file.isStaged ? 'Unstage File' : 'Stage File';

    btnDiffStage.onclick = async () => {
      await withTaskLoader(file.isStaged ? `Unstaging ${file.path}...` : `Staging ${file.path}...`, btnDiffStage, file.isStaged ? 'Unstaging...' : 'Staging...', async () => {
        if (file.isStaged) {
          await window.api.unstageFiles(state.currentRepoPath, [file.path]);
          file.isStaged = false;
        } else {
          await window.api.stageFiles(state.currentRepoPath, [file.path]);
          file.isStaged = true;
        }
        await refreshRepository();
      });
    };

    diffContainer.innerHTML = '<div style="padding: 20px; color: var(--text-muted);">Loading diff...</div>';
    const diffRes = await window.api.getDiff(state.currentRepoPath, file.path, file.isStaged);
    if (diffRes.success) {
      DiffViewer.render(diffRes.diff, diffContainer);
    } else {
      diffContainer.innerHTML = `<div class="diff-empty-state"><p style="color: var(--red-hover);">Error loading diff: ${diffRes.error}</p></div>`;
    }
  }

  // Helper to switch to commit history for a specific branch
  function switchToCommitHistoryForBranch(branchName) {
    if (selectHistoryBranch) {
      selectHistoryBranch.value = branchName;
    }
    tabHistory.click();
    refreshRepository();
  }

  // Create Branch List Item Element (Matches Reference Mockup)
  function createBranchItemElement(branch, isRemote = false) {
    const li = document.createElement('li');
    const isCurrent = !isRemote && branch.current;
    const isAhead = !isRemote && (branch.ahead || 0) > 0;
    const isBehind = !isRemote && (branch.behind || 0) > 0;

    li.className = `branch-item ${isCurrent ? 'active' : ''} ${isAhead ? 'is-ahead-branch' : ''}`;

    // Build status badges (Solid dark badge matching 1↓, 86↓ in mockup)
    let syncBadgeHtml = '';
    if (!isRemote) {
      if (branch.ahead > 0 && branch.behind > 0) {
        syncBadgeHtml = `<span class="branch-sync-badge" title="${branch.ahead} ahead, ${branch.behind} behind"><span class="badge-num branch-badge-ahead-pill">${branch.ahead}</span><span class="sync-arrow">↑</span> <span class="badge-num branch-badge-behind-pill">${branch.behind}</span><span class="sync-arrow">↓</span></span>`;
      } else if (branch.behind > 0) {
        syncBadgeHtml = `<span class="branch-sync-badge" title="${branch.behind} commit(s) behind ${escapeHtml(branch.upstream || 'remote')}"><span class="badge-num">${branch.behind}</span><span class="sync-arrow">↓</span></span>`;
      } else if (branch.ahead > 0) {
        syncBadgeHtml = `<span class="branch-sync-badge" title="${branch.ahead} commit(s) ahead of ${escapeHtml(branch.upstream || 'remote')}"><span class="badge-num branch-badge-ahead-pill">${branch.ahead}</span><span class="sync-arrow">↑</span></span>`;
      } else if (branch.isGone) {
        syncBadgeHtml = '<span class="branch-badge-gone-pill" title="Upstream tracking branch has been deleted on remote">gone</span>';
      } else if (branch.isLocalOnly && !branch.ahead) {
        syncBadgeHtml = '<span class="branch-badge-local-pill" title="Local branch only">local</span>';
      }
    }

    // Active Bullet Indicator 'o' (Hollow Circle)
    const activeBulletHtml = isCurrent
      ? '<span class="branch-bullet-icon" title="Current Active Branch"><span class="branch-bullet-circle"></span></span>'
      : '';

    // Tooltip text
    const tooltipLines = [
      branch.name,
      branch.upstream ? `Tracking: ${branch.upstream}` : (!isRemote ? 'Local branch (no remote tracking)' : ''),
      branch.ahead ? `${branch.ahead} commit(s) ahead` : '',
      branch.behind ? `${branch.behind} commit(s) behind` : '',
      branch.subject ? `Latest: ${branch.subject}` : '',
      branch.relativeDate ? `Updated: ${branch.relativeDate}` : ''
    ].filter(Boolean).join('\n');

    li.innerHTML = `
      ${activeBulletHtml}
      <span class="branch-name-text" title="${escapeHtml(tooltipLines)}">${escapeHtml(branch.displayName || branch.name)}</span>
      ${syncBadgeHtml}
      <div class="branch-hover-actions">
        ${!isRemote && branch.ahead > 0 ? `
          <button class="branch-action-mini-btn btn-push-branch-quick" title="Push ${branch.ahead} ahead commit(s) to remote">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
          </button>
        ` : ''}
        ${!isRemote && !branch.current ? `
          <button class="branch-action-mini-btn btn-switch-branch" title="Checkout / Switch to this branch">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 14 4 9 9 4"></polyline>
              <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
            </svg>
          </button>
          <button class="branch-action-mini-btn btn-merge-from" title="Merge into current branch">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="18" r="3"></circle>
              <circle cx="6" cy="6" r="3"></circle>
              <path d="M6 9v12"></path>
              <path d="M18 15a9 9 0 0 0-9-9H6"></path>
            </svg>
          </button>
          <button class="branch-action-mini-btn delete-btn btn-del-branch" title="Delete branch">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        ` : ''}
        ${isRemote ? `
          <button class="branch-action-mini-btn btn-checkout-remote" title="Checkout as local branch">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 14 4 9 9 4"></polyline>
              <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
            </svg>
          </button>
          <button class="branch-action-mini-btn delete-btn btn-del-remote-branch" title="Delete remote branch">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        ` : ''}
      </div>
    `;

    // Click on sync badge switches to commit history of that branch
    const syncBadgeEl = li.querySelector('.branch-sync-badge');
    if (syncBadgeEl) {
      syncBadgeEl.addEventListener('click', (e) => {
        e.stopPropagation();
        switchToCommitHistoryForBranch(branch.name);
      });
    }

    // Event Handlers for Local Branches
    if (!isRemote) {
      li.addEventListener('click', async (e) => {
        if (e.target.closest('.branch-hover-actions')) return;
        if (!branch.current) {
          await withTaskLoader(`Checking out branch ${branch.name}...`, null, null, async () => {
            const res = await window.api.checkoutBranch(state.currentRepoPath, branch.name);
            if (res.success) {
              showToast(res.message, 'success');
              await refreshRepository();
            } else {
              showToast(`Checkout failed: ${res.error}`, 'error');
            }
          });
        }
      });

      const pushQuickBtn = li.querySelector('.btn-push-branch-quick');
      if (pushQuickBtn) {
        pushQuickBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          await withTaskLoader(`Pushing branch ${branch.name}...`, pushQuickBtn, '...', async () => {
            const res = await window.api.push(state.currentRepoPath, 'origin', branch.name, true, false);
            if (res.success) {
              showToast(`Pushed branch '${branch.name}' successfully!`, 'success');
              await refreshRepository();
            } else {
              showToast(`Push failed: ${res.error}`, 'error');
            }
          });
        });
      }

      const switchBtn = li.querySelector('.btn-switch-branch');
      if (switchBtn) {
        switchBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          await withTaskLoader(`Checking out branch ${branch.name}...`, switchBtn, '...', async () => {
            const res = await window.api.checkoutBranch(state.currentRepoPath, branch.name);
            if (res.success) {
              showToast(res.message, 'success');
              await refreshRepository();
            } else {
              showToast(`Checkout failed: ${res.error}`, 'error');
            }
          });
        });
      }

      const mergeBtn = li.querySelector('.btn-merge-from');
      if (mergeBtn) {
        mergeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openMergeModal(branch.name);
        });
      }

      const delBtn = li.querySelector('.btn-del-branch');
      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openDeleteBranchModal(branch.name, false);
        });
      }
    } else {
      // Event Handlers for Remote Branches
      li.addEventListener('click', async (e) => {
        if (e.target.closest('.branch-hover-actions')) return;
        await withTaskLoader(`Checking out remote branch ${branch.name}...`, null, null, async () => {
          const res = await window.api.checkoutBranch(state.currentRepoPath, branch.name);
          if (res.success) {
            showToast(res.message, 'success');
            await refreshRepository();
          } else {
            showToast(`Checkout remote failed: ${res.error}`, 'error');
          }
        });
      });

      const checkoutRemoteBtn = li.querySelector('.btn-checkout-remote');
      if (checkoutRemoteBtn) {
        checkoutRemoteBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          await withTaskLoader(`Checking out remote branch ${branch.name}...`, checkoutRemoteBtn, '...', async () => {
            const res = await window.api.checkoutBranch(state.currentRepoPath, branch.name);
            if (res.success) {
              showToast(res.message, 'success');
              await refreshRepository();
            } else {
              showToast(`Checkout remote failed: ${res.error}`, 'error');
            }
          });
        });
      }

      const delRemoteBtn = li.querySelector('.btn-del-remote-branch');
      if (delRemoteBtn) {
        delRemoteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openDeleteBranchModal(branch.name, true);
        });
      }
    }

    return li;
  }

  // Render a list of branches (either Flat or Hierarchical Tree)
  function renderBranchListGroup(container, branches, isRemote = false, prefixKey = 'local') {
    container.innerHTML = '';
    if (!branches || branches.length === 0) {
      const emptyMsg = state.sidebarSearchQuery
        ? 'No matching branches'
        : (isRemote ? 'No remote branches' : 'No local branches');
      container.innerHTML = `<li class="branch-item" style="color: var(--text-muted); font-size: 11.5px; padding-left: 26px;">${emptyMsg}</li>`;
      return;
    }

    if (state.branchViewMode === 'flat' || state.sidebarSearchQuery) {
      branches.forEach(branch => {
        container.appendChild(createBranchItemElement(branch, isRemote));
      });
    } else {
      // Tree view: group branches with slashes into folders
      const folders = {};
      const rootItems = [];

      branches.forEach(branch => {
        const slashIdx = branch.name.indexOf('/');
        if (slashIdx > -1) {
          const folderName = branch.name.slice(0, slashIdx);
          const subName = branch.name.slice(slashIdx + 1);
          if (!folders[folderName]) folders[folderName] = [];
          folders[folderName].push({ ...branch, displayName: subName });
        } else {
          rootItems.push({ ...branch, displayName: branch.name });
        }
      });

      // Render folders
      Object.keys(folders).forEach(folderName => {
        const folderKey = `${prefixKey}:${folderName}`;
        const isCollapsed = state.collapsedBranchFolders.has(folderKey);
        const folderLi = document.createElement('li');
        folderLi.className = `branch-folder-item ${isCollapsed ? 'collapsed' : ''}`;

        const folderBehindCount = folders[folderName].reduce((s, b) => s + (b.behind || 0), 0);

        folderLi.innerHTML = `
          <div class="branch-folder-header" title="Folder: ${escapeHtml(folderName)}">
            <svg class="branch-folder-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">${escapeHtml(folderName)}</span>
            ${folderBehindCount > 0 ? `<span class="branch-sync-badge"><span class="badge-num">${folderBehindCount}</span><span class="sync-arrow">↓</span></span>` : ''}
            <span class="folder-badge-count">${folders[folderName].length}</span>
          </div>
          <ul class="branch-folder-children"></ul>
        `;

        const header = folderLi.querySelector('.branch-folder-header');
        header.addEventListener('click', () => {
          if (state.collapsedBranchFolders.has(folderKey)) {
            state.collapsedBranchFolders.delete(folderKey);
          } else {
            state.collapsedBranchFolders.add(folderKey);
          }
          renderBranches();
        });

        const childrenContainer = folderLi.querySelector('.branch-folder-children');
        folders[folderName].forEach(subBranch => {
          childrenContainer.appendChild(createBranchItemElement(subBranch, isRemote));
        });

        container.appendChild(folderLi);
      });

      // Render root items
      rootItems.forEach(branch => {
        container.appendChild(createBranchItemElement(branch, isRemote));
      });
    }
  }

  // Render Branches Explorer in Sidebar
  function renderBranches() {
    const b = state.branchesData;
    if (!b) return;

    if (btnToggleBranchTree) {
      btnToggleBranchTree.classList.toggle('active', state.branchViewMode === 'tree');
      btnToggleBranchTree.title = state.branchViewMode === 'tree' ? 'Switch to Flat View' : 'Switch to Tree View';
    }

    // Filter local branches if search query or Ahead View filter is active
    let displayedLocalBranches = b.local;
    if (state.sidebarSearchQuery) {
      displayedLocalBranches = b.local.filter(br =>
        br.name.toLowerCase().includes(state.sidebarSearchQuery)
      );
    } else if (state.branchFilterAhead) {
      displayedLocalBranches = b.local.filter(br => (br.ahead > 0) || (br.behind > 0) || br.isLocalOnly);
    }

    // Render Local Branches
    renderBranchListGroup(localBranchList, displayedLocalBranches, false, 'local');

    // Filter and Render Remote Branches
    let displayedRemoteBranches = b.remote;
    if (state.sidebarSearchQuery) {
      displayedRemoteBranches = b.remote.filter(br =>
        br.name.toLowerCase().includes(state.sidebarSearchQuery)
      );
    }
    renderBranchListGroup(remoteBranchList, displayedRemoteBranches, true, 'remote');
  }

  // Render Tags Explorer in Sidebar
  function renderTags() {
    if (!tagsList) return;
    tagsList.innerHTML = '';
    const tags = state.tagsData || [];

    if (tagsCountBadge) {
      if (tags.length > 0) {
        tagsCountBadge.textContent = `${tags.length}`;
        tagsCountBadge.style.display = 'inline-block';
      } else {
        tagsCountBadge.style.display = 'none';
      }
    }

    let displayedTags = tags;
    if (state.sidebarSearchQuery) {
      displayedTags = tags.filter(t => t.name.toLowerCase().includes(state.sidebarSearchQuery));
    }

    if (displayedTags.length === 0) {
      const msg = state.sidebarSearchQuery ? 'No matching tags' : 'No tags in repository';
      tagsList.innerHTML = `<li class="tag-item" style="color: var(--text-muted); font-size: 11.5px; padding-left: 26px;">${msg}</li>`;
      return;
    }

    displayedTags.forEach(tag => {
      const li = document.createElement('li');
      li.className = 'tag-item';
      const tooltip = [tag.name, tag.commit ? `Commit: ${tag.commit}` : '', tag.subject, tag.relativeDate].filter(Boolean).join('\n');
      li.innerHTML = `
        <span class="tag-name-text" title="${escapeHtml(tooltip)}">${escapeHtml(tag.name)}</span>
        <div class="branch-hover-actions">
          <button class="branch-action-mini-btn btn-checkout-tag" title="Checkout tag">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 14 4 9 9 4"></polyline>
              <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
            </svg>
          </button>
          <button class="branch-action-mini-btn delete-btn btn-del-tag" title="Delete tag">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      `;

      li.addEventListener('click', async (e) => {
        if (e.target.closest('.branch-hover-actions')) return;
        await withTaskLoader(`Checking out tag '${tag.name}'...`, null, null, async () => {
          const res = await window.api.checkoutBranch(state.currentRepoPath, tag.name);
          if (res.success) {
            showToast(`Checked out tag '${tag.name}'`, 'success');
            await refreshRepository();
          } else {
            showToast(`Checkout tag failed: ${res.error}`, 'error');
          }
        });
      });

      const checkoutTagBtn = li.querySelector('.btn-checkout-tag');
      if (checkoutTagBtn) {
        checkoutTagBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          await withTaskLoader(`Checking out tag '${tag.name}'...`, checkoutTagBtn, '...', async () => {
            const res = await window.api.checkoutBranch(state.currentRepoPath, tag.name);
            if (res.success) {
              showToast(`Checked out tag '${tag.name}'`, 'success');
              await refreshRepository();
            } else {
              showToast(`Checkout tag failed: ${res.error}`, 'error');
            }
          });
        });
      }

      const delTagBtn = li.querySelector('.btn-del-tag');
      if (delTagBtn) {
        delTagBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          if (confirm(`Are you sure you want to delete tag '${tag.name}'?`)) {
            await withTaskLoader(`Deleting tag '${tag.name}'...`, delTagBtn, '...', async () => {
              const res = await window.api.deleteTag(state.currentRepoPath, tag.name);
              if (res.success) {
                showToast(res.message, 'success');
                await refreshRepository();
              } else {
                showToast(`Delete tag failed: ${res.error}`, 'error');
              }
            });
          }
        });
      }

      tagsList.appendChild(li);
    });
  }

  // Setup Sidebar Accordions & Search Handlers
  function initSidebarAccordions() {
    const sections = [
      { header: headerBranches, section: sectionBranches, bodyId: 'body-branches' },
      { header: headerTags, section: sectionTags, bodyId: 'body-tags' },
      { header: headerRemotes, section: sectionRemotes, bodyId: 'body-remotes' },
      { header: headerRecentRepos, section: sectionRecentRepos, bodyId: 'body-recent-repos' }
    ];

    sections.forEach(({ header, section, bodyId }) => {
      if (header && section) {
        header.addEventListener('click', () => {
          const isCollapsed = section.classList.contains('collapsed');
          section.classList.toggle('collapsed', !isCollapsed);
          section.classList.toggle('active', isCollapsed);
          const body = document.getElementById(bodyId);
          if (body) {
            body.style.display = isCollapsed ? 'block' : 'none';
          }
        });
      }
    });

    if (sidebarSearchInput) {
      sidebarSearchInput.addEventListener('input', (e) => {
        state.sidebarSearchQuery = (e.target.value || '').toLowerCase().trim();
        if (btnClearSidebarSearch) {
          btnClearSidebarSearch.style.display = state.sidebarSearchQuery ? 'flex' : 'none';
        }
        if (state.sidebarSearchQuery) {
          // Auto-expand sections while searching
          [sectionBranches, sectionTags, sectionRemotes].forEach(sec => {
            if (sec) {
              sec.classList.remove('collapsed');
              sec.classList.add('active');
            }
          });
          ['body-branches', 'body-tags', 'body-remotes'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'block';
          });
        }
        renderBranches();
        renderTags();
      });
    }

    if (btnClearSidebarSearch) {
      btnClearSidebarSearch.addEventListener('click', () => {
        if (sidebarSearchInput) {
          sidebarSearchInput.value = '';
          sidebarSearchInput.focus();
        }
        state.sidebarSearchQuery = '';
        btnClearSidebarSearch.style.display = 'none';
        renderBranches();
        renderTags();
      });
    }

    if (btnToggleBranchTree) {
      btnToggleBranchTree.addEventListener('click', () => {
        state.branchViewMode = state.branchViewMode === 'tree' ? 'flat' : 'tree';
        renderBranches();
        showToast(`Switched to ${state.branchViewMode === 'tree' ? 'Tree View' : 'Flat View'}`, 'info');
      });
    }

    if (btnQuickFetchRemotes) {
      btnQuickFetchRemotes.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!state.currentRepoPath) return;
        await withTaskLoader('Fetching remote branches...', btnQuickFetchRemotes, '...', async () => {
          const res = await window.api.fetch(state.currentRepoPath, 'origin', true);
          if (res.success) {
            showToast('Remotes fetched successfully', 'success');
            await refreshRepository();
          } else {
            showToast(`Fetch failed: ${res.error}`, 'error');
          }
        });
      });
    }

    if (btnCopyRemoteUrl) {
      btnCopyRemoteUrl.addEventListener('click', (e) => {
        e.stopPropagation();
        const url = sidebarRemoteUrlText ? sidebarRemoteUrlText.textContent.trim() : '';
        if (url && url !== 'origin url') {
          navigator.clipboard.writeText(url);
          showToast(`Copied remote origin URL: ${url}`, 'success');
          btnCopyRemoteUrl.classList.add('copied');
          setTimeout(() => {
            btnCopyRemoteUrl.classList.remove('copied');
          }, 1200);
        }
      });
    }
  }

  // Git Actions (Stage, Unstage, Commit)
  btnStageAll.addEventListener('click', async () => {
    if (!state.currentRepoPath) return;
    await withTaskLoader('Staging all changes...', btnStageAll, 'Staging All...', async () => {
      const res = await window.api.stageFiles(state.currentRepoPath, ['.']);
      if (res.success) {
        await refreshRepository();
      } else {
        showToast(`Stage all failed: ${res.error}`, 'error');
      }
    });
  });

  btnUnstageAll.addEventListener('click', async () => {
    if (!state.currentRepoPath) return;
    await withTaskLoader('Unstaging all changes...', btnUnstageAll, 'Unstaging All...', async () => {
      const res = await window.api.unstageFiles(state.currentRepoPath, ['.']);
      if (res.success) {
        await refreshRepository();
      } else {
        showToast(`Unstage all failed: ${res.error}`, 'error');
      }
    });
  });

  async function executeCommit() {
    if (!state.currentRepoPath) return;
    const summary = commitSummary.value.trim();
    const desc = commitDescription.value.trim();

    if (!summary) {
      showToast('Please enter a commit summary message', 'error');
      commitSummary.focus();
      return;
    }

    if (!state.statusData || state.statusData.staged.length === 0) {
      const stageAndCommit = confirm('No files are staged. Would you like to stage all modified files and commit?');
      if (stageAndCommit) {
        await window.api.stageFiles(state.currentRepoPath, ['.']);
      } else {
        return;
      }
    }

    await withTaskLoader('Creating commit...', btnCommit, 'Committing...', async () => {
      const res = await window.api.commit(state.currentRepoPath, summary, desc);
      if (res.success) {
        showToast(res.message, 'success');
        commitSummary.value = '';
        commitDescription.value = '';
        await refreshRepository();
      } else {
        showToast(`Commit failed: ${res.error}`, 'error');
      }
    });
  }

  btnCommit.addEventListener('click', executeCommit);

  commitSummary.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') executeCommit();
  });
  commitDescription.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') executeCommit();
  });

  // Sync Actions: Fetch, Pull, Push
  btnFetch.addEventListener('click', async () => {
    if (!state.currentRepoPath) return;
    showToast('Fetching from remote...', 'info');
    await withTaskLoader('Fetching remote changes...', btnFetch, 'Fetching...', async () => {
      const res = await window.api.fetch(state.currentRepoPath, 'origin', true);
      if (res.success) {
        showToast(res.message, 'success');
        await refreshRepository();
      } else {
        showToast(`Fetch failed: ${res.error}`, 'error');
      }
    });
  });

  btnPull.addEventListener('click', async () => {
    if (!state.currentRepoPath) return;
    showToast('Pulling from remote...', 'info');
    await withTaskLoader('Pulling latest changes...', btnPull, 'Pulling...', async () => {
      const res = await window.api.pull(state.currentRepoPath);
      if (res.success) {
        showToast(res.message, 'success');
        await refreshRepository();
      } else {
        showToast(`Pull failed: ${res.error}`, 'error');
      }
    });
  });

  btnPush.addEventListener('click', () => {
    if (!state.currentRepoPath) return;
    openPushModal();
  });

  // Modals Management
  function closeModal(modalElement) {
    if (modalElement) modalElement.classList.remove('active');
  }

  document.querySelectorAll('.modal-close-btn, .modal-cancel-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-backdrop, .modal-overlay');
      closeModal(modal);
    });
  });

  document.querySelectorAll('.modal-backdrop, .modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay);
      }
    });
  });

  // Create Branch Modal
  function openCreateBranchModal() {
    if (!state.currentRepoPath || !state.branchesData) return;
    inputNewBranchName.value = '';
    selectBaseBranch.innerHTML = '';
    state.branchesData.local.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.name;
      opt.textContent = b.name;
      if (b.current) opt.selected = true;
      selectBaseBranch.appendChild(opt);
    });
    modalCreateBranch.classList.add('active');
    inputNewBranchName.focus();
  }

  btnModalBranch.addEventListener('click', openCreateBranchModal);
  btnAddBranchQuick.addEventListener('click', openCreateBranchModal);

  btnConfirmCreateBranch.addEventListener('click', async () => {
    const branchName = inputNewBranchName.value.trim();
    const baseBranch = selectBaseBranch.value;
    const checkout = chkCheckoutBranch.checked;

    if (!branchName) {
      showToast('Please enter a branch name', 'error');
      inputNewBranchName.focus();
      return;
    }

    await withTaskLoader(`Creating branch '${branchName}'...`, btnConfirmCreateBranch, 'Creating Branch...', async () => {
      const res = await window.api.createBranch(state.currentRepoPath, branchName, baseBranch, checkout);
      if (res.success) {
        showToast(res.message, 'success');
        closeModal(modalCreateBranch);
        await refreshRepository();
      } else {
        showToast(`Branch creation failed: ${res.error}`, 'error');
      }
    });
  });

  // Create Tag Modal Handlers
  function openCreateTagModal() {
    if (!state.currentRepoPath) return;
    if (inputNewTagName) inputNewTagName.value = '';
    if (inputNewTagMsg) inputNewTagMsg.value = '';
    if (modalCreateTag) {
      modalCreateTag.classList.add('active');
      if (inputNewTagName) inputNewTagName.focus();
    }
  }

  if (btnAddTagQuick) {
    btnAddTagQuick.addEventListener('click', (e) => {
      e.stopPropagation();
      openCreateTagModal();
    });
  }

  if (btnConfirmCreateTag) {
    btnConfirmCreateTag.addEventListener('click', async () => {
      const tagName = inputNewTagName.value.trim();
      const tagMsg = inputNewTagMsg.value.trim();
      if (!tagName) {
        showToast('Please enter a tag name', 'error');
        inputNewTagName.focus();
        return;
      }
      await withTaskLoader(`Creating tag '${tagName}'...`, btnConfirmCreateTag, 'Creating Tag...', async () => {
        const res = await window.api.createTag(state.currentRepoPath, tagName, tagMsg);
        if (res.success) {
          showToast(res.message, 'success');
          closeModal(modalCreateTag);
          await refreshRepository();
        } else {
          showToast(`Tag creation failed: ${res.error}`, 'error');
        }
      });
    });
  }

  // Checkout Commit Modal Handlers
  let currentTargetCommitForCheckout = null;

  function openCheckoutCommitModal(commit) {
    if (!state.currentRepoPath || !commit) return;
    currentTargetCommitForCheckout = commit;

    const shortHash = commit.shortHash || (commit.hash ? commit.hash.slice(0, 7) : '');
    const commitDate = commit.date || commit.authorDate || '';
    const dateStr = commitDate ? formatRelativeTime(commitDate) : '';

    if (checkoutCommitHashText) {
      checkoutCommitHashText.textContent = `${shortHash} (${commit.hash})`;
    }
    if (checkoutCommitAuthorDate) {
      checkoutCommitAuthorDate.textContent = `by ${commit.author_name || 'Unknown'}${dateStr ? ' • ' + dateStr : ''}`;
    }
    if (checkoutCommitMsgText) {
      checkoutCommitMsgText.textContent = commit.message || 'No commit message';
    }

    // Default to detached HEAD
    if (radioCheckoutDetached) radioCheckoutDetached.checked = true;
    if (radioCheckoutNewBranch) radioCheckoutNewBranch.checked = false;
    if (labelCheckoutDetached) labelCheckoutDetached.classList.add('active');
    if (labelCheckoutNewBranch) labelCheckoutNewBranch.classList.remove('active');
    if (groupCheckoutNewBranchName) groupCheckoutNewBranchName.style.display = 'none';
    if (inputCheckoutNewBranchName) inputCheckoutNewBranchName.value = '';

    if (modalCheckoutCommit) {
      modalCheckoutCommit.classList.add('active');
    }
  }

  if (radioCheckoutDetached && radioCheckoutNewBranch) {
    radioCheckoutDetached.addEventListener('change', () => {
      if (radioCheckoutDetached.checked) {
        if (labelCheckoutDetached) labelCheckoutDetached.classList.add('active');
        if (labelCheckoutNewBranch) labelCheckoutNewBranch.classList.remove('active');
        if (groupCheckoutNewBranchName) groupCheckoutNewBranchName.style.display = 'none';
      }
    });

    radioCheckoutNewBranch.addEventListener('change', () => {
      if (radioCheckoutNewBranch.checked) {
        if (labelCheckoutNewBranch) labelCheckoutNewBranch.classList.add('active');
        if (labelCheckoutDetached) labelCheckoutDetached.classList.remove('active');
        if (groupCheckoutNewBranchName) groupCheckoutNewBranchName.style.display = 'block';
        if (inputCheckoutNewBranchName) inputCheckoutNewBranchName.focus();
      }
    });

    if (labelCheckoutDetached) {
      labelCheckoutDetached.addEventListener('click', (e) => {
        if (e.target.tagName !== 'INPUT') {
          radioCheckoutDetached.checked = true;
          radioCheckoutDetached.dispatchEvent(new Event('change'));
        }
      });
    }

    if (labelCheckoutNewBranch) {
      labelCheckoutNewBranch.addEventListener('click', (e) => {
        if (e.target.tagName !== 'INPUT') {
          radioCheckoutNewBranch.checked = true;
          radioCheckoutNewBranch.dispatchEvent(new Event('change'));
        }
      });
    }
  }

  if (btnConfirmCheckoutCommit) {
    btnConfirmCheckoutCommit.addEventListener('click', async () => {
      if (!state.currentRepoPath || !currentTargetCommitForCheckout) return;

      const isNewBranch = radioCheckoutNewBranch && radioCheckoutNewBranch.checked;
      const newBranchName = inputCheckoutNewBranchName ? inputCheckoutNewBranchName.value.trim() : '';

      if (isNewBranch && !newBranchName) {
        showToast('Please enter a name for the new branch', 'error');
        if (inputCheckoutNewBranchName) inputCheckoutNewBranchName.focus();
        return;
      }

      const commitHash = currentTargetCommitForCheckout.hash;
      const shortHash = commitHash.slice(0, 7);

      await withTaskLoader(`Checking out commit ${shortHash}...`, btnConfirmCheckoutCommit, 'Checking out...', async () => {
        const res = await window.api.checkoutCommit(state.currentRepoPath, commitHash, isNewBranch, newBranchName);
        if (res.success) {
          showToast(res.message, 'success');
          closeModal(modalCheckoutCommit);
          await refreshRepository();
        } else {
          showToast(`Checkout failed: ${res.error}`, 'error');
        }
      });
    });
  }

  // Merge Branch Modal
  function openMergeModal(sourceBranch = null) {
    if (!state.currentRepoPath || !state.branchesData) return;
    mergeTargetBranch.value = state.branchesData.current || 'main';
    selectMergeSource.innerHTML = '';

    const allOtherBranches = state.branchesData.all.filter(b => b !== state.branchesData.current);
    if (allOtherBranches.length === 0) {
      showToast('No other branches available to merge', 'info');
      return;
    }

    allOtherBranches.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b;
      opt.textContent = b;
      if (sourceBranch && b === sourceBranch) opt.selected = true;
      selectMergeSource.appendChild(opt);
    });

    modalMerge.classList.add('active');
  }

  btnModalMerge.addEventListener('click', () => openMergeModal());

  btnConfirmMerge.addEventListener('click', async () => {
    const sourceBranch = selectMergeSource.value;
    const noFF = chkMergeNoFF.checked;
    const squash = chkMergeSquash.checked;

    showToast(`Merging '${sourceBranch}' into '${mergeTargetBranch.value}'...`, 'info');
    await withTaskLoader(`Merging '${sourceBranch}' into '${mergeTargetBranch.value}'...`, btnConfirmMerge, 'Executing Merge...', async () => {
      const res = await window.api.mergeBranch(state.currentRepoPath, sourceBranch, { noFF, squash });
      if (res.success) {
        showToast(res.message, 'success');
        closeModal(modalMerge);
        await refreshRepository();
      } else {
        showToast(`Merge failed: ${res.error}`, 'error');
      }
    });
  });

  // Delete Branch Modal
  function openDeleteBranchModal(branchName, isRemote = false) {
    state.branchToDelete = { name: branchName, isRemote };
    deleteBranchTargetName.textContent = branchName + (isRemote ? ' (Remote)' : '');
    chkForceDelete.checked = false;
    modalDeleteBranch.classList.add('active');
  }

  btnConfirmDeleteBranch.addEventListener('click', async () => {
    if (!state.branchToDelete) return;
    const { name, isRemote } = state.branchToDelete;
    const force = chkForceDelete.checked;

    await withTaskLoader(`Deleting ${isRemote ? 'remote' : 'local'} branch '${name}'...`, btnConfirmDeleteBranch, 'Deleting Branch...', async () => {
      const res = await window.api.deleteBranch(state.currentRepoPath, name, isRemote, force);
      if (res.success) {
        showToast(res.message, 'success');
        closeModal(modalDeleteBranch);
        await refreshRepository();
      } else {
        showToast(`Delete branch failed: ${res.error}`, 'error');
      }
    });
  });

  // Push Modal
  function openPushModal() {
    if (!state.currentRepoPath || !state.branchesData) return;
    selectPushRemote.innerHTML = '';
    const remotes = (state.statusData && state.statusData.remotes) || [];

    if (remotes.length === 0) {
      const opt = document.createElement('option');
      opt.value = 'origin';
      opt.textContent = 'origin (default)';
      selectPushRemote.appendChild(opt);
    } else {
      remotes.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.name;
        opt.textContent = `${r.name} (${r.pushUrl || r.fetchUrl})`;
        selectPushRemote.appendChild(opt);
      });
    }

    inputPushBranch.value = state.branchesData.current || 'main';
    modalPush.classList.add('active');
  }

  btnConfirmPush.addEventListener('click', async () => {
    const remote = selectPushRemote.value;
    const branch = inputPushBranch.value.trim();
    const setUpstream = chkPushUpstream.checked;
    const force = chkPushForce.checked;

    showToast(`Pushing to ${remote}/${branch}...`, 'info');
    await withTaskLoader(`Pushing to ${remote}/${branch}...`, btnConfirmPush, 'Pushing Commits...', async () => {
      const res = await window.api.push(state.currentRepoPath, remote, branch, setUpstream, force);
      if (res.success) {
        showToast(res.message, 'success');
        closeModal(modalPush);
        await refreshRepository();
      } else {
        showToast(`Push failed: ${res.error}`, 'error');
      }
    });
  });

  // Tab Switcher
  tabChanges.addEventListener('click', () => {
    state.activeTab = 'changes';
    tabChanges.classList.add('active');
    tabHistory.classList.remove('active');
    viewChanges.classList.add('active');
    viewHistory.classList.remove('active');
  });

  tabHistory.addEventListener('click', () => {
    state.activeTab = 'history';
    tabHistory.classList.add('active');
    tabChanges.classList.remove('active');
    viewHistory.classList.add('active');
    viewChanges.classList.remove('active');

    if (state.historyViewMode === 'detail' && state.selectedCommit) {
      commitsListPage.style.display = 'none';
      commitDetailPage.style.display = 'flex';
    } else {
      commitsListPage.style.display = 'flex';
      commitDetailPage.style.display = 'none';
    }
  });

  // Open External Standalone Terminal Window
  function openExternalTerminal() {
    window.api.openTerminalWindow(state.currentRepoPath);
  }

  if (btnToggleTerminal) {
    btnToggleTerminal.addEventListener('click', openExternalTerminal);
  }

  // Browse Repo Dialog
  async function handleBrowseRepo() {
    const selectedPath = await window.api.openFolderDialog();
    if (selectedPath) {
      openRepository(selectedPath);
    }
  }

  btnBrowseRepo.addEventListener('click', handleBrowseRepo);
  btnWelcomeOpen.addEventListener('click', handleBrowseRepo);

  btnWelcomeInit.addEventListener('click', async () => {
    const selectedPath = await window.api.openFolderDialog();
    if (selectedPath) {
      await withTaskLoader('Initializing Git repository...', btnWelcomeInit, 'Initializing...', async () => {
        const res = await window.api.initRepo(selectedPath);
        if (res.success) {
          showToast('Initialized empty Git repository', 'success');
          openRepository(selectedPath);
        } else {
          showToast(`Initialization failed: ${res.error}`, 'error');
        }
      });
    }
  });

  btnRefresh.addEventListener('click', refreshRepository);

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // If inside an input or textarea, ignore arrow navigation
    const isInputActive = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active, .modal-backdrop.active').forEach(m => closeModal(m));
    } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
      e.preventDefault();
      openErrorLogsModal();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault();
      refreshRepository();
    } else if ((e.ctrlKey || e.metaKey) && e.key === '`') {
      e.preventDefault();
      openExternalTerminal();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
      e.preventDefault();
      handleBrowseRepo();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
      e.preventDefault();
      openFileHistoryModal();
    } else if (!isInputActive && commitDetailPage.style.display !== 'none' && state.commitFilesList) {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        if (state.currentCommitFileIndex < state.commitFilesList.length - 1) {
          selectCommitFileByIndex(state.currentCommitFileIndex + 1);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        if (state.currentCommitFileIndex > 0) {
          selectCommitFileByIndex(state.currentCommitFileIndex - 1);
        }
      }
    }
  });

  // Initialize UI with last repository if available
  initSidebarAccordions();
  renderRecentRepos();
  if (state.recentRepos.length > 0) {
    openRepository(state.recentRepos[0]);
  } else {
    noRepoView.style.display = 'flex';
    viewChanges.classList.remove('active');
    viewHistory.classList.remove('active');
  }
});
