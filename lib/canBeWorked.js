"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNotAnotherCity = exports.isNotOccupiedByEnemy = exports.isNotWorked = void 0;
/**
 * Whether no city works `tile` yet.
 */
const isNotWorked = (tile, workedTileRegistry) => !workedTileRegistry.tileIsWorked(tile);
exports.isNotWorked = isNotWorked;
/**
 * Whether no other player's unit stands on `tile`.
 */
const isNotOccupiedByEnemy = (tile, city, unitRegistry) => !unitRegistry
    .getByTile(tile)
    .some((unit) => unit.player() !== city.player());
exports.isNotOccupiedByEnemy = isNotOccupiedByEnemy;
/**
 * Whether `tile` is not the centre of a city other than `city`.
 */
const isNotAnotherCity = (tile, city, cityRegistry) => {
    const otherTileCity = cityRegistry.getByTile(tile);
    if (otherTileCity === null) {
        return true;
    }
    return otherTileCity === city;
};
exports.isNotAnotherCity = isNotAnotherCity;
//# sourceMappingURL=canBeWorked.js.map