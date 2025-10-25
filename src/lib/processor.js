import { SyncPluginSystem as PluginSystem } from '@nousantx/plugify'
import { createResult, isImportant as getIsImportant } from '../utils'

var PROCESSOR_VARIANTS_GLOBAL

export class Processor {
  constructor(plugins) {
    this.plugins = new PluginSystem(plugins)
  }

  onInit(ctx) {
    PROCESSOR_VARIANTS_GLOBAL = ctx.variants
    this.plugins.exec('init', ctx)
  }

  processValue(value) {
    return this.plugins.exec('value', value)
  }

  processVariant(variant) {
    return this.plugins.exec('variant', variant)
  }

  processUtilities(ctx) {
    const { property, raw, value, className: rawClassName, variant } = ctx

    const isImportant = getIsImportant(rawClassName)
    const className = isImportant ? rawClassName.replace(/^!|!$/g, '') : rawClassName

    return (
      this.plugins.exec('utility', { isImportant, ...ctx }) ||
      createResult({ className: rawClassName, property, value, variant, raw, isImportant })
    )
  }

  process(className) {
    return this.plugins.exec('process', className)
  }
}

export function init(plugins = []) {
  const instance = new Processor(plugins)
  const proto = Object.getPrototypeOf(instance)

  return Object.getOwnPropertyNames(proto)
    .filter((name) => name !== 'constructor' && typeof proto[name] === 'function')
    .reduce(
      (methods, name) => ({
        ...methods,
        [name]: instance[name].bind(instance)
      }),
      {}
    )
}
