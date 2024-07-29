import { StreamingTextResponse, streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { ollama } from 'ollama-ai-provider'
import dayjs  from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'
import 'dayjs/locale/es'
import type { Message } from './types'

const config = useRuntimeConfig()

dayjs.extend(utc)
dayjs.extend(timezone)

const getModel = () => {
  if (config.ai.provider === 'openai') {
    return openai(config.ai.model)
  } else if (config.ai.provider === 'ollama') {
    return ollama(config.ai.model)
  }
  throw new Error('Invalid AI provider')
}

export default defineLazyEventHandler(async () => {
  return defineEventHandler<StreamingTextResponse>(async (event: any) => {
    const { messages } = await readBody(event)
    const question = messages.findLast(({role}: Message) => role === 'user')?.content
    const context = await getQuestionContext(question)
    const result = await streamText({
      model: getModel(),
      temperature: 0.5,
      messages,
    })
    return result.toAIStreamResponse()
  })

})
