import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import { Engine } from '@civ-clone/core-engine/Engine';
import Unit from '@civ-clone/core-unit/Unit';
import Yield from '@civ-clone/core-yield/Yield';
/**
 * A yield a city pays for one of its units, which knows that unit (or `null`).
 */
export type UnitYieldType = abstract new (...args: any[]) => Yield & {
  unit(): Unit | null;
};
/**
 * The first unit `cityGrowth`'s city feeds, as a `FoodSupportType` yield, in the order of the city's yields (the order
 *  its units were built), or `null`.
 */
export declare const foodSupportedUnit: (
  cityGrowth: CityGrowth,
  FoodSupportType: UnitYieldType
) => Unit | null;
/**
 * Tells clients that `cityGrowth`'s city has run out of food, with the unit it will lose for it, when there is one.
 */
export declare const emitFoodStorageExhausted: (
  cityGrowth: CityGrowth,
  unit: Unit | null,
  engine: Engine
) => void;
/**
 * The city loses the first unit it feeds (see `foodSupportedUnit`), which must exist.
 */
export declare const loseFoodSupportedUnit: (
  cityGrowth: CityGrowth,
  FoodSupportType: UnitYieldType
) => void;
/**
 * The city shrinks, because its food ran out.
 */
export declare const shrinkFromFamine: (cityGrowth: CityGrowth) => void;
/**
 * The city's food store is emptied.
 */
export declare const emptyFoodStore: (cityGrowth: CityGrowth) => void;
