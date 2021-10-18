(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.spatialIndexing = {}));
}(this, (function (exports) { 'use strict';

  var ALIGNMENTS = {
      TOP_LEFT: 'top_left',
      CENTER: 'center',
  };

  var STRATEGIES = {
      NAIVE: 'naive',
      QUADTREE: 'quadtree',
      SPATIAL_HASH_GRID: 'spatialHashGrid',
  };

  var index$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ALIGNMENTS: ALIGNMENTS,
    STRATEGIES: STRATEGIES
  });

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */
  /* global Reflect, Promise */

  var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
      return extendStatics(d, b);
  };

  function __extends(d, b) {
      if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }

  function __rest(s, e) {
      var t = {};
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
          t[p] = s[p];
      if (s != null && typeof Object.getOwnPropertySymbols === "function")
          for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
              if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                  t[p[i]] = s[p[i]];
          }
      return t;
  }

  function __values(o) {
      var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
      if (m) return m.call(o);
      if (o && typeof o.length === "number") return {
          next: function () {
              if (o && i >= o.length) o = void 0;
              return { value: o && o[i++], done: !o };
          }
      };
      throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
  }

  function __read(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m) return o;
      var i = m.call(o), r, ar = [], e;
      try {
          while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
      }
      catch (error) { e = { error: error }; }
      finally {
          try {
              if (r && !r.done && (m = i["return"])) m.call(i);
          }
          finally { if (e) throw e.error; }
      }
      return ar;
  }

  function __spreadArray(to, from) {
      for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
          to[j] = from[i];
      return to;
  }

  var AbstractIndexingStrategy = /** @class */ (function () {
      function AbstractIndexingStrategy() {
      }
      AbstractIndexingStrategy.prototype.update = function (item) {
          this.remove(item);
          this.insert(item);
      };
      return AbstractIndexingStrategy;
  }());

  var range = function (input) { return Math.max(0, Math.min(1, input)); };
  // Ref: https://github.com/simondevyoutube/Tutorial_SpatialHashGrid/blob/main/src/spatial-grid.js
  var SpatialHashGridStrategy = /** @class */ (function (_super) {
      __extends(SpatialHashGridStrategy, _super);
      function SpatialHashGridStrategy(_a) {
          var bound = _a.bound, dimensions = _a.dimensions;
          var _this = _super.call(this) || this;
          _this.type = STRATEGIES.SPATIAL_HASH_GRID;
          _this.cells = new Map();
          _this.clientGridRange = new Map();
          _this.bound = bound;
          _this.dimensions = dimensions;
          _this.clear();
          return _this;
      }
      SpatialHashGridStrategy.prototype.insert = function (item) {
          var _a;
          var _b = item.position, x = _b.x, y = _b.y, w = item.width, h = item.height;
          var leftTopIndics = this.getCellIndex({ x: x, y: y });
          var rightBottomIndics = this.getCellIndex({ x: x + w, y: y + h });
          this.clientGridRange.set(item, [leftTopIndics, rightBottomIndics]);
          for (var xIdx = leftTopIndics.x, maxXIdx = rightBottomIndics.x; xIdx <= maxXIdx; xIdx++) {
              for (var yIdx = leftTopIndics.y, maxYIdx = rightBottomIndics.y; yIdx <= maxYIdx; yIdx++) {
                  var k = this.key({
                      x: xIdx,
                      y: yIdx,
                  });
                  (_a = this.cells.get(k)) === null || _a === void 0 ? void 0 : _a.add(item);
              }
          }
      };
      SpatialHashGridStrategy.prototype.remove = function (item) {
          var _a;
          if (!this.clientGridRange.has(item)) {
              return;
          }
          var _b = __read(this.clientGridRange.get(item), 2), leftTopIndics = _b[0], rightBottomIndics = _b[1];
          for (var xIdx = leftTopIndics.x, maxXIdx = rightBottomIndics.x; xIdx <= maxXIdx; xIdx++) {
              for (var yIdx = leftTopIndics.y, maxYIdx = rightBottomIndics.y; yIdx <= maxYIdx; yIdx++) {
                  var k = this.key({
                      x: xIdx,
                      y: yIdx,
                  });
                  (_a = this.cells.get(k)) === null || _a === void 0 ? void 0 : _a.delete(item);
              }
          }
      };
      SpatialHashGridStrategy.prototype.find = function (item) {
          var e_1, _a;
          var _b = item.position, x = _b.x, y = _b.y, _c = item.width, w = _c === void 0 ? 1 : _c, _d = item.height, h = _d === void 0 ? 1 : _d;
          var leftTopIndics = this.getCellIndex({ x: x, y: y });
          var rightBottomIndics = this.getCellIndex({ x: x + w, y: y + h });
          var targets = new Set();
          for (var xIdx = leftTopIndics.x, maxXIdx = rightBottomIndics.x; xIdx <= maxXIdx; xIdx++) {
              for (var yIdx = leftTopIndics.y, maxYIdx = rightBottomIndics.y; yIdx <= maxYIdx; yIdx++) {
                  var k = this.key({
                      x: xIdx,
                      y: yIdx,
                  });
                  try {
                      for (var _e = (e_1 = void 0, __values(this.cells.get(k))), _f = _e.next(); !_f.done; _f = _e.next()) {
                          var v = _f.value;
                          targets.add(v);
                      }
                  }
                  catch (e_1_1) { e_1 = { error: e_1_1 }; }
                  finally {
                      try {
                          if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
                      }
                      finally { if (e_1) throw e_1.error; }
                  }
              }
          }
          return Array.from(targets);
      };
      SpatialHashGridStrategy.prototype.clear = function () {
          var leftTopIndics = this.getCellIndex(this.bound.position);
          var rightBottomIndics = this.getCellIndex({
              x: this.bound.position.x + this.bound.width,
              y: this.bound.position.y + this.bound.height,
          });
          for (var xIdx = leftTopIndics.x, maxXIdx = rightBottomIndics.x; xIdx <= maxXIdx; xIdx++) {
              for (var yIdx = leftTopIndics.y, maxYIdx = rightBottomIndics.y; yIdx <= maxYIdx; yIdx++) {
                  var k = this.key({
                      x: xIdx,
                      y: yIdx,
                  });
                  this.cells.set(k, new Set());
              }
          }
      };
      SpatialHashGridStrategy.prototype.getCellIndex = function (position) {
          var normalizedX = range((position.x - this.bound.position.x) / this.bound.width);
          var normalizedY = range((position.y - this.bound.position.y) / this.bound.height);
          var x = Math.floor(normalizedX * this.dimensions.x);
          var y = Math.floor(normalizedY * this.dimensions.y);
          return {
              x: x,
              y: y,
          };
      };
      SpatialHashGridStrategy.prototype.key = function (indics) {
          return indics.x + "." + indics.y;
      };
      return SpatialHashGridStrategy;
  }(AbstractIndexingStrategy));

  var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    SpatialHashGridStrategy: SpatialHashGridStrategy
  });

  var NaiveStrategy = /** @class */ (function (_super) {
      __extends(NaiveStrategy, _super);
      function NaiveStrategy() {
          var _this = _super !== null && _super.apply(this, arguments) || this;
          _this.type = STRATEGIES.NAIVE;
          _this.items = new Map();
          return _this;
      }
      NaiveStrategy.prototype.insert = function (item) {
          this.items.set(item, item);
      };
      NaiveStrategy.prototype.remove = function (item) {
          this.items.delete(item);
      };
      NaiveStrategy.prototype.find = function (item) {
          return Array.from(this.items.values());
      };
      NaiveStrategy.prototype.clear = function () {
          this.items = new Map();
      };
      return NaiveStrategy;
  }(AbstractIndexingStrategy));

  var Rect = /** @class */ (function () {
      function Rect(position, width, height, data) {
          if (width === void 0) { width = 1; }
          if (height === void 0) { height = 1; }
          this.position = position;
          this.width = width;
          this.height = height;
          this.data = data;
      }
      return Rect;
  }());

  var QuadtreeStrategy = /** @class */ (function (_super) {
      __extends(QuadtreeStrategy, _super);
      function QuadtreeStrategy(_a) {
          var bound = _a.bound, _b = _a.capacity, capacity = _b === void 0 ? 5 : _b, _c = _a.level, level = _c === void 0 ? 1 : _c;
          var _this = _super.call(this) || this;
          _this.type = STRATEGIES.QUADTREE;
          _this.subtrees = [];
          _this.items = new Map();
          _this.bound = bound;
          _this.capacity = capacity;
          _this.level = level;
          return _this;
      }
      QuadtreeStrategy.prototype.insert = function (item) {
          var e_1, _a;
          if (!this.isIntersectWith(item)) {
              return;
          }
          if (!this.isFull()) {
              this.items.set(item, item);
              return;
          }
          if (!this.isSubtreeCreated()) {
              var subregion = {
                  // use ceil to ensure 2 * length covers the original region
                  width: Math.ceil(this.bound.width / 2),
                  height: Math.ceil(this.bound.height / 2),
              };
              this.subtrees.push(
              //NE
              new QuadtreeStrategy({
                  bound: new Rect({
                      x: this.bound.position.x + subregion.width,
                      y: this.bound.position.y,
                  }, subregion.width, subregion.height),
                  capacity: this.capacity,
                  level: this.level + 1,
              }), 
              // NW
              new QuadtreeStrategy({
                  bound: new Rect({
                      x: this.bound.position.x,
                      y: this.bound.position.y,
                  }, subregion.width, subregion.height),
                  capacity: this.capacity,
                  level: this.level + 1,
              }), 
              // SW
              new QuadtreeStrategy({
                  bound: new Rect({
                      x: this.bound.position.x,
                      y: this.bound.position.y + subregion.height,
                  }, subregion.width, subregion.height),
                  capacity: this.capacity,
                  level: this.level + 1,
              }), 
              // SE
              new QuadtreeStrategy({
                  bound: new Rect({
                      x: this.bound.position.x + subregion.width,
                      y: this.bound.position.y + subregion.height,
                  }, subregion.width, subregion.height),
                  capacity: this.capacity,
                  level: this.level + 1,
              }));
          }
          try {
              for (var _b = __values(this.subtrees), _c = _b.next(); !_c.done; _c = _b.next()) {
                  var subtree = _c.value;
                  subtree.insert(item);
              }
          }
          catch (e_1_1) { e_1 = { error: e_1_1 }; }
          finally {
              try {
                  if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
              }
              finally { if (e_1) throw e_1.error; }
          }
      };
      QuadtreeStrategy.prototype.remove = function (item) {
          var e_2, _a;
          if (!this.isIntersectWith(item)) {
              return;
          }
          this.items.delete(item);
          if (this.isSubtreeCreated()) {
              try {
                  for (var _b = __values(this.subtrees), _c = _b.next(); !_c.done; _c = _b.next()) {
                      var subtree = _c.value;
                      subtree.remove(item);
                  }
              }
              catch (e_2_1) { e_2 = { error: e_2_1 }; }
              finally {
                  try {
                      if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                  }
                  finally { if (e_2) throw e_2.error; }
              }
          }
      };
      QuadtreeStrategy.prototype.find = function (item) {
          var e_3, _a;
          if (!this.isIntersectWith(item)) {
              return [];
          }
          var items = Array.from(this.items.values());
          if (this.isSubtreeCreated()) {
              try {
                  for (var _b = __values(this.subtrees), _c = _b.next(); !_c.done; _c = _b.next()) {
                      var subtree = _c.value;
                      items.push.apply(items, __spreadArray([], __read(subtree.find(item))));
                  }
              }
              catch (e_3_1) { e_3 = { error: e_3_1 }; }
              finally {
                  try {
                      if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                  }
                  finally { if (e_3) throw e_3.error; }
              }
          }
          return items;
      };
      QuadtreeStrategy.prototype.clear = function () {
          this.items.clear();
          this.subtrees.splice(0, this.subtrees.length);
      };
      QuadtreeStrategy.prototype.isFull = function () {
          return this.items.size >= this.capacity;
      };
      QuadtreeStrategy.prototype.isSubtreeCreated = function () {
          return this.subtrees.length > 0;
      };
      QuadtreeStrategy.prototype.isIntersectWith = function (item) {
          if (
          // Lefter than this region
          item.position.x + item.width < this.bound.position.x ||
              // Upper than this region
              item.position.y + item.height < this.bound.position.y ||
              // Righter than this region
              this.bound.position.x + this.bound.width < item.position.x ||
              // Lower than this region
              this.bound.position.y + this.bound.height < item.position.y) {
              return false;
          }
          return true;
      };
      return QuadtreeStrategy;
  }(AbstractIndexingStrategy));

  var SpatialIndexing = /** @class */ (function () {
      function SpatialIndexing(customStrategies) {
          var e_1, _a;
          if (customStrategies === void 0) { customStrategies = {}; }
          this.customStrategies = customStrategies;
          this.strategies = new Map([
              [STRATEGIES.NAIVE, NaiveStrategy],
              [STRATEGIES.QUADTREE, QuadtreeStrategy],
              [STRATEGIES.SPATIAL_HASH_GRID, SpatialHashGridStrategy],
          ]);
          this.instances = new Map();
          try {
              for (var _b = __values(Object.entries(customStrategies)), _c = _b.next(); !_c.done; _c = _b.next()) {
                  var _d = __read(_c.value, 2), strategyName = _d[0], strategyClass = _d[1];
                  this.strategies.set(strategyName, strategyClass);
              }
          }
          catch (e_1_1) { e_1 = { error: e_1_1 }; }
          finally {
              try {
                  if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
              }
              finally { if (e_1) throw e_1.error; }
          }
      }
      SpatialIndexing.prototype.register = function (customStrategies) {
          var e_2, _a;
          try {
              for (var _b = __values(Object.entries(customStrategies)), _c = _b.next(); !_c.done; _c = _b.next()) {
                  var _d = __read(_c.value, 2), strategyName = _d[0], strategyClass = _d[1];
                  this.strategies.set(strategyName, strategyClass);
              }
          }
          catch (e_2_1) { e_2 = { error: e_2_1 }; }
          finally {
              try {
                  if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
              }
              finally { if (e_2) throw e_2.error; }
          }
      };
      SpatialIndexing.prototype.create = function (strategyName, options) {
          if (options === void 0) { options = { id: undefined }; }
          var _a = options.id, id = _a === void 0 ? strategyName : _a, strategyOptions = __rest(options, ["id"]);
          var Strategy = this.strategies.get(strategyName);
          if (!Strategy) {
              throw new Error("No [" + strategyName + "] strategy");
          }
          var strategy = new Strategy(strategyOptions);
          this.instances.set(id, strategy);
          return strategy;
      };
      SpatialIndexing.prototype.get = function (id) {
          if (!this.instances.has(id)) {
              throw new Error("No [" + id + "]");
          }
          return this.instances.get(id);
      };
      return SpatialIndexing;
  }());

  exports.Rect = Rect;
  exports.SpatialIndexing = SpatialIndexing;
  exports.constants = index$1;
  exports.lib = index;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=spatial-indexing.umd.js.map
