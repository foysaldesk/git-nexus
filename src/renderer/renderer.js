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
    historyDisplayMode: 'tree' // 'tree' | 'timeline'
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

  const activeRepoPill = document.getElementById('active-repo-pill');
  const activeRepoName = document.getElementById('active-repo-name');
  const activeRepoBranch = document.getElementById('active-repo-branch');
  const badgeAhead = document.getElementById('badge-ahead');
  const badgeBehind = document.getElementById('badge-behind');
  const repoStatusIndicator = document.getElementById('status-text');

  // Sidebar Elements & Controls
  const btnFilterAheadView = document.getElementById('btn-filter-ahead-view');
  const badgeTotalAhead = document.getElementById('badge-total-ahead');
  const btnToggleBranchTree = document.getElementById('btn-toggle-branch-tree');
  const localAheadSummary = document.getElementById('local-ahead-summary');
  const localBranchList = document.getElementById('local-branch-list');
  const remoteBranchList = document.getElementById('remote-branch-list');
  const recentReposList = document.getElementById('recent-repos-list');

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

  // File History Modal Elements
  const modalFileHistory = document.getElementById('modal-file-history');
  const fhFilePathBadge = document.getElementById('fh-file-path-badge');
  const inputFhSearchFile = document.getElementById('input-fh-search-file');
  const repoFilesDatalist = document.getElementById('repo-files-datalist');
  const fhRevisionsCount = document.getElementById('fh-revisions-count');
  const fhCommitsList = document.getElementById('fh-commits-list');
  const fhSelectedCommitInfo = document.getElementById('fh-selected-commit-info');
  const btnFhViewDiff = document.getElementById('btn-fh-view-diff');
  const btnFhViewFull = document.getElementById('btn-fh-view-full');
  const fhDiffContainer = document.getElementById('fh-diff-container');

  // Terminal Elements
  const terminalDrawer = document.getElementById('terminal-drawer');
  const terminalCwdLabel = document.getElementById('terminal-cwd-label');
  const btnTerminalClear = document.getElementById('btn-terminal-clear');
  const btnTerminalSize = document.getElementById('btn-terminal-size');
  const btnTerminalClose = document.getElementById('btn-terminal-close');

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

  // Initialize Terminal
  const termManager = new TerminalManager('terminal-container');
  termManager.init();

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
    termManager.setTheme(effectiveTheme);
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

  // Toast Notification System
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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

    // Update Terminal CWD
    terminalCwdLabel.textContent = `~/${folderName}`;
    await window.api.setTerminalCwd(repoPath);

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

  // Populate Repo Files Datalist
  async function populateRepoFilesDatalist() {
    if (!state.currentRepoPath) return;
    try {
      const res = await window.api.getAllRepoFiles(state.currentRepoPath);
      if (res.success && res.files) {
        repoFilesDatalist.innerHTML = '';
        res.files.forEach(f => {
          const opt = document.createElement('option');
          opt.value = f;
          repoFilesDatalist.appendChild(opt);
        });
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
      const [statusRes, branchesRes, historyRes] = await Promise.all([
        window.api.getStatus(state.currentRepoPath),
        window.api.getBranches(state.currentRepoPath),
        window.api.getHistory(state.currentRepoPath, { maxCount: 300, branch: selectedBranch, all: !selectedBranch })
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

      const relDate = formatRelativeTime(c.date || c.authorDate);
      const shortHash = c.shortHash || (c.hash ? c.hash.slice(0, 7) : '');

      rowEl.innerHTML = `
        <div class="graph-track-cell" style="width: ${svgWidth}px;">
          <svg class="graph-svg" width="${svgWidth}" height="${ROW_HEIGHT}">
            ${svgContent}
          </svg>
        </div>
        <div class="graph-info-cell">
          ${badgesHtml ? `<div class="graph-refs-container">${badgesHtml}</div>` : ''}
          <span class="graph-commit-subject" title="${escapeHtml(c.message)}">${escapeHtml(c.message)}</span>
          <span class="graph-commit-author" title="${escapeHtml(c.author_name)}">${escapeHtml(c.author_name)}</span>
          <span class="graph-commit-date">${relDate}</span>
          <span class="graph-commit-hash" title="View commit changes">${shortHash}</span>
        </div>
      `;

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
            <button class="btn-hash-pill" title="View commit changes">${shortHash}</button>
            <button class="branch-btn-icon btn-gh-copy-hash" title="Copy full SHA">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
        `;

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
          <button id="btn-stream-expand-all" class="btn" style="padding: 2px 8px; font-size: 11px;">▼ Expand All</button>
          <button id="btn-stream-collapse-all" class="btn" style="padding: 2px 8px; font-size: 11px;">▶ Collapse All</button>
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

      const autoExpandCount = files.length <= 10 ? files.length : 3;

      files.forEach((file, index) => {
        const shouldExpand = index < autoExpandCount;
        const preloadedDiff = diffMap.get(file.path);
        const card = createDiffCard(file, shouldExpand, preloadedDiff);
        commitDiffsStream.appendChild(card);
      });

      toolbar.querySelector('#btn-stream-expand-all').addEventListener('click', async () => {
        const cards = commitDiffsStream.querySelectorAll('.file-diff-card');
        for (const c of cards) {
          await expandCard(c);
        }
      });

      toolbar.querySelector('#btn-stream-collapse-all').addEventListener('click', () => {
        const cards = commitDiffsStream.querySelectorAll('.file-diff-card');
        cards.forEach(c => collapseCard(c));
      });
    }
  }

  // Create Focused Single-File Diff View
  function createFocusedDiffView(file, preloadedDiff = null) {
    const container = document.createElement('div');
    container.className = 'commit-focused-file-container';

    container.innerHTML = `
      <div class="focused-file-header">
        <div class="focused-file-info">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0; color: var(--accent);">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          <span class="focused-file-path" title="${escapeHtml(file.path)}">${escapeHtml(file.path)}</span>
          <button class="branch-btn-icon btn-copy-filepath" title="Copy file path" style="padding: 2px 4px; flex-shrink: 0;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
          <span class="diff-stat-add" style="margin-left: 6px;">${file.isBinary ? 'BIN' : `+${file.additions}`}</span>
          <span class="diff-stat-del">${file.isBinary ? '' : `-${file.deletions}`}</span>
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

    card.innerHTML = `
      <div class="file-diff-card-header" title="Click to ${isExpanded ? 'collapse' : 'expand'}">
        <div class="file-diff-card-title">
          <span class="diff-toggle-chevron">${isExpanded ? '▼' : '▶'}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          <span class="file-diff-path-text">${escapeHtml(file.path)}</span>
          <button class="branch-btn-icon btn-copy-filepath" title="Copy file path" style="padding: 2px 4px; flex-shrink: 0;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button class="btn-file-history-card" title="View file history">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 14 14"></polyline>
            </svg>
            <span>History</span>
          </button>
        </div>
        <div style="display: flex; gap: 8px; align-items: center; flex-shrink: 0;">
          <span class="diff-stat-add">${file.isBinary ? 'BIN' : `+${file.additions}`}</span>
          <span class="diff-stat-del">${file.isBinary ? '' : `-${file.deletions}`}</span>
        </div>
      </div>
      <div class="file-diff-card-body" style="display: ${isExpanded ? 'block' : 'none'};">
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
      if (card.classList.contains('collapsed') || bodyEl.style.display === 'none') {
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
    const bodyEl = card.querySelector('.file-diff-card-body');
    const chevron = card.querySelector('.diff-toggle-chevron');
    const header = card.querySelector('.file-diff-card-header');
    const filePath = card.dataset.filePath;

    card.classList.remove('collapsed');
    bodyEl.style.display = 'block';
    if (chevron) chevron.textContent = '▼';
    if (header) header.title = 'Click to collapse';

    if (card.dataset.loaded !== 'true' && filePath) {
      await loadCardDiff(card, filePath);
    }
  }

  // Collapse Diff Card
  function collapseCard(card) {
    if (!card) return;
    const bodyEl = card.querySelector('.file-diff-card-body');
    const chevron = card.querySelector('.diff-toggle-chevron');
    const header = card.querySelector('.file-diff-card-header');

    card.classList.add('collapsed');
    bodyEl.style.display = 'none';
    if (chevron) chevron.textContent = '▶';
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

    let targetPath = filePath;
    if (!targetPath && state.selectedFile) {
      targetPath = state.selectedFile.path;
    }

    if (targetPath) {
      inputFhSearchFile.value = targetPath;
      await loadFileHistory(targetPath);
    } else {
      fhFilePathBadge.textContent = 'Select or search a file';
      fhRevisionsCount.textContent = '0 Revisions';
      fhCommitsList.innerHTML = '<li style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 12px;">Type or search a file to inspect its full revision history</li>';
      fhDiffContainer.innerHTML = '<div class="diff-empty-state"><p>Search or pick a file to view its revision history</p></div>';
      inputFhSearchFile.focus();
    }
  }

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
      const shortHash = c.shortHash || c.hash.slice(0, 7);

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

    const shortHash = commit.shortHash || commit.hash.slice(0, 7);
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
      // Full file content at commit with VS Code code viewer & syntax highlighting
      const contentRes = await window.api.getFileContentAtCommit(state.currentRepoPath, commit.hash, state.fileHistoryTarget);
      if (contentRes.success) {
        DiffViewer.renderFullFile(contentRes.content, fhDiffContainer, state.fileHistoryTarget);
      } else {
        fhDiffContainer.innerHTML = `<div class="diff-empty-state"><p style="color: var(--red-hover);">Content error: ${escapeHtml(contentRes.error)}</p></div>`;
      }
    }
  }

  // File History Action Triggers
  btnFileHistoryQuick.addEventListener('click', () => openFileHistoryModal());
  btnDiffFileHistory.addEventListener('click', () => {
    if (state.selectedFile) openFileHistoryModal(state.selectedFile.path);
    else openFileHistoryModal();
  });

  inputFhSearchFile.addEventListener('change', () => {
    const filePath = inputFhSearchFile.value.trim();
    if (filePath) loadFileHistory(filePath);
  });

  inputFhSearchFile.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const filePath = inputFhSearchFile.value.trim();
      if (filePath) loadFileHistory(filePath);
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

  // Create Branch List Item Element
  function createBranchItemElement(branch, isRemote = false) {
    const li = document.createElement('li');
    const isCurrent = !isRemote && branch.current;
    const isAhead = !isRemote && (branch.ahead || 0) > 0;
    const isBehind = !isRemote && (branch.behind || 0) > 0;

    li.className = `branch-item ${isCurrent ? 'active' : ''} ${isAhead ? 'is-ahead-branch' : ''}`;

    // Build status badges
    let badgesHtml = '';
    if (isCurrent) {
      badgesHtml += '<span class="branch-current-badge">HEAD</span>';
    }
    if (!isRemote) {
      if (branch.ahead > 0) {
        badgesHtml += `<span class="branch-badge-ahead" title="${branch.ahead} commit(s) ahead of ${escapeHtml(branch.upstream || 'remote')} (Click to view ahead commits)">▲ ${branch.ahead}</span>`;
      }
      if (branch.behind > 0) {
        badgesHtml += `<span class="branch-badge-behind" title="${branch.behind} commit(s) behind ${escapeHtml(branch.upstream || 'remote')}">▼ ${branch.behind}</span>`;
      }
      if (branch.isGone) {
        badgesHtml += '<span class="branch-badge-gone" title="Upstream tracking branch has been deleted on remote">gone</span>';
      } else if (branch.isLocalOnly && !branch.ahead) {
        badgesHtml += '<span class="branch-badge-local" title="Local branch (not pushed to remote)">local</span>';
      } else if (branch.upstream && branch.ahead === 0 && branch.behind === 0) {
        badgesHtml += `<span class="branch-badge-synced" title="Up to date with ${escapeHtml(branch.upstream)}">✓</span>`;
      }
    }

    // Rich Tooltip text
    const tooltipLines = [
      branch.name,
      branch.upstream ? `Tracking: ${branch.upstream}` : (!isRemote ? 'Local branch (no remote tracking)' : ''),
      branch.ahead ? `${branch.ahead} commit(s) ahead` : '',
      branch.behind ? `${branch.behind} commit(s) behind` : '',
      branch.subject ? `Latest: ${branch.subject}` : '',
      branch.relativeDate ? `Updated: ${branch.relativeDate}` : ''
    ].filter(Boolean).join('\n');

    const iconSvg = isRemote
      ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
           <circle cx="12" cy="12" r="10"></circle>
           <line x1="2" y1="12" x2="22" y2="12"></line>
           <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
         </svg>`
      : `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
           <line x1="6" y1="3" x2="6" y2="15"></line>
           <circle cx="18" cy="6" r="3"></circle>
           <circle cx="6" cy="18" r="3"></circle>
           <path d="M18 9a9 9 0 0 1-9 9"></path>
         </svg>`;

    li.innerHTML = `
      <div class="branch-name-box" title="${escapeHtml(tooltipLines)}">
        ${iconSvg}
        <span class="branch-name-text">${escapeHtml(branch.displayName || branch.name)}</span>
        <div class="branch-status-badges">${badgesHtml}</div>
      </div>
      <div class="branch-actions">
        ${!isRemote && branch.ahead > 0 ? `
          <button class="branch-btn-icon btn-push-branch-quick" title="Push ${branch.ahead} ahead commit(s) to remote">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
          </button>
        ` : ''}
        ${!isRemote && !branch.current ? `
          <button class="branch-btn-icon btn-switch-branch" title="Checkout / Switch to this branch">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 14 4 9 9 4"></polyline>
              <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
            </svg>
          </button>
        ` : ''}
        ${isRemote ? `
          <button class="branch-btn-icon btn-checkout-remote" title="Checkout as local branch">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 14 4 9 9 4"></polyline>
              <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
            </svg>
          </button>
        ` : `
          <button class="branch-btn-icon btn-merge-from" title="Merge into current branch">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="18" r="3"></circle>
              <circle cx="6" cy="6" r="3"></circle>
              <path d="M6 9v12"></path>
              <path d="M18 15a9 9 0 0 0-9-9H6"></path>
            </svg>
          </button>
        `}
        ${!branch.current ? `
          <button class="branch-btn-icon delete-btn ${isRemote ? 'btn-del-remote-branch' : 'btn-del-branch'}" title="Delete branch">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        ` : ''}
      </div>
    `;

    // Click on ahead badge switches to commit history of that branch
    const aheadBadgeEl = li.querySelector('.branch-badge-ahead');
    if (aheadBadgeEl) {
      aheadBadgeEl.addEventListener('click', (e) => {
        e.stopPropagation();
        switchToCommitHistoryForBranch(branch.name);
      });
    }

    // Event Handlers for Local Branches
    if (!isRemote) {
      li.addEventListener('click', async (e) => {
        if (e.target.closest('.branch-actions')) return;
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
      const emptyMsg = state.branchFilterAhead && !isRemote
        ? 'No branches with ahead / unpushed commits'
        : (isRemote ? 'No remote branches' : 'No local branches');
      container.innerHTML = `<li class="branch-item" style="color: var(--text-muted); font-size: 11px; padding: 8px;">${emptyMsg}</li>`;
      return;
    }

    if (state.branchViewMode === 'flat') {
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

        const folderAheadCount = folders[folderName].reduce((s, b) => s + (b.ahead || 0), 0);

        folderLi.innerHTML = `
          <div class="branch-folder-header" title="Folder: ${escapeHtml(folderName)}">
            <svg class="branch-folder-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">${escapeHtml(folderName)}</span>
            ${folderAheadCount > 0 ? `<span class="branch-badge-ahead">▲ ${folderAheadCount}</span>` : ''}
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

    // Calculate Ahead Metrics across local branches
    const totalAheadCommits = b.local.reduce((sum, branch) => sum + (branch.ahead || 0), 0);
    const aheadBranchesCount = b.local.filter(branch => (branch.ahead || 0) > 0 || branch.isLocalOnly).length;

    if (badgeTotalAhead) {
      if (totalAheadCommits > 0) {
        badgeTotalAhead.textContent = `${totalAheadCommits}`;
        badgeTotalAhead.style.display = 'inline-flex';
      } else {
        badgeTotalAhead.style.display = 'none';
      }
    }

    if (localAheadSummary) {
      if (totalAheadCommits > 0) {
        localAheadSummary.textContent = `${totalAheadCommits} ahead`;
        localAheadSummary.style.display = 'inline-flex';
      } else {
        localAheadSummary.style.display = 'none';
      }
    }

    if (btnFilterAheadView) {
      btnFilterAheadView.classList.toggle('active', !!state.branchFilterAhead);
    }

    if (btnToggleBranchTree) {
      btnToggleBranchTree.classList.toggle('active', state.branchViewMode === 'tree');
      btnToggleBranchTree.title = state.branchViewMode === 'tree' ? 'Switch to Flat View' : 'Switch to Tree View';
    }

    // Filter local branches if Ahead View filter is active
    let displayedLocalBranches = b.local;
    if (state.branchFilterAhead) {
      displayedLocalBranches = b.local.filter(br => (br.ahead > 0) || (br.behind > 0) || br.isLocalOnly);
    }

    // Render Local Branches
    renderBranchListGroup(localBranchList, displayedLocalBranches, false, 'local');

    // Render Remote Branches (hidden in Ahead Only view if user is focusing purely on ahead)
    if (state.branchFilterAhead) {
      remoteBranchList.innerHTML = '<li class="branch-item" style="color: var(--text-muted); font-size: 11px; padding: 8px;">Filtered (Ahead View)</li>';
    } else {
      renderBranchListGroup(remoteBranchList, b.remote, true, 'remote');
    }
  }

  // Setup Ahead View and Tree View Toggle Handlers
  if (btnFilterAheadView) {
    btnFilterAheadView.addEventListener('click', () => {
      state.branchFilterAhead = !state.branchFilterAhead;
      renderBranches();
      if (state.branchFilterAhead) {
        showToast('Ahead View enabled: Showing branches with unpushed / ahead commits', 'info');
      }
    });
  }

  if (btnToggleBranchTree) {
    btnToggleBranchTree.addEventListener('click', () => {
      state.branchViewMode = state.branchViewMode === 'tree' ? 'flat' : 'tree';
      renderBranches();
      showToast(`Switched to ${state.branchViewMode === 'tree' ? 'Tree View' : 'Flat View'}`, 'info');
    });
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
      const modal = e.target.closest('.modal-backdrop');
      closeModal(modal);
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

  // Terminal Drawer Toggle & Controls
  function toggleTerminal() {
    const isCollapsed = terminalDrawer.classList.contains('collapsed');
    if (isCollapsed) {
      terminalDrawer.classList.remove('collapsed');
      termManager.fit();
      termManager.focus();
      setTimeout(() => {
        termManager.fit();
        termManager.focus();
      }, 100);
      setTimeout(() => {
        termManager.fit();
        termManager.focus();
      }, 250);
    } else {
      terminalDrawer.classList.add('collapsed');
    }
  }

  btnToggleTerminal.addEventListener('click', toggleTerminal);
  btnTerminalClose.addEventListener('click', () => terminalDrawer.classList.add('collapsed'));
  const btnTerminalMin = document.getElementById('btn-terminal-minimize');
  if (btnTerminalMin) {
    btnTerminalMin.addEventListener('click', () => terminalDrawer.classList.add('collapsed'));
  }

  btnTerminalSize.addEventListener('click', () => {
    terminalDrawer.style.height = ''; // clear custom inline height
    terminalDrawer.classList.toggle('maximized');
    setTimeout(() => termManager.fit(), 220);
  });

  btnTerminalClear.addEventListener('click', () => {
    termManager.clear();
  });

  // Terminal Mouse Resizing
  const terminalResizeHandle = document.getElementById('terminal-resize-handle');
  let isResizingTerminal = false;
  let termStartY = 0;
  let termStartHeight = 0;

  if (terminalResizeHandle) {
    terminalResizeHandle.addEventListener('mousedown', (e) => {
      if (terminalDrawer.classList.contains('collapsed')) return;
      isResizingTerminal = true;
      termStartY = e.clientY;
      termStartHeight = terminalDrawer.getBoundingClientRect().height;
      terminalDrawer.classList.remove('maximized');
      terminalDrawer.classList.add('resizing');
      terminalResizeHandle.classList.add('dragging');
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isResizingTerminal) return;
      const deltaY = termStartY - e.clientY;
      const minH = 100;
      const maxH = Math.floor(window.innerHeight * 0.85);
      const newHeight = Math.max(minH, Math.min(maxH, termStartHeight + deltaY));
      terminalDrawer.style.height = `${newHeight}px`;
      termManager.fit();
    });

    window.addEventListener('mouseup', () => {
      if (isResizingTerminal) {
        isResizingTerminal = false;
        terminalDrawer.classList.remove('resizing');
        terminalResizeHandle.classList.remove('dragging');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        setTimeout(() => termManager.fit(), 50);
      }
    });
  }

  // Real-time Git Command Suggestions Stream
  const terminalSuggestionsBar = document.getElementById('terminal-suggestions-bar');
  if (window.api.onTerminalSuggestions && terminalSuggestionsBar) {
    window.api.onTerminalSuggestions((suggestions) => {
      if (!Array.isArray(suggestions) || suggestions.length === 0) return;
      terminalSuggestionsBar.innerHTML = '';
      suggestions.forEach(item => {
        const chip = document.createElement('button');
        chip.className = 'cmd-chip ubuntu-chip';
        chip.setAttribute('data-cmd', item.cmd);
        chip.title = item.desc || item.cmd;
        chip.textContent = item.label || item.cmd;
        chip.addEventListener('click', () => {
          if (terminalDrawer.classList.contains('collapsed')) {
            terminalDrawer.classList.remove('collapsed');
          }
          termManager.fit();
          termManager.focus();
          setTimeout(() => {
            termManager.fit();
            termManager.sendQuickCommand(item.cmd);
            termManager.focus();
          }, 80);
        });
        terminalSuggestionsBar.appendChild(chip);
      });
    });
  }

  document.querySelectorAll('.cmd-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const cmd = chip.getAttribute('data-cmd');
      if (terminalDrawer.classList.contains('collapsed')) {
        terminalDrawer.classList.remove('collapsed');
      }
      termManager.fit();
      termManager.focus();
      setTimeout(() => {
        termManager.fit();
        termManager.sendQuickCommand(cmd);
        termManager.focus();
      }, 80);
    });
  });

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

    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault();
      refreshRepository();
    } else if ((e.ctrlKey || e.metaKey) && e.key === '`') {
      e.preventDefault();
      toggleTerminal();
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
  renderRecentRepos();
  if (state.recentRepos.length > 0) {
    openRepository(state.recentRepos[0]);
  } else {
    noRepoView.style.display = 'flex';
    viewChanges.classList.remove('active');
    viewHistory.classList.remove('active');
  }
});
