export const OAUTH_PROVIDERS = [
  { 
    name: "google", 
    label: "Continue with Google", 
    colors: ['#4285F4', '#34A853'] as const,
    icon: "🔍"
  },
  { 
    name: "github", 
    label: "Continue with GitHub", 
    colors: ['#333', '#666'] as const,
    icon: "⚡"
  },
  { 
    name: "discord", 
    label: "Continue with Discord", 
    colors: ['#5865F2', '#7289DA'] as const,
    icon: "🎮"
  },
  { 
    name: "apple", 
    label: "Continue with Apple", 
    colors: ['#000', '#333'] as const,
    icon: "🍎"
  },
] as const;

export type OAuthProvider = typeof OAUTH_PROVIDERS[number]['name'];