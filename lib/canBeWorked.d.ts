import City from '@civ-clone/core-city/City';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import Tile from '@civ-clone/core-world/Tile';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';
/**
 * Whether no city works `tile` yet.
 */
export declare const isNotWorked: (
  tile: Tile,
  workedTileRegistry: WorkedTileRegistry
) => boolean;
/**
 * Whether no other player's unit stands on `tile`.
 */
export declare const isNotOccupiedByEnemy: (
  tile: Tile,
  city: City,
  unitRegistry: UnitRegistry
) => boolean;
/**
 * Whether `tile` is not the centre of a city other than `city`.
 */
export declare const isNotAnotherCity: (
  tile: Tile,
  city: City,
  cityRegistry: CityRegistry
) => boolean;
