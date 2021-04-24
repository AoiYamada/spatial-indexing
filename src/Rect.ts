import { Point } from './types/Point'

export class Rect<T = any> {
  constructor(
    public readonly position: Point,
    public readonly width: number = 1,
    public readonly height: number = 1,
    public readonly data?: T
  ) {}
}
