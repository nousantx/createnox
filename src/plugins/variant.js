import { createMatcher } from '@tenoxui/core'

export function functionalVariantPlugin() {
  let variants, regex
  return {
    name: 'nsx:functional-variant-processor',
    init(c) {
      variants = c.variants
      regex = createMatcher('', Object.keys(variants).join('|'))
    },
    regexp: () => ({ variant: ['[\\w.-]+'] }),
    variant(v) {
      const [, , variant, value] = v.match(regex)
      if (typeof variants[variant] === 'function') return variants[variant](value)
    }
  }
}
