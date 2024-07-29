import { embed, embedMany } from 'ai'
import { openai } from '@ai-sdk/openai'
import { createOllama } from 'ollama-ai-provider'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'

const config = useRuntimeConfig()

export const getEmbeddingWithOpenAI = async text => {
  if ( !config.openai.apikey ) {
    throw new Error('OPENAI_API_KEY environment variable is required')
  }
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

export const getEmbeddingsWithOpenAI = async paragraphs => {
  if ( !config.openai.apikey ) {
    throw new Error('OPENAI_API_KEY environment variable is required')
  }
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 0,
    separators: ["\n\n", "\n", "(?<=\. )", " "],
  })
  const chunks = await splitter.splitText(paragraphs.join('\n'))
  return embedMany({
    model: openai.embedding(config.embeddings.model),
    values: chunks,
  })
}

export const getEmbeddingsWithOllama = async paragraphs => {
  const options = {}
  if ( config.ollama.base_url ) options.baseURL = `${config.ollama.base_url}/api`
  const ollama = createOllama(options)
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 0,
    separators: ["\n\n", "\n", "(?<=\. )", " "],
  })
  const chunks = await splitter.splitText(paragraphs.join('\n'))
  return embedMany({
    model: ollama.embedding(config.embeddings.model),
    values: chunks,
  })
}

export const getEmbeddings = async paragraphs => ({
  openai: getEmbeddingsWithOpenAI,
  ollama: getEmbeddingsWithOllama,
})?.[config.embeddings.provider]?.(paragraphs) ?? null
