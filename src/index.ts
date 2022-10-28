import { resolve } from 'node:path'
import { readFile, writeFile, open } from 'node:fs/promises'

type ValueOr<T> = T extends T & Function ? never : T | (() => T)

const unwrap = <T>(val: ValueOr<T>): T => {
  return typeof val === 'function' ? val() : val;
}

interface PatchyyLineTarget {
  readonly at: ValueOr<number>;
  readonly patch: (line: string) => string;
}

interface PatchyyTarget {
	readonly id: string
}

type PatchyyConfig = readonly (PatchyyTarget & PatchyyLineTarget)[]

const Patchyy = class {
	private config: PatchyyConfig

	constructor(config: PatchyyConfig = []) {
		this.config = config
	}

	public resolve(id: string): string {
    return resolve('./node_modules', id);
  }

  public async patch() {
    for (const target of this.config) {
      const id = this.resolve(target.id);
      // @todo: open file
      const source = await readFile(id, 'utf-8')

      let value = '';

      if ('at' in target) {
        const at = unwrap(target.at);

        const splitted = source.split('\n');

        splitted[at - 1] = target.patch(splitted[at - 1]);

        value = splitted.join('\n');
      }

      await writeFile(id, value, 'utf-8');
    }
  }
}

const patchyy = new Patchyy([
  {
    id: '@babel/core/lib/index.js',
    at: 250,
    patch(line) {
      console.log(line);

      return line.replace('7.19.6', '8.0.0')
    }
  },
]);

patchyy.patch();
