import tseslint from 'typescript-eslint';
import obsidianmd from 'eslint-plugin-obsidianmd';
import globals from 'globals';
import { defineConfig, globalIgnores } from 'eslint/config';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig(
	globalIgnores([
		'node_modules',
		'build',
		'main.js',
		'styles.css',
	]),
	{
		languageOptions: {
			globals: {
				...globals.browser,
			},
			parserOptions: {
				projectService: {
					allowDefaultProject: ['eslint.config.mts', 'manifest.json', 'esbuild.config.mjs', 'version-bump.mjs'],
				},
				tsconfigRootDir,
				extraFileExtensions: ['.json'],
			},
		},
	},
	...tseslint.configs.recommended,
	{
		rules: {
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
			'@typescript-eslint/ban-ts-comment': 'off',
			'no-prototype-builtins': 'off',
			'@typescript-eslint/no-empty-function': 'off',
		},
	},
	...obsidianmd.configs.recommended,
	{
		files: ['tests/**/*.ts'],
		rules: {
			'obsidianmd/prefer-window-timers': 'off',
			'@microsoft/sdl/no-inner-html': 'off',
		},
	},
);
