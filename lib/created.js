"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workCityTile = exports.registerCityGrowth = exports.registerCityBuild = void 0;
const AvailableSpecialistRegistry_1 = require("@civ-clone/core-city/AvailableSpecialistRegistry");
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const PlayerWorldRegistry_1 = require("@civ-clone/core-player-world/PlayerWorldRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const SpecialistRegistry_1 = require("@civ-clone/core-city/SpecialistRegistry");
const WorkedTileRegistry_1 = require("@civ-clone/core-city/WorkedTileRegistry");
const CityBuild_1 = require("@civ-clone/core-city-build/CityBuild");
const CityGrowth_1 = require("@civ-clone/core-city-growth/CityGrowth");
const TileReassigned_1 = require("@civ-clone/core-city/Rules/TileReassigned");
const WorkedTile_1 = require("@civ-clone/core-city/WorkedTile");
const assignWorkers_1 = require("./assignWorkers");
/**
 * Gives a new city its build, whose first item is asked for as a new city's (civ-clone/web-renderer#716).
 */
const registerCityBuild = (city, cityBuildRegistry, availableBuildItemsRegistry, ruleRegistry = RuleRegistry_1.instance) => {
    const cityBuild = new CityBuild_1.default(city, availableBuildItemsRegistry, ruleRegistry);
    cityBuild.setCleared('created');
    cityBuildRegistry.register(cityBuild);
    return cityBuild;
};
exports.registerCityBuild = registerCityBuild;
/**
 * Gives a new city its growth: its size and food store.
 */
const registerCityGrowth = (city, cityGrowthRegistry = CityGrowthRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance) => {
    const cityGrowth = new CityGrowth_1.default(city, ruleRegistry);
    cityGrowthRegistry.register(cityGrowth);
    return cityGrowth;
};
exports.registerCityGrowth = registerCityGrowth;
/**
 * A new city works its own centre, taking it from any city that worked it, which its `TileReassigned` rules then let
 * choose another, and puts its citizens to work.
 */
const workCityTile = (city, ruleRegistry = RuleRegistry_1.instance, playerWorldRegistry = PlayerWorldRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance, specialistRegistry = SpecialistRegistry_1.instance, availableSpecialistRegistry = AvailableSpecialistRegistry_1.instance) => {
    const existingWorkedTile = workedTileRegistry.getByTile(city.tile());
    if (existingWorkedTile !== null) {
        workedTileRegistry.unregister(existingWorkedTile);
    }
    workedTileRegistry.register(new WorkedTile_1.default(city.tile(), city));
    // Give the existing City the chance to reassign its worker before...
    if (existingWorkedTile !== null) {
        ruleRegistry.process(TileReassigned_1.default, existingWorkedTile.city(), existingWorkedTile.tile());
    }
    // ...assigning the remaining workers.
    (0, assignWorkers_1.default)(city, playerWorldRegistry, cityGrowthRegistry, workedTileRegistry, specialistRegistry, availableSpecialistRegistry);
};
exports.workCityTile = workCityTile;
//# sourceMappingURL=created.js.map