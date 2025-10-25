import { escapeRegex, createResult } from '../utils'
import { init } from './processor'
import { createMatcher } from './matcher'

export const Plugin = ({ aliases = {}, plugins = [], importantMark = 'both' }) => [
  ...createMatcher(aliases, importantMark, plugins),
  { name: 'init:main', ...init(plugins, importantMark) }
]

export default Plugin
