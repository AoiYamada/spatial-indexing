import { STRATEGIES } from '../constants'
import { Rect } from '../Rect'
import { AbstractIndexingStrategy } from './AbstractIndexingStrategy'

export class NaiveStrategy<T> extends AbstractIndexingStrategy {
  public readonly type = STRATEGIES.NAIVE
  private items = new Map<Rect<T>, Rect<T>>()

  insert(item: Rect<T>): void {
    this.items.set(item, item)
  }
  remove(item: Rect<T>): void {
    this.items.delete(item)
  }
  find(item: Rect): Rect<T>[] {
    return Array.from(this.items.values())
  }
  clear(): void {
    this.items = new Map<Rect<T>, Rect<T>>()
  }
}
