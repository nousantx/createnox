# CreaTenox Plugin Utils

A complete and ready-to-use TenoxUI plugin template for quick plugin development.

## Features

- Built-in important mark support
- Default data transformer and quick style renderer
- Variant transformer
- Functional utilities and variants support
- Simplified APIs and hooks name for plugin development
- 5+ starter plugins example

## Usage Example

### Basic Usage

```javascript
import { TenoxUI } from '@tenoxui/core'
import { CreaTenoxPlugin } from 'createnoxui-plugin'

const ui = new TenoxUI({
  utilities: {
    bg: 'background'
  },
  plugins: [CreaTenoxPlugin(/* createnox config here */)]
})

console.log(ui.process('bg-red'))
```

Output :

```javascript
;[
  {
    use: 'createnox',
    className: 'bg-red',
    rules: { property: 'background', value: 'red' },
    isImportant: false,
    variant: null,
    raw: [
      /* ... */
    ]
  }
]
```

### Quick Renderer

```javascript
import { Main, starterPlugins as plugins } from 'createnoxui-plugin'

// Use createnox TenoxUI builder
const { ui } = Main({
  plugins,
  utilities: {
    // basic utility
    bg: 'background',
    // functional utility
    m: (val) => ({ margin: !isNaN(val) ? val * 0.25 + 'rem' : val })
  },
  variants: {
    // basic variants
    hover: '&:hover',
    md: '@media (width: 768px) { @slot }',
    // functional variant
    max: (value) => `@media (max-width: ${value}) { @slot }`
  }
})

console.log(ui.render('bg-red m-10 m-10px !bg-blue hover:m-3.5 !md:m-100 max-560px:m-4!'))
```

Output :

```
.bg-red { background: red }
.m-10 { margin: 2.5rem }
.m-10px { margin: 10px }
.\!bg-blue { background: blue !important }
.hover\:m-3\.5:hover { margin: 0.875rem }
@media (width: 768px) { .\!md\:m-100 { margin: 25rem !important } }
@media (max-width: 560px) { .max-560px\:m-4\! { margin: 1rem !important } }
```

## License

[MIT](./LICENSE) © 2025 NOuSantx
