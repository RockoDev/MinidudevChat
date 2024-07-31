import { embed } from 'ai'
import { openai } from '@ai-sdk/openai'
import { createOllama } from 'ollama-ai-provider'

const config = useRuntimeConfig()

export const getEmbeddingWithOpenAI = async text => {
  // if ( !config.openai.apikey ) {
  //   throw new Error('OPENAI_API_KEY environment variable is required')
  // }
  const { embedding } = await embed({
    model: openai.embedding(config.embeddings.model),
    value: text,
  })
  return embedding
}

export const getEmbeddingWithOllama = async text => {
  const options = {}
  if ( config.ollama.base_url ) options.baseURL = `${config.ollama.base_url}/api`
  const ollama = createOllama(options)
  const { embedding } = await embed({
    model: ollama.embedding(config.embeddings.model),
    value: text,
  })
  return embedding
}

export const getEmbedding = async text => ({
  openai: getEmbeddingWithOpenAI,
  ollama: getEmbeddingWithOllama,
})?.[config.embeddings.provider]?.(text) ?? null
