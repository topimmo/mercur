import { medusaIntegrationTestRunner } from '@medusajs/test-utils'

jest.setTimeout(60 * 1000)

medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ api }) => {
    describe('Ping', () => {
      it('ping the server health endpoint', async () => {
        const response = await api.get('/health')
        expect(response.status).toEqual(200)
      })

      it('should return database connection status', async () => {
        const response = await api.get('/health')
        expect(response.status).toEqual(200)
        expect(response.data).toHaveProperty('status')
        expect(response.data).toHaveProperty('database')
        expect(response.data.database).toHaveProperty('connected')
        expect(response.data.database).toHaveProperty('info')
      })

      it('should not expose database credentials', async () => {
        const response = await api.get('/health')
        expect(response.status).toEqual(200)
        const responseString = JSON.stringify(response.data)
        // Ensure no password appears in the response
        expect(responseString).not.toContain('password')
        expect(responseString).not.toContain('postgres:postgres')
      })
    })
  }
})
