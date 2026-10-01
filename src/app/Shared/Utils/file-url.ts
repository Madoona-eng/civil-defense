import { BaseAPI } from '../Env/env';

export function buildFileUrl(filePath: string): string {
  const cleanPath = filePath.replace(/^\/+/, '').replace(/\\/g, '/');
  return encodeURI(`${BaseAPI}/${cleanPath}`);
}