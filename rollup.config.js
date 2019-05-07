import babel from 'rollup-plugin-babel';
// https://github.com/rollup/rollup/issues/346
import resolve from 'rollup-plugin-node-resolve';

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
  resolve({}),
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
}, {
  input: `${__dirname}/src/hooks/use-credit-card-input.js`,
  output: {
    name: 'useCreditCardInput',
    file: `${__dirname}/lib/useCreditCardInput.js`,
    format: 'umd',
    globals
  }
}].map(output => Object.assign(output, {external, plugins, sourcemap: true}));
