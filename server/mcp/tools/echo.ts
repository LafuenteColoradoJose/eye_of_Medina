import { z } from 'zod'

export default defineMcpTool({
  description: 'Echo back a message',
  inputSchema: {
    message: z.string().describe('The message to echo back'),
  },
  handler: async ({ message }: { message: string }) => {
    return {
      content: [{
        type: 'text',
        text: `Echo: ${message}`,
      }],
    }
  },
})
