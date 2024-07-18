import { MongoClient } from 'mongodb'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import { createOllama } from 'ollama-ai-provider'

dayjs.extend(utc)

if ( !process.env.MONGO_CONNECTION_URL ) {
  throw new Error('MONGO_CONNECTION_URL environment variable is required.')
}

if ( !process.env.OLLAMA_BASE_URL ) {
  throw new Error('OLLAMA_BASE_URL environment variable is required.')
}

const ollama = createOllama({
  baseURL: process.env.OLLAMA_BASE_URL,
})

const getEmbeddings = async text => {
  const model = ollama.embedding('llama3')
  const embeddings = await model.doEmbed(text)
  return embeddings
  // const response = await fetch('http://localhost:11434/api/embeddings', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     model: 'llama3',
  //     prompt: text,
  //   }),
  // })
}

const mongodb = await MongoClient.connect(process.env.MONGO_CONNECTION_URL)
const collection = mongodb.db('midudev').collection('segments')

const cursor = collection.find({
  embeddings: { $exists: false },
}, {
  limit: 1,
})

for await ( const document of cursor ) {
  try {
    console.log(`[+] ${document.text.substring(0, 140)}...`)
    console.log('    Generating embeddings...')
    const embeddings = await getEmbeddings(document.text)
    console.log('    Embeddings:', embeddings)
    // await collection.updateOne({
    //   _id: document._id,
    // }, {
    //   $set: {
    //     embeddings,
    //   },
    // })
  } catch ( err ) {
    console.error(err)
  }
}

await mongodb.close()
