import City from '@civ-clone/core-city/City';
import Unit from '@civ-clone/core-unit/Unit';

/**
 * A unit `city` can no longer support is lost.
 */
export const disbandUnsupported = (city: City, unit: Unit): void =>
  unit.destroy();
