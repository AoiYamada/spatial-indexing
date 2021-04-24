import { STRATEGIES } from '../constants'
import { Rect } from '../Rect'
import { QuadtreeStrategyConfig } from '../types'
import { AbstractIndexingStrategy } from './AbstractIndexingStrategy'

export class QuadtreeStrategy<T = any> extends AbstractIndexingStrategy {
  public readonly type = STRATEGIES.NAIVE
  public readonly capacity: number
  public readonly bound: Rect
  public readonly subtrees: QuadtreeStrategy<T>[] = []
  public readonly items = new Map<Rect<T>, Rect<T>>()

  constructor({ bound, capacity = 5 }: QuadtreeStrategyConfig) {
    super()
    this.bound = bound
    this.capacity = capacity
  }

  insert(item: Rect<T>): void {
    if (!this.isIntersectWith(item)) {
      return
    }

    if (!this.isFull()) {
      this.items.set(item, item)
      return
    }

    if (!this.isSubtreeCreated()) {
      const subregion = {
        // use ceil to ensure 2 * length covers the original region
        width: Math.ceil(this.bound.width / 2),
        height: Math.ceil(this.bound.height / 2),
      }

      this.subtrees.push(
        //NE
        new QuadtreeStrategy({
          bound: new Rect(
            {
              x: this.bound.position.x + subregion.width,
              y: this.bound.position.y,
            },
            subregion.width,
            subregion.height
          ),
          capacity: this.capacity,
        }),
        // NW
        new QuadtreeStrategy({
          bound: new Rect(
            {
              x: this.bound.position.x,
              y: this.bound.position.y,
            },
            subregion.width,
            subregion.height
          ),
          capacity: this.capacity,
        }),
        // SW
        new QuadtreeStrategy({
          bound: new Rect(
            {
              x: this.bound.position.x,
              y: this.bound.position.y + subregion.height,
            },
            subregion.width,
            subregion.height
          ),
          capacity: this.capacity,
        }),
        // SE
        new QuadtreeStrategy({
          bound: new Rect(
            {
              x: this.bound.position.x + subregion.width,
              y: this.bound.position.y + subregion.height,
            },
            subregion.width,
            subregion.height
          ),
          capacity: this.capacity,
        })
      )
    }

    for (const subtree of this.subtrees) {
      subtree.insert(item)
    }
  }

  remove(item: Rect<T>): void {
    if (!this.isIntersectWith(item)) {
      return
    }

    this.items.delete(item)

    if (this.isSubtreeCreated()) {
      for (const subtree of this.subtrees) {
        subtree.remove(item)
      }
    }
  }

  find(item: Rect): Rect<T>[] {
    if (!this.isIntersectWith(item)) {
      return []
    }

    const items = Array.from(this.items.values())

    if (this.isSubtreeCreated()) {
      for (const subtree of this.subtrees) {
        items.push(...subtree.find(item))
      }
    }

    return items
  }

  clear(): void {
    this.subtrees.splice(0, this.subtrees.length)
  }

  private isFull(): boolean {
    return this.items.size >= this.capacity
  }

  private isSubtreeCreated(): boolean {
    return this.subtrees.length > 0
  }

  private isIntersectWith(item: Rect): boolean {
    if (
      // Lefter than this region
      item.position.x + item.width < this.bound.position.x ||
      // Upper than this region
      item.position.y + item.height < this.bound.position.y ||
      // Righter than this region
      this.bound.position.x + this.bound.width < item.position.x ||
      // Lower than this region
      this.bound.position.y + this.bound.height < item.position.y
    ) {
      return false
    }

    return true
  }
}
