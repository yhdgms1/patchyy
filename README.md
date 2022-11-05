# patchyy

Patch code programmable! This module is not about quick fixes, but about permanent ⌛ small changes

## Usage

```ts
import { Patchyy } from 'patchyy';

const patchyy = new Patchyy([
	{
		id: '@babel/core/lib/config/config-descriptors.js',
		at: 61, // at sixty-first line
		patch(line) {
			return line.replace(
				'optionsWithResolvedBrowserslistConfigFile(options, dirname)',
				'options'
			)
		},
	},
	{
		id: '@babel/core/lib/config/config-chain.js',
		find() { // find this
			return '(babelrc === true || babelrc === undefined) && typeof context.filename === "string"'
		},
		patch() {
			return 'false' // and replace to this
		},
	},
	{
		id: '@babel/core/lib/config/helpers/config-api.js',
		range: [0, 13], // from character at [0] upto [13]
		patch() {
			return ''
		},
	},
    {
		id: '@babel/core/lib/config/helpers/config-api.js',
		range: [74, 104], // from *line* 74 upto 104
		line: true,
		patch() {
			return '';
		},
	},
    {
        id: '@babel/core/lib/index.js',
        raw: true, // whole file
        patch(code) {
            return code.replace('const version = "7.19.6";', 'const version = "8.0.0";')
        }
    }
]);

// Run!!
patchyy.patch();
```

## Overriding default `id` resolving method

```ts
const MyPatchyy = class extends Patchyy {
	resolve(id: string) {
		return super.resolve(id) + '.js';
	}
}
```
