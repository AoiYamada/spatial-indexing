import { STRATEGIES } from '../constants'
import { SpatialIndexingStrategy } from '../interfaces/SpatialIndexingStrategy'
import { Rect } from '../Rect'
import { Point } from '../types/Point'
import { SpatialHashGridStrategyConfig } from '../types/StrategyConfigs'
import { AbstractIndexingStrategy } from './AbstractIndexingStrategy'

const range = (input: number) => Math.max(0, Math.min(1, input))

// Ref: https://github.com/simondevyoutube/Tutorial_SpatialHashGrid/blob/main/src/spatial-grid.js
export class SpatialHashGridStrategy<T = any>
  extends AbstractIndexingStrategy
  implements SpatialIndexingStrategy {
  public readonly type = STRATEGIES.SPATIAL_HASH_GRID
  public readonly bound: Rect
  public readonly dimensions: Point
  private cells = new Map<string, Set<Rect<T>>>()
  private clientGridRange = new Map<Rect<T>, [Point, Point]>()

  constructor({ bound, dimensions }: SpatialHashGridStrategyConfig) {
    super()
    this.bound = bound
    this.dimensions = dimensions
    this.clear()
  }

  insert(item: Rect<T>): void {
    const {
      position: { x, y },
      width: w,
      height: h,
    } = item

    const leftTopIndics = this.getCellIndex({ x, y })
    const rightBottomIndics = this.getCellIndex({ x: x + w, y: y + h })

    this.clientGridRange.set(item, [leftTopIndics, rightBottomIndics])

    for (let xIdx = leftTopIndics.x, maxXIdx = rightBottomIndics.x; xIdx <= maxXIdx; xIdx++) {
      for (let yIdx = leftTopIndics.y, maxYIdx = rightBottomIndics.y; yIdx <= maxYIdx; yIdx++) {
        const k = this.key({
          x: xIdx,
          y: yIdx,
        })
        this.cells.get(k)?.add(item)
      }
    }
  }

  remove(item: Rect<T>): void {
    if (!this.clientGridRange.has(item)) {
      return
    }

    const [leftTopIndics, rightBottomIndics] = this.clientGridRange.get(item) as [Point, Point]

    for (let xIdx = leftTopIndics.x, maxXIdx = rightBottomIndics.x; xIdx <= maxXIdx; xIdx++) {
      for (let yIdx = leftTopIndics.y, maxYIdx = rightBottomIndics.y; yIdx <= maxYIdx; yIdx++) {
        const k = this.key({
          x: xIdx,
          y: yIdx,
        })
        this.cells.get(k)?.delete(item)
      }
    }
  }

  find(item: Rect): Rect<T>[] {
    const {
      position: { x, y },
      width: w = 1,
      height: h = 1,
    } = item

    const leftTopIndics = this.getCellIndex({ x, y })
    const rightBottomIndics = this.getCellIndex({ x: x + w, y: y + h })

    const targets = new Set<Rect<T>>()

    for (let xIdx = leftTopIndics.x, maxXIdx = rightBottomIndics.x; xIdx <= maxXIdx; xIdx++) {
      for (let yIdx = leftTopIndics.y, maxYIdx = rightBottomIndics.y; yIdx <= maxYIdx; yIdx++) {
        const k = this.key({
          x: xIdx,
          y: yIdx,
        })
        for (const v of this.cells.get(k) as Set<Rect<T>>) {
          targets.add(v)
        }
      }
    }

    return Array.from(targets)
  }

  clear(): void {
    const leftTopIndics = this.getCellIndex(this.bound.position)
    const rightBottomIndics = this.getCellIndex({
      x: this.bound.position.x + this.bound.width,
      y: this.bound.position.y + this.bound.height,
    })

    for (let xIdx = leftTopIndics.x, maxXIdx = rightBottomIndics.x; xIdx <= maxXIdx; xIdx++) {
      for (let yIdx = leftTopIndics.y, maxYIdx = rightBottomIndics.y; yIdx <= maxYIdx; yIdx++) {
        const k = this.key({
          x: xIdx,
          y: yIdx,
        })
        this.cells.set(k, new Set())
      }
    }
  }

  private getCellIndex(position: Point): Point {
    const normalizedX = range((position.x - this.bound.position.x) / this.bound.width)
    const normalizedY = range((position.y - this.bound.position.y) / this.bound.height)
    const x = Math.floor(normalizedX * this.dimensions.x)
    const y = Math.floor(normalizedY * this.dimensions.y)

    return {
      x,
      y,
    }
  }

  private key(indics: Point): string {
    return `${indics.x}.${indics.y}`
  }
}
