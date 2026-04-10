import type {
  IDataObject,
  IPollFunctions,
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

export class GlimpseTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Glimpse Trigger',
    name: 'glimpseTrigger',
    icon: 'file:glimpse.svg',
    group: ['trigger'],
    version: 1,
    subtitle: 'New competitive signal',
    description: 'Triggers when new competitive intelligence signals are detected in Glimpse',
    defaults: {
      name: 'Glimpse Trigger',
    },
    polling: true,
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'glimpseApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Competitor IDs',
        name: 'competitorIds',
        type: 'string',
        default: '',
        description: 'Comma-separated competitor UUIDs. Leave empty for all competitors.',
      },
      {
        displayName: 'Signal Types',
        name: 'types',
        type: 'multiOptions',
        options: SIGNAL_TYPES.map((t) => ({ name: t.replace(/_/g, ' '), value: t })),
        default: [],
        description: 'Filter by signal types. Leave empty for all types.',
      },
    ],
  }

  async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
    const credentials = await this.getCredentials('glimpseApi')
    const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '')

    const competitorIds = this.getNodeParameter('competitorIds', '') as string
    const types = this.getNodeParameter('types', []) as string[]

    const staticData = this.getWorkflowStaticData('node')
    const lastPollTime = staticData.lastPollTime as string | undefined

    const qs: Record<string, string> = {
      days: '1',
      limit: '100',
    }
    if (competitorIds) qs.competitor_ids = competitorIds
    if (types.length) qs.types = types.join(',')

    const responseData = await this.helpers.httpRequestWithAuthentication.call(
      this, 'glimpseApi', {
        method: 'GET',
        url: baseUrl + '/api/v1/signals',
        qs,
        json: true,
      },
    ) as IDataObject

    const signals = (responseData.data as IDataObject[]) || []

    const newSignals = lastPollTime
      ? signals.filter((s) => {
          const signalTime = (s.published_at as string) || (s.created_at as string)
          return signalTime > lastPollTime
        })
      : signals

    if (newSignals.length > 0) {
      const mostRecent = newSignals.reduce((latest, s) => {
        const t = (s.published_at as string) || (s.created_at as string)
        return t > latest ? t : latest
      }, '')
      staticData.lastPollTime = mostRecent
    } else if (!lastPollTime) {
      staticData.lastPollTime = new Date().toISOString()
    }

    if (newSignals.length === 0) return null

    return [this.helpers.returnJsonArray(newSignals)]
  }
}
