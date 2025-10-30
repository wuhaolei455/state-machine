#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const packageJsonPath = path.join(projectRoot, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

function log(message, symbol = '•') {
  console.log(`${symbol} ${message}`);
}

function run(command, description) {
  log(description, '▶');
  try {
    execSync(command, { stdio: 'inherit', cwd: projectRoot });
    log(`${description} 完成`, '✔');
  } catch (error) {
    log(`${description} 失败`, '✖');
    process.exitCode = 1;
    throw error;
  }
}

function hasScript(name) {
  return Boolean(packageJson.scripts && packageJson.scripts[name]);
}

function ensureGitClean() {
  try {
    const status = execSync('git status --porcelain', { cwd: projectRoot, stdio: 'pipe' }).toString();
    if (status.trim()) {
      log('当前 Git 工作区不是干净状态，请先提交或暂存更改。', '⚠');
      process.exit(1);
    }
  } catch (error) {
    log('无法确认 Git 状态，请确保在 Git 仓库中执行。', '⚠');
  }
}

function ensureNpmLogin() {
  try {
    execSync('npm whoami', { stdio: 'pipe' });
  } catch (error) {
    log('未检测到 npm 登录信息，请先执行 "npm login"。', '⚠');
    process.exit(1);
  }
}

function ensureDist() {
  const distPath = path.join(projectRoot, 'dist');
  if (!fs.existsSync(distPath)) {
    log('未找到 dist 目录，请先执行构建。', '⚠');
    process.exit(1);
  }
}

function main() {
  const versionBump = process.argv[2];

  log('开始发布流程', '🚀');
  ensureGitClean();
  ensureNpmLogin();

  if (versionBump) {
    const allowed = ['patch', 'minor', 'major'];
    if (!allowed.includes(versionBump)) {
      log(`无效的版本类型: ${versionBump}，可选值: ${allowed.join(', ')}`, '✖');
      process.exit(1);
    }
    run(`npm version ${versionBump}`, `更新版本 (${versionBump})`);
  }

  if (hasScript('test')) {
    run('npm test', '运行测试');
  }

  run('npm run build', '构建产物');
  ensureDist();

  run('npm publish --access public', '发布到 npm');

  log('发布完成 🎉', '✅');
}

try {
  main();
} catch (error) {
  log(error.message || error, '✖');
  process.exit(1);
}

