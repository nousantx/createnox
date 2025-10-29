import { SyncPluginSystem as PluginSystem } from '@nousantx/plugify'
import { escapeRegex } from '../utils'

const fmt = (arr = []) => arr.filter(Boolean).join('|')
const escp = (obj = {}) => Object.keys(obj).map(escapeRegex).join('|')

export const createMatcher = (safelist = [], markAt = 'both', plugins = []) => {
  // Initialize plugin system
  const pluginProcessor = new PluginSystem(plugins)

  let utilities, variants

  const markPatterns = {
    both: (source) => `^!?${source}!?$`,
    start: (source) => `^!?${source}$`,
    end: (source) => `^${source}!?$`
  }

  // Execute all `regexp` hooks from the plugin system
  const regexp = (pluginProcessor.execAll('regexp') || []).reduce((acc, obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (!acc[key]) acc[key] = []
      acc[key].push(...value)
    }
    return acc
  }, {})

  return [
    /**
     * Generate `patterns` with simplified logic for TenoxUI's matcher
     */
    {
      name: 'createnox:global-patterns',
      init: (c) => {
        utilities = c.utilities
        variants = c.variants
      },
      regexp: ({ patterns }) => ({
        patterns: {
          utility: fmt([
            escp(utilities),
            safelist.map(escapeRegex).join('|'),
            ...(regexp?.utility || [])
          ]),
          variant: fmt([escp(variants), ...(regexp?.variant || [])]),
          value: fmt([patterns.value, ...(regexp?.value || [])])
        }
      })
    },

    /**
     * Injects exclamation mark to the TenoxUI main matcher
     */
    {
      name: 'createnox:main-matcher',
      regexp: ({ matcher }) => ({
        matcher: markPatterns[markAt]
          ? new RegExp(markPatterns[markAt](matcher.source.slice(1, -1)))
          : matcher
      })
    }
  ]
}
