import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

// expo-router registers every file under `app/` as a route. A module without a default
// export logs `Route "…" is missing the required default export` and becomes a navigable
// path that renders nothing. There is no opt-out: `_layout` is the only special name, and
// the ignore regex lives inside the package. So style modules, types and shared components
// belong under `src/`, not in the route tree.
const APP_ROOT = path.resolve(__dirname, '../app')

function walkRouteFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkRouteFiles(full, out)
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(full)
    }
  }
  return out
}

describe('expo-router route tree', () => {
  it('holds only files that export a route component', () => {
    const missing = walkRouteFiles(APP_ROOT)
      .filter((file) => !/^export default/m.test(fs.readFileSync(file, 'utf8')))
      .map((file) => path.relative(APP_ROOT, file).split(path.sep).join('/'))
      .sort()
    // Why toEqual([]): failures print the exact phantom routes.
    expect(missing).toEqual([])
  })
})
