import { describe, it, expect } from 'vitest'
import { TenoxUI } from '@tenoxui/core'
import { createMatcher } from '../src/lib/matcher.js'

describe('Matcher Unit Test', () => {
  let ui = new TenoxUI({ utilities: { bg: '...' } })

  it('should create new matcher', () => {
    expect(ui.matcher).toStrictEqual(
      /^(?:(?<variant>[\w.-]+):)?(?<utility>bg)(?:-(?<value>[\w.-]+?))?$/
    )
    ui.use(createMatcher())
    expect(ui.matcher).toStrictEqual(
      /^!?(?:(?<variant>[\w.-]+):)?(?<utility>bg)(?:-(?<value>[\w.-]+?))?!?$/
    )
    ui.use(createMatcher(['my-class'], 'end'))
    expect(ui.matcher).toStrictEqual(
      /^(?:(?<variant>[\w.-]+):)?(?<utility>bg|my\-class)(?:-(?<value>[\w.-]+?))?!?$/
    )
  })
})
