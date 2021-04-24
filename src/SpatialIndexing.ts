import { STRATEGIES } from './constants/Strategies'
import {
  SpatialIndexingStrategy,
  SpatialIndexingStrategyConstructor,
} from './interfaces/SpatialIndexingStrategy'
import { NaiveStrategy } from './libs/NaiveStrategy'
import { QuadtreeStrategy } from './libs/QuadtreeStrategy'
import { SpatialHashGridStrategy } from './libs/SpatialHashGridStrategy'

export class SpatialIndexing {
  readonly strategies = new Map<string, SpatialIndexingStrategyConstructor>([
    [STRATEGIES.NAIVE, NaiveStrategy],
    [STRATEGIES.QUADTREE, QuadtreeStrategy],
    [STRATEGIES.SPATIAL_HASH_GRID, SpatialHashGridStrategy],
  ])
  readonly instances = new Map<any, SpatialIndexingStrategy>()

  constructor(
    readonly customStrategies: { [strategyName: string]: SpatialIndexingStrategyConstructor } = {}
  ) {
    for (const [strategyName, strategyClass] of Object.entries(customStrategies)) {
      this.strategies.set(strategyName, strategyClass)
    }
  }

  register(customStrategies: { [strategyName: string]: SpatialIndexingStrategyConstructor }) {
    for (const [strategyName, strategyClass] of Object.entries(customStrategies)) {
      this.strategies.set(strategyName, strategyClass)
    }
  }

  create<T = any>(
    strategyName: string,
    options: { id: string | undefined; [key: string]: any } = { id: undefined }
  ): SpatialIndexingStrategy<T> {
    const { id = strategyName, ...strategyOptions } = options
    const Strategy = this.strategies.get(strategyName)

    if (!Strategy) {
      throw new Error(`No [${strategyName}] strategy`)
    }

    const strategy = new Strategy(strategyOptions)
    this.instances.set(id, strategy)

    return strategy
  }

  get<T = any>(id: string): SpatialIndexingStrategy<T> {
    if (!this.instances.has(id)) {
      throw new Error(`No [${id}]`)
    }

    return this.instances.get(id) as SpatialIndexingStrategy<T>
  }
}
