"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.releaseSpecialists = exports.releaseWorkedTiles = exports.destroyUnits = void 0;
/**
 * Destroys each of `units` (a city's own, say) that isn't destroyed already: when the city was its player's last, the
 * first unit to go defeats the player, which destroys the rest (civ-clone/web-renderer#600).
 */
const destroyUnits = (units) => units.forEach((unit) => {
    if (unit.destroyed()) {
        return;
    }
    unit.destroy();
});
exports.destroyUnits = destroyUnits;
/**
 * The tiles a city that's gone worked are free for another to work.
 */
const releaseWorkedTiles = (city, workedTileRegistry) => workedTileRegistry
    .getByCity(city)
    .forEach((workedTile) => workedTileRegistry.unregister(workedTile));
exports.releaseWorkedTiles = releaseWorkedTiles;
/**
 * A city that's gone has no specialists.
 */
const releaseSpecialists = (city, specialistRegistry) => specialistRegistry
    .getByCity(city)
    .forEach((specialist) => specialistRegistry.unregister(specialist));
exports.releaseSpecialists = releaseSpecialists;
//# sourceMappingURL=destroyed.js.map