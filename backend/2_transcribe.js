import fs from 'node:fs'
import child_process from 'node:child_process'
import util from 'node:util'
import { MongoClient } from 'mongodb'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import { getAudioFilePath, getTranscriptionFilePath } from './config.js'

dayjs.extend(utc)

const exec = util.promisify(child_process.exec)

if ( !process.env.MONGO_CONNECTION_URL ) {
  throw new Error('MONGO_CONNECTION_URL environment variable is required.')
}

const mongodb = await MongoClient.connect(process.env.MONGO_CONNECTION_URL)
const collection = mongodb.db('midudev').collection('videos')

const document = await collection.findOne({
  transcribed_at: { $exists: false },
})

await mongodb.close()

;(async () => {
  if ( !document ) {
    console.log('No documents to transcribe found.')
    return
  }
  console.log(`[+] ${document.title}`)

  const output = getTranscriptionFilePath(document.platform, document.id)
  if ( !fs.existsSync(output) ) {
    const file = getAudioFilePath(document.platform, document.id)
    if ( !fs.existsSync(file) ) {
      console.log('    Audio file not found.')
      return
    }
    console.log('    Transcribing...')
    await exec(`python transcribe.py ${file} ${output}`)
    console.log(`    Transcription: ${output}`)
  }

  if ( !fs.existsSync(output) ) {
    console.log('    Transcription file not found.')
    return
  }

  console.log('    Reading transcription...')
  const transcription = JSON.parse(await fs.promises.readFile(output, { encoding: 'utf-8' }))

  console.log('    Updating database...')
  try {
    const mongodb = await MongoClient.connect(process.env.MONGO_CONNECTION_URL)
    for ( const { id, text, start, end } of transcription ) {
      const collection = mongodb.db('midudev').collection('segments')
      await collection.updateOne({
        video_id: document.id,
        id,
      }, {
        $setOnInsert: {
          video_id: document.id,
          created_at: dayjs().utc().toDate(),
          id,
        },
        $set: {
          updated_at: dayjs().utc().toDate(),
          text,
          start,
          end,
        },
      }, {
        upsert: true,
      })
    }
    const collection = mongodb.db('midudev').collection('videos')
    await collection.updateOne({
      _id: document._id,
    }, {
      $set: {
        updated_at: dayjs().utc().toDate(),
        transcribed_at: dayjs().utc().toDate(),
      },
    }, {
      upsert: false,
    })
    await mongodb.close()
    console.log('    Done!')
  } catch ( error ) {
    console.error(error)
  }
})()
