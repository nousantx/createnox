import { TenoxUI } from '@tenoxui/core'
import { Renderer } from './lib/renderer'
import { transform } from './lib/transformer'
import MainPlugin from './lib/plugin'
import {
  basicUtilityProcessorPlugin,
  functionalUtilityPlugin,
  arbitraryValuePlugin,
  functionalVariant,
  defaultUtilityProcessor
} from './plugins'

const starterPlugins = [
  functionalUtilityPlugin,
  basicUtilityProcessorPlugin,
  arbitraryValuePlugin,
  functionalVariant
]

const CreaTenoxPlugin = ({ aliases = {}, importantMark = 'both', plugins = [] } = {}) =>
  MainPlugin({
    aliases,
    importantMark,
    plugins: plugins.length === 0 ? [defaultUtilityProcessor] : plugins
  })

function Main({
  corePlugins = [],
  utilities = {},
  variants = {},
  aliases = {},
  plugins = [],
  apply = {},
  importantMark = 'both',
  renderOutputParent = ''
} = {}) {
  const main = new TenoxUI({
    utilities,
    variants,
    plugins: [CreaTenoxPlugin({ aliases, importantMark, plugins }), ...corePlugins]
  })

  const ui = new Renderer({ main, aliases, apply, parent: renderOutputParent })

  return {
    main,
    ui,
    render: (...args) => ui.render(...args),
    getData: (...args) => main.process(...args)
  }
}

export * from './utils'
export * from './plugins'
export * from './lib'
export { starterPlugins, CreaTenoxPlugin, Main }
export { default as Plugin } from './lib/plugin.js'
export default Main
