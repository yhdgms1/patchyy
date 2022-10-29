import { resolve } from 'node:path'
import { open } from 'node:fs/promises'

type ValueOr<T> = T extends T & Function ? never : T | (() => T)

const unwrap = <T>(val: ValueOr<T>): T => {
	return typeof val === 'function' ? val() : val
}

interface PatchyyFindTarget {
	/**
	 * Найти, и заменить
	 */
	readonly find: ValueOr<string | RegExp>
	readonly patch: (match: string) => string
}

interface PatchyyLineTarget {
	/**
	 * Строка, в которой будет произведена замена
	 */
	readonly at: ValueOr<number>
	readonly patch: (line: string) => string
}

interface PatchyyRangeTarget {
	/**
	 * Диапазон
	 */
	readonly range: [number, number]
	/**
	 * Диапазон в строках
	 */
	readonly line?: boolean
	readonly patch: (str: string) => string
}

interface PatchyyRawTarget {
	readonly raw: true;
	readonly patch: (file: string) => string;
}

interface PatchyyTarget {
	/**
	 * Файл, в котором будут произведены операции изменения
	 */
	readonly id: string
}

type PatchyyConfigModifiers =
	| PatchyyLineTarget
	| PatchyyFindTarget
	| PatchyyRangeTarget
	| PatchyyRawTarget

type PatchyyConfig = readonly (PatchyyTarget & PatchyyConfigModifiers)[]

const Patchyy = class {
	private config: PatchyyConfig

	constructor(config: PatchyyConfig = []) {
		this.config = config
	}

	public resolve(id: string): string {
		return resolve('./node_modules', id)
	}

	public async patch() {
		for (const target of this.config) {
			const id = this.resolve(target.id)

			const file = await open(id, 'r+')
			const source = await file.readFile('utf8')

			let value = ''

			if ('at' in target) {
				const index = unwrap(target.at) - 1
				const lines = source.split('\n')

				lines[index] = target.patch(lines[index])

				value = lines.join('\n')
			} else if ('find' in target) {
				value = source.replace(unwrap(target.find), target.patch)
			} else if ('range' in target) {
				const [start, end] = target.range

				const separator = target.line ? '\n' : ''

				const lines = source.split(separator)
				const content = lines.slice(start - 1, end).join(separator)

				const patched = target.patch(content)

				const part0 = lines.slice(0, start - 1).join(separator)
				const part1 = lines.slice(end, lines.length).join(separator)

				value = part0 + separator + patched + separator + part1
			} else if ('raw' in target) {
				value = target.patch(source);
			}

			await file.writeFile(value, 'utf8')
			await file.close()
		}
	}
}

const patchyy = new Patchyy([
	{
		id: '@babel/core/lib/config/config-descriptors.js',
		at: 61,
		patch(line) {
			return line.replace(
				'optionsWithResolvedBrowserslistConfigFile(options, dirname)',
				'options'
			)
		},
	},
	{
		id: '@babel/core/lib/config/config-chain.js',
		find() {
			return '(babelrc === true || babelrc === undefined) && typeof context.filename === "string"'
		},
		patch() {
			return 'false'
		},
	},
	{
		id: '@babel/core/lib/config/helpers/config-api.js',
		range: [75, 104],
		line: true,
		patch() {
			return ''
		},
	},
	{
		id: '@babel/core/lib/config/helpers/config-api.js',
		range: [1, 14],
		patch() {
			return ''
		},
	},
])

patchyy.patch()
