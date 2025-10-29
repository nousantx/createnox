import {
  generateSelector,
  generateRuleBlock,
  processVariantSelector
} from '../utils/transformerUtils'

export function transform(data, name = 'createnox') {
  const results = {
    rules: [],
    invalid: { [name]: [], rest: [] }
  }

  if (!data) return results

  const addInvalid = (item) => results.invalid[name].push(item)

  const processItem = (item) => {
    try {
      if (!item.rules || (!item.variant && item.raw?.[1])) {
        addInvalid(item)
        return
      }

      const variant = item.variant || ''
      const className = typeof item.className === 'string' ? item.className : item.raw?.[0] || ''

      const rulesBlock = generateRuleBlock(item.rules, item.isImportant || false)

      if (variant) {
        const isObjectClassName = item.className && typeof item.className === 'object'
        const result = isObjectClassName
          ? processVariantSelector(
              variant,
              item.className?.raw || className,
              rulesBlock,
              item.className
            )
          : processVariantSelector(
              variant,
              generateSelector(item.className, className, true),
              rulesBlock
            )

        result ? results.rules.push(result) : addInvalid(item)
      } else {
        const selector = generateSelector(item.className, className, true)
        if (rulesBlock) {
          results.rules.push(`${selector} ${rulesBlock}`)
        } else {
          addInvalid(item)
        }
      }
    } catch (err) {
      console.error(`Error transforming ${item.className}:`, err)
      addInvalid(item)
    }
  }

  data.forEach((item) => {
    item.use === name ? processItem(item) : results.invalid.rest.push(item)
  })

  return results
}

export const getRules = (data) => transform(data).rules.join('\n')
