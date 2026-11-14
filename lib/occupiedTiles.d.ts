import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import Player from '@civ-clone/core-player/Player';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import WorkedTile from '@civ-clone/core-city/WorkedTile';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';
/**
 * The `WorkedTile` for `tile` if a city of a player other than `unit`'s works it, other than as its centre (a city always
 *  works its own centre, even while a unit capturing it is moving in), or `null`.
 */
export declare const enemyWorkedTile: (
  unit: Unit,
  tile: Tile,
  workedTileRegistry: WorkedTileRegistry
) => WorkedTile | null;
/**
 * `unit` has moved onto `tile`: if another player's city works it (see `enemyWorkedTile`), the city stops working it,
 *  and its `TileReassigned` rules choose what it works instead. The tile is looked up again here rather than in a
 *  `Criterion`, because an earlier `Moved` effect (cargo moving with its transport, say) may already have released it.
 */
export declare const releaseEnemyWorkedTile: (
  unit: Unit,
  tile: Tile,
  workedTileRegistry: WorkedTileRegistry,
  ruleRegistry: RuleRegistry
) => void;
/**
 * At the start of `player`'s turn, each of its cities stops working any tile (other than its centre) that another
 *  player's unit stands on, and its `TileReassigned` rules choose what it works instead.
 */
export declare const releaseOccupiedWorkedTiles: (
  player: Player,
  cityRegistry: CityRegistry,
  unitRegistry: UnitRegistry,
  workedTileRegistry: WorkedTileRegistry,
  ruleRegistry: RuleRegistry
) => void;
