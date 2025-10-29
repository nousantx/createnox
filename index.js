import {
  Main,
  starterPlugins as plugins,
  createResult as pass,
  isImportant,
  transform
} from './dist/index.js'

const ui = Main({
  plugins,
  utilities: {
    bg: 'background',
    bg2: ['background', 'color', 'display: flex', ['display', 'flex', true]],
    m: (value) => ({
      className: { suffix: ':not(div) + * + *' },
      rules: { margin: value * 0.25 + 'rem' }
    })
  },
  aliases: {
    'my-tes': 'bg-red m-10 retro-3'
  },
  variants: {
    hover: '&:hover',
    md: '@media (width: 768px) { @slot }',
    max: (value) => `@media (max-width: ${value}) { @slot }`
  }
})

const classList =
  'bg-red hover:bg-blue md:bg-yellow max-768px:bg-green !bg-red !hover:bg-blue !md:bg-yellow !max-768px:bg-green m-10 !max-1080px:m-1000'
const iteration = 10000
const classes = (classList + ' ').repeat(iteration)

console.log(classList.split(' ').length * iteration + ' class names process and render result :')

const runs = 5
const dataTimes = []
const styleTimes = []

for (let i = 0; i < runs; i++) {
  // Measure data generation
  const startData = performance.now()
  const data = ui.getData(classes)
  const endData = performance.now()
  const dataTime = endData - startData
  console.log('generate data time ' + (i + 1) + ': ', dataTime)
  dataTimes.push(dataTime)

  const startStyle = performance.now()
  const css = transform(ui.getData(classes)).rules.join('\n')
  const endStyle = performance.now()
  const styleTime = endStyle - startStyle
  console.log('render time ' + (i + 1) + ': ', styleTime)
  styleTimes.push(styleTime)
}

// Compute averages
const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length

console.log(`Average data generation time: ${avg(dataTimes).toFixed(2)}ms`)
console.log(`Average style generation time: ${avg(styleTimes).toFixed(2)}ms`)

/*
data = ui.getData(classes)
css = ui.render(classes)
console.log(data, data.length)
console.log(ui.render(classes))
console.log(ui.main.matcher)
*/

console.log(ui.getData(classList))
console.log(transform(ui.getData(classList)).rules.join('\n'))
