import { MongoClient } from 'mongodb'

const config = useRuntimeConfig()

export const getQuestionContext = async (question, apiKey) => {
  if ( !question ) {
    throw new Error('Missing question')
  }
  const embedding = await getEmbedding(question, apiKey)
  if ( (embedding?.length ?? 0) <= 0 ) {
    throw new Error('Invalid embedding')
  }
  if ( !config.mongodb.uri ) {
    throw new Error('Missing MongoDB URI')
  }
  const mongodb = new MongoClient(config.mongodb.uri)
  try {
    await mongodb.connect()
    const db = mongodb.db('midudev')
    const aggregations = [
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: embedding,
          numCandidates: 150,
          limit: 5,
        },
      },
      {
        $project: {
          _id: false,
          id: true,
          platform: true,
          title: true,
          text: true,
          index: true,
          score: {
            $meta: 'vectorSearchScore',
          },
        },
      },
    ]

    const documentGroups = {}
    const cursor = db.collection('embeddings').aggregate(aggregations)
    for await ( const document of cursor ) {
      if ( !(document.id in documentGroups) ) {
        documentGroups[document.id] = []
      }
      documentGroups[document.id].push({
        id: document.id,
        platform: document.platform,
        index: document.index,
        text: document.text,
        score: document.score,
      })
    }
  
    const [ docs ] = Object.values(documentGroups)
    const indexes = docs.map((d) => d.index)
    const neededIndexes = indexes.flatMap(i => rangeWithPadding(i, 1, 2)).filter(i => i >= 0 && !indexes.includes(i))
    const extraContext = await getExtraContext(db, docs[0], neededIndexes)
    return [
      ...docs,
      ...extraContext,
    ].sort((a, b) => a.index - b.index).map(d => d.text)
  } catch ( err ) {
    throw err
  } finally {
    await mongodb.close()
  }
}

const getExtraContext = async (db, document, indexes) => {
  return db.collection('embeddings').find({
    id: document.id,
    platform: document.platform,
    index: { $in: indexes },
  }, {
    projection: {
      _id: false,
      index: true,
      text: true,
      score: true,
    },
  }).toArray()
}
