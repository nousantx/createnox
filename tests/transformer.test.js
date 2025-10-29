import { describe, it, expect } from 'vitest'
import { transform } from '../src/lib/transformer.js'

describe('Transformer', () => {
  it('should transform basic process results', () => {
    const input = [
      {
        use: 'createnox',
        className: 'bg-red',
        rules: { property: 'background-color', value: 'red' },
        variant: null,
        isImportant: false,
        raw: ['bg-red', '', 'bg', 'red']
      },
      {
        use: 'createnox',
        className: {
          raw: 'bg-red',
          suffix: ' + *'
        },
        rules: { property: 'background-color', value: 'red' },
        variant: '&:hover',
        isImportant: false,
        raw: ['bg-red', '', 'bg', 'red']
      },
      {
        use: 'createnox',
        className: {
          raw: 'bg-red',
          suffix: ' + *',
          prefix: 'body '
        },
        rules: { property: 'background-color', value: 'red' },
        variant: '&:hover',
        isImportant: false,
        raw: ['bg-red', '', 'bg', 'red']
      },
      {
        use: 'createnox',
        className: {
          raw: 'bg-red',
          suffix: ' + *.bg-red',
          prefix: 'body '
        },
        rules: { property: 'background-color', value: 'red' },
        variant: '&:hover',
        isImportant: false,
        raw: ['bg-red', '', 'bg', 'red']
      },
      {
        use: 'createnox',
        className: { suffix: ' + *' },
        rules: { property: 'background-color', value: 'red' },
        variant: '&:hover',
        isImportant: false,
        raw: ['hover:bg-red', '', 'bg', 'red']
      },
      {
        use: 'createnox',
        className: { suffix: ' + *', prefix: '.createnox ' },
        rules: { property: 'background-color', value: 'red' },
        variant: '&:hover',
        isImportant: false,
        raw: ['hover:bg-red', '', 'bg', 'red']
      },
      {
        use: 'createnox',
        className: { suffix: ' + *', prefix: '.createnox ' },
        rules: { property: 'background-color', value: 'red' },
        variant: '@media (width: 768px) { @slot }',
        isImportant: false,
        raw: ['bg-red', '', 'bg', 'red']
      },
      {
        use: 'createnox',
        className: { suffix: ' + *', prefix: '.createnox ' },
        rules: { property: 'background-color', value: 'red' },
        variant: '@media (width: 768px) { @class:hover { :focus { @rules } } }',
        isImportant: false,
        raw: ['bg-red', '', 'bg', 'red']
      }
    ]

    const result = transform(input)

    expect(result.rules).toHaveLength(8)
    expect(result.invalid.createnox).toHaveLength(0)
    expect(result.rules[0]).toContain('.bg-red')
    expect(result.rules[0]).toContain('background-color: red')
    expect(result.rules[1]).toContain('.bg-red:hover + *')
    expect(result.rules[2]).toContain('body .bg-red:hover + *')
    expect(result.rules[3]).toContain('body .bg-red:hover + *.bg-red:hover')
    expect(result.rules[4]).toContain('.hover\\:bg-red:hover + *')
    expect(result.rules[5]).toContain('.createnox .hover\\:bg-red:hover + *')
    expect(result.rules[6]).toBe(
      '@media (width: 768px) { .createnox .bg-red + * { background-color: red } }'
    )
    expect(result.rules[7]).toBe(
      '@media (width: 768px) { .createnox .bg-red + *:hover { :focus { background-color: red } } }'
    )
  })

  it('should transform results with variants', () => {
    const input = [
      {
        use: 'createnox',
        className: 'hover:bg-blue',
        rules: { property: 'background-color', value: 'blue' },
        variant: '&:hover',
        isImportant: false,
        raw: ['hover:bg-blue', 'hover', 'bg', 'blue']
      }
    ]

    const result = transform(input)

    expect(result.rules).toHaveLength(1)
    expect(result.rules[0]).toContain(':hover')
    expect(result.rules[0]).toBe('.hover\\:bg-blue:hover { background-color: blue }')
  })

  it('should handle important rules', () => {
    const input = [
      {
        use: 'createnox',
        className: '!bg-red',
        rules: { property: 'background-color', value: 'red' },
        variant: null,
        isImportant: true,
        raw: ['!bg-red', '', 'bg', 'red']
      }
    ]

    const result = transform(input)

    expect(result.rules[0]).toContain('!important')
  })

  it('should handle invalid results', () => {
    const input = [
      {
        use: 'createnox',
        className: 'invalid',
        rules: null,
        variant: null,
        isImportant: false,
        raw: ['invalid']
      }
    ]

    const result = transform(input)

    expect(result.rules).toHaveLength(0)
    expect(result.invalid.createnox).toHaveLength(1)
  })

  it('should handle results with variant prefix but no variant', () => {
    const input = [
      {
        use: 'createnox',
        className: 'unknown:bg-red',
        rules: { property: 'background-color', value: 'red' },
        variant: null,
        isImportant: false,
        raw: ['unknown:bg-red', 'unknown', 'bg', 'red']
      }
    ]

    const result = transform(input)

    expect(result.rules).toHaveLength(0)
    expect(result.invalid.createnox).toHaveLength(1)
  })

  it('should handle non-createnox results', () => {
    const input = [
      {
        use: 'other',
        className: 'other-class',
        rules: { property: 'color', value: 'blue' },
        variant: null,
        isImportant: false,
        raw: []
      }
    ]

    const result = transform(input)

    expect(result.rules).toHaveLength(0)
    expect(result.invalid.rest).toHaveLength(1)
  })

  it('should handle string rules', () => {
    const input = [
      {
        use: 'createnox',
        className: 'custom',
        rules: 'color: red; background: blue',
        variant: null,
        isImportant: false,
        raw: ['custom']
      }
    ]

    const result = transform(input)

    expect(result.rules).toHaveLength(1)
    expect(result.rules[0]).toContain('.custom { color: red; background: blue }')
  })

  it('should handle array property rules', () => {
    const input = [
      {
        use: 'createnox',
        className: 'multi',
        rules: { property: ['margin-top', 'margin-bottom'], value: '10px' },
        variant: null,
        isImportant: false,
        raw: ['multi']
      }
    ]

    const result = transform(input)

    expect(result.rules).toHaveLength(1)
    expect(result.rules[0]).toContain('margin-top: 10px')
    expect(result.rules[0]).toContain('margin-bottom: 10px')
  })
})
