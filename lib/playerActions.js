"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeSpecialistActions = exports.hasSpecialist = exports.changeWorkedTileActions = exports.hasCity = exports.changeProductionActions = exports.hasCityToChangeProduction = exports.chooseProductionActions = exports.hasCityToChooseProduction = void 0;
const PlayerActions_1 = require("@civ-clone/core-city-build/PlayerActions");
const ChangeSpecialist_1 = require("@civ-clone/core-city/PlayerActions/ChangeSpecialist");
const ChangeWorkedTile_1 = require("@civ-clone/core-city/PlayerActions/ChangeWorkedTile");
/**
 * Whether one of `player`'s cities is building nothing.
 */
const hasCityToChooseProduction = (player, cityRegistry, cityBuildRegistry) => cityRegistry
    .getByPlayer(player)
    .map((city) => cityBuildRegistry.getByCity(city))
    .some((cityBuild) => !cityBuild.building());
exports.hasCityToChooseProduction = hasCityToChooseProduction;
/**
 * A `CityBuild` action for each of `player`'s cities that is building nothing, in the order of its cities.
 */
const chooseProductionActions = (player, cityRegistry, cityBuildRegistry) => cityRegistry
    .getByPlayer(player)
    .map((city) => cityBuildRegistry.getByCity(city))
    .filter((cityBuild) => !cityBuild.building())
    .map((cityBuild) => new PlayerActions_1.CityBuild(player, cityBuild));
exports.chooseProductionActions = chooseProductionActions;
/**
 * Whether one of `player`'s cities is building something.
 */
const hasCityToChangeProduction = (player, cityRegistry, cityBuildRegistry) => cityRegistry
    .getByPlayer(player)
    .map((city) => cityBuildRegistry.getByCity(city))
    .some((cityBuild) => !!cityBuild.building());
exports.hasCityToChangeProduction = hasCityToChangeProduction;
/**
 * A `ChangeProduction` action for each of `player`'s cities that is building something, in the order of its cities.
 */
const changeProductionActions = (player, cityRegistry, cityBuildRegistry) => cityRegistry
    .getByPlayer(player)
    .map((city) => cityBuildRegistry.getByCity(city))
    .filter((cityBuild) => !!cityBuild.building())
    .map((cityBuild) => new PlayerActions_1.ChangeProduction(player, cityBuild));
exports.changeProductionActions = changeProductionActions;
/**
 * Whether `player` has a city.
 */
const hasCity = (player, cityRegistry) => cityRegistry.getByPlayer(player).length > 0;
exports.hasCity = hasCity;
/**
 * A `ChangeWorkedTile` action for each of `player`'s cities.
 */
const changeWorkedTileActions = (player, cityRegistry) => cityRegistry
    .getByPlayer(player)
    .map((city) => new ChangeWorkedTile_1.default(player, city));
exports.changeWorkedTileActions = changeWorkedTileActions;
/**
 * Whether one of `player`'s cities has a specialist.
 */
const hasSpecialist = (player, cityRegistry, specialistRegistry) => cityRegistry
    .getByPlayer(player)
    .some((city) => specialistRegistry.getByCity(city).length > 0);
exports.hasSpecialist = hasSpecialist;
/**
 * A `ChangeSpecialist` action for each specialist in each of `player`'s cities.
 */
const changeSpecialistActions = (player, cityRegistry, specialistRegistry) => cityRegistry
    .getByPlayer(player)
    .flatMap((city) => specialistRegistry.getByCity(city))
    .map((specialist) => new ChangeSpecialist_1.default(player, specialist));
exports.changeSpecialistActions = changeSpecialistActions;
//# sourceMappingURL=playerActions.js.map