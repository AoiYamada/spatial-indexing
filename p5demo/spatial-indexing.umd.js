(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.spatialIndexing = {})));
}(this, (function (exports) { 'use strict';

  var ALIGNMENTS = {
      TOP_LEFT: 'top_left',
      CENTER: 'center'
  };

  var STRATEGIES = {
      NAIVE: 'naive',
      QUADTREE: 'quadtree',
      SPATIAL_HASH_GRID: 'spatialHashGrid'
  };



  var index = /*#__PURE__*/Object.freeze({
    ALIGNMENTS: ALIGNMENTS,
    STRATEGIES: STRATEGIES
  });

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  /* global Reflect, Promise */

  var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return extendStatics(d, b);
  };

  function __extends(d, b) {
      extendStatics(d, b);
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }

  function __rest(s, e) {
      var t = {};
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
          t[p] = s[p];
      if (s != null && typeof Object.getOwnPropertySymbols === "function")
          for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
              t[p[i]] = s[p[i]];
      return t;
  }

  function __values(o) {
      var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
      if (m) return m.call(o);
      return {
          next: function () {
              if (o && i >= o.length) o = void 0;
              return { value: o && o[i++], done: !o };
          }
      };
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
                      y: yIdx
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
                      y: yIdx
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
                      y: yIdx
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
              y: this.bound.position.y + this.bound.height
          });
          for (var xIdx = leftTopIndics.x, maxXIdx = rightBottomIndics.x; xIdx <= maxXIdx; xIdx++) {
              for (var yIdx = leftTopIndics.y, maxYIdx = rightBottomIndics.y; yIdx <= maxYIdx; yIdx++) {
                  var k = this.key({
                      x: xIdx,
                      y: yIdx
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
              y: y
          };
      };
      SpatialHashGridStrategy.prototype.key = function (indics) {
          return indics.x + "." + indics.y;
      };
      return SpatialHashGridStrategy;
  }(AbstractIndexingStrategy));



  var index$1 = /*#__PURE__*/Object.freeze({
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

  var SpatialIndexing = /** @class */ (function () {
      function SpatialIndexing(customStrategies) {
          var e_1, _a;
          if (customStrategies === void 0) { customStrategies = {}; }
          this.customStrategies = customStrategies;
          this.strategies = new Map([
              [STRATEGIES.NAIVE, NaiveStrategy],
              [STRATEGIES.SPATIAL_HASH_GRID, SpatialHashGridStrategy]
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

  exports.constants = index;
  exports.lib = index$1;
  exports.SpatialIndexing = SpatialIndexing;
  exports.Rect = Rect;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=spatial-indexing.umd.js.map
