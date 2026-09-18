import {Router} from 'express'
import * as movieService from './movies.service.js'
import * as IMDBService from './imdb.service.js'
import { CreateMovieRequest, GetMovieFromIMDBRequest, SearchRequest } from './movies.interfaces.js'
import { getMovieFromIMDB, fetchPopularMovies, getFlashNewsFrames, getMovieForMovieFeed } from './imdb.service.js'

const router = Router()


router.get('/search', async (req, res) => {
  const { searchTerm, title, originalTitle, year } = req.query

  try {
    const ref = title && originalTitle && year
      ? { title: String(title), originalTitle: String(originalTitle), year: Number(year) }
      : undefined

    const results = await movieService.movieSearch(String(searchTerm), ref)
    res.status(200).send(results)
  } catch (error) {
    res.status(400).send(error)
  }
})


router.get('/imdb-search', async ({query: {searchTerm} }: SearchRequest, res) => {
    try {
        const results = await IMDBService.searchInIMDB(searchTerm)
       
        res.status(200).send(results)
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }
   
})

router.get('/imdb/:IMDBId', async ({params: {IMDBId} }: GetMovieFromIMDBRequest, res) => {
    try {
        const results = await getMovieFromIMDB(String(IMDBId))
       
        res.status(200).send(results)
    } catch (error) {
        res.status(400).send(error)
    }
   
})


router.get('/popular', async (_, res) => {
  try {
    const results = await getMovieForMovieFeed()
    res.status(200).send(results)
  } catch (error) {
    res.status(400).send(error)
  }
})



router.get('/banner', async (_, res) => {
  try {
    const movie = await fetchPopularMovies()
    res.status(200).send(movie)
  } catch (error) {
    res.status(400).send(error)
  }
})

router.get('/flash-news', async (_, res) => {
  try {
    const spotlight = await getFlashNewsFrames()
    res.status(200).send(spotlight)
  } catch (error) {
    res.status(400).send(error)
  }
})
router.post('/', async ({body }: CreateMovieRequest, res) => {
    try {
        const result = await movieService.create(body)
       
        res.status(200).send(result)
    } catch (error) {
        res.status(400).send(error)
    }
   
})

router.get('/', async (_, res) => {
    try {
        const results = await movieService.findAll()
       
        res.status(200).send(results)
    } catch (error) {
        res.status(400).send(error)
    }
   
})

export default router