import fs from 'node:fs'
import minimist from 'minimist'
import child_process from 'node:child_process'
import { MongoClient } from 'mongodb'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import { getAudioFilePath, getTranscriptionFilePath } from './config.js'
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

const spawn = async (...args) => {
  return new Promise((resolve, reject) => {
    const process = child_process.spawn(...args)
    process.on('close', code => {
      code === 0 ? resolve() : reject(new Error(`Process exited with code ${code}`))
    })
  })
}

const mongodb = new MongoClient(process.env.MONGO_CONNECTION_URL)
await mongodb.connect()
const db = mongodb.db('midudev')
const documents = await db.collection('videos').find({
  transcribed_at: { $exists: false },
  platform: 'youtube',
  duration: { $lt: 3600 },
}, {
  projection: {
    _id: true,
    id: true,
    platform: true,
    title: true,
    duration: true,
  },
  sort: {
    duration: 1,
  },
  limit: LIMIT,
}).toArray()
await mongodb.close()

if ( documents.length === 0 ) console.log('No documents to transcribe found.')

const transcribe = async document => {
  console.log(`[+] ${document.title} (${getDurationText(document.duration)})`)
  
  const output = getTranscriptionFilePath(document.platform, document.id)
  if ( !fs.existsSync(output) ) {
    const file = getAudioFilePath(document.platform, document.id)
    if ( !fs.existsSync(file) ) {
      console.log('    Audio file not found.')
      return
    }
    console.log('    Transcribing...')
    await spawn('python', ['transcribe.py', file, output], { stdio: 'inherit' })
    console.log(`    Transcription: ${output}`)
  }
  
  if ( !fs.existsSync(output) ) {
    console.log('    Transcription file not found.')
    return
  }
  
  console.log('    Updating database...')
  try {
    const mongodb = await MongoClient.connect(process.env.MONGO_CONNECTION_URL)
    const db = mongodb.db('midudev')
    await db.collection('videos').updateOne({
      _id: document._id,
    }, {
      $set: {
        updated_at: dayjs().utc().toDate(),
        transcribed_at: dayjs().utc().toDate(),
        // transcription: paragraphs.join('\n'),
      },
    }, {
      upsert: false,
    })
    await mongodb.close()
    console.log('    Done!')
  } catch ( error ) {
    console.error(error)
  }
}

for ( const document of documents ) {
  await transcribe(document)
}
