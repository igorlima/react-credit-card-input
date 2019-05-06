import babel from 'rollup-plugin-babel';

const globals = {
  react: 'React',
  payment: 'payment',
  'credit-card-type': 'creditCardType',
  'styled-components': 'styled'
};

const external = [
  'react',
  'credit-card-type',
  'payment',
  'styled-components'
];

const plugins = [
  babel({
    presets: [['env', { modules: false }], 'react', 'flow'],
    plugins: [
      'external-helpers',
      'transform-class-properties',
      'transform-object-rest-spread'
    ]
  })
]

export default [{
  input: `${__dirname}/src/index.js`,
  output: {
    name: 'CreditCardInput',
    file: `${__dirname}/lib/index.js`,
    format: 'umd',
    globals
  }
}].map(output => Object.assign(output, {external, plugins, sourcemap: true}));
