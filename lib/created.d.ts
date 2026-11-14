import { AvailableSpecialistRegistry } from '@civ-clone/core-city/AvailableSpecialistRegistry';
import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { PlayerWorldRegistry } from '@civ-clone/core-player-world/PlayerWorldRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { SpecialistRegistry } from '@civ-clone/core-city/SpecialistRegistry';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';
import { AvailableCityBuildItemsRegistry } from '@civ-clone/core-city-build/AvailableCityBuildItemsRegistry';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import { CityBuildRegistry } from '@civ-clone/core-city-build/CityBuildRegistry';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
/**
 * Gives a new city its build, whose first item is asked for as a new city's (civ-clone/web-renderer#716).
 */
export declare const registerCityBuild: (
  city: City,
  cityBuildRegistry: CityBuildRegistry,
  availableBuildItemsRegistry: AvailableCityBuildItemsRegistry,
  ruleRegistry?: RuleRegistry
) => CityBuild;
/**
 * Gives a new city its growth: its size and food store.
 */
export declare const registerCityGrowth: (
  city: City,
  cityGrowthRegistry?: CityGrowthRegistry,
  ruleRegistry?: RuleRegistry
) => CityGrowth;
/**
 * A new city works its own centre, taking it from any city that worked it, which its `TileReassigned` rules then let
 * choose another, and puts its citizens to work.
 */
export declare const workCityTile: (
  city: City,
  ruleRegistry?: RuleRegistry,
  playerWorldRegistry?: PlayerWorldRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  workedTileRegistry?: WorkedTileRegistry,
  specialistRegistry?: SpecialistRegistry,
  availableSpecialistRegistry?: AvailableSpecialistRegistry
) => void;
