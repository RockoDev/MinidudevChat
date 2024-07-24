import { embed, embedMany } from 'ai'
import { openai } from '@ai-sdk/openai'
import { createOllama } from 'ollama-ai-provider'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'

export const getEmbeddingWithOpenAI = async text => {
  if ( !process.env.OPENAI_API_KEY ) {
    throw new Error('OPENAI_API_KEY environment variable is required')
  }
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text,
  })
  return embedding
}

export const getEmbeddingWithOllama = async text => {
  if ( !process.env.OLLAMA_BASE_URL ) {
    throw new Error('OLLAMA_BASE_URL environment variable is required')
  }
  const ollama = createOllama({
    baseURL: `${process.env.OLLAMA_BASE_URL}/api`,
  })
  const { embedding } = await embed({
    model: ollama.embedding('nomic-embed-text'),
    value: text,
  })
  return embedding
}

export const getEmbedding = async text => 
  process.env.OPENAI_API_KEY
  ? getEmbeddingWithOpenAI(text)
  : getEmbeddingWithOllama(text)

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
    model: openai.embedding('text-embedding-3-small'),
    values: chunks,
  })
}

export const getEmbeddingsWithOllama = async paragraphs => {
  if ( !process.env.OLLAMA_BASE_URL ) {
    throw new Error('OLLAMA_BASE_URL environment variable is required')
  }
  const ollama = createOllama({
    baseURL: `${process.env.OLLAMA_BASE_URL}/api`,
  })
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 0,
    // separators: ["\n\n", "\n", " ", ""],
  })
  const chunks = await splitter.splitText(paragraphs.join('\n'))
  return embedMany({
    model: ollama.embedding('nomic-embed-text'),
    values: chunks,
  })
}

export const getEmbeddings = async paragraphs => 
  process.env.OPENAI_API_KEY
  ? getEmbeddingsWithOpenAI(paragraphs)
  : getEmbeddingsWithOllama(paragraphs)
