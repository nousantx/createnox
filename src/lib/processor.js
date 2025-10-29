import { TenoxUI } from '@tenoxui/core'
import { Renderer } from './renderer'
import { transform } from './transformer'
import { Plugin } from './plugin'
import { defaultUtilityProcessor } from '../plugins'

export function init({
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
    plugins: [
      Plugin({
        safelist: Object.keys(aliases),
        importantMark,
        plugins: plugins.length === 0 ? [defaultUtilityProcessor] : plugins
      }),
      ...corePlugins
    ]
  })

  const ui = new Renderer({ main, aliases, apply, parent: renderOutputParent })

  return {
    main,
    ui,
    render: (...args) => ui.render(...args),
    getData: (...args) => main.process(...args)
  }
}
