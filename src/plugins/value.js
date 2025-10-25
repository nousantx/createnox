import { escapeArbitrary } from './pluginUtils'

export const arbitraryValuePlugin = {
  name: 'nsx:arbitrary-value-transformer',
  value(value) {
    if (value.startsWith('[') && value.endsWith(']')) {
      return escapeArbitrary(value.slice(1, -1))
    }
  },
  regexp: () => ({ value: ['\\[[^\\]]+\\]+'] })
}
