import { vi } from 'vitest'

// Set required env vars before any module imports
process.env.JWT_SECRET = 'test-jwt-secret-min-32-chars-long!!'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-min-32-chars!!'
process.env.NODE_ENV = 'test'
process.env.CLOUDINARY_API_SECRET = 'test-secret'
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud'
process.env.CLOUDINARY_API_KEY = 'test-key'

// Mock Prisma client
vi.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    listing: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    listingImage: {
      findFirst: vi.fn(),
      count: vi.fn(),
      createMany: vi.fn(),
      delete: vi.fn(),
    },
    savedListing: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

// Mock Redis
vi.mock('../lib/redis', () => ({
  redis: {
    set: vi.fn().mockResolvedValue('OK'),
    get: vi.fn().mockResolvedValue(null),
    del: vi.fn().mockResolvedValue(1),
    on: vi.fn(),
  },
}))

// Mock Cloudinary
vi.mock('../lib/cloudinary', () => ({
  cloudinary: {
    utils: { api_sign_request: vi.fn().mockReturnValue('mock-signature') },
    uploader: { destroy: vi.fn().mockResolvedValue({ result: 'ok' }) },
  },
  getCloudinaryTransformUrl: vi.fn().mockReturnValue('https://res.cloudinary.com/test/image.jpg'),
}))
