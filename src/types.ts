type Wrapped<T> = T extends T & Function ? never : T | (() => T)

interface PatchyyFindTarget {
	/**
	 * Найти, и заменить
	 */
	readonly find: Wrapped<string | RegExp>
	readonly patch: (match: string) => string
}

interface PatchyyLineTarget {
	/**
	 * Строка, в которой будет произведена замена
	 */
	readonly at: Wrapped<number>
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
	readonly raw: true
	readonly patch: (file: string) => string
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

type PatchyyTarget = PatchyyBaseTarget & PatchyyConfigModifiers
type PatchyyConfig = readonly PatchyyTarget[]

export { Wrapped, PatchyyTarget, PatchyyConfig }
