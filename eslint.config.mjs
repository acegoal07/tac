import oclif from 'eslint-config-oclif';
import prettier from 'eslint-config-prettier';
import unusedImports from 'eslint-plugin-unused-imports';
import { defineConfig } from 'eslint/config';

export default defineConfig(
   {
      ignores: ['bin/**', 'dist/**', 'node_modules/**']
   },
   ...oclif,
   prettier,
   {
      plugins: {
         'unused-imports': unusedImports
      },
      rules: {
         '@typescript-eslint/no-unused-vars': 'off',
         'unicorn/consistent-class-member-order': 'off',
         'unicorn/prefer-module': 'off',
         'unused-imports/no-unused-imports': 'error'
      }
   }
);
