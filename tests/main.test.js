import { describe, it, expect } from 'vitest'
import { TenoxUI } from '@tenoxui/core'
import { init, Plugin, starterPlugins, createResult, createErrorResult, getRules } from '../src'

describe('TenoxUI Integration Unit Test', () => {
  const config = {
    utilities: {
      r1: '--my-rules',
      r2: ['--my-rules1', '--my-rules2'],
      r3: '--my-rules: red',
      r4: (value) => {
        if (!value) return { '--tenox': '100%' }
        let rules = `--my-rules: ${value}`

        if (value === '1') return { '--my-rules': value }
        if (value === '1a') return { 'props:--my-rules': value }
        if (value === '1b') return { 'props:--my-rules1,--my-rules2': value }
        if (value === '2') {
          return {
            property: '--my-rules',
            value
          }
        }
        if (value === '3') {
          return {
            rules: { property: '--my-rules', value }
          }
        }
        if (value === '4') {
          return {
            rules: { '--my-rules': value }
          }
        }
        if (value === '4a') {
          return {
            rules: { 'props:--my-rules': value }
          }
        }
        if (value === '4b') {
          return {
            rules: { 'props:--my-rules1,--my-rules2': value }
          }
        }
        if (value === '5') {
          return [{ '--my-rules1': 'red' }, '--my-rules2: blue', ['--my-rules3', 'yellow']]
        }
        if (value === '5a') {
          return [{ 'props:--my-rules1': 'red' }, '--my-rules2: blue', ['--my-rules3', 'yellow']]
        }
        if (value === '5b') {
          return [
            { 'props:--my-rules1,--my-rules1a': 'red' },
            '--my-rules2: blue',
            ['--my-rules3', 'yellow']
          ]
        }
        if (value === '6') {
          return {
            rules: [
              { '--my-rules1': 'red' },
              '--my-rules2: blue',
              [['--my-rules3', '--my-rules4'], 'yellow']
            ]
          }
        }
        if (value === '6a') {
          return {
            rules: [
              { 'props:--my-rules1': 'red' },
              '--my-rules2: blue',
              [['--my-rules3', '--my-rules4'], 'yellow']
            ]
          }
        }
        if (value === '6b') {
          return {
            rules: [
              { 'props:--my-rules1,--my-rules1a': 'red' },
              '--my-rules2: blue',
              [['--my-rules3', '--my-rules4'], 'yellow']
            ]
          }
        }
        if (value === '7') {
          return [
            { property: '--my-rules1', value },
            { property: '--my-rules2', value }
          ]
        }
        if (value === '8') {
          return [{ '--my-rules1': value }, { '--my-rules2': value }]
        }
        if (value === '8a') {
          return [{ 'props:--my-rules1': value }, { '--my-rules2': value }]
        }
        if (value === '8b') {
          return [{ 'props:--my-rules1,--my-rules1a': value }, { '--my-rules2': value }]
        }
        if (value === '9') {
          return 'display: flex; &:after { display: block } position: absolute'
        }
        if (value === '9a') {
          return ['display: flex', '&:after { display: block }', 'position: absolute']
        }

        return rules
      }
    },
    variants: {
      hover: '&:hover',
      dark: '.dark &',
      max: (value) => Boolean(value) && `@media (max-width: ${value}) { @slot }`
    }
  }

  let ui = new TenoxUI({
    ...config,
    plugins: [Plugin({ plugins: starterPlugins })]
  })

  it('should getRules generated data from TenoxUI', () => {
    expect(getRules(ui.process('r1-1'))).toBe('.r1-1 { --my-rules: 1 }')
    expect(getRules(ui.process('r2-1'))).toBe('.r2-1 { --my-rules1: 1; --my-rules2: 1 }')

    expect(getRules(ui.process('r3'))).toBe('.r3 { --my-rules: red }')
    expect(ui.process('r3-1')[0].reason).toBe("r3 utility can't have value, and 1 is defined") // direct string rules can't have value
    expect(getRules(ui.process('r4-9 r4-9a'))).toBe(
      '.r4-9 { display: flex; &:after { display: block } position: absolute }\n.r4-9a { display: flex; &:after { display: block } position: absolute }'
    )

    expect(getRules(ui.process('r4-10'))).toBe('.r4-10 { --my-rules: 10 }')
    expect(getRules(ui.process('r4'))).toBe('.r4 { --tenox: 100% }')
    expect(getRules(ui.process('r4-1'))).toBe('.r4-1 { --my-rules: 1 }')
    expect(getRules(ui.process('r4-1a'))).toBe('.r4-1a { --my-rules: 1a }')
    expect(getRules(ui.process('r4-1b'))).toBe('.r4-1b { --my-rules1: 1b; --my-rules2: 1b }')
    expect(getRules(ui.process('r4-2'))).toBe('.r4-2 { --my-rules: 2 }')
    expect(getRules(ui.process('r4-3'))).toBe('.r4-3 { --my-rules: 3 }')
    expect(getRules(ui.process('r4-4'))).toBe('.r4-4 { --my-rules: 4 }')
    expect(getRules(ui.process('r4-4a'))).toBe('.r4-4a { --my-rules: 4a }')
    expect(getRules(ui.process('r4-4b'))).toBe('.r4-4b { --my-rules1: 4b; --my-rules2: 4b }')
    expect(getRules(ui.process('r4-5'))).toBe(
      '.r4-5 { --my-rules1: red; --my-rules2: blue; --my-rules3: yellow }'
    )
    expect(getRules(ui.process('r4-5a'))).toBe(
      '.r4-5a { --my-rules1: red; --my-rules2: blue; --my-rules3: yellow }'
    )

    expect(getRules(ui.process('r4-5b'))).toBe(
      '.r4-5b { --my-rules1: red; --my-rules1a: red; --my-rules2: blue; --my-rules3: yellow }'
    )
    expect(getRules(ui.process('r4-6'))).toBe(
      '.r4-6 { --my-rules1: red; --my-rules2: blue; --my-rules3: yellow; --my-rules4: yellow }'
    )

    expect(getRules(ui.process('r4-6a'))).toBe(
      '.r4-6a { --my-rules1: red; --my-rules2: blue; --my-rules3: yellow; --my-rules4: yellow }'
    )

    expect(getRules(ui.process('r4-6b'))).toBe(
      '.r4-6b { --my-rules1: red; --my-rules1a: red; --my-rules2: blue; --my-rules3: yellow; --my-rules4: yellow }'
    )

    expect(getRules(ui.process('r4-7 r4-8 r4-8a r4-8b'))).toBe(
      `.r4-7 { --my-rules1: 7; --my-rules2: 7 }\n.r4-8 { --my-rules1: 8; --my-rules2: 8 }\n.r4-8a { --my-rules1: 8a; --my-rules2: 8a }\n.r4-8b { --my-rules1: 8b; --my-rules1a: 8b; --my-rules2: 8b }`
    )
  })

  it('should handle utility with variant', () => {
    expect(getRules(ui.process('hover:r3'))).toBe('.hover\\:r3:hover { --my-rules: red }')
    expect(getRules(ui.process('dark:r3'))).toBe('.dark .dark\\:r3 { --my-rules: red }')
    expect(ui.process('max:r3')[0].variant).toBeFalsy()
    expect(getRules(ui.process('max-768px:r3'))).toBe(
      '@media (max-width: 768px) { .max-768px\\:r3 { --my-rules: red } }'
    )
  })
})

describe('Main Unit Test', () => {
  const config = {
    utilities: {
      r1: '--my-rules',
      r2: ['--my-rules1', '--my-rules2'],
      r3: '--my-rules: red',
      r4: (value) => {
        if (!value) return { '--tenox': '100%' }
        let rules = `--my-rules: ${value}`

        if (value === '1') return { '--my-rules': value }
        if (value === '1a') return { 'props:--my-rules': value }
        if (value === '1b') return { 'props:--my-rules1,--my-rules2': value }
        if (value === '2') {
          return {
            property: '--my-rules',
            value
          }
        }
        if (value === '3') {
          return {
            rules: { property: '--my-rules', value }
          }
        }
        if (value === '4') {
          return {
            rules: { '--my-rules': value }
          }
        }
        if (value === '4a') {
          return {
            rules: { 'props:--my-rules': value }
          }
        }
        if (value === '4b') {
          return {
            rules: { 'props:--my-rules1,--my-rules2': value }
          }
        }
        if (value === '5') {
          return [{ '--my-rules1': 'red' }, '--my-rules2: blue', ['--my-rules3', 'yellow']]
        }
        if (value === '5a') {
          return [{ 'props:--my-rules1': 'red' }, '--my-rules2: blue', ['--my-rules3', 'yellow']]
        }
        if (value === '5b') {
          return [
            { 'props:--my-rules1,--my-rules1a': 'red' },
            '--my-rules2: blue',
            ['--my-rules3', 'yellow']
          ]
        }
        if (value === '6') {
          return {
            rules: [
              { '--my-rules1': 'red' },
              '--my-rules2: blue',
              [['--my-rules3', '--my-rules4'], 'yellow']
            ]
          }
        }
        if (value === '6a') {
          return {
            rules: [
              { 'props:--my-rules1': 'red' },
              '--my-rules2: blue',
              [['--my-rules3', '--my-rules4'], 'yellow']
            ]
          }
        }
        if (value === '6b') {
          return {
            rules: [
              { 'props:--my-rules1,--my-rules1a': 'red' },
              '--my-rules2: blue',
              [['--my-rules3', '--my-rules4'], 'yellow']
            ]
          }
        }
        if (value === '7') {
          return [
            { property: '--my-rules1', value },
            { property: '--my-rules2', value }
          ]
        }
        if (value === '8') {
          return [{ '--my-rules1': value }, { '--my-rules2': value }]
        }
        if (value === '8a') {
          return [{ 'props:--my-rules1': value }, { '--my-rules2': value }]
        }
        if (value === '8b') {
          return [{ 'props:--my-rules1,--my-rules1a': value }, { '--my-rules2': value }]
        }
        if (value === '9') {
          return 'display: flex; &:after { display: block } position: absolute'
        }
        if (value === '9a') {
          return ['display: flex', '&:after { display: block }', 'position: absolute']
        }

        return rules
      }
    },
    variants: {
      hover: '&:hover',
      dark: '.dark &',
      max: (value) => Boolean(value) && `@media (max-width: ${value}) { @slot }`
    }
  }

  let ui = init({
    ...config,
    plugins: starterPlugins
  })

  it('should getRules generated data from TenoxUI', () => {
    expect(ui.render('r1-1')).toBe('.r1-1 { --my-rules: 1 }')
    expect(ui.render('r2-1')).toBe('.r2-1 { --my-rules1: 1; --my-rules2: 1 }')

    expect(ui.render('r3')).toBe('.r3 { --my-rules: red }')
    expect(ui.getData('r3-1')[0].reason).toBe("r3 utility can't have value, and 1 is defined") // direct string rules can't have value
    expect(ui.render('r4-9 r4-9a')).toBe(
      '.r4-9 { display: flex; &:after { display: block } position: absolute }\n.r4-9a { display: flex; &:after { display: block } position: absolute }'
    )
    expect(ui.render('r4-10')).toBe('.r4-10 { --my-rules: 10 }')
    expect(ui.render('r4')).toBe('.r4 { --tenox: 100% }')
    expect(ui.render('r4-1')).toBe('.r4-1 { --my-rules: 1 }')
    expect(ui.render('r4-1a')).toBe('.r4-1a { --my-rules: 1a }')
    expect(ui.render('r4-1b')).toBe('.r4-1b { --my-rules1: 1b; --my-rules2: 1b }')
    expect(ui.render('r4-2')).toBe('.r4-2 { --my-rules: 2 }')
    expect(ui.render('r4-3')).toBe('.r4-3 { --my-rules: 3 }')
    expect(ui.render('r4-4')).toBe('.r4-4 { --my-rules: 4 }')
    expect(ui.render('r4-4a')).toBe('.r4-4a { --my-rules: 4a }')
    expect(ui.render('r4-4b')).toBe('.r4-4b { --my-rules1: 4b; --my-rules2: 4b }')
    expect(ui.render('r4-5')).toBe(
      '.r4-5 { --my-rules1: red; --my-rules2: blue; --my-rules3: yellow }'
    )
    expect(ui.render('r4-5a')).toBe(
      '.r4-5a { --my-rules1: red; --my-rules2: blue; --my-rules3: yellow }'
    )
    expect(ui.render('r4-5b')).toBe(
      '.r4-5b { --my-rules1: red; --my-rules1a: red; --my-rules2: blue; --my-rules3: yellow }'
    )
    expect(ui.render('r4-6')).toBe(
      '.r4-6 { --my-rules1: red; --my-rules2: blue; --my-rules3: yellow; --my-rules4: yellow }'
    )
    expect(ui.render('r4-6a')).toBe(
      '.r4-6a { --my-rules1: red; --my-rules2: blue; --my-rules3: yellow; --my-rules4: yellow }'
    )
    expect(ui.render('r4-6b')).toBe(
      '.r4-6b { --my-rules1: red; --my-rules1a: red; --my-rules2: blue; --my-rules3: yellow; --my-rules4: yellow }'
    )
    expect(ui.render('r4-7 r4-8 r4-8a r4-8b')).toBe(
      `.r4-7 { --my-rules1: 7; --my-rules2: 7 }\n.r4-8 { --my-rules1: 8; --my-rules2: 8 }\n.r4-8a { --my-rules1: 8a; --my-rules2: 8a }\n.r4-8b { --my-rules1: 8b; --my-rules1a: 8b; --my-rules2: 8b }`
    )
  })

  it('should handle utility with variant', () => {
    expect(ui.render('hover:r3')).toBe('.hover\\:r3:hover { --my-rules: red }')
    expect(ui.render('dark:r3')).toBe('.dark .dark\\:r3 { --my-rules: red }')
    expect(ui.getData('max:r3')[0].variant).toBeFalsy()
    expect(ui.render('max-768px:r3')).toBe(
      '@media (max-width: 768px) { .max-768px\\:r3 { --my-rules: red } }'
    )
  })
})
