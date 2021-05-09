import { Rect } from '../Rect'
import { Point } from './Point'

export type SpatialHashGridStrategyConfig = { bound: Rect; dimensions: Point }

export type QuadtreeStrategyConfig = { bound: Rect; capacity?: number; level?: number }
