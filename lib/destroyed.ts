import { SpecialistRegistry } from '@civ-clone/core-city/SpecialistRegistry';
import City from '@civ-clone/core-city/City';
import Unit from '@civ-clone/core-unit/Unit';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';

/**
 * Destroys each of `units` (a city's own, say) that isn't destroyed already: when the city was its player's last, the
 * first unit to go defeats the player, which destroys the rest (civ-clone/web-renderer#600).
 */
export const destroyUnits = (units: Unit[]): void =>
  units.forEach((unit: Unit): void => {
    if (unit.destroyed()) {
      return;
    }

    unit.destroy();
  });

/**
 * The tiles a city that's gone worked are free for another to work.
 */
export const releaseWorkedTiles = (
  city: City,
  workedTileRegistry: WorkedTileRegistry
): void =>
  workedTileRegistry
    .getByCity(city)
    .forEach((workedTile) => workedTileRegistry.unregister(workedTile));

/**
 * A city that's gone has no specialists.
 */
export const releaseSpecialists = (
  city: City,
  specialistRegistry: SpecialistRegistry
): void =>
  specialistRegistry
    .getByCity(city)
    .forEach((specialist) => specialistRegistry.unregister(specialist));
