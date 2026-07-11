import {
  CrewMember,
  GetCreditsResponse,
  GetVideosResponse,
  IMDBMovie,
  Movie,
  SearchMoviesResponse,
  CastMember
} from '../movies.interfaces.js'

import axios from 'axios'
import { stringify } from 'qs'
import { IMDB_SEARCH_URL } from '../movies.const.js'

import 'dotenv/config'

const findCrewMember = (crew: CrewMember[], jobs: string[]) => crew.find(({ job }) => jobs.includes(job))?.name || ''

export const IMDBRequests = () => {
  const queryParams = stringify({
    language: 'ru-RU',
    api_key: process.env.IMDB_API_KEY
  })
  const MOVIE_URL = `${IMDB_SEARCH_URL}/movie`

  return {
    getMovie: (IMDBId: string) => axios.get<IMDBMovie>(`${MOVIE_URL}/${IMDBId}?${queryParams}`),
    getMovieCredits: (IMDBId: number) => axios.get<GetCreditsResponse>(`${MOVIE_URL}/${IMDBId}/credits?${queryParams}`),
   searchMovie: (query: string) =>
  axios.get<SearchMoviesResponse>(`${IMDB_SEARCH_URL}/search/movie?${queryParams}&query=${query}`),
    getVideos: (IMDBId: number) => axios.get<GetVideosResponse>(`${MOVIE_URL}/${IMDBId}/videos?${queryParams}`)
  }
}
const { getMovieCredits, getVideos } = IMDBRequests()

export const movieCredits = async (IMDBId: number) => {
  try {
    const {
      data: { crew, cast }
    } = await getMovieCredits(IMDBId)

const actors: CastMember[] = cast.slice(0, 12).map(({ name, character, profile_path }) => ({
  name,
  character,
  photo: profile_path ? `https://image.tmdb.org/t/p/w300${profile_path}` : ''
}))


    return {
      actors,
      director: findCrewMember(crew, ['Director']),
      writer: findCrewMember(crew, ['Writer', 'Screenplay', 'Story', 'Author'])
    }
  } catch (error) {
    console.log(error)
    return {
      actors: [] as CastMember[],
      director: '',
      writer: ''
    }
  }
}

export const getTrailer = async (IMDBId: number) => {
  try {
    const {
      data: { results }
    } = await getVideos(IMDBId)
    const trailer = results.find(({type}) => type === 'Trailer')
    return trailer ? `https://www.themoviedb.org/video/play?key=${trailer.key}` : ''
  } catch (error) {
    console.log(error)
    return ''
  }
}

export const convertMovie = async ({
  title,
  original_title,
  tagline,
  overview,
  release_date,
  id,
  poster_path,
  backdrop_path,
  revenue,
  budget,
  vote_count,
  production_companies,
  spoken_languages,
  runtime,
  vote_average,
  imdb_id,
  genres
}: IMDBMovie): Promise<Partial<Movie>> => {
  const { actors, director, writer } = await movieCredits(id)
  return {
    title,
    originalTitle: original_title !== title ? original_title : '',
    tagline: tagline || '',
    plot: overview,
    year: release_date ? String(new Date(release_date).getFullYear()) : '',
    director,
    actors,
    poster: poster_path ? `https://image.tmdb.org/t/p/w1280${poster_path}` : '',
    backdrop: backdrop_path ? `https://image.tmdb.org/t/p/w1280${backdrop_path}` : '',
    trailer: await getTrailer(id),
    boxOffice: String(revenue || 0),
    released: release_date,
    budget: budget || 0,
    writer,
    runtime: String(runtime || 0),
    ratingImdb: vote_average ? vote_average.toFixed(1) : '',
    voteCount: vote_count || 0,
    imdbId: imdb_id,
    rated: '',
    genres: genres.map(({ name }) => name),
    productionCompanies: (production_companies || []).filter(({logo_path}) => Boolean(logo_path)).map(({name, logo_path}) => ({
      name,
      logo: `https://image.tmdb.org/t/p/w200${logo_path}`
    })),
    spokenLanguages: (spoken_languages || []).map(({name}) => name)

  }
}