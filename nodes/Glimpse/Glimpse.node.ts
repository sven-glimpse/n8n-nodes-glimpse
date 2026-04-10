import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow'

const SIGNAL_TYPES = [
  'blog_post', 'pricing_change', 'job_posting', 'job_removed',
  'tech_added', 'tech_removed', 'tech_stack_update',
  'news_mention', 'newsletter', 'ebook', 'webinar', 'webinar_upcoming',
  'linkedin_ad', 'social_post', 'youtube_video', 'instagram_post',
  'facebook_post', 'facebook_ad', 'google_ad', 'user_review',
  'sitemap_update', 'page_change', 'leadership_change',
]

export class Glimpse implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Glimpse',
    name: 'glimpse',
    icon: 'file:glimpse.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Read data from the Glimpse competitive intelligence API',
    defaults: { name: 'Glimpse' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'glimpseApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Competitor', value: 'competitor' },
          { name: 'Signal', value: 'signal' },
        ],
        default: 'signal',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['competitor'] } },
        options: [
          { name: 'Get All', value: 'getAll', action: 'Get all competitors' },
          { name: 'Get', value: 'get', action: 'Get a competitor' },
        ],
        default: 'getAll',
      },
      {
        displayName: 'Competitor ID',
        name: 'competitorId',
        type: 'string',
        required: true,
        displayOptions: { show: { resource: ['competitor'], operation: ['get'] } },
        default: '',
        description: 'The UUID of the competitor to retrieve',
      },
      {
        displayName: 'Limit',
        name: 'competitorLimit',
        type: 'number',
        displayOptions: { show: { resource: ['competitor'], operation: ['getAll'] } },
        default: 100,
        description: 'Max number of competitors to return (max 500)',
        typeOptions: { minValue: 1, maxValue: 500 },
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['signal'] } },
        options: [
          { name: 'Get All', value: 'getAll', action: 'Get all signals' },
        ],
        default: 'getAll',
      },
      {
        displayName: 'Additional Filters',
        name: 'signalFilters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        displayOptions: { show: { resource: ['signal'], operation: ['getAll'] } },
        options: [
          {
            displayName: 'Competitor IDs',
            name: 'competitorIds',
            type: 'string',
            default: '',
            description: 'Comma-separated competitor UUIDs to filter by',
          },
          {
            displayName: 'Signal Types',
            name: 'types',
            type: 'multiOptions',
            options: SIGNAL_TYPES.map((t) => ({ name: t.replace(/_/g, ' '), value: t })),
            default: [],
            description: 'Filter by signal types',
          },
          {
            displayName: 'Days',
            name: 'days',
            type: 'number',
            default: 7,
            description: 'Only return signals from the last N days',
            typeOptions: { minValue: 1 },
          },
          {
            displayName: 'Limit',
            name: 'limit',
            type: 'number',
            default: 50,
            description: 'Max signals to return (max 500)',
            typeOptions: { minValue: 1, maxValue: 500 },
          },
        ],
      },
    ],
  }

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const credentials = await this.getCredentials('glimpseApi')
    const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '')
    const resource = this.getNodeParameter('resource', 0) as string
    const operation = this.getNodeParameter('operation', 0) as string

    let responseData: IDataObject

    if (resource === 'competitor') {
      if (operation === 'get') {
        const id = this.getNodeParameter('competitorId', 0) as string
        responseData = await this.helpers.httpRequestWithAuthentication.call(
          this, 'glimpseApi', {
            method: 'GET',
            url: baseUrl + '/api/v1/competitors/' + id,
            json: true,
          },
        ) as IDataObject
      } else {
        const limit = this.getNodeParameter('competitorLimit', 0) as number
        responseData = await this.helpers.httpRequestWithAuthentication.call(
          this, 'glimpseApi', {
            method: 'GET',
            url: baseUrl + '/api/v1/competitors',
            qs: { limit },
            json: true,
          },
        ) as IDataObject
      }
    } else {
      const filters = this.getNodeParameter('signalFilters', 0, {}) as {
        competitorIds?: string
        types?: string[]
        days?: number
        limit?: number
      }

      const qs: Record<string, string> = {}
      if (filters.competitorIds) qs.competitor_ids = filters.competitorIds
      if (filters.types && filters.types.length) qs.types = filters.types.join(',')
      if (filters.days) qs.days = String(filters.days)
      if (filters.limit) qs.limit = String(filters.limit)

      responseData = await this.helpers.httpRequestWithAuthentication.call(
        this, 'glimpseApi', {
          method: 'GET',
          url: baseUrl + '/api/v1/signals',
          qs,
          json: true,
        },
      ) as IDataObject
    }

    const items = Array.isArray(responseData.data)
      ? responseData.data as IDataObject[]
      : [responseData]

    return [this.helpers.returnJsonArray(items)]
  }
}
