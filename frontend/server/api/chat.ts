import { StreamingTextResponse, streamText } from 'ai'
import { ollama, createOllama } from 'ollama-ai-provider'
import dayjs  from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'
import 'dayjs/plugin/es'

dayjs.extend(utc)
dayjs.extend(timezone)

export default defineLazyEventHandler(async () => {
  const {
    ollama: { base_url: ollamaBaseURL },
  } = useRuntimeConfig()

  if ( !ollamaBaseURL ) throw new Error('Missing Ollama base URL')
  // const ollama = createOllama({
  //   baseURL: ollamaBaseURL,
  // })

  return defineEventHandler<StreamingTextResponse>(async (event: any) => {
    const { messages } = await readBody(event)
    const result = await streamText({
      model: ollama('gemma2'),
      temperature: 0.5,
      messages,
    })
    return result.toAIStreamResponse()
  })

})
