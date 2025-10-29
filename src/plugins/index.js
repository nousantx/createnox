import { basicUtilityProcessorPlugin, functionalUtilityPlugin } from './utility'
import { arbitraryValuePlugin } from './value'
import { functionalVariantPlugin } from './variant'

export const starterPlugins = [
  functionalUtilityPlugin,
  basicUtilityProcessorPlugin,
  arbitraryValuePlugin,
  functionalVariantPlugin
]

export * from './utility'
export * from './value'
export * from './variant'
