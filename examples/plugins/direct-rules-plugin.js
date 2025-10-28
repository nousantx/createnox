import { isImportant, createResult as pass } from 'createnoxui-plugin'

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
const directRulesUtilityPlugin = (data) => {
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
