import { SyncPluginSystem as PluginSystem } from '@nousantx/plugify'
import { escapeRegex } from '../utils'

const fmt = (arr = []) => arr.filter(Boolean).join('|')
const escp = (obj = {}) => Object.keys(obj).map(escapeRegex).join('|')

export const createMatcher = (safelist, markAt = 'both', plugins = []) => {
  const pluginProcessor = new PluginSystem(plugins)

  let utilities, variants

  const markPatterns = {
    both: (source) => `^!?${source}!?$`,
    start: (source) => `^!?${source}$`,
    end: (source) => `^${source}!?$`
  }

  const regexp = (pluginProcessor.execAll('regexp') || []).reduce((acc, obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (!acc[key]) acc[key] = []
      acc[key].push(...value)
    }
    return acc
  }, {})

  return [
    {
      name: 'init:global',
      onInit: (c) => {
        utilities = c.utilities
        variants = c.variants
      },
      regexp: ({ patterns }) => ({
        patterns: {
          property: fmt([escp(utilities), safelist && escp(safelist), ...(regexp?.property || [])]),
          variant: fmt([escp(variants), ...(regexp?.variant || [])]),
          value: fmt([patterns.value, ...(regexp?.value || [])])
        }
      })
    },
    {
      name: 'init:parser',
      regexp: ({ matcher }) => ({
        matcher: markPatterns[markAt]
          ? new RegExp(markPatterns[markAt](matcher.source.slice(1, -1)))
          : matcher
      })
    }
  ]
}
