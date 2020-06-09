import { StorageUtil } from './Storage';


export type RequestHeaders = Record<string, string>;

export type RequestData = Record<string, string> | string | object;

export interface RequestOptions {
  url?: string;
  method?: string;
  args?: RequestData;
  saveAuthnState?: boolean;
  accessToken?: string;
  withCredentials?: boolean;
  storageUtil?: StorageUtil;
  cacheResponse?: boolean;
  headers?: RequestHeaders;
}

export interface FetchOptions {
  headers?: HeadersInit;
  data?: RequestData;
  withCredentials?: boolean;
}

export interface FetchResponse {
  headers: {
    get(key: string): string;
  };
  json(): Promise<object>;
  text(): Promise<string>;
}

export type HttpRequestClient = (method: string, url: string, options: FetchOptions) => Promise<any>;

export interface HttpResponse {
  responseText: string;
  status: number;
  responseType?: string;
  responseJSON?: object;
}
