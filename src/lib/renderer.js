import { generateRuleBlock, processVariantSelector, addTabs } from '../utils/transformerUtils'
import { transform } from './transformer'
import { DEFAULT_LABEL } from '../utils/createResult'

export class Renderer {
  constructor({ main = null, aliases = {}, apply = {}, name = DEFAULT_LABEL, parent = '' } = {}) {
    this.main = main
    this.aliases = aliases
    this.apply = apply
    this.transformerLabelName = name
    this.parent = parent
  }

  processClassesToRules(selector, classNames) {
    if (!this.main) {
      console.warn("TenoxUI isn't initialized")
      return []
    }

    const results = []
    const baseRulesMap = new Map()

    try {
      const dataRules = this.main.process(classNames)

      if (!dataRules || dataRules.length === 0) return []

      dataRules.forEach((rule) => {
        if (rule.use === this.transformerLabelName && rule.rules) {
          const rules = generateRuleBlock(rule.rules, rule.isImportant || false, true)

          if (rule.variant) {
            const variantRule = processVariantSelector(rule.variant, selector, `{ ${rules} }`)
            if (variantRule) results.push(variantRule)
          } else {
            if (!baseRulesMap.has(selector)) {
              baseRulesMap.set(selector, [])
            }
            if (rules) baseRulesMap.get(selector).push(rules)
          }
        }
      })

      baseRulesMap.forEach((rulesList, selectorKey) => {
        if (rulesList.length > 0) {
          const combinedRules = rulesList.join('; ')
          results.unshift(`${selectorKey} { ${combinedRules} }`)
        }
      })
    } catch (error) {
      console.error(`Error processing classes for selector '${selector}':`, error)
    }

    return results
  }

  processObjectRules(data) {
    if (!data) return []
    const allResults = []
    Object.entries(data).forEach(([selector, classNames]) => {
      if (classNames) {
        const results = this.processClassesToRules(selector, classNames)

        allResults.push(...results)
      }
    })

    return allResults
  }

  processAlias(aliasName) {
    const aliasClasses = this.aliases[aliasName]

    if (!aliasClasses) {
      console.warn(`Alias '${aliasName}' not found`)
      return []
    }

    const classSelector = `.${aliasName}`
    return this.processClassesToRules(classSelector, aliasClasses)
  }

  sanitize(classNames) {
    let cns

    if (typeof classNames === 'string') {
      cns = classNames
        .split(/\s+/)
        .map((cn) => cn.trim())
        .filter(Boolean)
    } else if (Array.isArray(classNames)) {
      cns = classNames.filter(Boolean)
    } else {
      return null
    }

    if (cns.length === 0) return null

    const results = {
      classNames: [],
      aliases: []
    }

    cns.forEach((cn) => {
      if (this.aliases[cn]) {
        results.aliases.push(cn)
      } else {
        results.classNames.push(cn)
      }
    })

    return results
  }

  addAlias(name, classes) {
    this.aliases[name] = classes
    return this
  }

  removeAlias(name) {
    if (this.aliases[name]) {
      delete this.aliases[name]
    }
    return this
  }

  processStringOrArray(input) {
    if (!input) return []
    const results = []

    const sanitized = this.sanitize(input)
    if (!sanitized) return results

    const { classNames, aliases } = sanitized

    // alias class names should rendered first
    if (aliases.length > 0) {
      aliases.forEach((aliasName) => {
        const aliasRules = this.processAlias(aliasName)
        if (aliasRules.length > 0) {
          results.push(...aliasRules)
        }
      })
    }

    if (classNames.length > 0 && this.main) {
      try {
        const transformResult = transform(this.main.process(classNames), this.transformerLabelName)
        if (transformResult.rules && transformResult.rules.length > 0) {
          results.push(...transformResult.rules)
        }
      } catch (error) {
        console.error('Error processing class names:', error)
      }
    }

    return results
  }

  setParent(parent) {
    this.parent = parent
    return this
  }

  render(...args) {
    if (!args) return '/* nothing to do */'
    const results = []
    args.forEach((arg) => {
      try {
        if (typeof arg === 'object' && !Array.isArray(arg)) {
          const objectRules = this.processObjectRules(arg)
          if (objectRules.length > 0) {
            results.push(...objectRules)
          }
        } else if (typeof arg === 'string' || Array.isArray(arg)) {
          const stringArrayRules = this.processStringOrArray(arg)
          if (stringArrayRules.length > 0) {
            results.push(...stringArrayRules)
          }
        }
      } catch (error) {
        console.error('Error processing render argument:', error, arg)
      }
    })

    const applyRules =
      Object.keys(this.apply).length > 0
        ? this.processObjectRules(this.apply).join('\n') + '\n'
        : ''
    const mainRules = results.length > 0 ? results.join('\n') : ''

    let finalRules = applyRules + mainRules

    if (finalRules.length === 0) finalRules = `/* invalid utilities ${JSON.stringify(args)} */`

    function wrapWithParents(rules, parents, indent = 0) {
      const space = ' '.repeat(indent)
      const parent = parents[0]

      // base case — if only one parent left
      if (parents.length === 1) {
        return `${space}${parent} {\n${addTabs(rules, indent + 2)}\n${space}}`
      }

      // recursive nesting
      return (
        `${space}${parent} {\n` +
        wrapWithParents(rules, parents.slice(1), indent + 2) +
        `\n${space}}`
      )
    }

    return this.parent
      ? Array.isArray(this.parent)
        ? wrapWithParents(finalRules, this.parent)
        : `${this.parent} {\n${addTabs(finalRules)}\n}`
      : finalRules
  }

  clear() {
    this.aliases = {}
    this.apply = {}
  }
}
