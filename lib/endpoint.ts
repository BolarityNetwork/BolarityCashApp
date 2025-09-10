export const FEED_PAGE_LIMIT = 10;
export const DEFAULT_STALE_TIME = 1000 * 10;
export const DEFAULT_CACHE_TIME = 1000 * 60 * 2;
export const EDIT_CACHE_TIME = 1000 * 60 * 15;

export const ImageCDN = process.env.EXPO_PUBLIC_IMAGE_CDN_URL;

export enum EndpointEnum {
  // base info
  getCoinsByAddress = '/router_api/coins_by_address',
}
