import { createResult as pass, createErrorResult as fail, isImportant, escapeRegex } from '../utils'
import { escapeArbitrary } from './pluginUtils'

/**
 * Default utility processor for your vanilla, unconfigured TenoxUI for -
 * quick support for createnox.
 */
export const defaultUtilityProcessor = {
  name: 'nsx:default-utility-processor',
  utility: (ctx) => {
    const { className, property, value } = ctx
    return typeof property === 'string' // only accept string utility (e.g. {bg: 'background'})
      ? pass({ ...ctx, rules: { property, value } })
      : fail({ className, reason: `Typeof 'property' must be a string` })
  }
}

// basic utility processing implementation
export const basicUtilityProcessorPlugin = {
  name: 'nsx:basic-utility-processor-example',
  utility(ctx) {
    const { property, raw, value, className } = ctx

    let rules = { property, value } // default value

    if (typeof property === 'object') {
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
      rules = property
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
          const [property, value] = i.split(':')
          return { property, value: escapeArbitrary(value) }
        })
    }

    return pass({ ...ctx, rules })
  },
  /**
   * Add new utility patterns to the main matcher to support arbitrary utility
   */
  regexp: () => ({ property: ['\\[[^\\]]+\\]+'] })
}

/**
 * Functional utility support
 */
export const functionalUtilityPlugin = {
  name: 'nsx:functional-utility-feature-example',
  utility: (ctx) => {
    const { property, value, raw } = ctx

    // Check if the utility is a function
    if (typeof property === 'function') {
      // Run the utility as function
      const rules = property(value, raw)

      return rules
        ? typeof rules === 'object' && 'rules' in rules && !Array.isArray(rules)
          ? // Pass context if the utility returns truthy value
            pass({ ...ctx, ...rules })
          : pass({ ...ctx, rules })
        : fail(ctx.className, 'unknown error') // Fail when the utility returns falsy value
    }
  }
}

/**
 * Direct Rules Utility Plugin
 *
 * Define your utility classes with createnox valid rules. { utilityName: createnoxRules }
 *
 * Example:
 * data: { 'my-class': ['display: flex', {color: 'red'}, ['position', 'absolute']] }
 *
 * TenoxUI.process('my-class')
 */
export const directRulesUtilityPlugin = (data) => {
  const objKeys = Object.keys(data)

  let processVariant, parse

  return {
    name: 'nsx:direct-rules-utility-plugin',

    // First, we must pass the utilities names from the `data` to the main `matcher`
    regexp: () => ({ property: objKeys.map(escapeRegex) }),

    // `init` hook always run once before anything is processed
    init(ctx) {
      processVariant = ctx.processVariant
      parse = ctx.parser
    },

    // `process` hook, process individual class names
    process(inputClassName) {
      // Parse the class name
      const match = parse(inputClassName)

      if (match) {
        /**
         * Get variant and the class name from the match
         *
         * Example:
         *   data: { 'text-red': 'color: red' }
         *
         * `!hover:text-red` => [!hover:text-red, hover, text-red, undefined]
         */
        const [, variant, className] = match

        // If the data has the class name
        if (data[className]) {
          // Pass with...
          return pass({
            // Class name from input
            className: inputClassName,

            // Get rules from the data of the class name
            rules: data[className],

            // Process variant if any
            variant: processVariant(variant),

            // Get `isImportant` mark
            isImportant: isImportant(inputClassName),

            // Optionally, pass the match as raw
            raw: match
          })
        }
      }
    }
  }
}
