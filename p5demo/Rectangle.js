class Rectangle {
  constructor(x, y, width, height, idx) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.area = width * height
    this.idx = idx
    this.velocity = { x: 0, y: 0 }
  }

  setVelocity(velocity) {
    this.velocity = velocity
  }

  draw() {
    rect(this.x, this.y, this.width, this.height)
  }

  intersect(rectangle) {
    return !(
      rectangle.x > this.x + this.width ||
      rectangle.y > this.y + this.height ||
      this.x > rectangle.x + rectangle.width ||
      this.y > rectangle.y + rectangle.height
    )
  }

  collide(rectangle) {
    if (!this.intersect(rectangle)) {
      return
    }

    ;[rectangle.velocity, this.velocity] = [this.velocity, rectangle.velocity]

    // const totalArea = this.area + rectangle.area
    // const dA = this.area - rectangle.area
    // const v2v1coefficient = (2 * this.area) / totalArea
    // const v2v2Coefficient = -dA / totalArea
    // const v1v2coefficient = (2 * rectangle.area) / totalArea
    // const v1v1Coefficient = -v2v2Coefficient

    // rectangle.velocity = createVector(
    //   v2v1coefficient * this.velocity.x + v2v2Coefficient * rectangle.velocity.x,
    //   v2v1coefficient * this.velocity.y + v2v2Coefficient * rectangle.velocity.y
    // )

    // this.velocity = createVector(
    //   v1v1Coefficient * this.velocity.x + v1v2coefficient * rectangle.velocity.x,
    //   v1v1Coefficient * this.velocity.y + v1v2coefficient * rectangle.velocity.y
    // )
  }

  update() {
    const newX = this.x + this.velocity.x
    const newY = this.y + this.velocity.y

    if (newX < 0 || newX + this.width > canvasWidth) {
      this.velocity.x = -this.velocity.x
    }

    if (newY < 0 || newY + this.height > canvasHeight) {
      this.velocity.y = -this.velocity.y
    }

    this.x += this.velocity.x
    this.y += this.velocity.y
  }
}
