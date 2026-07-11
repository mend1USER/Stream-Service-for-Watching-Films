
import { IMDBMovie, Movie } from "./movies.interfaces.js"
import { convertMovie, IMDBRequests } from "./helper/imdb.helper.js"

const {searchMovie, getMovie} = IMDBRequests()


export interface MovieSearchResult {
  id: string;
  title: string;
  poster: string;
  year: string;
  rate: string;
}


export const  searchInIMDB = async (query: string): Promise<MovieSearchResult[]> => {
  const {
    data: {results}
  } = await searchMovie(query)

  return results.filter(({poster_path}) => Boolean(poster_path)).map(({id, title, poster_path, release_date, vote_average}) => ({
    id: String(id),
    title,
    poster: `https://image.tmdb.org/t/p/w500${poster_path}`,
    year: release_date ? String(new Date(release_date).getFullYear()) : '',
    rate: vote_average ? vote_average.toFixed(1) : ''
  }))
}

export const getMovieFromIMDB = async(IMDBId: string): Promise<Partial<Movie>> => {
  const {data} = await getMovie(IMDBId)
  return convertMovie(data)
}