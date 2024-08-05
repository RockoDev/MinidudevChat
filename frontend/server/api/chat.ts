import { streamText, tool } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { ollama } from 'ollama-ai-provider'
import dayjs  from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import tz from 'dayjs/plugin/timezone.js'
import 'dayjs/locale/es'
import type { Message } from './types'

const config = useRuntimeConfig()

dayjs.extend(utc)
dayjs.extend(tz)

const getModel = (apiKey: string) => {
  if (config.ai.provider === 'openai') {
    const openai = createOpenAI({ apiKey })
    return openai(config.ai.model)
  } else if (config.ai.provider === 'ollama') {
    return ollama(config.ai.model)
  }
  throw new Error('Invalid AI provider')
}

export default defineLazyEventHandler(async () => {
  return defineEventHandler(async (event: any) => {
    const headers = getHeaders(event)
    const [_, apiKey = ''] = headers.authorization?.split(' ') ?? []
    const { messages } = await readBody(event)
    const question = messages.findLast(({role}: Message) => role === 'user')?.content
    const context = await getQuestionContext(question, apiKey)
    const result = await streamText({
      model: getModel(apiKey),
      temperature: 0.5,
      messages,
    })
    return result.toAIStreamResponse()
  })

})
