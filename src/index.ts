import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import logger from 'morgan'
import mongoose from 'mongoose'
import 'dotenv/config'

import streamRouter from './modules/stream/stream.controller.js'
import contentRouter from './modules/content/content.controller.js'
import moviesRouter from './modules/movies/movies.controller.js'


try {
  console.log(process.env.MONGO_URL)
  mongoose.set('strictQuery', true)
  mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log('DataBase Connected')
  })
} catch (error) {
  console.warn('Connection to mongo failed', error)
  throw error
}


const app = express()
app.use(cors())
app.use(express.json())
app.use(logger('dev'))

app.use('/stream', streamRouter)
app.use('/content', contentRouter)
app.use('/movies', moviesRouter)


const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`)
})