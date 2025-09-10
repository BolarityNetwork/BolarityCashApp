import { Buffer } from 'buffer';
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { randomUUID } from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { t } from 'i18next';
import moment from 'moment';

import { PATTERN_URL } from '@/lib/config';
import { LocalStorageEnum } from '@/lib/local-store';

// import { Toast } from '@/components/common/Toast';

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getLengthInBytes(
  text:
    | string
    | Buffer
    | NodeJS.ArrayBufferView
    | ArrayBuffer
    | SharedArrayBuffer
) {
  return Buffer.byteLength(text, 'utf-8');
}

export function getStringBytesLength(str: string) {
  const encoder = new TextEncoder();
  return encoder.encode(str).length;
}

export function getByteString(
  text: string | { [Symbol.toPrimitive](hint: 'string'): string }
) {
  return Buffer.from(text, 'utf-8');
}

export const matchesWith = (str: string, pattern: RegExp) => {
  let match = null;
  const arr: Array<[RegExpExecArray, RegExp]> = [];
  // Match the pattern with the string and push the matches to an array
  while ((match = pattern.exec(str)) !== null) {
    arr.push([match, pattern]);
  }
  return arr;
};

export const getMatchesPair = (patternsArr: RegExp[], castText: string) => {
  const matchesPair: Array<[RegExpExecArray, RegExp]> = [];
  return matchesPair
    .concat(...patternsArr.map(pattern => matchesWith(castText, pattern)))
    .filter(e => !!e)
    .sort(([a], [b]) => ({ ...a }).index - { ...b }.index);
};

export function formatCount(
  count?: number,
  min = 1000,
  fixed: number | undefined = undefined
): string {
  if (!count) {
    return '0';
  }
  if (count < min) {
    return count.toString();
  }
  if (count < 1000) {
    return count.toString();
  } else if (count < 1_000_000) {
    const rounded = Math.floor(count / 10) / 100;
    return rounded.toFixed(fixed ?? 2) + 'K';
  } else if (count < 1_000_000_000) {
    const rounded = Math.floor(count / 10000) / 100;
    return rounded.toFixed(fixed ?? 1) + 'M';
  } else {
    const rounded = Math.floor(count / 10000000) / 100;
    return rounded.toFixed(fixed ?? 0) + 'B';
  }
}

export function formatNotificationCount(count: number) {
  if (count > 99) {
    return '99+';
  }
  return count;
}

const MINUTES = 60;
const HOUR = 3600;
const DAY = 86400;

export const formatDate = (
  dateStr: string | number | undefined,
  isShort = false,
  isFullTime = false
) => {
  if (!dateStr) return;
  const createdTimeStamp =
    typeof dateStr === 'number'
      ? new Date(dateStr * 1000).getTime()
      : new Date(dateStr).getTime();

  if (!createdTimeStamp) return;

  const fromTimestamp = moment.utc(createdTimeStamp).local();

  if (isFullTime) {
    return fromTimestamp.format('YYYY-MM-DD HH:mm:ss');
  }

  const today = moment.utc().local();
  const timeDifferenceInSeconds = today.diff(fromTimestamp, 'seconds');
  let timeSincePoststr = '';

  const getTimeDiff = (timeParam: number) => {
    return Math.floor(timeDifferenceInSeconds / timeParam);
  };

  if (getTimeDiff(DAY) > 0) {
    if (fromTimestamp.year() === today.year()) {
      return fromTimestamp.format(isShort ? 'MM-DD' : 'MM-DD HH:mm');
    }
    return fromTimestamp.format(isShort ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm');
  } else if (getTimeDiff(HOUR) > 0) {
    timeSincePoststr = getTimeDiff(HOUR).toString() + t('date.h');
  } else if (getTimeDiff(MINUTES) > 0) {
    timeSincePoststr = getTimeDiff(MINUTES).toString() + t('date.m');
  } else {
    timeSincePoststr =
      (timeDifferenceInSeconds > 0 ? timeDifferenceInSeconds : 0) + t('date.s');
    if (timeDifferenceInSeconds < 30) {
      return t('date.JustNow');
    }
  }

  return timeSincePoststr + t('date.ago');
};

export function useResetInfiniteQueryPagination(queryKey?: any[]) {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    if (!queryKey) return;
    await queryClient.setQueryData(queryKey, (oldData: any) => {
      if (!oldData) return undefined;
      return {
        ...oldData,
        pages: [...oldData.pages.slice(0, 1)],
        pageParams: [...oldData.pageParams.slice(0, 1)],
      };
    });
    await queryClient.invalidateQueries({ queryKey, refetchType: 'none' });
  }, [queryKey, queryClient]);
}

export function getBlobUrl(file: Blob) {
  if (file) {
    const blobUrl = URL.createObjectURL(file);
    return blobUrl;
  }
  return '';
}

export function getRandomArrayElements<T>(arr: T[], count: number) {
  if (!arr.length) return [];
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function extractUrlPart(url: string) {
  const match = url.match(/https?:\/\/(.*)/);
  if (match && match[1]) {
    return match[1];
  }
  return url;
}

export function isImageUrl(url: string) {
  return (
    /\.(png|jpe?g|gif|svg|webp|gif|bmp)(\?.*)?$/.test(url) ||
    url.includes('takocdn.xyz/images') ||
    url.includes('imagedelivery.net') ||
    url.includes('media.tenor.com') ||
    url.includes('image') ||
    url.includes('imgur')
  );
}

export function getShowAddr(addr: string, len?: number) {
  if (!addr) return '';
  if (len) {
    return addr.slice(0, len) + '...' + addr.slice(-len);
  }
  return addr.slice(0, 6) + '...' + addr.slice(-6);
}

export function isString(arg: any) {
  return typeof arg === 'string';
}

export function findUrls(text: string) {
  const matches = text.match(PATTERN_URL);
  return matches || [];
}

export const formatAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export function delay(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export function throttle(func: Function, delay: number) {
  let lastCall = 0;
  return (...args: any) => {
    const now = new Date().getTime();
    if (now - lastCall >= delay) {
      lastCall = now;
      return func(...args);
    }
  };
}

export async function saveImageFn(url: string) {
  let isSuccess = false;
  let uri: string | undefined;
  try {
    const permission = await MediaLibrary.requestPermissionsAsync();
    if (!permission.granted) {
      // Toast.show({
      //   type: 'normal',
      //   status: 'error',
      //   message: t('error.saveImagePermissions'),
      // });
      return;
    }

    // if (Platform.OS === "android") {
    const timer = setTimeout(() => {
      throw 'Timeout';
    }, 15000);
    const response = await FileSystem.downloadAsync(
      url,
      FileSystem.documentDirectory + 'temp_file'
    );
    const contentType =
      response.headers['Content-Type'] || response.headers['content-type'];
    let fileExtension = '';
    if (contentType === 'image/jpeg') {
      fileExtension = '.jpg';
    } else if (contentType === 'image/png') {
      fileExtension = '.png';
    } else if (contentType === 'image/gif') {
      fileExtension = '.gif';
    } else {
      fileExtension = '';
    }
    const fileUri =
      FileSystem.documentDirectory +
      'downloaded_image' +
      new Date().getTime() +
      fileExtension;

    const { uri: _uri } = await FileSystem.downloadAsync(url, fileUri);
    await MediaLibrary.createAssetAsync(_uri);
    uri = _uri;
    isSuccess = true;
    // }
    // if (Platform.OS === "ios") {
    //   const permission = await MediaLibrary.requestPermissionsAsync();
    //   if (permission.granted) {
    //     await MediaLibrary.saveToLibraryAsync(url);
    //     isSuccess = true;
    //   } else {
    //     Toast.show({
    //       text1: t("error.saveImagePermissions"),
    //       type: "error",
    //     });
    //   }
    // }
    if (isSuccess)
      // Toast.show({
      //   type: 'normal',
      //   status: 'success',
      //   message: t('toast.saveImageSuccess'),
      // });
      clearTimeout(timer);
    return uri || url;
  } catch (error: any) {
    // Toast.show({
    //   type: 'normal',
    //   status: 'error',
    //   message: t('error.saveImage'),
    // });
    throw error;
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}

export const fetchDeviceUniqueId = async () => {
  try {
    const storedUUID = await AsyncStorage.getItem(LocalStorageEnum.DeviceUUID);

    if (storedUUID) {
      return storedUUID;
    }

    const newUUID = randomUUID();

    await AsyncStorage.setItem(LocalStorageEnum.DeviceUUID, newUUID);
    return newUUID;
  } catch {
    return randomUUID();
  }
};
