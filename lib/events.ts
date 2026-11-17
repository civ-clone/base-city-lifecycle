import { IBuildable as Buildable } from '@civ-clone/core-city-build/Buildable';
import City from '@civ-clone/core-city/City';
import CityBuild, {
  CityBuildClearedReason,
} from '@civ-clone/core-city-build/CityBuild';
import { Engine } from '@civ-clone/core-engine/Engine';
import Tile from '@civ-clone/core-world/Tile';

/**
 * Tells clients that `city` now works `tile`, so they can redraw it and show who works it.
 */
export const emitTileWorked = (
  city: City,
  tile: Tile,
  engine: Engine
): void => {
  engine.emit('city:tile-worked', city, tile);
};

/**
 * Tells clients that `city` no longer works `tile`, so they can redraw it.
 */
export const emitTileReleased = (
  city: City,
  tile: Tile,
  engine: Engine
): void => {
  engine.emit('city:tile-released', city, tile);
};

/**
 * Tells clients that `cityBuild`'s `item` is paid for but held back, with the ids of the `Hold` rules holding it (`null`
 *  for a rule without one), for a client to word.
 */
export const emitBuildingHeld = (
  cityBuild: CityBuild,
  item: Buildable,
  held: (string | null)[],
  engine: Engine
): void => {
  engine.emit('city:building-held', cityBuild, item, held);
};

/**
 * Tells clients that `cityBuild` has stopped building `item`, for `reason` (`cancelled`, `unavailable`, `captured`, or
 *  a ruleset's own), so they can show the build as it is now (civ-clone/web-renderer#978). A ruleset raises it before
 *  a city on Auto chooses again, so what was dropped is `item` and `reason`, not `cityBuild.cleared()` or
 *  `cityBuild.building()`, which may already have moved on.
 */
export const emitBuildingCancelled = (
  cityBuild: CityBuild,
  item: Buildable,
  reason: CityBuildClearedReason,
  engine: Engine
): void => {
  engine.emit('city:building-cancelled', cityBuild, item, reason);
};

/**
 * Tells clients that `cityBuild` has built `built`.
 */
export const emitBuildingComplete = (
  cityBuild: CityBuild,
  built: unknown,
  engine: Engine
): void => {
  engine.emit('city:building-complete', cityBuild, built);
};
