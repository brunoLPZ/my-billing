import crypto from 'crypto';

export function getRequiredEnv(name: string): string {
  const envVar = process.env[name];
  if (!envVar) {
    throw new Error(`Cannot load required env var ${name}`);
  }
  return envVar;
}

export function getEnv(name: string): string | undefined {
  return process.env[name];
}

export function isYesterday(date: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return new Date(date).getDate() === yesterday.getDate();
}

export function isFirstDayOfMonth(): boolean {
  return new Date().getDate() === 1;
}

export function getYesterdayDate(): Date {
  const date = new Date();
  return new Date(date.setDate(date.getDate() - 1));
}

export function removeTabsAndNewLines(text: string): string {
  return text.replace(/\t*/g, '').replace(/\n/g, ' ').trim();
}

export function hashToSha256(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

export function calculateAverage(nums: number[]): number {
  return nums.reduce((a, b) => a + b) / nums.length;
}

export function getDaysInPreviousMonth(): number {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 0).getDate();
}
