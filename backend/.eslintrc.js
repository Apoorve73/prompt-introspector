module.exports = {
    env: {
        browser: false,
        es2022: true,
        node: true,
        jest: true,
    },
    extends: [
        'eslint:recommended',
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    rules: {
        // Error prevention
        'no-console': 'warn',
        'no-debugger': 'error',
        'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'no-undef': 'error',

        // Code style
        'indent': ['error', 2],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'comma-dangle': ['error', 'always-multiline'],
        'object-curly-spacing': ['error', 'always'],
        'array-bracket-spacing': ['error', 'never'],

        // Best practices
        'prefer-const': 'error',
        'no-var': 'error',
        'no-duplicate-imports': 'error',
        'no-useless-return': 'error',
        'no-useless-escape': 'error',
        'prefer-template': 'error',

        // Async/await
        'no-async-promise-executor': 'error',
        'no-await-in-loop': 'warn',
        'prefer-promise-reject-errors': 'error',

        // Security
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-new-func': 'error',
    },
    globals: {
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
    },
};