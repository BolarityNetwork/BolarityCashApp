export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function toMainIdentifier(account: any): string {
  if (account.type === "phone") {
    return account.phoneNumber;
  }
  if (account.type === "email" || account.type === "wallet") {
    return account.address;
  }
  if (account.type === "twitter_oauth" || account.type === "tiktok_oauth") {
    return account.username;
  }
  if (account.type === "custom_auth") {
    return account.custom_user_id;
  }
  return account.type;
}

export function getProviderIcon(type: string): string {
  const icons: { [key: string]: string } = {
    email: "📧",
    phone: "📱",
    wallet: "💼",
    solana: "🌞",
    ethereum: "🔷",
    twitter_oauth: "🐦",
    tiktok_oauth: "🎵",
    google: "🔍",
    github: "⚡",
    discord: "🎮",
    apple: "🍎",
    custom_auth: "🔐",
  };
  
  return icons[type] || "🔗";
}