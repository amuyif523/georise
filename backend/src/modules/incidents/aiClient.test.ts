import axios from 'axios'
import { classifyIncident } from './aiClient'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('classifyIncident', () => {
  it('returns data when AI service responds', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        category: 'fire',
        severity_score: 0.7,
        severity_label: 4,
        confidence: 0.8,
        summary: 'Fire detected',
        model_version: 'rule-stub-v2',
      },
    })

    const res = await classifyIncident('fire at home')
    expect(res?.category).toBe('fire')
    expect(res?.confidence).toBe(0.8)
  })

  it('returns null when AI service fails', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('network'))
    const res = await classifyIncident('text')
    expect(res).toBeNull()
  })
})
