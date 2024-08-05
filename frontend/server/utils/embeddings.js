import { embed } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createOllama } from 'ollama-ai-provider'

const config = useRuntimeConfig()

export const getEmbeddingWithOpenAI = async (text, apiKey) => {
  const openai = createOpenAI({apiKey})
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

export const getEmbedding = async (text, apiKey) => ({
  openai: getEmbeddingWithOpenAI,
  ollama: getEmbeddingWithOllama,
})?.[config.embeddings.provider]?.(text, apiKey) ?? null
