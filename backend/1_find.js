import fs from 'node:fs'
import child_process from 'node:child_process'
import util from 'node:util'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import { MongoClient } from 'mongodb'
import minimist from 'minimist'
import { getAudiosDirectory } from './config.js'

dayjs.extend(utc)

const argv = minimist(process.argv.slice(2))
const exec = util.promisify(child_process.exec)

if ( !process.env.MONGO_CONNECTION_URL ) {
  throw new Error('MONGO_CONNECTION_URL environment variable is required')
}

const AUDIOS_DIRECTORY = getAudiosDirectory('twitch')
if ( !fs.existsSync(AUDIOS_DIRECTORY) ) {
  fs.mkdirSync(AUDIOS_DIRECTORY, { recursive: true })
}

// const response = await fetch('https://www.twitch.tv/midudev/videos?filter=all&sort=time')
// const html = await response.text()
// const [ script ] = html?.match?.(/<script type="application\/ld\+json">(.*?<\/script>)/gm) ?? []
// const [ _, data = null ] = script?.match?.(/(?:<script type="application\/ld\+json">)(.*)(?:<\/script>)/) ?? []
// const json = JSON.parse(data)
// const items = json?.['@graph']?.filter?.(d => d['@type'] === 'ItemList')?.[0]?.itemListElement ?? []
// console.log(items)

const { stdout } = await exec('twitch-dl videos midudev --all')
const results = stdout
  .split('\n\n\n')
  .filter(r => !r.startsWith('-----'))
  .map(data => {
    let [id, title, category, meta, url] = data.trim().split('\n')
    const [_, date, time, hours, minutes] = meta.match(/Published (\d{4}-\d{2}-\d{2}) @ (\d{2}:\d{2}:\d{2})  Length: (\d+) h (\d+) min/) ?? []
    return {
      id: id.replace('Video ', ''),
      platform: 'twitch',
      title,
      category: category.split(' playing ')?.[1]?.trim?.() ?? '',
      published_at: `${date}T${time}`,
      duration: `${hours.padStart(2,'0')}:${minutes.padStart(2,'0')}:00`,
      url,
    }
  })

const downloadResult = async (result, collection, logging = true) => {
  try {
    const documentExists = await collection.countDocuments({
      id: result.id,
    }) > 0
    if ( documentExists ) {
      if ( logging ) console.log(`    Already exists. Skipping...`)
      return
    }
    if ( logging ) console.log(`    Downloading...`)
    const { stdout } = await exec(`twitch-dl download -o ${AUDIOS_DIRECTORY}/${result.id}.source.{format} -q audio_only --overwrite ${result.url}`)
    const sourceOutput = stdout?.trim?.()?.split?.('\n')?.find?.(l => l.startsWith('Output: '))?.split?.('Output: ')?.[1] ?? null
    if ( !sourceOutput ) throw new Error('Downloaded file not found')
      if ( logging ) console.log(`    Extracting audio...`)
    await exec(`ffmpeg -y -i ${sourceOutput} ${AUDIOS_DIRECTORY}/${result.id}.wav`)
    if ( logging ) console.log(`    Deleting temporal file...`)
    fs.promises.unlink(sourceOutput)
    if ( logging ) console.log(`    Getting duration...`)
    const { stdout: duration } = await exec(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${AUDIOS_DIRECTORY}/${result.id}.wav`)
    if ( logging ) console.log(`    Saving to database...`)
    await collection.updateOne({
      id: result.id,
    }, {
      $setOnInsert: {
        created_at: dayjs().utc().toDate(),
      },
      $set: {
        ...result,
        updated_at: dayjs().utc().toDate(),
        duration: Math.floor(parseFloat(duration) * 100) / 100,
      },
    }, {
      upsert: true,
    })
    if ( logging ) console.log(`    Done!`)
  } catch ( err ) {
    console.error(err)
  }
}

const mongodb = await MongoClient.connect(process.env.MONGO_CONNECTION_URL)
const collection = mongodb.db('midudev').collection('videos')

if ( argv.parallel ) {
  // Running in parallel
  await Promise.all(results.map(async (result, index) => {
    console.log(`[+] (${index+1}/${results.length}) ${result.title}`)
    await downloadResult(result, collection, false)
  }))
} else {
  // Running in sequence
  for ( const [index, result] of Object.entries(results) ) {
    console.log(`[+] (${Number(index)+1}/${results.length}) ${result.title}`)
    await downloadResult(result, collection, true)
  }
}

await mongodb.close()
