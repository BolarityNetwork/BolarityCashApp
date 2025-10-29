import { Buffer } from 'buffer';
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { randomUUID } from 'expo-crypto';
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

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}

/**
 * Formats a number to a compact string representation (max ~3-4 characters)
 * Examples: 0.00, 12.0, 123, 1.0k, 1.0m, etc.
 *
 * @param value - The number to format
 * @returns Formatted string representation
 */
export function formatCompactNumber(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  // Handle zero
  if (abs === 0) {
    return '0.00';
  }

  // Less than 1: show 2 decimal places (e.g., 0.00, 0.12)
  if (abs < 1) {
    return `${sign}${abs.toFixed(2)}`;
  }

  // 1-10: show 1 decimal place (e.g., 1.0, 9.5)
  if (abs < 10) {
    return `${sign}${abs.toFixed(2)}`;
  }

  // 10-100: show 1 decimal place (e.g., 12.0, 99.5)
  if (abs < 100) {
    return `${sign}${abs.toFixed(1)}`;
  }

  // 100-999: show integer (e.g., 123)
  if (abs < 1000) {
    return `${sign}${Math.round(abs)}`;
  }

  // 1000+: use suffix notation (k, m, b, t)
  const SUFFIXES = ['k', 'm', 'b', 't'];
  let unitIndex = -1;
  let scaled = abs;

  while (scaled >= 1000 && unitIndex < SUFFIXES.length - 1) {
    scaled /= 1000;
    unitIndex += 1;
  }

  // Format the scaled number
  let rounded: string;
  if (scaled >= 100) {
    // >= 100: show as integer (e.g., 100k, 999k)
    rounded = Math.round(scaled).toString();
  } else if (scaled >= 10) {
    // 10-99.9: show 1 decimal place (e.g., 12.5k)
    rounded = scaled.toFixed(1);
  } else {
    // 1-9.9: show 1 decimal place (e.g., 1.5k)
    rounded = scaled.toFixed(1);
  }

  return `${sign}${rounded}${SUFFIXES[unitIndex]}`;
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
