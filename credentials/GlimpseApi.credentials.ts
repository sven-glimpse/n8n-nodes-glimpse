```typescript
import type {
  IAuthenticateGeneric,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow'

export class GlimpseApi implements ICredentialType {
  name = 'glimpseApi'
  displayName = 'Glimpse API'
  documentationUrl = 'https://www.glimpsehq.io/docs/api'

  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      placeholder: 'glmp_...',
      description: 'Your Glimpse API key. Generate one in Settings > Integrations.',
    },
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://app.glimpsehq.io',
      description: 'Override for self-hosted or staging environments',
    },
  ]

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials.apiKey}}',
      },
    },
  }
}
