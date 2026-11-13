import {
  CityBuild as CityBuildAction,
  ChangeProduction,
} from '@civ-clone/core-city-build/PlayerActions';
import ChangeSpecialist from '@civ-clone/core-city/PlayerActions/ChangeSpecialist';
import ChangeWorkedTile from '@civ-clone/core-city/PlayerActions/ChangeWorkedTile';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import { CityBuildRegistry } from '@civ-clone/core-city-build/CityBuildRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import Player from '@civ-clone/core-player/Player';
import { SpecialistRegistry } from '@civ-clone/core-city/SpecialistRegistry';

/**
 * Whether one of `player`'s cities is building nothing.
 */
export const hasCityToChooseProduction = (
  player: Player,
  cityRegistry: CityRegistry,
  cityBuildRegistry: CityBuildRegistry
): boolean =>
  cityRegistry
    .getByPlayer(player)
    .map((city: City): CityBuild => cityBuildRegistry.getByCity(city))
    .some((cityBuild: CityBuild): boolean => !cityBuild.building());

/**
 * A `CityBuild` action for each of `player`'s cities that is building nothing, in the order of its cities.
 */
export const chooseProductionActions = (
  player: Player,
  cityRegistry: CityRegistry,
  cityBuildRegistry: CityBuildRegistry
): CityBuildAction[] =>
  cityRegistry
    .getByPlayer(player)
    .map((city: City): CityBuild => cityBuildRegistry.getByCity(city))
    .filter((cityBuild: CityBuild): boolean => !cityBuild.building())
    .map(
      (cityBuild: CityBuild): CityBuildAction =>
        new CityBuildAction(player, cityBuild)
    );

/**
 * Whether one of `player`'s cities is building something.
 */
export const hasCityToChangeProduction = (
  player: Player,
  cityRegistry: CityRegistry,
  cityBuildRegistry: CityBuildRegistry
): boolean =>
  cityRegistry
    .getByPlayer(player)
    .map((city: City): CityBuild => cityBuildRegistry.getByCity(city))
    .some((cityBuild: CityBuild): boolean => !!cityBuild.building());

/**
 * A `ChangeProduction` action for each of `player`'s cities that is building something, in the order of its cities.
 */
export const changeProductionActions = (
  player: Player,
  cityRegistry: CityRegistry,
  cityBuildRegistry: CityBuildRegistry
): ChangeProduction[] =>
  cityRegistry
    .getByPlayer(player)
    .map((city: City): CityBuild => cityBuildRegistry.getByCity(city))
    .filter((cityBuild: CityBuild): boolean => !!cityBuild.building())
    .map(
      (cityBuild: CityBuild): ChangeProduction =>
        new ChangeProduction(player, cityBuild)
    );

/**
 * Whether `player` has a city.
 */
export const hasCity = (player: Player, cityRegistry: CityRegistry): boolean =>
  cityRegistry.getByPlayer(player).length > 0;

/**
 * A `ChangeWorkedTile` action for each of `player`'s cities.
 */
export const changeWorkedTileActions = (
  player: Player,
  cityRegistry: CityRegistry
): ChangeWorkedTile[] =>
  cityRegistry
    .getByPlayer(player)
    .map((city: City): ChangeWorkedTile => new ChangeWorkedTile(player, city));

/**
 * Whether one of `player`'s cities has a specialist.
 */
export const hasSpecialist = (
  player: Player,
  cityRegistry: CityRegistry,
  specialistRegistry: SpecialistRegistry
): boolean =>
  cityRegistry
    .getByPlayer(player)
    .some((city: City) => specialistRegistry.getByCity(city).length > 0);

/**
 * A `ChangeSpecialist` action for each specialist in each of `player`'s cities.
 */
export const changeSpecialistActions = (
  player: Player,
  cityRegistry: CityRegistry,
  specialistRegistry: SpecialistRegistry
): ChangeSpecialist[] =>
  cityRegistry
    .getByPlayer(player)
    .flatMap((city: City) => specialistRegistry.getByCity(city))
    .map((specialist) => new ChangeSpecialist(player, specialist));
