"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.releaseEnemyWorkedTile = exports.enemyWorkedTile = void 0;
const TileReassigned_1 = require("@civ-clone/core-city/Rules/TileReassigned");
/**
 * The `WorkedTile` for `tile` if a city of a player other than `unit`'s works it, other than as its centre (a city always
 *  works its own centre, even while a unit capturing it is moving in), or `null`.
 */
const enemyWorkedTile = (unit, tile, workedTileRegistry) => {
    const workedTile = workedTileRegistry.getByTile(tile);
    if (workedTile === null) {
        return null;
    }
    const city = workedTile.city();
    if (workedTile.tile() === city.tile() || city.player() === unit.player()) {
        return null;
    }
    return workedTile;
};
exports.enemyWorkedTile = enemyWorkedTile;
/**
 * `unit` has moved onto `tile`: if another player's city works it (see `enemyWorkedTile`), the city stops working it,
 *  and its `TileReassigned` rules choose what it works instead. The tile is looked up again here rather than in a
 *  `Criterion`, because an earlier `Moved` effect (cargo moving with its transport, say) may already have released it.
 */
const releaseEnemyWorkedTile = (unit, tile, workedTileRegistry, ruleRegistry) => {
    const workedTile = (0, exports.enemyWorkedTile)(unit, tile, workedTileRegistry);
    if (workedTile === null) {
        return;
    }
    workedTileRegistry.unregister(workedTile);
    ruleRegistry.process(TileReassigned_1.default, workedTile.city(), tile);
};
exports.releaseEnemyWorkedTile = releaseEnemyWorkedTile;
//# sourceMappingURL=occupiedTiles.js.map