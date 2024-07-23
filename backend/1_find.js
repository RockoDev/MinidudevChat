import fs from 'node:fs'
import child_process from 'node:child_process'
import util from 'node:util'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import { MongoClient } from 'mongodb'
import minimist from 'minimist'
import cliProgress from 'cli-progress'
import { getAudiosDirectory } from './config.js'
import { getDurationText } from './utils.js'

dayjs.extend(utc)

const argv = minimist(process.argv.slice(2))
const exec = util.promisify(child_process.exec)

if ( !process.env.MONGO_CONNECTION_URL ) {
  throw new Error('MONGO_CONNECTION_URL environment variable is required')
}

const PLATFORM = (argv.platform ?? 'youtube').toLowerCase()
if ( !['youtube', 'twitch'].includes(PLATFORM) ) {
  throw new Error(`Invalid platform: ${PLATFORM}`)
}

const CHANNEL = argv.channel
if ( !CHANNEL ) throw new Error('--channel is required.')
if ( !(/^[a-zA-Z0-9_-]{1,}$/.test(CHANNEL)) ) throw new Error('Invalid --channel value.')

const AUDIOS_DIRECTORY = getAudiosDirectory(PLATFORM)
if ( !fs.existsSync(AUDIOS_DIRECTORY) ) {
  fs.mkdirSync(AUDIOS_DIRECTORY, { recursive: true })
}

const getYouTubeVideos = async channel => {
  if ( !channel ) throw new Error('Channel is required')
  if ( !(/^[a-zA-Z0-9_-]{1,}$/.test(channel)) ) throw new Error('Invalid channel')
  const response = await fetch(`https://www.youtube.com/@${channel}/videos`)
  const html = await response.text()
  const json = JSON.parse(html?.split?.("ytInitialData = ")?.[1]?.split?.(";</script>")?.[0] ?? null)
  return json?.contents?.twoColumnBrowseResultsRenderer?.tabs?.find(tab => tab.tabRenderer?.selected)?.tabRenderer?.content?.richGridRenderer?.contents?.map?.(item => {
    const video = item.richItemRenderer?.content?.videoRenderer
    if ( !video ) return null
    const [ seconds = 0, minutes = 0, hours = 0 ] = video?.lengthText?.simpleText?.split?.(':')?.map?.(n => Number(n))?.reverse?.() ?? []
    return {
      id: video?.videoId,
      platform: 'youtube',
      channel,
      title: video?.title?.runs?.map?.(run => run.text)?.join?.('') ?? '',
      published_at: video?.publishedTimeText?.simpleText,
      duration: (hours * 3600) + (minutes * 60) + seconds,
      url: `https://www.youtube.com/watch?v=${video?.videoId}`,
    }
  })?.filter?.(i => i !== null) ?? []
}

const getTwitchVideos = async channel => {
  if ( !channel ) throw new Error('Channel is required')
  if ( !(/^[a-zA-Z0-9_-]{1,}$/.test(channel)) ) throw new Error('Invalid channel')
  const { stdout } = await exec(`twitch-dl videos ${channel} --all`)
  return stdout
    ?.split?.('\n\n\n')
    ?.filter?.(r => !r.startsWith('-----'))
    ?.map?.(data => {
      let [id, title, category, meta, url] = data.trim().split('\n')
      const [_, date, time, hours, minutes] = meta.match(/Published (\d{4}-\d{2}-\d{2}) @ (\d{2}:\d{2}:\d{2})  Length: (\d+) h (\d+) min/) ?? []
      return {
        id: id.replace('Video ', ''),
        platform: 'twitch',
        channel,
        title,
        category: category.split(' playing ')?.[1]?.trim?.() ?? '',
        published_at: `${date}T${time}`,
        duration: (hours * 3600) + (minutes * 60),
        url,
      }
    }) ?? []
}

const getVideos = (platform, channel) => {
  if ( platform === 'youtube' ) {
    return getYouTubeVideos(channel)
  } else if ( platform === 'twitch' ) {
    return getTwitchVideos(channel)
  }
  throw new Error(`Invalid platform: ${platform}`)
}

// const response = await fetch('https://www.twitch.tv/midudev/videos?filter=all&sort=time')
// const html = await response.text()
// const [ script ] = html?.match?.(/<script type="application\/ld\+json">(.*?<\/script>)/gm) ?? []
// const [ _, data = null ] = script?.match?.(/(?:<script type="application\/ld\+json">)(.*)(?:<\/script>)/) ?? []
// const json = JSON.parse(data)
// const items = json?.['@graph']?.filter?.(d => d['@type'] === 'ItemList')?.[0]?.itemListElement ?? []
// console.log(items)

const downloadYouTubeVideo = async (result, collection, logging = true) => {
  try {
    const fileExists = fs.existsSync(`${AUDIOS_DIRECTORY}/${result.id}.wav`)
    if ( fileExists ) {
      if ( logging ) console.log(`    Audio file already exists. Skipping downloading...`)
    } else {
      if ( logging ) console.log(`    Downloading...`)
      const { stdout } = await exec(`yt-dlp -x --audio-quality 0 --audio-format wav -f "ba" -o ${AUDIOS_DIRECTORY}/${result.id}.wav ${result.id}`)
      const sourceOutput = stdout?.trim?.()?.split?.('\n')?.find?.(l => l.startsWith('[ExtractAudio] Destination:'))?.split?.('[ExtractAudio] Destination: ')?.[1] ?? null
      if ( !sourceOutput ) throw new Error('Downloaded file not found')
    }
    if ( logging ) console.log(`    Saving to database...`)
    await collection.updateOne({
      id: result.id,
      platform: result.platform,
    }, {
      $setOnInsert: {
        created_at: dayjs().utc().toDate(),
      },
      $set: {
        ...result,
        updated_at: dayjs().utc().toDate(),
        duration: Math.floor(parseFloat(result.duration) * 100) / 100,
      },
    }, {
      upsert: true,
    })
    if ( logging ) console.log(`    Done!`)
  } catch ( err ) {
    console.error(err)
  }
}

const downloadTwitchVideo = async (result, collection, logging = true) => {
  try {
    const documentExists = await collection.countDocuments({
      id: result.id,
      platform: result.platform,
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
      platform: result.platform,
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

const downloadVideo = (result, collection, logging = true) => {
  if ( result.platform === 'youtube' ) {
    return downloadYouTubeVideo(result, collection, logging)
  } else if ( result.platform === 'twitch' ) {
    return downloadTwitchVideo(result, collection, logging)
  }
  throw new Error(`Invalid platform: ${platform}`)
}

const results = await getVideos(PLATFORM, CHANNEL)

const mongodb = new MongoClient(process.env.MONGO_CONNECTION_URL)

await mongodb.connect()
const collection = mongodb.db('midudev').collection('videos')

if ( argv.parallel ) {
  // Running in parallel
  const progress = {
    pending: results.length,
    downloading: 0,
    downloaded: 0,
    total: results.length,
  }
  const progressBar = new cliProgress.SingleBar({
    format: 'Descargando datos |{bar}| {percentage}% || {value} de {total}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  })
  progressBar.start(progress.total, progress.downloaded, progress)
  await Promise.all(results.map(async result => {
    // progress.pending--
    // progress.downloading++
    // progressBar.update(progress.downloaded, progress)
    await downloadVideo(result, collection, false)
    // progress.downloading--
    progress.downloaded++
    progressBar.update(progress.downloaded, progress)
  }))
  progressBar.stop()
} else {
  // Running in sequence
  for ( const [index, result] of Object.entries(results) ) {
    console.log(`[+] (${Number(index)+1}/${results.length}) ${result.title} (${getDurationText(result.duration)})`)
    await downloadVideo(result, collection, true)
  }
}

await mongodb.close()
