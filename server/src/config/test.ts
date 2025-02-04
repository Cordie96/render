export default {
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/youtube_party_test'
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'test_secret'
  },
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY || 'test_key',
    maxDuration: 10 * 60 // 10 minutes
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10)
  }
}; 