import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import { Engine } from '@civ-clone/core-engine/Engine';
import FoodExhausted from '@civ-clone/core-city-growth/Rules/FoodExhausted';
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
export const foodSupportedUnit = (
  cityGrowth: CityGrowth,
  FoodSupportType: UnitYieldType
): Unit | null =>
  (
    cityGrowth
      .city()
      .yields()
      .find(
        (cityYield: Yield): boolean =>
          cityYield instanceof FoodSupportType &&
          (cityYield as InstanceType<UnitYieldType>).unit() !== null
      ) as InstanceType<UnitYieldType> | undefined
  )?.unit() ?? null;

/**
 * Tells clients that `cityGrowth`'s city has run out of food, with the unit it will lose for it, when there is one.
 */
export const emitFoodStorageExhausted = (
  cityGrowth: CityGrowth,
  unit: Unit | null,
  engine: Engine
): void => {
  if (unit === null) {
    engine.emit('city:food-storage-exhausted', cityGrowth.city());

    return;
  }

  engine.emit('city:food-storage-exhausted', cityGrowth.city(), unit);
};

/**
 * The city loses the first unit it feeds (see `foodSupportedUnit`), which must exist.
 */
export const loseFoodSupportedUnit = (
  cityGrowth: CityGrowth,
  FoodSupportType: UnitYieldType
): void => foodSupportedUnit(cityGrowth, FoodSupportType)!.destroy();

/**
 * The city shrinks, because its food ran out.
 */
export const shrinkFromFamine = (cityGrowth: CityGrowth): void =>
  cityGrowth.shrink(FoodExhausted);

/**
 * The city's food store is emptied.
 */
export const emptyFoodStore = (cityGrowth: CityGrowth): void =>
  cityGrowth.empty();
