const fs = require('fs');
const { execSync } = require('child_process');

function getSimplifiedTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 获取当前分支
let currentBranch;
try {
  currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
} catch (error) {
  console.error('❌ Cannot get Git branch:', error.message);
  process.exit(1);
}

// 分支映射 - 根据你的项目调整
let channel;
if (currentBranch === 'main' || currentBranch === 'master') {
  channel = 'production';
} else if (currentBranch === 'develop' || currentBranch === 'dev') {
  channel = 'development';
} else if (currentBranch === 'preview' || currentBranch === 'staging') {
  channel = 'preview';
} else {
  channel = 'development';
}

// 读取当前版本和时间
const appJson = JSON.parse(fs.readFileSync('app.json', 'utf-8'));
const currentVersion = appJson.expo.version || '1.0.0';
const currentUpdateTime = appJson.expo.extra?.updateTime || 'unknown';

console.log(`🚀 BolarityCashApp Quick Update`);
console.log(`📦 Branch: ${currentBranch} → Channel: ${channel}`);
console.log(`🔢 Version: ${currentVersion}`);
console.log(`⏰ Current Update Time: ${currentUpdateTime}`);
console.log(`🕐 New Update Time: ${getSimplifiedTime()}`);
console.log('');

// 执行更新
try {
  // 更新 app.json 中的时间
  if (!appJson.expo.extra) {
    appJson.expo.extra = {};
  }
  appJson.expo.extra.updateTime = getSimplifiedTime();
  fs.writeFileSync('app.json', JSON.stringify(appJson, null, 2));

  const updateCommand = `eas update --channel ${channel} --message "BolarityCashApp v${currentVersion} - ${getSimplifiedTime()}"`;
  console.log(`🚀 Executing: ${updateCommand}`);
  console.log('');

  execSync(updateCommand, { stdio: 'inherit' });

  console.log('');
  console.log('✅ Update completed successfully!');
  console.log(
    `📱 Users will see version: [${getSimplifiedTime()}] v${currentVersion}`
  );
} catch (error) {
  // 恢复原始时间
  if (appJson.expo.extra) {
    appJson.expo.extra.updateTime = currentUpdateTime;
    fs.writeFileSync('app.json', JSON.stringify(appJson, null, 2));
  }
  console.error('❌ Update failed:', error.message);
  process.exit(1);
}
