import {
  createResult as pass,
  createErrorResult as fail,
  isImportant,
  escapeRegex,
  generateRuleBlock
} from '../utils'
import { escapeArbitrary } from './pluginUtils'

/**
 * Default utility processor for your vanilla, unconfigured TenoxUI for -
 * quick support for createnox.
 */
export const defaultUtilityProcessor = {
  name: 'nsx:default-utility-processor',
  utility: (ctx) => {
    const { className, utility, value } = ctx
    return typeof utility === 'string' // only accept string utility (e.g. {bg: 'background'})
      ? pass({ ...ctx, rules: { utility, value } })
      : fail({ className, reason: `Typeof 'utility' must be a string` })
  }
}

const isDirect = (str) => str.includes(':')

// basic utility processing implementation
export const basicUtilityProcessorPlugin = {
  name: 'nsx:basic-utility-processor-example',
  utility(ctx) {
    const { utility, raw, value, className } = ctx

    if (isDirect(utility) && value)
      return fail({
        className,
        reason: `${raw[2]} utility can't have value, and ${value} is defined`
      })

    let rules =
      typeof utility === 'string' && isDirect(utility) ? utility : { property: utility, value } // fallback value

    if (typeof utility === 'object' && !Array.isArray(utility)) {
      /**
       * Object type utility, e.g.
       * flex: {display: 'flex'}
       *
       * usage example:
       * TenoxUI.process('flex')
       */

      if (value) {
        /**
         * Should fail when utility has value defined. For example :
         *
         * TenoxUI.process('flex-4')
         */
        return fail(
          className,
          `\`${raw[2]}\` utility can't have value, and \`${value}\` is defined.`
        )
      }
      rules = utility
    } else if (Array.isArray(utility)) {
      if (utility.length === 0)
        return fail({ className, reason: 'Empty utility rules, nothing to do' })

      const hasPlain = utility.some((i) => typeof i === 'string' && !i.includes(':'))

      rules =
        hasPlain && value
          ? utility.map((i) => (typeof i === 'string' && !i.includes(':') ? `${i}: ${value}` : i))
          : utility
    } else if (raw[2].startsWith('[') && raw[2].endsWith(']')) {
      /**
       * Tailwind CSS like arbitrary utility implementation.
       *
       * usage example:
       * TenoxUI.process('[color:red]')
       */

      if (value) return fail(className, 'No value needed') // should fail if utility has value

      rules = raw[2]
        .slice(1, -1)
        .split(',')
        .map((i) => {
          const [utility, value] = i.split(':')
          return { utility, value: escapeArbitrary(value) }
        })
    }

    return pass({ ...ctx, rules })
  },
  /**
   * Add new utility patterns to the main matcher to support arbitrary utility
   */
  regexp: () => ({ utility: ['\\[[^\\]]+\\]+'] })
}

/**
 * Functional utility support
 */
export const functionalUtilityPlugin = {
  name: 'nsx:functional-utility-feature-example',
  utility: (ctx) => {
    const { utility, value, raw } = ctx

    // Check if the utility is a function
    if (typeof utility === 'function') {
      // Run the utility as function
      const rules = utility(value, raw)

      return rules
        ? typeof rules === 'object' && 'rules' in rules && !Array.isArray(rules)
          ? // Pass context if the utility returns truthy value
            pass({ ...ctx, ...rules })
          : pass({ ...ctx, rules })
        : fail(ctx.className, 'unknown error') // Fail when the utility returns falsy value
    }
  }
}
