// 网络工具方法
import { AAVE_NETWORKS, NETWORKS, RPC_ENDPOINTS } from '@/constants/networks';

// 根据 chainId 获取网络配置
export const getNetworkByChainId = (
  chainId: string
): (typeof NETWORKS)[keyof typeof NETWORKS] | undefined => {
  return Object.values(NETWORKS).find(network => network.chainId === chainId);
};

// 根据网络名称获取网络配置
export const getNetworkByName = (
  name: string
): (typeof NETWORKS)[keyof typeof NETWORKS] | undefined => {
  return Object.values(NETWORKS).find(
    network => network.name.toLowerCase() === name.toLowerCase()
  );
};

// 获取 AAVE 网络配置
export const getAAVENetworkConfig = (
  networkKey: keyof typeof AAVE_NETWORKS
): (typeof AAVE_NETWORKS)[keyof typeof AAVE_NETWORKS] | null => {
  return AAVE_NETWORKS[networkKey] || null;
};

// 获取支持的 AAVE 网络列表
export const getSupportedAAVENetworks = (): (keyof typeof AAVE_NETWORKS)[] => {
  return Object.keys(AAVE_NETWORKS) as (keyof typeof AAVE_NETWORKS)[];
};

// 验证网络是否支持
export const isNetworkSupported = (chainId: string): boolean => {
  return Object.values(NETWORKS).some(network => network.chainId === chainId);
};

// 获取网络显示名称
export const getNetworkDisplayName = (chainId: string): string => {
  const network = getNetworkByChainId(chainId);
  return network?.name || 'Unknown Network';
};

// 获取网络 RPC URL
export const getNetworkRpcUrl = (chainId: string): string | undefined => {
  const network = getNetworkByChainId(chainId);
  return network?.rpcUrl;
};

// 根据网络键获取 RPC URL
export const getRpcUrlByNetwork = (
  network: keyof typeof RPC_ENDPOINTS
): string => {
  return RPC_ENDPOINTS[network];
};

// 获取所有支持的网络列表
export const getAllSupportedNetworks = (): (keyof typeof NETWORKS)[] => {
  return Object.keys(NETWORKS) as (keyof typeof NETWORKS)[];
};

// 验证是否为有效的网络键
export const isValidNetworkKey = (
  key: string
): key is keyof typeof NETWORKS => {
  return key in NETWORKS;
};

// 验证是否为有效的 AAVE 网络键
export const isValidAAVENetworkKey = (
  key: string
): key is keyof typeof AAVE_NETWORKS => {
  return key in AAVE_NETWORKS;
};
