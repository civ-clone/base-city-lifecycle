import { AvailableSpecialistRegistry } from '@civ-clone/core-city/AvailableSpecialistRegistry';
import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { PlayerWorldRegistry } from '@civ-clone/core-player-world/PlayerWorldRegistry';
import { SpecialistRegistry } from '@civ-clone/core-city/SpecialistRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';
import City from '@civ-clone/core-city/City';
import CityTileYield from '@civ-clone/core-city/Rules/CityTileYield';
import { IYieldMap } from '@civ-clone/core-world/Tile';
import Tile from '@civ-clone/core-world/Tile';
import Yield from '@civ-clone/core-yield/Yield';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import Specialist from '@civ-clone/core-city/Specialist';
/**
 * How many citizens `city` has placed: one per worked tile, the city centre included, and one per `Specialist`. A city
 * of size `n` has `n + 1`.
 */
export declare const citizenCount: (
  city: City,
  workedTileRegistry?: WorkedTileRegistry,
  specialistRegistry?: SpecialistRegistry
) => number;
/**
 * The kinds of `Specialist` `city` may have: those the ruleset offers (`AvailableSpecialistRegistry`), in its order,
 * less any a `SpecialistAvailable` rule refuses the city. With no such rule, the registry's own entries.
 */
export declare const availableSpecialists: (
  city: City,
  availableSpecialistRegistry?: AvailableSpecialistRegistry,
  ruleRegistry?: RuleRegistry
) => (typeof Specialist)[];
/**
 * Turns each of `city`'s specialists of a kind a `SpecialistAvailable` rule now refuses it (a city that has shrunk, say)
 * into the first kind it may have, and returns how many changed. One with no kind left to become stays as it is. With
 * no such rule nothing is asked and nothing changes.
 */
export declare const replaceRefusedSpecialists: (
  city: City,
  specialistRegistry?: SpecialistRegistry,
  availableSpecialistRegistry?: AvailableSpecialistRegistry,
  ruleRegistry?: RuleRegistry
) => number;
/**
 * Makes a citizen of `city` a `Specialist` of the first kind it may have (an Entertainer, in Civ1). Returns `null` when
 * the ruleset offers it no specialists.
 */
export declare const addSpecialist: (
  city: City,
  specialistRegistry?: SpecialistRegistry,
  availableSpecialistRegistry?: AvailableSpecialistRegistry,
  ruleRegistry?: RuleRegistry
) => Specialist | null;
/**
 * Turns `specialist` into the next kind its city may have, wrapping back to the first. Returns the `Specialist` that
 * replaces it, or `specialist` itself when there is nothing to change it to.
 */
export declare const changeSpecialist: (
  specialist: Specialist,
  specialistRegistry?: SpecialistRegistry,
  availableSpecialistRegistry?: AvailableSpecialistRegistry,
  ruleRegistry?: RuleRegistry
) => Specialist;
export declare const getHighestValueCityTiles: (city: City) => Tile[];
/**
 * What `tile` is worth to `city`, weighing each of the yields it gives the city (`City#tileYields`, with `rules`) as
 * `Tile#score` weighs the tile's own: by the first weight whose yield type it is, or 0.
 */
export declare const cityTileScore: (
  city: City,
  tile: Tile,
  weights: IYieldMap[],
  rules?: CityTileYield[]
) => number;
/** The yields of every tile `city` works, as they are for the city (`City#tileYields`, with `rules`). */
export declare const workedTileYields: (
  city: City,
  rules?: CityTileYield[]
) => Yield[];
/**
 * Sorts `tiles` best first for `city` to work: by `weights`, by default food first, then production (more so while the
 * city works no square with any) and trade (likewise). A square is weighed by what it gives the city: with no
 * `CityTileYield` rules, the tile's own yields (`Tile#score`).
 */
export declare const sortTiles: (
  tiles: Tile[],
  city: City,
  weights?: [typeof Yield, number][]
) => Tile[];
export declare const getHighestValueAvailableCityTiles: (
  city: City,
  playerWorldRegistry?: PlayerWorldRegistry,
  workedTileRegistry?: WorkedTileRegistry
) => Tile[];
/**
 * Rearranges the tiles `city` works from scratch. Its specialists stay as they are, but for any of a kind the city may
 * no longer have (`replaceRefusedSpecialists`).
 */
export declare const reassignWorkers: (
  city: City,
  playerWorldRegistry?: PlayerWorldRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  workedTileRegistry?: WorkedTileRegistry,
  specialistRegistry?: SpecialistRegistry,
  availableSpecialistRegistry?: AvailableSpecialistRegistry,
  ruleRegistry?: RuleRegistry
) => void;
/**
 * Places each of `city`'s citizens that has no job on the best tile available, or makes them a specialist if there is
 * no tile left to work.
 */
export declare const assignWorkers: (
  city: City,
  playerWorldRegistry?: PlayerWorldRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  workedTileRegistry?: WorkedTileRegistry,
  specialistRegistry?: SpecialistRegistry,
  availableSpecialistRegistry?: AvailableSpecialistRegistry,
  ruleRegistry?: RuleRegistry
) => void;
/**
 * Places one new citizen of `city` on the best tile available, or makes them a specialist if there is no tile left.
 */
export declare const assignWorker: (
  city: City,
  playerWorldRegistry?: PlayerWorldRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  workedTileRegistry?: WorkedTileRegistry,
  specialistRegistry?: SpecialistRegistry,
  availableSpecialistRegistry?: AvailableSpecialistRegistry,
  ruleRegistry?: RuleRegistry
) => void;
export type WorkedTileChange = 'removed' | 'added' | 'reassigned' | 'none';
/**
 * Changes whether `tile` is worked by `city`, as a player clicking it on the city map would.
 *
 * A tile the city works stops being worked, and its worker becomes a specialist. Any other tile is worked by a
 * specialist, or by a citizen with no job, if the city has one and is allowed to work it. With every citizen already
 * working a tile, the city's workers are reassigned instead. The city centre is always worked.
 */
export declare const changeWorkedTile: (
  city: City,
  tile: Tile,
  playerWorldRegistry?: PlayerWorldRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  workedTileRegistry?: WorkedTileRegistry,
  specialistRegistry?: SpecialistRegistry,
  availableSpecialistRegistry?: AvailableSpecialistRegistry,
  ruleRegistry?: RuleRegistry
) => WorkedTileChange;
/**
 * Takes jobs away from `city`'s citizens until it has no more than its size allows: specialists first, then the
 * workers on the least valuable tiles. Any specialist left of a kind the city may no longer have becomes one of a kind
 * it may (`replaceRefusedSpecialists`).
 */
export declare const releaseCitizens: (
  city: City,
  cityGrowth: CityGrowth,
  workedTileRegistry?: WorkedTileRegistry,
  specialistRegistry?: SpecialistRegistry,
  availableSpecialistRegistry?: AvailableSpecialistRegistry,
  ruleRegistry?: RuleRegistry
) => void;
export declare const reduceWorkers: (
  city: City,
  cityGrowth: CityGrowth
) => Tile[];
export default assignWorkers;
