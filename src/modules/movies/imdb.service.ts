import axios from "axios"
import { stringify } from "qs"
import { IMDB_SEARCH_URL } from "./movies.const.js"

export const  searchInIMDB = async query => {
  const queryParams = stringify({
    language: 'ru',
    api_key: '3ac978afa7e369a94917e234050c2bb9',
    query
  })
  const {data: {results}} = await axios.get(`${IMDB_SEARCH_URL}/search/movie?${queryParams}`  )
  const [movie] = results
  return movie
} 


export const  getMovieFromIMDB = async (IMDBId) => {
  const queryParams = stringify({
    language: 'ru',
    api_key: '3ac978afa7e369a94917e234050c2bb9',
  })
  const result = await axios.get(`${IMDB_SEARCH_URL}/movie/${IMDBId}?${queryParams}`  )
  return result.data
} 