import MiniSearch from 'minisearch'
import stemmer from 'stemmer'
import stopwords from 'stopwords/english'

export { MiniSearch, stemmer }
console.log(stopwords.english)
export const englishStopwords = new Set(stopwords.english)
