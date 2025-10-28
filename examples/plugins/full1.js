import { Main, Plugin, createResult as pass, isImportant } from 'createnoxui-plugin'
import { createMatcher } from '@tenoxui/core'

// helper function to check if string is an arbitrary
const isArbitrary = (str) => str.startsWith('[') && str.endsWith(']')

function MyPlugin() {
  // global utilities and variants map
  let utilities, variants, variantRegex

  return {
    name: 'complex-plugin-example',

    // plugin initialization

    // `init` hook will run before any utility processing, once
    init(ctx) {
      utilities = ctx.utilities
      variants = ctx.variants

      // initialize functional variants regexp pattern
      variantRegex = createMatcher('', Object.keys(variants).join('|'))
    },

    regexp: () => ({
      // add arbitrary support for `utility` and `value` patterns
      property: ['\\[[^\\]]+\\]+'],
      value: ['\\[[^\\]]+\\]+'],
      variant: ['[\\w.-]+'] // functional variant will have unlimited possibility of string, so we will make it 'loose'
    }),

    // handle arbitrary utility

    utility(ctx) {
      const { className, raw, property, value } = ctx

      // store default utility and value
      // as well as fallback if the utility isn't arbitrary utility
      let rules = { property, value }

      // process arbitrary utility
      if (
        isArbitrary(raw?.[2])
        /**
         * check parsed `utility` directly from `raw`
         *
         * e.g. you have `important` class name like `![color:blue]`, -
         * you will get `context` of :
         *
         * {
         *   className: '![color:blue]',
         *   raw: ['![color:blue]', undefined, '[color:blue]', ...],
         *   // ...
         * }
         *
         * so if your utility doesn't check the `value` (static class -
         * name such as aliases, etc.), you have to make sure you use -
         * class name from the `raw` instead of the `className` directly -
         * to make sure the class names you're about to process is 'PURE'.
         */
      ) {
        const [property, value] = raw?.[2]
          .slice(1, -1) // remove the square brackets first
          .split(':') // split the property and the value

        // store new property and value
        rules = { property, value }
      }

      // using createResult helper from CreaTenox
      return pass({ ...ctx, isImportant: isImportant(className), rules })
    },

    // handle arbitrary value

    value: (value) => (isArbitrary(value) ? value.slice(1, -1).replace(/_/g, ' ') : value),

    // handle functional variants

    variant(rawVariant) {
      const [, , variant, value] = rawVariant.match(variantRegex)
      if (typeof variants[variant] === 'function') return variants[variant](value)
    }
  }
}

/**
 * Usage Example
 */

const ui = Main({
  plugins: [MyPlugin()],
  utilities: {
    bg: 'background'
  },
  variants: {
    // basic variant
    hover: '&:hover',
    // functional variant
    max: (value) => `@media (max-width: ${value}) {
  @slot
}`
  }
})

console.log(
  ui.render([
    '[color:blue]', // arbitrary utility
    'hover:[color:blue]', // arbitrary utility + variant
    '!hover:[color:blue]', // arbitrary utility + variant + important mark
    '!max-768px:[color:blue]' // arbitrary utility + functional variant + important mark
  ])
)
