// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    {
        ignores: [
            'dist',
            'node_modules',
            '*.config.mjs',
            '*.config.js',
            '**/*.spec.ts',
            '**/*.test.ts',
            '**/__tests__/**',
            '**/tests/**',
        ],
        languageOptions: {
            parserOptions: {
                tsconfigRootDir: import.meta.dirname,
                project: ['./tsconfig.json'],
            },
        },
    },
);

// import js from '@eslint/js';
// import tseslint from '@typescript-eslint/eslint-plugin';
// import tsparser from '@typescript-eslint/parser';

// export default [
//     // Global ignores
//     {
//         ignores: [
//             'dist/**',
//             'node_modules/**',
//             'coverage/**',
//             '*.config.js',
//             '*.config.mjs',
//         ],
//     },

//     // Base configuration for all files
//     js.configs.recommended,

//     // Main config for TypeScript source files
//     {
//         files: ['src/**/*.ts', 'src/**/*.tsx'],
//         languageOptions: {
//             parser: tsparser,
//             parserOptions: {
//                 ecmaVersion: 'latest',
//                 sourceType: 'module',
//                 project: './tsconfig.json',
//             },
//         },
//         plugins: {
//             '@typescript-eslint': tseslint,
//         },
//         rules: {
//             // TypeScript specific rules
//             '@typescript-eslint/no-unused-vars': 'error',
//             '@typescript-eslint/no-explicit-any': 'warn',
//             '@typescript-eslint/explicit-function-return-type': 'warn',
//             '@typescript-eslint/no-non-null-assertion': 'error',
//             '@typescript-eslint/prefer-const': 'error',
//             '@typescript-eslint/no-inferrable-types': 'warn',

//             // General rules
//             'no-console': 'warn',
//             'no-debugger': 'error',
//             'prefer-const': 'error',
//             'no-var': 'error',
//             'eqeqeq': 'error',
//             'curly': 'error',
//         },
//     },

//     // Separate config for test files with relaxed rules
//     {
//         files: ['**/*.spec.ts', '**/*.test.ts', '**/__tests__/**/*.ts'],
//         languageOptions: {
//             parser: tsparser,
//             parserOptions: {
//                 ecmaVersion: 'latest',
//                 sourceType: 'module',
//                 project: './tsconfig.json',
//             },
//         },
//         plugins: {
//             '@typescript-eslint': tseslint,
//         },
//         rules: {
//             // Relaxed rules for tests
//             '@typescript-eslint/no-explicit-any': 'off',
//             '@typescript-eslint/no-non-null-assertion': 'off',
//             '@typescript-eslint/explicit-function-return-type': 'off',
//             'no-console': 'off',

//             // Still keep some important rules
//             '@typescript-eslint/no-unused-vars': 'warn',
//             'no-debugger': 'error',
//         },
//     },

//     // Config for JavaScript files (if any)
//     {
//         files: ['**/*.js', '**/*.mjs'],
//         languageOptions: {
//             ecmaVersion: 'latest',
//             sourceType: 'module',
//         },
//         rules: {
//             'no-unused-vars': 'warn',
//             'no-console': 'warn',
//             'prefer-const': 'error',
//             'no-var': 'error',
//         },
//     },
// ];
