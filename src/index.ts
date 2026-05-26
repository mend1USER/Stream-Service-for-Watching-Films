import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import logger from 'morgan'

import streamRouter from './modules/stream/stream.controller.js'
import contentRouter from './modules/content/content.controller.js'
import moviesRouter from './modules/movies/movies.controller.js'
const app = express()
app.use(cors())
app.use(express.json())
app.use(logger('dev'))

app.use('/stream', streamRouter)
app.use('/content', contentRouter)
app.use('/movies', moviesRouter)

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('=== GLOBAL ERROR ===')
  console.error('Message:', err.message)
  console.error('Stack:', err.stack)
  console.error('Status:', err.status)
  res.status(err.status || 500).json({ error: err.message })
})

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`)
})