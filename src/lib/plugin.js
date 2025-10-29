import { SyncPluginSystem as PluginSystem } from '@nousantx/plugify'
import { escapeRegex, createResult, isImportant } from '../utils'
import { createMatcher } from './matcher'

/**
 * Simplified plugin creation class
 * With simplified hooks name and important marks support for utilities
 */
export function init(plugins = []) {
  const pluginSystem = new PluginSystem(plugins)
  let PROCESSOR_VARIANTS_GLOBAL
  return {
    init(ctx) {
      PROCESSOR_VARIANTS_GLOBAL = ctx.variants
      pluginSystem.exec('init', ctx)
    },

    process: (className) => pluginSystem.exec('process', className),

    value: (value) => pluginSystem.exec('value', value),

    variant: (variant) =>
      pluginSystem.exec('variant', variant) ?? PROCESSOR_VARIANTS_GLOBAL[variant],

    utility(ctx) {
      const { className, property, value, variant, raw } = ctx

      return (
        pluginSystem.exec('utility', { isImportant: isImportant(className), ...ctx }) ||
        createResult({
          className,
          property,
          value,
          variant,
          raw,
          isImportant: isImportant(className)
        })
      )
    }
  }
}

export const Plugin = ({ safelist = [], plugins = [], importantMark = 'both' }) => [
  // initialize regexp patterns or matcher
  ...createMatcher(safelist, importantMark, plugins),
  // initialize plugin processor
  { name: 'createnox:init-main', ...init(plugins) }
]

export default Plugin
