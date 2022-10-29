/**
 * `T` or function that returns `T`, but not `Function` & `T`
 */
type Wrapped<T> = T extends T & Function ? never : T | (() => T)

interface PatchyyFindTarget {
	/**
	 * Find, then patch
	 */
	readonly find: Wrapped<string | RegExp>
	readonly patch: (match: string) => string
}

interface PatchyyLineTarget {
	/**
	 * Number of the line in which the replacement will be made
	 */
	readonly at: Wrapped<number>
	readonly patch: (line: string) => string
}

interface PatchyyRangeTarget {
	/**
	 * Range
	 *
	 * Note that range is powered by `slice` or `substring`
	 */
	readonly range: [number, number]
	/**
	 * Range in lines
	 */
	readonly line?: boolean
	readonly patch: (str: string) => string
}

interface PatchyyRawTarget {
	/**
	 * Provide the raw file source
	 */
	readonly raw: true
	readonly patch: (file: string) => string
}

interface PatchyyBaseTarget {
	/**
	 * File in which change operations will be made
	 */
	readonly id: string
}

type PatchyyConfigModifiers =
	| PatchyyLineTarget
	| PatchyyFindTarget
	| PatchyyRangeTarget
	| PatchyyRawTarget

type PatchyyTarget = PatchyyBaseTarget & PatchyyConfigModifiers

/**
 * Array of `PatchyyTarget`
 */
type PatchyyConfig = readonly PatchyyTarget[]

export { Wrapped, PatchyyTarget, PatchyyConfig }
