import { Router, Response, Request, NextFunction } from 'express'
import WebTorrent, { Torrent, TorrentFile } from 'webtorrent'
import { pickBestVideoFile, getMimeType } from '../movies/movies.util.js'

const router = Router()
const client = new WebTorrent()

let state = {
  progress: 0,
  downloadSpeed: 0,
  ratio: 0
}

let error

client.on('error', (err: Error) => {
  console.error('err', err.message)
  error = err.message
})

client.on('torrent', () => {
  console.log(client.progress)
  state = {
    progress: Math.round(client.progress * 100 * 100) / 100,
    downloadSpeed: client.downloadSpeed,
    ratio: client.ratio
  }
})
router.get('/add/:magnet', (req: Request, res: Response) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  })
  const magnet = req.params.magnet

  const respondWithBestFile = (torrent: Torrent) => {
    const best = pickBestVideoFile(torrent.files)
    if (!best) {
      return res.status(404).send({ error: 'В торренте нет подходящего видеофайла' })
    }
    res.status(200).send([{ name: best.name, length: best.length }])
  }

  const existing = client.get(magnet)
  if (existing) {
    return respondWithBestFile(existing)
  }

  client.add(magnet, torrent => {
    respondWithBestFile(torrent)
  })
})

router.get('/stats', (req: Request, res: Response) => {
  state = {
    progress: Math.round(client.progress * 100 * 100) / 100,
    downloadSpeed: client.downloadSpeed,
    ratio: client.ratio
  }
  res.status(200).send(state)
})

// stream
interface StreamRequest extends Request {
  params: {
    magnet: string
    fileName: string
  }
  headers: {
    range: string
  }
}

interface ErrorWithStatus extends Error {
  status: number
}
router.get('/:magnet/:fileName', (req: StreamRequest, res: Response, next: NextFunction) => {
  const {
    params: { magnet, fileName },
    headers: { range }
  } = req

  if (!range) {
    const err = new Error('Range is not defined, please make request from HTML5 Player') as ErrorWithStatus
    err.status = 416
    return next(err)
  }

  const existing = client.get(magnet) as Torrent | null

  const handleTorrent = (torrentFile: Torrent) => {
    let file = <TorrentFile>{}

    for (let i = 0; i < torrentFile.files.length; i++) {
      const currentTorrentPiece = torrentFile.files[i]
      if (currentTorrentPiece.name === fileName) {
        file = currentTorrentPiece
      }
    }

    if (!file.length) {
      const err = new Error(`File "${fileName}" not found in torrent`) as ErrorWithStatus
      err.status = 404
      return next(err)
    }

  torrentFile.files.forEach(f => {
    if (f !== file) f.deselect()
  })
  file.select()

    const fileSize = file.length
    const [startParsed, endParsed] = range.replace(/bytes=/, '').split('-')

    const start = Number(startParsed)
    const end = endParsed ? Number(endParsed) : fileSize - 1
    const chunkSize = end - start + 1

    const headers = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
  'Accept-Ranges': 'bytes',
  'Content-Length': chunkSize,
  'Content-Type': getMimeType(fileName)
    }

    res.writeHead(206, headers)

    const stream = file.createReadStream({ start, end })

    const cleanup = () => {
      stream.destroy()
    }

    res.on('close', cleanup)

    stream.on('error', (err: Error) => {
      if (!res.writableEnded) {
        res.destroy()
      }
      console.error('Stream error:', err.message)
    })

    stream.pipe(res)
  }

  if (existing) {
    if (existing.files && existing.files.length > 0) {
      handleTorrent(existing)
    } else {
      existing.once('ready', () => handleTorrent(existing))
    }
  } else {
    client.add(magnet, torrent => {
      handleTorrent(torrent)  
    })
  }
})

export default router