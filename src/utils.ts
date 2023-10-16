import totp from './totpGenerator';

export const getToken = (secretKey: string, currentTimestamp: number) => {
  const otp = totp(secretKey, {
    digits: 6,
    algorithm: 'SHA-1',
    period: 30,
    timestamp: currentTimestamp,
  });
  return otp;
};
