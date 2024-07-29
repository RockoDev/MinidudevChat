export const getAudiosDirectory = platform => `.data/${platform}/audios`
export const getTranscriptionsDirectory = platform => `.data/${platform}/transcriptions`
export const getAudioFilePath = (platform, id) => `${getAudiosDirectory(platform)}/${id}.wav`
export const getTranscriptionFilePath = (platform, id) => `${getTranscriptionsDirectory(platform)}/${id}.json`

export const EMBEDDINGS_PROVIDER = process.env.EMBEDDINGS_PROVIDER ?? 'ollama'
export const EMBEDDINGS_MODEL = process.env.EMBEDDINGS_MODEL ?? 'nomic-embed-text'
