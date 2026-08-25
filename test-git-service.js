const gitService = require('./src/main/git-service');
const path = require('path');
const fs = require('fs');

async function test() {
  console.log('Testing GitService against current directory...');
  const repoPath = path.resolve(__dirname);
  
  // 1. Check if git repo
  let isRepo = await gitService.checkIsRepo(repoPath);
  console.log('checkIsRepo:', isRepo);
  if (!isRepo) {
    console.log('Initializing git in repoPath...');
    await gitService.initRepo(repoPath);
    isRepo = await gitService.checkIsRepo(repoPath);
    console.log('After init isRepo:', isRepo);
  }

  // 2. Status
  const status = await gitService.getStatus(repoPath);
  console.log('getStatus current branch:', status.data?.currentBranch);
  console.log('getStatus staged count:', status.data?.staged.length);
  console.log('getStatus untracked count:', status.data?.untracked.length);

  // 4. Branches
  const branches = await gitService.getBranches(repoPath);
  console.log('Branches:', branches.data);

  // 5. History
  const history = await gitService.getHistory(repoPath);
  console.log('History count:', history.data?.length);

  // 6. Branch creation & checkout
  console.log('Creating feature branch...');
  const branchRes = await gitService.createBranch(repoPath, 'feature/test-branch', null, true);
  console.log('Create branch result:', branchRes);

  const branchesAfterCreate = await gitService.getBranches(repoPath);
  console.log('Branches after create:', branchesAfterCreate.data?.local.map(b => b.name));

  console.log('Switching back to original branch...');
  const mainBranchName = branches.data.current || 'main';
  await gitService.checkoutBranch(repoPath, mainBranchName);

  console.log('Deleting test branch...');
  const deleteRes = await gitService.deleteBranch(repoPath, 'feature/test-branch', false, true);
  console.log('Delete result:', deleteRes);

  // Test File History
  console.log('Testing getAllRepoFiles...');
  const repoFilesRes = await gitService.getAllRepoFiles(repoPath);
  console.log('Tracked files count:', repoFilesRes.files.length);

  console.log('Testing getFileHistory on package.json...');
  const fileHistRes = await gitService.getFileHistory(repoPath, 'package.json');
  console.log('package.json history count:', fileHistRes.data.length);
  if (fileHistRes.data.length > 0) {
    const firstCommit = fileHistRes.data[0];
    console.log('Testing getFileContentAtCommit on package.json...');
    const contentRes = await gitService.getFileContentAtCommit(repoPath, firstCommit.hash, 'package.json');
    console.log('package.json content length:', contentRes.content.length);
  }

  // Test Tags
  console.log('Testing getTags...');
  const tagsRes = await gitService.getTags(repoPath);
  console.log('Existing tags:', tagsRes.data);

  console.log('Testing createTag...');
  const createTagRes = await gitService.createTag(repoPath, 'test-v999.0', 'Test tag message');
  console.log('Create tag result:', createTagRes);

  const tagsAfterCreate = await gitService.getTags(repoPath);
  console.log('Tags after create:', tagsAfterCreate.data.map(t => t.name));

  console.log('Testing deleteTag...');
  const deleteTagRes = await gitService.deleteTag(repoPath, 'test-v999.0');
  console.log('Delete tag result:', deleteTagRes);

  // Test checkoutCommit in a clean temporary repository
  const os = require('os');
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'git-checkout-test-'));
  try {
    console.log('Testing checkoutCommit in clean temporary repo at:', tempDir);
    await gitService.initRepo(tempDir);
    fs.writeFileSync(path.join(tempDir, 'file.txt'), 'version 1\n');
    await gitService.stageFiles(tempDir, ['.']);
    await gitService.commit(tempDir, 'First commit', '');

    fs.writeFileSync(path.join(tempDir, 'file.txt'), 'version 2\n');
    await gitService.stageFiles(tempDir, ['.']);
    await gitService.commit(tempDir, 'Second commit', '');

    const tempHistory = await gitService.getHistory(tempDir);
    const commit1 = tempHistory.data[1];
    const commit2 = tempHistory.data[0];

    console.log(`Checking out commit 1 (${commit1.shortHash}) in detached HEAD...`);
    const resDetached = await gitService.checkoutCommit(tempDir, commit1.hash, false);
    console.log('Detached result:', resDetached);

    const contentAtCommit1 = fs.readFileSync(path.join(tempDir, 'file.txt'), 'utf8');
    console.log('File content at commit 1:', contentAtCommit1.trim());

    console.log(`Checking out commit 1 (${commit1.shortHash}) as new branch 'feature-from-c1'...`);
    const resNewBranch = await gitService.checkoutCommit(tempDir, commit1.hash, true, 'feature-from-c1');
    console.log('New branch result:', resNewBranch);

    const tempBranches = await gitService.getBranches(tempDir);
    console.log('Branches in temp repo:', tempBranches.data.local.map(b => b.name), 'Current:', tempBranches.data.current);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  console.log('\nAll GitService operations successfully validated!');
}

test().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
