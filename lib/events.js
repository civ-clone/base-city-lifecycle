"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitBuildingComplete = exports.emitBuildingHeld = exports.emitTileReleased = exports.emitTileWorked = void 0;
/**
 * Tells clients that `city` now works `tile`, so they can redraw it and show who works it.
 */
const emitTileWorked = (city, tile, engine) => {
    engine.emit('city:tile-worked', city, tile);
};
exports.emitTileWorked = emitTileWorked;
/**
 * Tells clients that `city` no longer works `tile`, so they can redraw it.
 */
const emitTileReleased = (city, tile, engine) => {
    engine.emit('city:tile-released', city, tile);
};
exports.emitTileReleased = emitTileReleased;
/**
 * Tells clients that `cityBuild`'s `item` is paid for but held back, with the ids of the `Hold` rules holding it (`null`
 *  for a rule without one), for a client to word.
 */
const emitBuildingHeld = (cityBuild, item, held, engine) => {
    engine.emit('city:building-held', cityBuild, item, held);
};
exports.emitBuildingHeld = emitBuildingHeld;
/**
 * Tells clients that `cityBuild` has built `built`.
 */
const emitBuildingComplete = (cityBuild, built, engine) => {
    engine.emit('city:building-complete', cityBuild, built);
};
exports.emitBuildingComplete = emitBuildingComplete;
//# sourceMappingURL=events.js.map