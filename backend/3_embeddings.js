import fs from 'node:fs'
import minimist from 'minimist'
import { MongoClient } from 'mongodb'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import { embedMany } from 'ai'
import { createOllama } from 'ollama-ai-provider'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { getTranscriptionFilePath } from './config.js'
import { getDurationText } from './utils.js'

dayjs.extend(utc)

const argv = minimist(process.argv.slice(2))

let LIMIT = (argv.limit ?? '1').toString().trim().toLowerCase()
if ( !(/^\d+$/.test(LIMIT)) ) {
  throw new Error(`Invalid --limit value: ${LIMIT}. Must be a number.`)
}
LIMIT = Number(LIMIT)
if ( LIMIT <= 0 || LIMIT > 1000 ) {
  throw new Error(`Invalid --limit value: ${LIMIT}. Must be between 1 and 1000.`)
}

if ( !process.env.MONGO_CONNECTION_URL ) {
  throw new Error('MONGO_CONNECTION_URL environment variable is required.')
}

if ( !process.env.OLLAMA_BASE_URL ) {
  throw new Error('OLLAMA_BASE_URL environment variable is required.')
}

const ollama = createOllama({
  baseURL: `${process.env.OLLAMA_BASE_URL}/api`,
})

const getParagraphs = async file => {
  const transcription = JSON.parse(await fs.promises.readFile(file, { encoding: 'utf-8' }))
  const paragraphs = []
  let paragraph = []
  transcription.forEach((segment, index) => {
    const text = segment.text.trim()
    paragraph.push(text)
    if ( transcription.length === (index + 1) || ( text.endsWith('.') && !text.endsWith('...') ) ) {
      paragraphs.push(paragraph.join(' '))
      paragraph = []
    }
  })
  return paragraphs
}

const getEmbeddings = async paragraphs => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 0,
    // separators: ["\n\n", "\n", " ", ""],
  })
  const chunks = await splitter.splitText(paragraphs.join('\n'))
  return embedMany({
    model: ollama.embedding('nomic-embed-text'),
    values: chunks,
  })
}

const mongodb = await MongoClient.connect(process.env.MONGO_CONNECTION_URL)
const db = mongodb.db('midudev')

const cursor = db.collection('videos').find({
  transcribed_at: { $exists: true },
  has_embeddings: { $ne: true },
}, {
  projection: {
    _id: true,
    id: true,
    platform: true,
    channel: true,
    title: true,
    duration: true,
    url: true,
  },
  limit: LIMIT,
})

const saveEmbeddings = async (document, embeddingsResult) => {
  await db.collection('embeddings').deleteMany({
    video_id: document.id,
    video_platform: document.platform,
  })
  const { embeddings, values } = embeddingsResult
  await db.collection('embeddings').insertMany(embeddings.map((embedding, index) => ({
    created_at: dayjs().utc().toDate(),
    updated_at: dayjs().utc().toDate(),
    id: document.id,
    platform: document.platform,
    channel: document.channel,
    title: document.title,
    duration: document.duration,
    url: document.url,
    index,
    text: values[index],
    embedding,
  })))
}

for await ( const document of cursor ) {
  try {
    console.log(`[+] ${document.title.substring(0, 140)} (${getDurationText(document.duration)})`)
    const output = getTranscriptionFilePath(document.platform, document.id)
    if ( !fs.existsSync(output) ) {
      console.log('    Transcription file not found.')
      continue
    }
    console.log('    Reading transcription...')
    const paragraphs = await getParagraphs(output)
    console.log('    Generating embeddings...')
    const embeddings = await getEmbeddings(paragraphs)
    console.log('    Saving embeddings...')
    await saveEmbeddings(document, embeddings)
    await db.collection('videos').updateOne({
      _id: document._id,
    }, {
      $set: {
        updated_at: dayjs().utc().toDate(),
        has_embeddings: true,
      },
    }, {
      upsert: false,
    })
  } catch ( err ) {
    console.error(err)
  }
}

await mongodb.close()
