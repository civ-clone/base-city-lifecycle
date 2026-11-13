import City from '@civ-clone/core-city/City';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';

/**
 * Whether no city works `tile` yet.
 */
export const isNotWorked = (
  tile: Tile,
  workedTileRegistry: WorkedTileRegistry
): boolean => !workedTileRegistry.tileIsWorked(tile);

/**
 * Whether no other player's unit stands on `tile`.
 */
export const isNotOccupiedByEnemy = (
  tile: Tile,
  city: City,
  unitRegistry: UnitRegistry
): boolean =>
  !unitRegistry
    .getByTile(tile)
    .some((unit: Unit) => unit.player() !== city.player());

/**
 * Whether `tile` is not the centre of a city other than `city`.
 */
export const isNotAnotherCity = (
  tile: Tile,
  city: City,
  cityRegistry: CityRegistry
): boolean => {
  const otherTileCity = cityRegistry.getByTile(tile);

  if (otherTileCity === null) {
    return true;
  }

  return otherTileCity === city;
};
