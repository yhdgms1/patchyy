import type { PatchyyConfig, PatchyyTarget } from './types'

import { resolve } from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'
import { NEW_LINE, NEW_LINE_REGEX, EMPTY_STRING } from './constants'
import { unwrap } from './helpers'

const apply = (source: string, target: PatchyyTarget) => {
	if ('at' in target) {
		const index = unwrap(target.at) - 1
		const lines = source.split(NEW_LINE_REGEX)

		lines[index] = target.patch(lines[index])

		return lines.join(NEW_LINE)
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

/**
 * Base class of Patchyy
 * @param config Array of PatchyyTarget
 */
const Patchyy = class {
	config: PatchyyConfig

	constructor(config: PatchyyConfig = []) {
		this.config = config
	}

	/**
	 * Method to resolve `id`'s
	 */
	public resolve(id: string): string {
		return resolve('./node_modules', id)
	}

	/**
	 * Start patching
	 */
	public async patch() {
		const init: Record<string, PatchyyTarget[]> = {}
		const config = this.config.reduce((acc, curr) => {
			const id = this.resolve(curr.id);

			return (acc[id] || (acc[id] = [])).push(curr), acc;
		}, init)

		for (const [path, entries] of Object.entries(config)) {
			let value = await readFile(path, 'utf8')

			for (const target of entries) {
				value = apply(value, target) || EMPTY_STRING
			}

			await writeFile(path, value, 'utf8')
		}
	}
}

export { Patchyy }
export type { PatchyyConfig, PatchyyTarget }
