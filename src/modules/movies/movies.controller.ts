import {Router} from 'express'
import * as movieService from './movies.service.js'
import { CreateMovieRequest, SearchRequest } from './movies.interfaces.js'

const router = Router()


router.get('/search', async ({query: {searchTerm} }: SearchRequest, res) => {
    try {
        const results = await movieService.movieSearch(searchTerm)
       
        res.status(200).send(results)
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