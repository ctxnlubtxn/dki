import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function determineSeconds(start: number) {
  const minutes = Math.floor(start / 60)
  const seconds = start - minutes * 60
  return {
    minutes,
    seconds
  }
}

export function determineStart(start: number) {
  const { minutes, seconds } = determineSeconds(start)
  if (start === 0) {
    return {
      start: `00:00:00`,
      end: `00:${minutes}:${seconds + 35}`
    }
  }
  return {
    start: `00:${minutes}:${seconds}`,
    end: `00:${minutes}:${seconds + 35}`
  }
}

export const MERGE_COMMAND = [
  '-i',
  'temp.mp4',
  '-i',
  'bgm.mp3',
  '-t',
  '00:00:30',
  '-c:v',
  'copy',
  '-c:a',
  'aac',
  '-strict',
  'experimental',
  '-map',
  '0:v:0',
  '-map',
  '1:a:0',
  '-shortest',
  'output.mp4',
]