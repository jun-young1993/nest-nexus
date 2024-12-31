import { createHmac } from 'crypto';

export function generateSign(
  apiPath: string,
  params: Record<string, string>,
  appSecret: string,
  signMethod: string | undefined = 'sha256',
) {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}${params[key]}`)
    .join('');
  const baseString = `${apiPath}${sortedParams}`;
  return createHmac(signMethod, appSecret)
    .update(baseString)
    .digest('hex')
    .toUpperCase();
}

export function generateSignature(
  params: Record<string, string>,
  appSecret: string,
  signMethod: string | undefined = 'sha256',
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}${params[key]}`)
    .join('');
  const baseString = `${sortedParams}`;
  return createHmac(signMethod, appSecret)
    .update(baseString)
    .digest('hex')
    .toUpperCase();
}
