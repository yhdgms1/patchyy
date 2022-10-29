import { resolve } from 'node:path'
import { open } from 'node:fs/promises'

const NEW_LINE_REGEX = /\r?\n/;
const NEW_LINE = '\n';
const EMPTY_STRING = '';

type ValueOr<T> = T extends T & Function ? never : T | (() => T)

const unwrap = <T>(val: ValueOr<T>): T => {
	return typeof val === 'function' ? val() : val
}

const apply = (source: string, target: PatchyyTarget) => {
	if ('at' in target) {
		const index = unwrap(target.at) - 1
		const lines = source.split('\n')

		lines[index] = target.patch(lines[index])

		return lines.join('\n')
	} else if ('find' in target) {
		return source.replace(unwrap(target.find), target.patch)
	} else if ('range' in target) {
		const [start, end] = target.range

		if (target.line) {
			const lines = source.split(NEW_LINE_REGEX)
			const content = lines.slice(start, end).join(NEW_LINE)

			const patched = target.patch(content)

			const part0 = lines.slice(0, start).join(NEW_LINE)
			const part1 = lines.slice(end, lines.length).join(NEW_LINE)

			return part0 + NEW_LINE + patched + NEW_LINE + part1
		} else {
			const content = source.substring(start, end)

			const part0 = source.substring(0, start)
			const part1 = source.substring(end, source.length)

			return part0 + target.patch(content) + part1
		}
	} else if ('raw' in target) {
		return target.patch(source)
	}
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

interface PatchyyBaseTarget {
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

type PatchyyTarget = PatchyyBaseTarget & PatchyyConfigModifiers;
type PatchyyConfig = readonly PatchyyTarget[]

const Patchyy = class {
	private config: PatchyyConfig

	constructor(config: PatchyyConfig = []) {
		this.config = config
	}

	public resolve(id: string): string {
		return resolve('./node_modules', id)
	}

	public async patch() {
		const init: Record<string, PatchyyTarget[]> = {}
		const config = this.config.reduce((acc, curr) => {
			const id = this.resolve(curr.id);

			if (!acc[id]) acc[id] = [];

			acc[id].push(curr);

			return acc;
		}, init);

		for (const [id, entries] of Object.entries(config)) {
			const file = await open(id, 'r+')
			const source = await file.readFile('utf8')

			let value = source;

			for (const target of entries) {
				value = apply(value, target) || EMPTY_STRING
			}

			await file.writeFile(value, 'utf8')
			await file.close()
		}
	}
}

const CustomPatchyy = class extends Patchyy {
	public resolve(id: string): string {
		return resolve('./', id);
	}
}

const patchyy = new CustomPatchyy([
	// {
	// 	id: '@babel/core/lib/config/config-descriptors.js',
	// 	at: 61,
	// 	patch(line) {
	// 		return line.replace(
	// 			'optionsWithResolvedBrowserslistConfigFile(options, dirname)',
	// 			'options'
	// 		)
	// 	},
	// },
	// {
	// 	id: '@babel/core/lib/config/config-chain.js',
	// 	find() {
	// 		return '(babelrc === true || babelrc === undefined) && typeof context.filename === "string"'
	// 	},
	// 	patch() {
	// 		return 'false'
	// 	},
	// },
	// {
	// 	id: '@babel/core/lib/config/helpers/config-api.js',
	// 	range: [75, 104],
	// 	line: true,
	// 	patch() {
	// 		return ''
	// 	},
	// },
	// {
	// 	id: '@babel/core/lib/config/helpers/config-api.js',
	// 	range: [1, 14],
	// 	patch() {
	// 		return ''
	// 	},
	// },
	{
		id: 'test.js',
		range: [3, 8],
		patch(content) {
			return content + ' world';
		}
	},
	{
		id: 'test.js',
		range: [7, 10],
		line: true,
		patch() {
			return '';
		}
	}
])

patchyy.patch()
