import {
  CityBuild as CityBuildAction,
  ChangeProduction,
} from '@civ-clone/core-city-build/PlayerActions';
import ChangeSpecialist from '@civ-clone/core-city/PlayerActions/ChangeSpecialist';
import ChangeWorkedTile from '@civ-clone/core-city/PlayerActions/ChangeWorkedTile';
import { CityBuildRegistry } from '@civ-clone/core-city-build/CityBuildRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import Player from '@civ-clone/core-player/Player';
import { SpecialistRegistry } from '@civ-clone/core-city/SpecialistRegistry';
/**
 * Whether one of `player`'s cities is building nothing.
 */
export declare const hasCityToChooseProduction: (
  player: Player,
  cityRegistry: CityRegistry,
  cityBuildRegistry: CityBuildRegistry
) => boolean;
/**
 * A `CityBuild` action for each of `player`'s cities that is building nothing, in the order of its cities.
 */
export declare const chooseProductionActions: (
  player: Player,
  cityRegistry: CityRegistry,
  cityBuildRegistry: CityBuildRegistry
) => CityBuildAction[];
/**
 * Whether one of `player`'s cities is building something.
 */
export declare const hasCityToChangeProduction: (
  player: Player,
  cityRegistry: CityRegistry,
  cityBuildRegistry: CityBuildRegistry
) => boolean;
/**
 * A `ChangeProduction` action for each of `player`'s cities that is building something, in the order of its cities.
 */
export declare const changeProductionActions: (
  player: Player,
  cityRegistry: CityRegistry,
  cityBuildRegistry: CityBuildRegistry
) => ChangeProduction[];
/**
 * Whether `player` has a city.
 */
export declare const hasCity: (
  player: Player,
  cityRegistry: CityRegistry
) => boolean;
/**
 * A `ChangeWorkedTile` action for each of `player`'s cities.
 */
export declare const changeWorkedTileActions: (
  player: Player,
  cityRegistry: CityRegistry
) => ChangeWorkedTile[];
/**
 * Whether one of `player`'s cities has a specialist.
 */
export declare const hasSpecialist: (
  player: Player,
  cityRegistry: CityRegistry,
  specialistRegistry: SpecialistRegistry
) => boolean;
/**
 * A `ChangeSpecialist` action for each specialist in each of `player`'s cities.
 */
export declare const changeSpecialistActions: (
  player: Player,
  cityRegistry: CityRegistry,
  specialistRegistry: SpecialistRegistry
) => ChangeSpecialist[];
