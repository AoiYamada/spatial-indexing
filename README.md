# Spatial Indexing

A spatial indexing lib provide uniform methods for studying different algorithms' performance.
Currently only support Spatial Hash Grid

# Install

Currently don't publish to npm yet, so clone this repo and run

```
# Install deps
yarn
yarn build
```

`docs` will be in `./docs/`
builds will be in `./dist/`

# Usage

Web:

```html
<script src="./dist/spatial-indexing.umd.js"></script>
<script>
  const {
    SpatialIndexing,
    constants: { STRATEGIES }
  } = spatialIndexing
</script>
```

Ts:

```ts
import { SpatialIndexing, constants } from './path/to/index.ts'

const { STRATEGIES } = constants
```

Create indexing instances:

```js
const spatialIndexingSingleton = new SpatialIndexing()

const checkAllItems = spatialIndexingSingleton.create(STRATEGIES.NAIVE)
const checkAllItems2 = spatialIndexingSingleton.create('hello')
const spatialHashGrid = spatialIndexingSingleton.create(STRATEGIES.SPATIAL_HASH_GRID, {
  // id, is optional, default it is the same as strategy name
  bound: { position: { x: 0, y: 0 }, width: 200, height: 200 },
  dimensions: { x: 10, y: 10 } // split the 200 x 200 area into 10 x 10 grids
})
```

Retrieve created instances

```js
const checkAllItems = spatialIndexingSingleton.get(STRATEGIES.NAIVE)
const checkAllItems2 = spatialIndexingSingleton.get('hello')
const spatialHashGrid = spatialIndexingSingleton.get(STRATEGIES.SPATIAL_HASH_GRID)
```

Register your own strategy

```ts
spatialIndexingSingleton.register({
  [UniqueStrategyName]: YourStrategyWhichExtendsAbstractIndexingStrategy
})
```

Types you maybe useful

```ts
type Point = {
  x: number
  y: number
}

class Rect<T = any> {
  constructor(
    public readonly position: Point,
    public readonly width: number = 1,
    public readonly height: number = 1,
    public readonly data?: T
  ) {}
}

abstract class AbstractIndexingStrategy<T = any> implements SpatialIndexingStrategy<T> {
  public abstract readonly type: string
  abstract insert(item: Rect<T>): void
  abstract remove(item: Rect<T>): void
  update(item: Rect<T>): void {
    this.remove(item)
    this.insert(item)
  }
  abstract find(item: Rect): Rect<T>[]
  abstract clear(): void
}
```

# Thanks

[Typescript Library Template](https://github.com/alexjoverm/typescript-library-starter.git)
