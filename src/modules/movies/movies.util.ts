import { parse } from 'qs'
import { MAGNET_KEY, SPLIT_MAGNET_STRING } from './movies.const.js'
import { TorrentFile } from 'webtorrent'

const BTIH_HASH_REGEX = /^[a-fA-F0-9]{40}$|^[A-Z2-7]{32}$/

export const isValidMagnetHash = (hash: unknown): hash is string => {
  return typeof hash === 'string' && BTIH_HASH_REGEX.test(hash.trim())
}

export const extractMagnetFromQuery = (query: string | undefined | null): string | null => {
  if (!query) return null

  const parsedMagnetLink = parse(query)
  const magnetValue = parsedMagnetLink[MAGNET_KEY]

  if (typeof magnetValue !== 'string') return null

  const hash = magnetValue.replace(SPLIT_MAGNET_STRING, '')
  if (!isValidMagnetHash(hash)) return null


  const rest = query.split('&').slice(1).join('&')
  return rest ? `magnet:?xt=urn:btih:${hash}&${rest}` : `magnet:?xt=urn:btih:${hash}`
}


export interface MovieRef {
  title: string        
  originalTitle: string 
  year: number       
}

const EXCLUDE_PATTERNS: RegExp[] = [
  /\bPC\b/i,           
  /\[S\d{2}(-\d{2})?\]/i, 
  /\bCBR\b/i,             
  /\bсезон[а-я]*\b/i,    
  /\bсери[ияй]+\b/i,      
  /\bepisode[s]?\b/i,
  /\bTV\s?Series\b/i,
  /\bmini[\s-]?series\b/i,
  /\d+\s?-\s?\d+\s?серии?\b/i, 
]

function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[«»"'’.,:!?]/g, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractYear(rawTitle: string): number | null {
  const match = rawTitle.match(/\((\d{4})(?:-\d{4})?\)/)
  return match ? Number(match[1]) : null
}


function extractCandidateTitles(rawTitle: string): string[] {
  const beforeYear = rawTitle.split(/\(\d{4}/)[0]
  return beforeYear
    .split('/')
    .map(t => normalize(t))
    .filter(Boolean)
}

export function matchMovie(rawTitle: string, ref: MovieRef): boolean {
  if (EXCLUDE_PATTERNS.some(re => re.test(rawTitle))) return false

  const year = extractYear(rawTitle)
  if (year === null || Math.abs(year - ref.year) > 1) return false

  const candidates = extractCandidateTitles(rawTitle)
  const targets = [normalize(ref.title), normalize(ref.originalTitle)]

  return candidates.some(candidate => targets.includes(candidate))
}


const VIDEO_EXTENSIONS = ['.mkv', '.mp4', '.avi', '.mov', '.webm']

const MIME_TYPES: Record<string, string> = {
  '.mkv': 'video/x-matroska',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.avi': 'video/x-msvideo',
  '.mov': 'video/quicktime'
}

export function getFileExtension(fileName: string): string {
  const match = fileName.toLowerCase().match(/\.[^.]+$/)
  return match ? match[0] : ''
}

export function getMimeType(fileName: string): string {
  return MIME_TYPES[getFileExtension(fileName)] ?? 'application/octet-stream'
}

export function pickBestVideoFile(files: TorrentFile[]): TorrentFile | null {
  const videoFiles = files.filter(f =>
    VIDEO_EXTENSIONS.includes(getFileExtension(f.name))
  )

  if (videoFiles.length === 0) return null

  const mkv = videoFiles.find(f => getFileExtension(f.name) === '.mkv')
  if (mkv) return mkv

  return videoFiles.sort((a, b) => b.length - a.length)[0]
}