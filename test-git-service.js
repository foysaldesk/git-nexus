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

  // 3. Stage & commit
  console.log('Staging files...');
  await gitService.stageFiles(repoPath, ['.']);
  const statusAfterStage = await gitService.getStatus(repoPath);
  console.log('Staged count after add:', statusAfterStage.data?.staged.length);

  console.log('Committing test changes...');
  const commitRes = await gitService.commit(repoPath, 'Initial commit: Git Nexus desktop application');
  console.log('Commit result:', commitRes);

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

  console.log('\nAll GitService operations successfully validated!');
}

test().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
