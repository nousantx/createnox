# CreaTenox Plugin Utils

A complete and ready-to-use TenoxUI plugin template for quick plugin development.

## Features

- Built-in important mark support
- Default data transformer and quick style renderer
- Variant transformer
- Functional utilities and variants support
- Simplified APIs and hooks name for plugin development

## Usage Example

### Basic Usage

```javascript
import { TenoxUI } from '@tenoxui/core'
import { Plugin } from 'createnoxui-plugin'

const ui = new TenoxUI({
  utilities: {
    bg: 'background'
  },
  plugins: [Plugin(/* createnox config here */)]
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
import { init, starterPlugins as plugins } from 'createnoxui-plugin'

// Use createnox TenoxUI builder
const { ui } = init({
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

## APIs

### Available Exports

<details>
<summary>Main Exports</summary>

```javascript
import {
  init,
  Plugin,
  Plugin,
  starterPlugins,
  transform,
  Renderer,
  createResult,
  createErrorResult
} from 'createnoxui-plugin'
```

</details>

### `init`

A ready to use styler with `TenoxUI`, `Renderer`, and `transformer` included, giving you quick style generation without much configuration. Configuration options :

```javascript
function init({
  utilities = {},
  variants = {},
  aliases = {},
  apply = {},
  plugins = [],
  corePlugins = [],
  importantMark = 'both',
  renderOutputParent = ''
}) {
  /* ... */
}
```

- `utilities` - Define your utility rules here (e.g. `{ bg: 'background' }`)
- `variants` - Define your variant rules here (e.g. `{ hover: '&:hover' }`)
- `aliases` - Define your aliases that allow you to apply multiple classes into single utility (e.g. `{ 'my-class': 'bg-red hover:bg-blue' }`)
- `apply` - Same as aliases, but it will create rules for certain selector and rendered immediately (e.g. `{ body: 'bg-red' }`)
- `plugins` - Pass plugins for `Plugin` here
- `corePlugins` - Pass plugins for `TenoxUI` here
- `importantMark` - Where should the exclamation mark (`!`) allowed in the class names (available options: `both`: allow start and end, `start`: only start, `end`: only end. default: `both`)
- `renderOutputParent` - The rendered style nested parent

Usage Example :

```javascript
import { init } from 'createnoxui-plugin'

const { ui, main, render, getData } = init({
  utilities: { bg: 'background' },
  variants: { hover: '&:hover' }
  // other configuration
})
```

#### `ui`

Quick style renderer you can use that built on top of the [`Renderer`](#renderer) module. Usage Example :

```javascript
console.log(ui.render('bg-red hover:bg-blue !hover:bg-yellow'))
```

Output :

```
.bg-red { background: red }
.hover\:bg-blue:hover { background: blue }
.\!hover\:bg-yellow:hover { background: yellow !important }
```

#### `main`

The TenoxUI instnace that passed to the `ui` (`Renderer`). Example usage :

```javascript
console.log(main.process('bg-red hover:bg-blue !hover:bg-yellow'))
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
  },
  {
    use: 'createnox',
    className: 'hover:bg-blue',
    rules: { property: 'background', value: 'blue' },
    isImportant: false,
    variant: '&:hover',
    raw: [
      /* ... */
    ]
  },
  {
    use: 'createnox',
    className: '!hover:bg-yellow',
    rules: { property: 'background', value: 'yellow' },
    isImportant: true,
    variant: '&:hover',
    raw: [
      /* ... */
    ]
  }
]
```

#### `render` and `getData`

Just a reference to `Renderer.render` and `TenoxUI.process`

### `Plugin` & `Plugin`

A single, configurable main `cratenox` plugin you ever need. Example Usage :

```javascript
import { TenoxUI } from '@tenoxui/core'
import { Plugin } from 'createnoxui-plugin'

const ui = new TenoxUI({
  plugins: [
    Plugin({
      /* configuration here */
    })
  ]
})
```

#### Configuration Options

- `importantMark` - Same description in the `init` function
- `aliases` - The aliases for main `Renderer`, will be passed to the matcher's utility pattern
- `plugins` - Plugin inside plugin? Hell yeah. It offers simplified methods and APIs for creating TenoxUI plugins

#### `Plugins`'s Plugins

The `plugins` option offer simplified APIs for you to use for creating TenoxUI plugin. Example :

- Modify matcher easily

```javascript
import { TenoxUI } from '@tenoxui/core'
import { Plugin } from 'createnoxui-plugin'

const ui = new TenoxUI({
  utilities: { bg: '...' },
  plugins: [
    Plugin({
      importantMark: 'none',
      plugins: [
        {
          name: 'add-matcher',
          regexp: () => ({ utility: ['my-class', '\\[[^\\]]+\\]+'] })
        }
      ]
    })
  ]
})

console.log(ui.matcher)
```

Output :

```
/^(?:(?<variant>[\w.-]+):)?(?<utility>bg|my-class|\[[^\]]+\]+)(?:-(?<value>[\w.-]+?))?$/
```

And without `createnox` plugin, you have to write this to get the same output :

```javascript
const ui = new TenoxUI({
  utilities: { bg: '...' },
  plugins: [
    {
      name: 'add-matcher',
      regexp: ({ patterns }) => ({
        patterns: {
          utility: patterns.utility + '|my-class|\\[[^\\]]+\\]+'
        }
      })
    }
  ]
})
```

The `Plugin` also support more hooks that'll passed to `TenoxUI` such as `init` for `onInit`, `utility` for `processUtilities`, `value` for `processValue`, and `variant` for `processVariant`.

Find plugin implementation examples [here](./examples/plugins).

### `starterPlugins`

A curated started plugins for `Plugin` or `Plugin`. What's inside :

- `basicUtilityProcessorPlugin` - Default, basic TenoxUI data-to-createnox transformer
- `functionalUtilityPlugin` - Basic functional utility support
- `functionalVariant` - Functional variant support
- `arbitraryValuePlugin` - Arbitrary value support

Example usage :

```javascript
import { init, starterPlugins as plugins } from 'createnoxui-plugin'

const ui = init({
  utilities: {
    // basic utilities {type: cssProperty}
    bg: 'background',

    // static utilities
    flex: 'display: flex; &:hover { display: grid }',
    'my-class': {
      position: 'fixed !important',
      background: ['red', true]
    },

    // functional utility
    m: (value) =>
      // must have `value`
      !value ? null : { margin: !isNaN(value) ? 0.25 * value + 'rem' : value }
  },

  variants: {
    // basic variants
    hover: '&:hover',
    md: '@media (width: 768px) {\n  @slot\n}',

    // functional variants
    max: (value) => `@media (max-width: ${value}) {\n  @slot\n}`,
    min: (value) => `@media (min-width: ${value}) {\n  @slot\n}`
  },

  plugins
})

console.log(
  ui.render([
    'bg-red',
    'flex',
    'my-class',
    'm-10',
    'm-10px',
    // with variants
    'hover:bg-red',
    'md:m-3.5',
    'max-768px:my-class',
    'min-768px:flex'
  ])
)
```

Output :

```
.bg-red { background: red }
.flex { display: flex; &:hover { display: grid } }
.my-class { position: fixed !important; background: red !important }
.m-10 { margin: 2.5rem }
.m-10px { margin: 10px }
.hover\:bg-red:hover { background: red }
@media (width: 768px) {
  .md\:m-3\.5 { margin: 0.875rem }
}
@media (max-width: 768px) {
  .max-768px\:my-class { position: fixed !important; background: red !important }
}
@media (min-width: 768px) {
  .min-768px\:flex { display: flex; &:hover { display: grid } }
}
```

### `transform`

CreaTenox default data-to-css transformer.

#### Basic Usage

`transform` function can be used directly to process data into CSS rules :

```javascript
import { transform } from 'createnoxui-plugin'

console.log(
  transform([
    // valid data
    {
      use: 'createnox',
      className: 'bg-red',
      rules: { property: 'background', value: 'red' },
      isImportant: true
    },
    // invalid data
    {
      use: 'createnox',
      className: 'my-class',
      rules: null
    },
    // invalid data (not createnox data)
    {
      className: 'hello'
    }
  ])
)
```

Output :

```javascript
{
  rules: [ ".bg-red { background: red !important }" ],
  invalid: {
    createnox: [ { use: "createnox", className: "my-class", rules: null } ],
    rest: [ { className: "hello" } ]
  }
}
```

#### Integration

Or you can make the TenoxUI generate the data for you :

```javascript
import { TenoxUI } from '@tenoxui/core'
import { Plugin, transform, starterPlugins as plugins } from 'createnoxui-plugin'

const ui = new TenoxUI({
  utilities: { bg: 'background' },
  variants: { hover: '&:hover' },
  plugins: [Plugin({ plugins })]
})

console.log(transform(ui.process(['bg-red', 'hover:bg-blue', '!hover:bg-yellow'])))
```

Output :

```javascript
{
  rules: [
    ".bg-red { background: red }",
    ".hover\\:bg-blue:hover { background: blue }",
    ".\\!hover\\:bg-yellow:hover { background: yellow !important }"
  ],
  invalid: { createnox: [], rest: [] }
}
```

### `Renderer`

A complete CSS renderer for `createnoxui-plugin` to use with ease. Usage example :

```javascript
import { TenoxUI } from '@tenoxui/core'
import { Plugin, Renderer, starterPlugins as plugins } from 'createnoxui-plugin'

const ui = new Renderer({
  main: new TenoxUI({
    utilities: { bg: 'background' },
    variants: { hover: '&:hover' },
    plugins: [Plugin({ plugins })]
  }),
  apply: { body: 'bg-red' },
  parent: 'html#nsx'
})

console.log(ui.render(['bg-red', 'hover:bg-blue', '!hover:bg-yellow']))
```

Output :

```
html#nsx {
  body { background: red }
  .bg-red { background: red }
  .hover\:bg-blue:hover { background: blue }
  .\!hover\:bg-yellow:hover { background: yellow !important }
}
```

### `createResult` & `createErrorResult`

Helper functions to generate supported data pattern for the `transformer`. Usage example :

```javascript
import {
  init,
  createResult as pass,
  createErrorResult as fail,
  transform
} from 'createnoxui-plugin'

const ui = init({
  plugins: [
    {
      name: 'create-data',
      regexp: () => ({ utility: ['class1', 'class2'] }),
      process(className) {
        if (className === 'class1') {
          return pass({ className, rules: { display: 'flex', color: 'blue' } })
        }
        if (className === 'class2') {
          return fail({ className })
        }
      }
    }
  ]
})

console.log(transform(ui.getData(['class1', 'class2'])))
```

Output :

```javascript
{
  rules: [ ".class1 { display: flex; color: blue }" ],
  invalid: {
    createnox: [
      {
        use: "createnox",
        className: "class2",
        rules: null,
        reason: "Unknown reason"
      }
    ],
    rest: []
  }
}
```

## License

[MIT](./LICENSE) © 2025 NOuSantx
