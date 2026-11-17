"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitBuildingComplete = exports.emitBuildingCancelled = exports.emitBuildingHeld = exports.emitTileReleased = exports.emitTileWorked = void 0;
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
 * Tells clients that `cityBuild` has stopped building `item`, for `reason` (`cancelled`, `unavailable`, `captured`, or
 *  a ruleset's own), so they can show the build as it is now (civ-clone/web-renderer#978). A ruleset raises it before
 *  a city on Auto chooses again, so what was dropped is `item` and `reason`, not `cityBuild.cleared()` or
 *  `cityBuild.building()`, which may already have moved on.
 */
const emitBuildingCancelled = (cityBuild, item, reason, engine) => {
    engine.emit('city:building-cancelled', cityBuild, item, reason);
};
exports.emitBuildingCancelled = emitBuildingCancelled;
/**
 * Tells clients that `cityBuild` has built `built`.
 */
const emitBuildingComplete = (cityBuild, built, engine) => {
    engine.emit('city:building-complete', cityBuild, built);
};
exports.emitBuildingComplete = emitBuildingComplete;
//# sourceMappingURL=events.js.map