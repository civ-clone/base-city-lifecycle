import City from '@civ-clone/core-city/City';
/**
 * What keeps the names cities have been given: a game's `cityNames` (core-civilization's `CityNameRegistry`), of which
 *  only this much is asked.
 */
export type CityNames = {
  claim(name: string): void;
};
/**
 * `city`'s name is claimed, so that no city founded later is given it too.
 */
export declare const claimName: (city: City, cityNames: CityNames) => void;
