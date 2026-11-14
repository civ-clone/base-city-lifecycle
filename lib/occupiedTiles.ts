import City from '@civ-clone/core-city/City';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import Player from '@civ-clone/core-player/Player';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Tile from '@civ-clone/core-world/Tile';
import TileReassigned from '@civ-clone/core-city/Rules/TileReassigned';
import Unit from '@civ-clone/core-unit/Unit';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import WorkedTile from '@civ-clone/core-city/WorkedTile';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';

/**
 * The `WorkedTile` for `tile` if a city of a player other than `unit`'s works it, other than as its centre (a city always
 *  works its own centre, even while a unit capturing it is moving in), or `null`.
 */
export const enemyWorkedTile = (
  unit: Unit,
  tile: Tile,
  workedTileRegistry: WorkedTileRegistry
): WorkedTile | null => {
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

/**
 * `unit` has moved onto `tile`: if another player's city works it (see `enemyWorkedTile`), the city stops working it,
 *  and its `TileReassigned` rules choose what it works instead. The tile is looked up again here rather than in a
 *  `Criterion`, because an earlier `Moved` effect (cargo moving with its transport, say) may already have released it.
 */
export const releaseEnemyWorkedTile = (
  unit: Unit,
  tile: Tile,
  workedTileRegistry: WorkedTileRegistry,
  ruleRegistry: RuleRegistry
): void => {
  const workedTile = enemyWorkedTile(unit, tile, workedTileRegistry);

  if (workedTile === null) {
    return;
  }

  workedTileRegistry.unregister(workedTile);

  ruleRegistry.process(TileReassigned, workedTile.city(), tile);
};

/**
 * At the start of `player`'s turn, each of its cities stops working any tile (other than its centre) that another
 *  player's unit stands on, and its `TileReassigned` rules choose what it works instead.
 */
export const releaseOccupiedWorkedTiles = (
  player: Player,
  cityRegistry: CityRegistry,
  unitRegistry: UnitRegistry,
  workedTileRegistry: WorkedTileRegistry,
  ruleRegistry: RuleRegistry
): void =>
  cityRegistry.getByPlayer(player).forEach((city: City): void =>
    workedTileRegistry
      .getByCity(city)
      .filter(
        (workedTile: WorkedTile): boolean =>
          workedTile.tile() !== city.tile() &&
          unitRegistry
            .getByTile(workedTile.tile())
            .some((unit: Unit): boolean => unit.player() !== player)
      )
      .forEach((workedTile: WorkedTile): void => {
        workedTileRegistry.unregister(workedTile);

        ruleRegistry.process(TileReassigned, city, workedTile.tile());
      })
  );
