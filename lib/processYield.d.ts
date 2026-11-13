import City from '@civ-clone/core-city/City';
import { CityBuildRegistry } from '@civ-clone/core-city-build/CityBuildRegistry';
import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { UnitYieldType } from './famine';
import Yield from '@civ-clone/core-yield/Yield';
/**
 * A city's food for the turn, net of what its citizens and units eat, goes into its food store, and the store is checked:
 *  its `FoodStorage` rules decide whether the city grows or its food has run out.
 */
export declare const storeFood: (
  food: Yield,
  city: City,
  cityGrowthRegistry: CityGrowthRegistry
) => void;
/**
 * A city's production for the turn goes into what it is building, and the build is checked.
 *
 * While the production, net of its units' support, is below 0, the units it can't support go, furthest from the city
 *  first: each is handed to the `Unsupported` rules, and its support (a `ProductionSupportType` yield) is given back.
 *  Nothing is added to the build while a `CivilDisorder` rule holds for the city.
 */
export declare const buildWithProduction: (
  production: Yield,
  city: City,
  cityYields: Yield[],
  ProductionSupportType: UnitYieldType,
  cityBuildRegistry: CityBuildRegistry,
  ruleRegistry: RuleRegistry
) => void;
