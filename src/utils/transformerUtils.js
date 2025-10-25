import { escapeSelector } from './escape'

/**
 * Check if the utility has important mark
 */
export const isImportant = (className) => className.startsWith('!') || className.endsWith('!')

/**
 * Transform css properties into kebab-type
 */
export function toKebabCase(str) {
  if (/^(webkit|moz|ms|o)[A-Z]/.test(str)) {
    const match = str.match(/^(webkit|moz|ms|o)/)
    if (match) {
      const prefix = match[0]
      return `-${prefix}${str
        .slice(prefix.length)
        .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`
    }
  }

  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

/**
 * Helper function to add tabs or spaces into string blocks
 */
export function addTabs(str, size = 2) {
  const spaces = ' '.repeat(size)
  return str
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => `${spaces}${line}`)
    .join('\n')
}

/**
 * Helper to check if css property or variable
 */
export function transformProps(prop = '') {
  return prop.startsWith('--') ? prop : toKebabCase(prop)
}

/**
 * Helper for generating rules from variables
 */
export function generateCSSRule(property, value, isImportant, localIsImportant) {
  const important = localIsImportant || isImportant ? ' !important' : ''

  if (Array.isArray(property)) {
    return property
      .map((prop) =>
        typeof prop === 'string' ? `${transformProps(prop)}: ${value}${important}` : null
      )
      .join('; ')
  }

  return typeof property === 'string' ? `${transformProps(property)}: ${value}${important}` : null
}

/**
 * Helper function for processing string rules
 */
function processStringRules(rules, isImportant = false) {
  if (!isImportant) return rules
  const cleanRules = rules.trim().endsWith(';') ? rules.trim().slice(0, -1) : rules.trim()
  const withoutImportant = cleanRules.replaceAll(' !important', '')
  let result = ''
  let i = 0
  let depth = 0
  let currentProp = ''

  while (i < withoutImportant.length) {
    const char = withoutImportant[i]

    if (char === '{') {
      result += currentProp + char + ' '
      currentProp = ''
      depth++
    } else if (char === '}') {
      if (currentProp.trim() && currentProp.includes(':')) {
        result += currentProp.trim() + ' !important '
      } else {
        result += currentProp.trim() + ' '
      }
      result += char
      currentProp = ''
      depth--
    } else if (char === ';') {
      if (currentProp.trim() && currentProp.includes(':')) {
        result += currentProp.trim() + ' !important' + char + ' '
      } else {
        result += currentProp + char
      }
      currentProp = ''
    } else {
      currentProp += char
    }

    i++
  }

  if (currentProp.trim()) {
    if (currentProp.includes(':')) {
      result += currentProp.trim() + ' !important'
    } else {
      result += currentProp
    }
  }

  return result.trim().replace(/\s+/g, ' ')
}

export function generateSelector(className, originalClassName, isClassName = true) {
  if (typeof className === 'string') {
    return (isClassName ? '.' : '') + escapeSelector(className)
  }

  const { raw, prefix = '', suffix = '' } = className
  const baseClass = raw || originalClassName
  return `${prefix}.${escapeSelector(baseClass)}${suffix}`
}

export function processObjectRules(rules, isImportant = false) {
  return Object.entries(rules)
    .map(([property, value]) => {
      const pureProps = property.startsWith('props:') ? property.slice(6) : property
      const props = pureProps.includes(',') ? pureProps.split(',').map((x) => x.trim()) : pureProps

      const [val, localImportant] = Array.isArray(value) ? value : [value]

      return generateCSSRule(props, val, isImportant, localImportant)
    })
    .join('; ')
}

export const removeColonFromBracket = (item) => item.replaceAll('}; ', '} ')

export function processRulesArray(rules, isImportant) {
  return removeColonFromBracket(
    rules
      .map((rule) => {
        if (!rule) return ''

        if (Array.isArray(rule)) {
          return generateCSSRule(rule[0], rule[1], isImportant, rule[2])
        }

        if (typeof rule === 'object') {
          return 'property' in rule
            ? generateCSSRule(rule.property, rule.value, isImportant, rule.isImportant)
            : processObjectRules(rule, isImportant)
        }

        if (typeof rule === 'string' && rule.includes(':')) {
          return processStringRules(rule, isImportant)
        }

        return String(rule)
      })
      .filter(Boolean)
      .join('; ')
  )
}

export function generateRuleBlock(rules, isImportant, rulesOnly = false) {
  if (!rules) return null

  const wrapRules = (content) => (rulesOnly ? content : `{ ${content} }`)

  if (Array.isArray(rules)) {
    return wrapRules(processRulesArray(rules, isImportant))
  }

  if (typeof rules === 'object') {
    const content =
      'property' in rules
        ? generateCSSRule(rules.property, rules.value, isImportant, rules.isImportant)
        : processObjectRules(rules, isImportant)
    return wrapRules(content)
  }

  if (typeof rules === 'string' && rules.includes(':')) {
    return wrapRules(processStringRules(rules, isImportant))
  }

  return wrapRules(rules)
}

export function processVariantSelector(variant, selector, rules, classNameObject) {
  const getSelector = () =>
    classNameObject ? generateSelector(classNameObject, selector) : selector

  // Handle & replacement syntax (excluding @class variants)
  if (variant.includes('&') && !variant.includes('@class')) {
    if (classNameObject) {
      const parts = generateSelector(classNameObject, selector).split(escapeSelector(selector))
      return parts.length > 1
        ? `${parts.join(variant.replace(/&/g, escapeSelector(selector)))} ${rules}`
        : null
    }
    return `${variant.replace(/&/g, selector)} ${rules}`
  }

  // Handle @slot syntax
  if (variant.includes('@slot')) {
    return variant.replace('@slot', `${getSelector()} ${rules}`)
  }

  // Handle @class and @rules syntax
  if (variant.includes('@class')) {
    if (!variant.includes('@rules')) return null

    const cleanRules =
      rules.startsWith('{') && rules.endsWith('}') ? rules.slice(1, -1).trim() : rules.trim()

    return variant.replace('@class', getSelector()).replace('@rules', cleanRules)
  }

  return null
}
