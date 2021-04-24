const canvasWidth = 600
const canvasHeight = 400
const DIMENSION_X = 30
const DIMENSION_Y = 20
const LEFT_TOP_X = 0
const LEFT_TOP_Y = 0

const {
  SpatialIndexing,
  constants: { STRATEGIES },
} = spatialIndexing

const spatialIndexingSingleton = new SpatialIndexing()

spatialIndexingSingleton.create(STRATEGIES.NAIVE)
spatialIndexingSingleton.create(STRATEGIES.SPATIAL_HASH_GRID, {
  bound: { position: { x: LEFT_TOP_X, y: LEFT_TOP_Y }, width: canvasWidth, height: canvasHeight },
  dimensions: { x: DIMENSION_X, y: DIMENSION_Y },
})
spatialIndexingSingleton.create(STRATEGIES.QUADTREE, {
  bound: { position: { x: LEFT_TOP_X, y: LEFT_TOP_Y }, width: canvasWidth, height: canvasHeight },
  capacity: 5,
})

const drawGridMethods = {
  default: () => {},
  [STRATEGIES.SPATIAL_HASH_GRID]: () => {
    stroke(255)
    strokeWeight(0.5)
    noFill()
    for (let x = LEFT_TOP_X; x < decoratedIndexingLib.dimensions.x; x++) {
      for (let y = LEFT_TOP_Y; y < decoratedIndexingLib.dimensions.y; y++) {
        rect(x * region.width, y * region.height, region.width, region.height)
      }
    }
  },
  // Don't use arrow fn to get caller's 'this'
  [STRATEGIES.QUADTREE]: function () {
    stroke(255)
    strokeWeight(0.5)
    noFill()

    rect(this.bound.position.x, this.bound.position.y, this.bound.width, this.bound.height)

    if (this.subtrees.length < 4) {
      return
    }

    const decoratedSubtrees = this.subtrees.map(
      (subtree) =>
        new Proxy(subtree, {
          get: function (target, name) {
            if (name === 'drawGrids') {
              return drawGridMethods[target.type] || drawGridMethods['default']
            }

            return Reflect.get(target, name)
          },
        })
    )

    for (const subtree of decoratedSubtrees) {
      subtree.drawGrids()
    }
  },
}

let decoratedIndexingLib

const region = {
  width: canvasWidth / DIMENSION_X,
  height: canvasHeight / DIMENSION_Y,
}

let slider
let sel

const rectangles = Array.from({ length: 3000 }, (_, idx) => {
  const rectangle = new Rectangle(
    Math.random() * canvasWidth,
    Math.random() * canvasHeight,
    (region.width * (2 - Math.random())) / 3,
    (region.height * (2 - Math.random())) / 3,
    idx
  )

  return {
    position: {
      x: rectangle.x,
      y: rectangle.y,
    },
    width: rectangle.width,
    height: rectangle.height,
    data: rectangle,
  }
})

function setup() {
  createCanvas(canvasWidth, canvasHeight)

  sel = createSelect()
  sel.position(10, canvasHeight + 20)

  for (const strategy of Object.values(STRATEGIES)) {
    sel.option(strategy)
  }
  sel.selected(STRATEGIES.NAIVE)
  sel.changed(changeStrategy)

  changeStrategy()

  slider = createSlider(0, 3000, 10)
  slider.position(10, canvasHeight + 50)
  slider.style('width', '300px')

  for (const rectangle of rectangles) {
    rectangle.data.setVelocity(createVector(Math.random() * 2 - 1, Math.random() * 2 - 1))
  }
}

function changeStrategy() {
  const strategy = sel.value()

  decoratedIndexingLib = new Proxy(spatialIndexingSingleton.get(strategy), {
    get: function (target, name) {
      if (name === 'drawGrids') {
        return drawGridMethods[target.type] || drawGridMethods['default']
      }

      return Reflect.get(target, name)
    },
  })
}

function draw() {
  background(0)
  decoratedIndexingLib.drawGrids()
  decoratedIndexingLib.clear()

  const maxRect = slider.value()
  strokeWeight(0)
  const fillColor = color(255, 255, 255, 100)
  fill(fillColor)
  for (const rectangle of rectangles) {
    if (rectangle.data.idx < maxRect) {
      decoratedIndexingLib.insert(rectangle)

      const nearby = decoratedIndexingLib.find(rectangle)
      for (const target of nearby) {
        if (target.data.idx < maxRect && rectangle.data.idx !== target.data.idx) {
          rectangle.data.collide(target.data)
        }
      }

      rectangle.data.update()
      rectangle.position.x = rectangle.data.x
      rectangle.position.y = rectangle.data.y
      rectangle.data.draw()
    }
  }

  const findWidth = 50
  const findHeight = 50

  const findRegion = {
    position: {
      x: mouseX - findWidth / 2,
      y: mouseY - findHeight / 2,
    },
    width: findWidth,
    height: findHeight,
  }

  drawFindRegion(findRegion)

  const nearby = decoratedIndexingLib.find(findRegion)

  stroke(0, 255, 0, 50)
  strokeWeight(1)
  for (const rectangle of nearby) {
    noFill()
    if (rectangle.data.idx < maxRect) {
      if (
        rectangle.data.intersect({
          ...findRegion.position,
          width: findRegion.width,
          height: findRegion.height,
        })
      ) {
        fill(0, 255, 0, 100)
      }
      rectangle.data.draw()
    }
  }

  drawFramerate()
}

function drawFindRegion(findRegion) {
  stroke(0, 255, 0)
  strokeWeight(1)
  noFill()
  rect(findRegion.position.x, findRegion.position.y, findRegion.width, findRegion.height)
}

function drawFramerate() {
  stroke(255)
  fill(255)
  strokeWeight(1)
  text(`Items: ${slider.value()}`, 10, 20)
  text(`FPS: ${Math.floor(frameRate())}`, 10, 50)
}
