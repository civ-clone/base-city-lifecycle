import City from '@civ-clone/core-city/City';
import { CityBuildRegistry } from '@civ-clone/core-city-build/CityBuildRegistry';
import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import CivilDisorder from '@civ-clone/core-city-happiness/Rules/CivilDisorder';
import FoodStorage from '@civ-clone/core-city-growth/Yields/FoodStorage';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { UnitYieldType } from './famine';
import Unsupported from '@civ-clone/core-unit/Rules/Unsupported';
import Yield from '@civ-clone/core-yield/Yield';

/**
 * A city's food for the turn, net of what its citizens and units eat, goes into its food store, and the store is checked:
 *  its `FoodStorage` rules decide whether the city grows or its food has run out.
 */
export const storeFood = (
  food: Yield,
  city: City,
  cityGrowthRegistry: CityGrowthRegistry
): void => {
  const cityGrowth = cityGrowthRegistry.getByCity(city);

  cityGrowth.add(new FoodStorage(food));
  cityGrowth.check();
};

/**
 * A city's production for the turn goes into what it is building, and the build is checked.
 *
 * While the production, net of its units' support, is below 0, the units it can't support go, furthest from the city
 *  first: each is handed to the `Unsupported` rules, and its support (a `ProductionSupportType` yield) is given back.
 *  Nothing is added to the build while a `CivilDisorder` rule holds for the city.
 */
export const buildWithProduction = (
  production: Yield,
  city: City,
  cityYields: Yield[],
  ProductionSupportType: UnitYieldType,
  cityBuildRegistry: CityBuildRegistry,
  ruleRegistry: RuleRegistry
): void => {
  const cityBuild = cityBuildRegistry.getByCity(city),
    availableProduction = production.clone();

  (cityYields as (Yield | InstanceType<UnitYieldType>)[])
    .filter(
      (cityYield): cityYield is InstanceType<UnitYieldType> =>
        cityYield instanceof ProductionSupportType
    )
    .sort(
      (yieldA, yieldB) =>
        (yieldB.unit()?.tile().distanceFrom(city.tile()) ?? 0) -
        (yieldA.unit()?.tile().distanceFrom(city.tile()) ?? 0)
    )
    .forEach((cityYield) => {
      if (availableProduction.value() >= 0) {
        return;
      }

      const unit = cityYield.unit();

      if (unit === null) {
        return;
      }

      ruleRegistry.process(Unsupported, city, unit, cityYield as Yield);

      availableProduction.subtract(cityYield as Yield);
    });

  const updatedCityYields = city.yields();

  // No production happens when there's civil disorder.
  if (
    !ruleRegistry
      .process(CivilDisorder, city, updatedCityYields)
      .some((result: boolean): boolean => result)
  ) {
    cityBuild.add(availableProduction);
  }

  cityBuild.check();
};
