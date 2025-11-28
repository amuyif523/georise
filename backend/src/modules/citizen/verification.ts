import { Request, Response } from 'express'
import { query } from '../../config/db'
import { register } from '../auth/service'
import type { RegisterInput, UserRecord } from '../auth/types'

const OTP_LENGTH = 6

function generateOtp() {
  return Math.random().toString().slice(2, 2 + OTP_LENGTH).padEnd(OTP_LENGTH, '0')
}

export async function citizenRegisterHandler(req: Request, res: Response) {
  try {
    const body = req.body as RegisterInput
    if (!body.fullName || !body.password || (!body.email && !body.phone)) {
      return res.status(400).json({ error: 'fullName, password, and email or phone are required' })
    }
    const result = await register({ ...body, role: 'citizen' })
    return res.status(201).json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed'
    return res.status(400).json({ error: message })
  }
}

export async function startVerificationHandler(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const { nationalId, phone } = req.body as { nationalId?: string; phone?: string }
  if (!nationalId) return res.status(400).json({ error: 'nationalId is required' })

  const otp = generateOtp()
  await query(
    `INSERT INTO citizen_verifications (user_id, national_id, phone, otp_code, status)
     VALUES ($1, $2, $3, $4, 'pending')`,
    [req.user.id, nationalId, phone ?? null, otp]
  )

  return res.json({
    status: 'pending',
    message: 'OTP sent (mock)',
    otp, // returned for mock/demo purposes
  })
}

export async function confirmVerificationHandler(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const { nationalId, otp } = req.body as { nationalId?: string; otp?: string }
  if (!nationalId || !otp) return res.status(400).json({ error: 'nationalId and otp are required' })

  const rows = await query<{
    id: number
    otp_code: string
    status: string
  }>(
    `SELECT id, otp_code, status
     FROM citizen_verifications
     WHERE user_id = $1 AND national_id = $2
     ORDER BY created_at DESC
     LIMIT 1`,
    [req.user.id, nationalId]
  )
  const attempt = rows[0]
  if (!attempt) return res.status(404).json({ error: 'Verification not found' })
  if (attempt.status === 'verified') {
    return res.json({ status: 'verified' })
  }
  if (attempt.otp_code !== otp) {
    return res.status(400).json({ error: 'Invalid OTP' })
  }

  await query(
    `UPDATE citizen_verifications
     SET status = 'verified', confirmed_at = NOW()
     WHERE id = $1`,
    [attempt.id]
  )

  await query<UserRecord>(
    `UPDATE users SET verification_status = 'verified' WHERE id = $1`,
    [req.user.id]
  )

  return res.json({ status: 'verified' })
}
