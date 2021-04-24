import { SpatialIndexingStrategy } from '../interfaces/SpatialIndexingStrategy'
import { Rect } from '../Rect'

export abstract class AbstractIndexingStrategy<T = any> implements SpatialIndexingStrategy<T> {
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
