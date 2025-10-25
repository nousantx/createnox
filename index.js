import {
  Main,
  starterPlugins as plugins,
  createResult as pass,
  isImportant,
  directRulesUtilityPlugin
} from './dist/index.js'

const ui = Main({
  plugins: [
    directRulesUtilityPlugin({
      'my-custom-class': ['display: flex']
    }),
    ...plugins
  ],
  utilities: {
    bg: 'background',
    retro: (value) => {
      return [
        '&:focus { display: flex }',
        {
          position: 'relative',
          padding: value * 0.25 + 'rem'
        }
      ]
    },
    m: (margin) => ({ className: { suffix: ':not(div) + * + *' }, rules: { margin } })
  },
  variants: {
    hover: '&:hover',
    md: '@media (width: 768px) { @slot }'
  }
})

const classes =
  'bg-red hover:bg-blue retro-4 hover:my-custom-class !my-custom-class !hover:my-custom-class md:my-custom-class !md:my-custom-class text-red !text-red hover:text-red m-10px!'

const data = ui.getData(classes)
console.log(data, data.length)
console.log(ui.render(classes))
console.log(ui.main.matcher)
