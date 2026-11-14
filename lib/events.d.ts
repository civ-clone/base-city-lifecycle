import { IBuildable as Buildable } from '@civ-clone/core-city-build/Buildable';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import { Engine } from '@civ-clone/core-engine/Engine';
import Tile from '@civ-clone/core-world/Tile';
/**
 * Tells clients that `city` now works `tile`, so they can redraw it and show who works it.
 */
export declare const emitTileWorked: (
  city: City,
  tile: Tile,
  engine: Engine
) => void;
/**
 * Tells clients that `city` no longer works `tile`, so they can redraw it.
 */
export declare const emitTileReleased: (
  city: City,
  tile: Tile,
  engine: Engine
) => void;
/**
 * Tells clients that `cityBuild`'s `item` is paid for but held back, with the ids of the `Hold` rules holding it (`null`
 *  for a rule without one), for a client to word.
 */
export declare const emitBuildingHeld: (
  cityBuild: CityBuild,
  item: Buildable,
  held: (string | null)[],
  engine: Engine
) => void;
/**
 * Tells clients that `cityBuild` has built `built`.
 */
export declare const emitBuildingComplete: (
  cityBuild: CityBuild,
  built: unknown,
  engine: Engine
) => void;
