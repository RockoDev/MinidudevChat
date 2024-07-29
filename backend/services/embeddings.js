import { embed, embedMany } from 'ai'
import { openai } from '@ai-sdk/openai'
import { createOllama } from 'ollama-ai-provider'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { EMBEDDINGS_PROVIDER, EMBEDDINGS_MODEL } from '../config'

export const getEmbeddingWithOpenAI = async text => {
  if ( !process.env.OPENAI_API_KEY ) {
    throw new Error('OPENAI_API_KEY environment variable is required')
  }
  const { embedding } = await embed({
    model: openai.embedding(EMBEDDINGS_MODEL),
    value: text,
  })
  return embedding
}

export const getEmbeddingWithOllama = async text => {
  const options = {}
  if ( process.env.OLLAMA_BASE_URL ) options.baseURL = `${process.env.OLLAMA_BASE_URL}/api`
  const ollama = createOllama(options)
  const { embedding } = await embed({
    model: ollama.embedding(EMBEDDINGS_MODEL),
    value: text,
  })
  return embedding
}

export const getEmbedding = async text => ({
  openai: getEmbeddingWithOpenAI,
  ollama: getEmbeddingWithOllama,
})?.[EMBEDDINGS_PROVIDER]?.(text) ?? null

export const getEmbeddingsWithOpenAI = async paragraphs => {
  if ( !process.env.OPENAI_API_KEY ) {
    throw new Error('OPENAI_API_KEY environment variable is required')
  }
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 0,
    // separators: ["\n\n", "\n", " ", ""],
  })
  const chunks = await splitter.splitText(paragraphs.join('\n'))
  return embedMany({
    model: openai.embedding(EMBEDDINGS_MODEL),
    values: chunks,
  })
}

export const getEmbeddingsWithOllama = async paragraphs => {
  const options = {}
  if ( process.env.OLLAMA_BASE_URL ) options.baseURL = `${process.env.OLLAMA_BASE_URL}/api`
  const ollama = createOllama(options)
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 0,
    // separators: ["\n\n", "\n", " ", ""],
  })
  const chunks = await splitter.splitText(paragraphs.join('\n'))
  return embedMany({
    model: ollama.embedding(EMBEDDINGS_MODEL),
    values: chunks,
  })
}

export const getEmbeddings = async paragraphs => ({
  openai: getEmbeddingsWithOpenAI,
  ollama: getEmbeddingsWithOllama,
})?.[EMBEDDINGS_PROVIDER]?.(paragraphs) ?? null
