const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

class GitService {
  constructor() {
    this.gitInstances = new Map();
  }

  getGit(repoPath) {
    if (!repoPath) throw new Error('Repository path is required');
    const normalized = path.normalize(repoPath);
    if (!this.gitInstances.has(normalized)) {
      this.gitInstances.set(normalized, simpleGit(normalized));
    }
    return this.gitInstances.get(normalized);
  }

  async checkIsRepo(repoPath) {
    try {
      if (!fs.existsSync(repoPath)) return false;
      const git = this.getGit(repoPath);
      const isRepo = await git.checkIsRepo();
      return isRepo;
    } catch {
      return false;
    }
  }

  async initRepo(repoPath) {
    try {
      const git = this.getGit(repoPath);
      await git.init();
      return { success: true, message: 'Initialized empty Git repository' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async getStatus(repoPath) {
    try {
      const git = this.getGit(repoPath);
      const status = await git.status();
      const remotes = await git.getRemotes(true);

      // Structure files into staged, unstaged, untracked, and conflicting
      const staged = [];
      const unstaged = [];
      const untracked = status.not_added.map(file => ({
        path: file,
        status: 'untracked',
        isStaged: false
      }));
      const conflicted = status.conflicted.map(file => ({
        path: file,
        status: 'conflicted',
        isStaged: false
      }));

      // Process created, deleted, modified, renamed files
      status.files.forEach(f => {
        // Index state (staged)
        if (f.index && f.index !== '?' && f.index !== ' ') {
          staged.push({
            path: f.path,
            status: f.index === 'A' ? 'added' : f.index === 'D' ? 'deleted' : f.index === 'R' ? 'renamed' : 'modified',
            indexCode: f.index,
            isStaged: true
          });
        }

        // Working tree state (unstaged)
        if (f.working_dir && f.working_dir !== ' ' && f.working_dir !== '?') {
          unstaged.push({
            path: f.path,
            status: f.working_dir === 'D' ? 'deleted' : 'modified',
            workingCode: f.working_dir,
            isStaged: false
          });
        }
      });

      return {
        success: true,
        data: {
          currentBranch: status.current || 'HEAD (detached)',
          trackingBranch: status.tracking || null,
          ahead: status.ahead || 0,
          behind: status.behind || 0,
          isClean: status.isClean(),
          staged,
          unstaged,
          untracked,
          conflicted,
          remotes: remotes.map(r => ({ name: r.name, fetchUrl: r.refs.fetch, pushUrl: r.refs.push }))
        }
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async getBranches(repoPath) {
    try {
      const git = this.getGit(repoPath);
      const branchSummary = await git.branch(['-a']);

      const local = [];
      const remote = [];

      Object.values(branchSummary.branches).forEach(b => {
        if (b.name.startsWith('remotes/')) {
          const cleanName = b.name.replace(/^remotes\//, '');
          // Ignore HEAD pointers like remotes/origin/HEAD
          if (!cleanName.includes('/HEAD')) {
            remote.push({
              name: cleanName,
              fullName: b.name,
              commit: b.commit,
              label: b.label
            });
          }
        } else {
          local.push({
            name: b.name,
            current: b.current,
            commit: b.commit,
            label: b.label
          });
        }
      });

      return {
        success: true,
        data: {
          current: branchSummary.current,
          local,
          remote,
          all: branchSummary.all
        }
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async createBranch(repoPath, branchName, baseBranch = null, checkout = false) {
    try {
      const git = this.getGit(repoPath);
      if (checkout) {
        if (baseBranch) {
          await git.checkoutBranch(branchName, baseBranch);
        } else {
          await git.checkoutLocalBranch(branchName);
        }
      } else {
        if (baseBranch) {
          await git.raw(['branch', branchName, baseBranch]);
        } else {
          await git.branch([branchName]);
        }
      }
      return { success: true, message: `Branch '${branchName}' created successfully` };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async checkoutBranch(repoPath, branchName, createIfMissing = false) {
    try {
      const git = this.getGit(repoPath);
      // Handle checking out remote branches locally
      if (branchName.startsWith('origin/')) {
        const localName = branchName.replace(/^origin\//, '');
        // Check if local branch already exists
        const branches = await git.branchLocal();
        if (branches.all.includes(localName)) {
          await git.checkout(localName);
        } else {
          await git.checkoutBranch(localName, branchName);
        }
      } else if (createIfMissing) {
        await git.checkoutLocalBranch(branchName);
      } else {
        await git.checkout(branchName);
      }
      return { success: true, message: `Switched to branch '${branchName}'` };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async deleteBranch(repoPath, branchName, isRemote = false, force = false) {
    try {
      const git = this.getGit(repoPath);
      if (isRemote) {
        // e.g. origin/feature-x => remote = origin, branch = feature-x
        const parts = branchName.replace(/^remotes\//, '').split('/');
        const remote = parts[0];
        const remoteBranch = parts.slice(1).join('/');
        await git.push([remote, '--delete', remoteBranch]);
        return { success: true, message: `Deleted remote branch '${branchName}'` };
      } else {
        await git.deleteLocalBranch(branchName, force);
        return { success: true, message: `Deleted local branch '${branchName}'` };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async mergeBranch(repoPath, sourceBranch, options = {}) {
    try {
      const git = this.getGit(repoPath);
      const args = [sourceBranch];
      if (options.noFF) args.unshift('--no-ff');
      if (options.squash) args.unshift('--squash');
      if (options.message) args.unshift('-m', options.message);

      const result = await git.merge(args);
      return { success: true, data: result, message: `Successfully merged '${sourceBranch}'` };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async fetch(repoPath, remote = 'origin', prune = true) {
    try {
      const git = this.getGit(repoPath);
      const args = [remote];
      if (prune) args.push('--prune');
      const result = await git.fetch(args);
      return { success: true, data: result, message: 'Fetch completed successfully' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async pull(repoPath, remote = 'origin', branch = null) {
    try {
      const git = this.getGit(repoPath);
      const result = branch ? await git.pull(remote, branch) : await git.pull();
      return { success: true, data: result, message: 'Pull completed successfully' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async push(repoPath, remote = 'origin', branch = null, setUpstream = true, force = false) {
    try {
      const git = this.getGit(repoPath);
      const args = [];
      if (setUpstream) args.push('-u');
      if (force) args.push('--force-with-lease');
      if (remote) args.push(remote);
      if (branch) args.push(branch);

      const result = await git.push(args);
      return { success: true, data: result, message: 'Push completed successfully' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async stageFiles(repoPath, files = []) {
    try {
      const git = this.getGit(repoPath);
      if (files.length === 0 || files.includes('*') || files.includes('.')) {
        await git.add('.');
      } else {
        await git.add(files);
      }
      return { success: true, message: 'Files staged' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async unstageFiles(repoPath, files = []) {
    try {
      const git = this.getGit(repoPath);
      if (files.length === 0 || files.includes('*') || files.includes('.')) {
        await git.reset(['HEAD']);
      } else {
        await git.reset(['HEAD', '--', ...files]);
      }
      return { success: true, message: 'Files unstaged' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async discardChanges(repoPath, filePath, isUntracked = false) {
    try {
      const git = this.getGit(repoPath);
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(repoPath, filePath);

      if (isUntracked) {
        if (fs.existsSync(fullPath)) {
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            fs.rmSync(fullPath, { recursive: true, force: true });
          } else {
            fs.unlinkSync(fullPath);
          }
        }
      } else {
        await git.checkout(['--', filePath]);
      }
      return { success: true, message: `Discarded changes in ${filePath}` };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async commit(repoPath, message, description = '') {
    try {
      const git = this.getGit(repoPath);
      const fullMessage = description.trim() ? `${message.trim()}\n\n${description.trim()}` : message.trim();
      const result = await git.commit(fullMessage);
      return { success: true, data: result, message: `Committed: ${message}` };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async getDiff(repoPath, filePath, isStaged = false) {
    try {
      const git = this.getGit(repoPath);
      let diff = '';
      if (isStaged) {
        diff = await git.diff(['--cached', '--', filePath]);
      } else {
        diff = await git.diff(['--', filePath]);
        // If file is untracked, read its content to simulate a full addition diff
        if (!diff && fs.existsSync(path.join(repoPath, filePath))) {
          try {
            const content = fs.readFileSync(path.join(repoPath, filePath), 'utf8');
            const lines = content.split('\n');
            diff = `--- /dev/null\n+++ b/${filePath}\n@@ -0,0 +1,${lines.length} @@\n` +
                   lines.map(l => `+${l}`).join('\n');
          } catch {
            diff = '[Binary or unreadable file]';
          }
        }
      }
      return { success: true, diff };
    } catch (err) {
      return { success: false, error: err.message, diff: '' };
    }
  }

  async getHistory(repoPath, options = {}) {
    try {
      const git = this.getGit(repoPath);
      const maxCount = typeof options === 'number' ? options : (options.maxCount || 100);
      const branch = typeof options === 'object' && options.branch ? options.branch : null;

      const logOptions = {
        maxCount,
        format: {
          hash: '%H',
          shortHash: '%h',
          date: '%ai',
          authorDate: '%ad',
          message: '%s',
          body: '%b',
          author_name: '%an',
          author_email: '%ae',
          refs: '%D',
          parents: '%P'
        }
      };

      if (branch) {
        logOptions[branch] = null;
      }

      const log = await git.log(logOptions);
      return { success: true, data: log.all };
    } catch (err) {
      return { success: false, error: err.message, data: [] };
    }
  }

  async getCommitDetail(repoPath, hash) {
    try {
      const git = this.getGit(repoPath);

      // 1. Get commit metadata & parents
      const commitLog = await git.log({
        maxCount: 1,
        from: hash,
        to: hash,
        format: {
          hash: '%H',
          shortHash: '%h',
          date: '%ai',
          message: '%s',
          body: '%b',
          author_name: '%an',
          author_email: '%ae',
          refs: '%D',
          parents: '%P'
        }
      });
      const meta = commitLog.all && commitLog.all[0] ? commitLog.all[0] : { hash };
      const parents = (meta.parents || '').trim().split(' ').filter(Boolean);

      // 2. Get numstat for changed files (handling merge commits with --first-parent)
      let numstatRaw = '';
      try {
        if (parents.length > 1) {
          numstatRaw = await git.raw(['show', '-m', '--first-parent', '--numstat', '--format=', hash]);
        } else {
          numstatRaw = await git.raw(['show', '--numstat', '--format=', hash]);
        }
      } catch (e) {
        try {
          numstatRaw = await git.raw(['show', '--numstat', '--format=', hash]);
        } catch (e2) {
          numstatRaw = '';
        }
      }

      const files = [];
      let totalAdditions = 0;
      let totalDeletions = 0;

      const numstatLines = numstatRaw.trim().split('\n').filter(Boolean);
      numstatLines.forEach(line => {
        const parts = line.split('\t');
        if (parts.length >= 3) {
          const additions = parts[0] === '-' ? 0 : parseInt(parts[0], 10) || 0;
          const deletions = parts[1] === '-' ? 0 : parseInt(parts[1], 10) || 0;
          const filePath = parts[2];
          totalAdditions += additions;
          totalDeletions += deletions;
          files.push({
            path: filePath,
            additions,
            deletions,
            isBinary: parts[0] === '-' || parts[1] === '-'
          });
        }
      });

      // 3. Extract diffs for initial preview (up to first 12 files)
      const fileDiffs = [];
      const filesToPreview = files.slice(0, 12);

      for (const f of filesToPreview) {
        try {
          const res = await this.getCommitFileDiff(repoPath, hash, f.path);
          if (res.success && res.diff) {
            fileDiffs.push({
              filePath: f.path,
              diff: res.diff
            });
          }
        } catch (e) {
          // ignore single file preview error
        }
      }

      return {
        success: true,
        data: {
          meta,
          files,
          totalAdditions,
          totalDeletions,
          fileDiffs,
          isLargeCommit: files.length > 15
        }
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async getCommitFileDiff(repoPath, hash, filePath) {
    try {
      const git = this.getGit(repoPath);
      const parentsRaw = await git.raw(['log', '-1', '--format=%P', hash]);
      const parents = parentsRaw.trim().split(' ').filter(Boolean);

      let diff = '';
      if (parents.length > 0) {
        try {
          diff = await git.raw(['diff', parents[0], hash, '--', filePath]);
        } catch (e) {}
      }

      if (!diff) {
        try {
          diff = await git.raw(['show', '--format=', hash, '--', filePath]);
        } catch (e) {}
      }

      if (!diff) {
        // If file was newly added, show file content as additions
        try {
          const content = await git.raw(['show', `${hash}:${filePath}`]);
          if (content !== undefined && content !== null) {
            const lines = content.split('\n');
            diff = `--- /dev/null\n+++ b/${filePath}\n@@ -0,0 +1,${lines.length} @@\n` + lines.map(l => `+${l}`).join('\n');
          }
        } catch (e) {
          diff = '[Binary file or deleted]';
        }
      }

      return { success: true, diff };
    } catch (err) {
      return { success: false, error: err.message, diff: '' };
    }
  }

  async getFileHistory(repoPath, filePath, maxCount = 50) {
    try {
      const git = this.getGit(repoPath);
      const log = await git.log({
        file: filePath,
        maxCount,
        '--follow': null,
        format: {
          hash: '%H',
          shortHash: '%h',
          date: '%ai',
          message: '%s',
          body: '%b',
          author_name: '%an',
          author_email: '%ae',
          refs: '%D'
        }
      });
      return { success: true, data: log.all, filePath };
    } catch (err) {
      return { success: false, error: err.message, data: [] };
    }
  }

  async getFileContentAtCommit(repoPath, hash, filePath) {
    try {
      const git = this.getGit(repoPath);
      const content = await git.raw(['show', `${hash}:${filePath}`]);
      return { success: true, content };
    } catch (err) {
      return { success: false, error: err.message, content: '' };
    }
  }

  async getAllRepoFiles(repoPath) {
    try {
      const git = this.getGit(repoPath);
      const filesRaw = await git.raw(['ls-files']);
      const files = filesRaw.trim().split('\n').filter(Boolean);
      return { success: true, files };
    } catch (err) {
      return { success: false, error: err.message, files: [] };
    }
  }
}

module.exports = new GitService();
