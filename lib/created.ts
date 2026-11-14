import {
  AvailableSpecialistRegistry,
  instance as availableSpecialistRegistryInstance,
} from '@civ-clone/core-city/AvailableSpecialistRegistry';
import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import {
  PlayerWorldRegistry,
  instance as playerWorldRegistryInstance,
} from '@civ-clone/core-player-world/PlayerWorldRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  SpecialistRegistry,
  instance as specialistRegistryInstance,
} from '@civ-clone/core-city/SpecialistRegistry';
import {
  WorkedTileRegistry,
  instance as workedTileRegistryInstance,
} from '@civ-clone/core-city/WorkedTileRegistry';
import { AvailableCityBuildItemsRegistry } from '@civ-clone/core-city-build/AvailableCityBuildItemsRegistry';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import { CityBuildRegistry } from '@civ-clone/core-city-build/CityBuildRegistry';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import TileReassigned from '@civ-clone/core-city/Rules/TileReassigned';
import WorkedTile from '@civ-clone/core-city/WorkedTile';
import assignWorkers from './assignWorkers';

/**
 * Gives a new city its build, whose first item is asked for as a new city's (civ-clone/web-renderer#716).
 */
export const registerCityBuild = (
  city: City,
  cityBuildRegistry: CityBuildRegistry,
  availableBuildItemsRegistry: AvailableCityBuildItemsRegistry,
  ruleRegistry: RuleRegistry = ruleRegistryInstance
): CityBuild => {
  const cityBuild = new CityBuild(
    city,
    availableBuildItemsRegistry,
    ruleRegistry
  );

  cityBuild.setCleared('created');

  cityBuildRegistry.register(cityBuild);

  return cityBuild;
};

/**
 * Gives a new city its growth: its size and food store.
 */
export const registerCityGrowth = (
  city: City,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance
): CityGrowth => {
  const cityGrowth = new CityGrowth(city, ruleRegistry);

  cityGrowthRegistry.register(cityGrowth);

  return cityGrowth;
};

/**
 * A new city works its own centre, taking it from any city that worked it, which its `TileReassigned` rules then let
 * choose another, and puts its citizens to work.
 */
export const workCityTile = (
  city: City,
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance,
  specialistRegistry: SpecialistRegistry = specialistRegistryInstance,
  availableSpecialistRegistry: AvailableSpecialistRegistry = availableSpecialistRegistryInstance
): void => {
  const existingWorkedTile = workedTileRegistry.getByTile(city.tile());

  if (existingWorkedTile !== null) {
    workedTileRegistry.unregister(existingWorkedTile);
  }

  workedTileRegistry.register(new WorkedTile(city.tile(), city));

  // Give the existing City the chance to reassign its worker before...
  if (existingWorkedTile !== null) {
    ruleRegistry.process(
      TileReassigned,
      existingWorkedTile.city(),
      existingWorkedTile.tile()
    );
  }

  // ...assigning the remaining workers.
  assignWorkers(
    city,
    playerWorldRegistry,
    cityGrowthRegistry,
    workedTileRegistry,
    specialistRegistry,
    availableSpecialistRegistry
  );
};
