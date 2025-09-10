import axios, { InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { getI18n } from 'react-i18next';
import { Platform } from 'react-native';
import { colorScheme } from 'react-native-css-interop';

import APP_CONFIG from '@/lib/env.config';
import { HotFixVersion } from '@/lib/version';

import { Language } from '@/i18n';
import { fetchDeviceUniqueId, sleep } from '@/utils/utils';

const axiosToken = axios.create();

axios.defaults.baseURL = APP_CONFIG.apiUrl;
axiosToken.defaults.baseURL = APP_CONFIG.apiUrl;

let requestList: (() => void)[] = [];

let requestConfigList: ((token: {
  signature: string;
  deadline: number;
}) => void)[] = [];

const onErrorCallBack = async (error: any) => {
  const config = error.config;
  if (!config.params?.retry) {
    return Promise.reject(error);
  }
  config.__retryCount = config?.__retryCount || 0;
  config.__retryCount += 1;
  if (config.__retryCount < 3) {
    await sleep(1000);
    return axios(config);
  }
  return Promise.reject(error);
};

const onErrorAndRefreshCallBack = async (error: any) => {
  const config = error.config;
  const statusCode = error.response?.status;
  if (statusCode === 401) {
    if (config.__retryCount > 3) {
      return onErrorCallBack(error);
    }
    config.__retryCount += 1;
    return new Promise(resolve => {
      const retryRequest = () => {
        resolve(axiosToken(config));
      };
      requestList.push(retryRequest);
    });
  }

  return onErrorCallBack(error);
};

const requestCallBack = async (config: InternalAxiosRequestConfig<any>) => {
  const i18n = getI18n();
  config.headers['Connection'] = 'keep-alive';
  config.headers['X-Platform'] = Platform.OS === 'ios' ? 'ios' : 'android';
  config.headers['X-AppVersion'] = Constants.expoConfig?.version ?? '1.1.0';
  config.headers['X-HotfixVersion'] = HotFixVersion[0];
  config.headers['X-DeviceId'] = await fetchDeviceUniqueId();
  if (!config.headers?.['X-Lang'])
    config.headers['X-Lang'] = i18n.language ?? Language.CN;
  if (!config.headers?.['X-Theme'])
    config.headers['X-Theme'] = colorScheme.get() === 'dark' ? 'dark' : 'light';

  if (config.params?.optional === true) {
    delete config.params['optional'];
    return config;
  } else {
    return new Promise<InternalAxiosRequestConfig<any>>(resolve => {
      const retryRequest = (token: { signature: string; deadline: number }) => {
        config.headers['X-Request-Auth'] =
          `${token.signature}:${token.deadline}`;
        resolve(config);
      };
      requestConfigList.push(retryRequest);
    });
  }
};

axiosToken.interceptors.request.use(requestCallBack, (error: any) => {
  return Promise.reject(error);
});

axiosToken.interceptors.response.use(
  (response: any) => {
    console.log(`api:${response.config.url}:`, {
      baseURL: response.config.baseURL,
      url: response.config.url,
      params: response.config.params,
      requestData: response.config.data,
      response: response.data,
    });

    return response;
  },
  (error: any) => onErrorAndRefreshCallBack(error)
);

export { axios, axiosToken };
