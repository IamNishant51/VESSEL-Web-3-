import { z } from 'zod'

// Import validation schemas
describe('Validation Schemas', () => {
  describe('Email validation', () => {
    const EmailSchema = z.string().email('Invalid email')

    it('should validate correct emails', () => {
      expect(() => EmailSchema.parse('user@example.com')).not.toThrow()
      expect(() => EmailSchema.parse('test@vessel.com')).not.toThrow()
    })

    it('should reject invalid emails', () => {
      expect(() => EmailSchema.parse('invalid.email')).toThrow()
      expect(() => EmailSchema.parse('user@')).toThrow()
    })
  })

  describe('Wallet address validation', () => {
    const WalletSchema = z.string().length(44, 'Invalid wallet address length')

    it('should validate correct wallet addresses', () => {
      const validWallet = '11111111111111111111111111111112'
      expect(() => WalletSchema.parse(validWallet)).not.toThrow()
    })

    it('should reject invalid wallet addresses', () => {
      expect(() => WalletSchema.parse('short')).toThrow()
      expect(() => WalletSchema.parse('toolongwalletaddressthatexceedslimit')).toThrow()
    })
  })

  describe('Agent name validation', () => {
    const AgentNameSchema = z
      .string()
      .min(2, 'Name too short')
      .max(50, 'Name too long')
      .regex(/^[a-zA-Z0-9\s-_]+$/, 'Invalid characters')

    it('should validate correct agent names', () => {
      expect(() => AgentNameSchema.parse('My Agent')).not.toThrow()
      expect(() => AgentNameSchema.parse('Agent-2024_Pro')).not.toThrow()
    })

    it('should reject invalid agent names', () => {
      expect(() => AgentNameSchema.parse('A')).toThrow() // too short
      expect(() => AgentNameSchema.parse('a'.repeat(51))).toThrow() // too long
      expect(() => AgentNameSchema.parse('Agent@#$')).toThrow() // invalid chars
    })
  })

  describe('Price validation', () => {
    const PriceSchema = z.number().positive('Price must be positive').max(1000000, 'Price too high')

    it('should validate correct prices', () => {
      expect(() => PriceSchema.parse(0.001)).not.toThrow()
      expect(() => PriceSchema.parse(100)).not.toThrow()
      expect(() => PriceSchema.parse(999999)).not.toThrow()
    })

    it('should reject invalid prices', () => {
      expect(() => PriceSchema.parse(-1)).toThrow()
      expect(() => PriceSchema.parse(0)).toThrow()
      expect(() => PriceSchema.parse(10000001)).toThrow()
    })
  })
})
