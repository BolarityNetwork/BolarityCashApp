// components/PerfectVaultSavingsPlatform/assets/logos.ts

// 🖼️ 安全导入本地logo图片 - 带try-catch处理
let aaveLogo,
  compoundLogo,
  driftLogo,
  solendLogo,
  naviLogo,
  humaLogo,
  ratexLogo,
  pendleLogo,
  bolarityLogo;
let flexiVaultLogo, timeVaultLogo, maxVaultLogo;

try {
  aaveLogo = require('../../../assets/logos/aave.png');
} catch (_) {
  console.warn('AAVE logo not found');
}

try {
  compoundLogo = require('../../../assets/logos/compound.png');
} catch (_) {
  console.warn('Compound logo not found');
}

try {
  driftLogo = require('../../../assets/logos/drift.png');
} catch (_) {
  console.warn('Drift logo not found');
}

try {
  solendLogo = require('../../../assets/logos/solend.png');
} catch (_) {
  console.warn('Solend logo not found');
}

try {
  naviLogo = require('../../../assets/logos/navi.png');
} catch (_) {
  console.warn('Navi logo not found');
}

try {
  humaLogo = require('../../../assets/logos/huma.png');
} catch (_) {
  console.warn('Huma logo not found');
}

try {
  ratexLogo = require('../../../assets/logos/ratex.png');
} catch (_) {
  console.warn('Ratex logo not found');
}

try {
  pendleLogo = require('../../../assets/logos/pendle.png');
} catch (_) {
  console.warn('Pendle logo not found');
}

try {
  bolarityLogo = require('../../../assets/logos/bolarity.png');
} catch (_) {
  console.warn('Bolarity logo not found');
}

// 🎯 Vault 产品专用 Logo
try {
  flexiVaultLogo = require('../../../assets/logos/flexivault.png');
} catch (_) {
  console.warn('FlexiVault logo not found');
}

try {
  timeVaultLogo = require('../../../assets/logos/timevault.png');
} catch (_) {
  console.warn('TimeVault logo not found');
}

try {
  maxVaultLogo = require('../../../assets/logos/maxvault.png');
} catch (_) {
  console.warn('MaxVault logo not found');
}

// Protocol Logo映射
export const PROTOCOL_LOGOS = {
  AAVE: aaveLogo,
  Drift: driftLogo,
  Compound: compoundLogo,
  Solend: solendLogo,
  Navi: naviLogo,
  Huma: humaLogo,
  Ratex: ratexLogo,
  Pendle: pendleLogo,
};

// Vault Logo映射
export const VAULT_LOGOS = {
  FlexiVault: flexiVaultLogo,
  'TimeVault Pro': timeVaultLogo,
  'MaxVault Elite': maxVaultLogo,
};

// Vault图标映射
export const VAULT_FALLBACK_ICONS = {
  FlexiVault: '⚡',
  'TimeVault Pro': '⏰',
  'MaxVault Elite': '⭐',
};

// Protocol备用图标
export const PROTOCOL_FALLBACK_ICONS = {
  AAVE: '🏛️',
  Drift: '🌊',
  Compound: '🔷',
  Solend: '☀️',
  Navi: '🧭',
  Huma: '🌍',
  Ratex: '💎',
  Pendle: '🔮',
};

// 其他logo
export { bolarityLogo };

// 从vault名称获取协议名称
export const getProtocolFromVaultName = (vaultName: string): string => {
  if (vaultName.includes('Ratex')) return 'Ratex';
  if (vaultName.includes('Pendle')) return 'Pendle';
  return vaultName;
};
