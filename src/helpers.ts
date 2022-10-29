import type { Wrapped } from './types'

const unwrap = <T>(val: Wrapped<T>): T => {
	return typeof val === 'function' ? val() : val
}

export { unwrap }
