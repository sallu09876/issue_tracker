import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IssueFlow API',
      version: '1.0.0',
      description: 'REST API documentation for the IssueFlow Issue Management Platform',
    },
    servers: [
      {
        url: 'https://issue-tracker-backend-f167.onrender.com/api',
        description: 'Production server',
      },
      {
        url: 'http://localhost:4000/api',
        description: 'Local development server',
      },
    ],
    components: {
      schemas: {
        Issue: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string', example: 'Login page crashes on mobile Safari' },
            description: { type: 'string', example: 'Users on iOS devices are experiencing crashes...' },
            status: { type: 'string', enum: ['open', 'in_progress', 'resolved', 'closed'], example: 'open' },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'], example: 'high' },
            label: { type: 'string', enum: ['bug', 'feature', 'improvement', 'question'], example: 'bug' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        CreateIssue: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', minLength: 3, example: 'Login page crashes on mobile Safari' },
            description: { type: 'string', example: 'Detailed description of the issue...' },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'], example: 'high' },
            label: { type: 'string', enum: ['bug', 'feature', 'improvement', 'question'], example: 'bug' },
          },
        },
        UpdateIssue: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'Updated title' },
            description: { type: 'string', example: 'Updated description' },
            status: { type: 'string', enum: ['open', 'in_progress', 'resolved', 'closed'] },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            label: { type: 'string', enum: ['bug', 'feature', 'improvement', 'question'] },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            issue_id: { type: 'string', format: 'uuid' },
            content: { type: 'string', example: 'This is a comment on the issue' },
            author: { type: 'string', example: 'John Doe' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        CreateComment: {
          type: 'object',
          required: ['issue_id', 'content'],
          properties: {
            issue_id: { type: 'string', format: 'uuid' },
            content: { type: 'string', example: 'This is a comment' },
            author: { type: 'string', example: 'John Doe' },
          },
        },
        AIAnalysis: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            issue_id: { type: 'string', format: 'uuid' },
            summary: { type: 'string', example: 'This issue affects mobile Safari users...' },
            root_cause: { type: 'string', example: 'Optional chaining not supported in older Safari...' },
            suggestions: {
              type: 'array',
              items: { type: 'string' },
              example: ['Add polyfill for optional chaining', 'Test on Safari 15', 'Add browser compatibility check'],
            },
            sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative', 'urgent'], example: 'urgent' },
            generated_at: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Something went wrong' },
          },
        },
      },
    },
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          tags: ['Health'],
          responses: {
            200: {
              description: 'Server is running',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { status: { type: 'string', example: 'ok' } },
                  },
                },
              },
            },
          },
        },
      },
      '/issues': {
        get: {
          summary: 'Get all issues',
          tags: ['Issues'],
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['open', 'in_progress', 'resolved', 'closed'] } },
            { name: 'priority', in: 'query', schema: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] } },
            { name: 'label', in: 'query', schema: { type: 'string', enum: ['bug', 'feature', 'improvement', 'question'] } },
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search in title and description' },
          ],
          responses: {
            200: {
              description: 'List of issues',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/Issue' } },
                },
              },
            },
          },
        },
        post: {
          summary: 'Create a new issue',
          tags: ['Issues'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateIssue' },
              },
            },
          },
          responses: {
            201: {
              description: 'Issue created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Issue' },
                },
              },
            },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/issues/{id}': {
        get: {
          summary: 'Get a single issue',
          tags: ['Issues'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Issue detail', content: { 'application/json': { schema: { $ref: '#/components/schemas/Issue' } } } },
            404: { description: 'Issue not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        put: {
          summary: 'Update an issue',
          tags: ['Issues'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateIssue' } } },
          },
          responses: {
            200: { description: 'Issue updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Issue' } } } },
            404: { description: 'Issue not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        delete: {
          summary: 'Delete an issue',
          tags: ['Issues'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Issue deleted', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } },
            404: { description: 'Issue not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/comments/{issueId}': {
        get: {
          summary: 'Get comments for an issue',
          tags: ['Comments'],
          parameters: [{ name: 'issueId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'List of comments', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Comment' } } } } },
          },
        },
      },
      '/comments': {
        post: {
          summary: 'Add a comment to an issue',
          tags: ['Comments'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateComment' } } },
          },
          responses: {
            201: { description: 'Comment created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Comment' } } } },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/comments/{id}': {
        delete: {
          summary: 'Delete a comment',
          tags: ['Comments'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Comment deleted', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } },
          },
        },
      },
      '/analysis/{issueId}': {
        get: {
          summary: 'Get latest AI analysis for an issue',
          tags: ['AI Analysis'],
          parameters: [{ name: 'issueId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'AI analysis or null', content: { 'application/json': { schema: { $ref: '#/components/schemas/AIAnalysis' } } } },
          },
        },
      },
      '/analysis/generate/{issueId}': {
        post: {
          summary: 'Generate AI analysis for an issue using Gemini',
          tags: ['AI Analysis'],
          parameters: [{ name: 'issueId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Generated analysis', content: { 'application/json': { schema: { $ref: '#/components/schemas/AIAnalysis' } } } },
            502: { description: 'AI generation failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);