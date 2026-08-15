import * as cheerio from 'cheerio'
import axios from 'axios'
import MovieEntity from './movies.model.js'
import { Movie } from './movies.interfaces.js'
import { BASE_SEARCH_URL, RUTOR_URL } from './movies.const.js'
import { extractMagnetFromQuery, MovieRef, matchMovie, isValidMagnetHash } from './movies.util.js'


export const movieSearch = async (searchTerm: string, ref?: MovieRef) => {
  const searchResult = await axios.get(`${BASE_SEARCH_URL}/${searchTerm}`)
  const $ = cheerio.load(searchResult.data)
  const data = $('#index tr').toArray()

  const results = data
    .map(item => {
      try {
        const links = $(item).find('a').toArray()
        const magnetTag = links.find(a => $(a).attr('href')?.startsWith('magnet:'))
        const title = links.find(a => $(a).attr('href')?.includes('/torrent/'))

        if (!magnetTag || !title) return null

        const magnet = extractMagnetFromQuery($(magnetTag).attr('href'))
        if (!magnet) return null

        const titleText = $(title).text()
        if (!titleText) return null

        return {
          magnet,
          title: titleText,
          torrentUrl: `${RUTOR_URL}${$(title).attr('href')}`
        }
      } catch {
        return null
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  if (ref) {
    return results.filter(item => matchMovie(item.title, ref))
  }

  return results
}


export const create = async (input: Movie) => {
  const item = new MovieEntity(input)
  await item.save()
  return item
}

export const update = (input: Partial<Movie>, id: string) => {
  return MovieEntity.findByIdAndUpdate(id, input, {
    new: true
  })
}

export const findOne = (id: string) => {
  return MovieEntity.findById(id)
}

export const findAll = () => {
  return MovieEntity.find()
}

export const deleteOne = (id: string) => {
  return MovieEntity.findByIdAndRemove(id)
}

export function searchInImdb(searchTerm: string) {
  throw new Error('Function not implemented.')
}