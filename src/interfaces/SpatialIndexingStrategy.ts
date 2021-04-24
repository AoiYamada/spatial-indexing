import { Rect } from '../Rect'

export interface SpatialIndexingStrategyConstructor<T = any> {
  new (...args: any[]): SpatialIndexingStrategy<T>
}

export interface SpatialIndexingStrategy<T = any> {
  insert(item: Rect<T>): void
  remove(item: Rect<T>): void
  update(item: Rect<T>): void
  find(item: Rect): Rect<T>[]
  clear(): void
}

class x<T = any> implements SpatialIndexingStrategy {
  insert(item: Rect<T>): void {}
  remove(item: Rect<T>): void {}
  update(item: Rect<T>): void {}
  find(item: Rect): Rect<T>[] {
    return []
  }
  clear(): void {}
}
