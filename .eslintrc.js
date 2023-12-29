module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    '@react-native',
    'prettier',
  ],
  plugins: ['prettier'],
  rules: {
    curly: ['error', 'multi-line'],
    'react-native/no-inline-styles': 'off',
    'react/jsx-curly-brace-presence': [
      1,
      {props: 'never', children: 'ignore', propElementValues: 'always'},
    ],
  },
};
