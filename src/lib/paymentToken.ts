import crypto from 'crypto';

export function getPaymentConfirmToken(orderCode: string, secretKey: string = ''): string {
  return crypto
    .createHash('sha256')
    .update(`${orderCode.toUpperCase().trim()}_${secretKey || 'omachi_token_salt_2026'}`)
    .digest('hex')
    .substring(0, 16);
}
