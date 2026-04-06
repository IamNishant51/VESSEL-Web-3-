import { generateToken, verifyToken } from '@/lib/jwt'
import { randomBytes } from 'crypto'

describe('JWT Authentication', () => {
  const testUser = {
    _id: '507f1f77bcf86cd799439011',
    walletAddress: '11111111111111111111111111111112',
    agentCount: 5,
    totalEarnings: 100,
  }

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(testUser as any)
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.').length).toBe(3) // JWT has 3 parts
    })

    it('should generate different tokens on each call', () => {
      const token1 = generateToken(testUser as any)
      const token2 = generateToken(testUser as any)
      expect(token1).not.toBe(token2)
    })
  })

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateToken(testUser as any)
      const payload = verifyToken(token)
      expect(payload).toBeDefined()
      expect(payload?.userId).toBeDefined()
    })

    it('should fail on invalid token', () => {
      const invalidToken = 'invalid.token.here'
      expect(() => verifyToken(invalidToken)).toThrow()
    })

    it('should fail on expired token', () => {
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJ3YWxsZXRBZGRyZXNzIjoiMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTIiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMDAwfQ.test'
      expect(() => verifyToken(expiredToken)).toThrow()
    })
  })
})
