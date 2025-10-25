import { createMatcher } from '@tenoxui/core'

export function functionalVariant() {
  let variants
  return {
    name: 'nsx:functional-variant-processor',
    init(c) {
      variants = c.variants
    },
    regexp: () => ({ variant: ['[\\w.-]+'] }),
    variant(v) {
      const regex = createMatcher('', Object.keys(variants).join('|'))
      const [, , variant, value] = v.match(regex)
      if (typeof variants[variant] === 'function') return variants[variant](value)
      // else return variants[variant]
    }
  }
}
