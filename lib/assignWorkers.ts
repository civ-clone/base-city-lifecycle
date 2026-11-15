// Lifted from library-city 0.1.4 (`lib/assignWorkers.ts`), so a game's rules can place a city's citizens without
//  depending on library-city (civ-clone/web-renderer Civ2 M2a, R3b). Since then, it asks what each square gives the city
//  (`City#tileYields`, with its `CityTileYield` rules) and which specialists the city may have (`SpecialistAvailable`).
//  With neither kind of rule registered it does exactly what library-city 0.1.4's does.
import {
  AvailableSpecialistRegistry,
  instance as availableSpecialistRegistryInstance,
} from '@civ-clone/core-city/AvailableSpecialistRegistry';
import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import Food from '@civ-clone/base-terrain-yield-food/Food';
import Production from '@civ-clone/base-terrain-yield-production/Production';
import Trade from '@civ-clone/base-terrain-yield-trade/Trade';
import {
  PlayerWorldRegistry,
  instance as playerWorldRegistryInstance,
} from '@civ-clone/core-player-world/PlayerWorldRegistry';
import {
  SpecialistRegistry,
  instance as specialistRegistryInstance,
} from '@civ-clone/core-city/SpecialistRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import {
  WorkedTileRegistry,
  instance as workedTileRegistryInstance,
} from '@civ-clone/core-city/WorkedTileRegistry';
import City from '@civ-clone/core-city/City';
import CityTileYield from '@civ-clone/core-city/Rules/CityTileYield';
import { IYieldMap } from '@civ-clone/core-world/Tile';
import SpecialistAvailable from '../Rules/SpecialistAvailable';
import Tile from '@civ-clone/core-world/Tile';
import Yield from '@civ-clone/core-yield/Yield';
import { reduceYield } from '@civ-clone/core-yield/lib/reduceYields';
import WorkedTile from '@civ-clone/core-city/WorkedTile';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import Specialist from '@civ-clone/core-city/Specialist';

/**
 * How many citizens `city` has placed: one per worked tile, the city centre included, and one per `Specialist`. A city
 * of size `n` has `n + 1`.
 */
export const citizenCount = (
  city: City,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance,
  specialistRegistry: SpecialistRegistry = specialistRegistryInstance
): number =>
  workedTileRegistry.getByCity(city).length +
  specialistRegistry.getByCity(city).length;

/**
 * The kinds of `Specialist` `city` may have: those the ruleset offers (`AvailableSpecialistRegistry`), in its order,
 * less any a `SpecialistAvailable` rule refuses the city. With no such rule, the registry's own entries.
 */
export const availableSpecialists = (
  city: City,
  availableSpecialistRegistry: AvailableSpecialistRegistry = availableSpecialistRegistryInstance,
  ruleRegistry: RuleRegistry = city.ruleRegistry()
): (typeof Specialist)[] => {
  const types = availableSpecialistRegistry.entries();

  if (ruleRegistry.get(SpecialistAvailable).length === 0) {
    return types;
  }

  return types.filter((SpecialistType: typeof Specialist): boolean =>
    ruleRegistry
      .process(SpecialistAvailable, city, SpecialistType)
      .every((available: boolean): boolean => available)
  );
};

/**
 * Turns each of `city`'s specialists of a kind a `SpecialistAvailable` rule now refuses it (a city that has shrunk, say)
 * into the first kind it may have, and returns how many changed. One with no kind left to become stays as it is. With
 * no such rule nothing is asked and nothing changes.
 */
export const replaceRefusedSpecialists = (
  city: City,
  specialistRegistry: SpecialistRegistry = specialistRegistryInstance,
  availableSpecialistRegistry: AvailableSpecialistRegistry = availableSpecialistRegistryInstance,
  ruleRegistry: RuleRegistry = city.ruleRegistry()
): number => {
  if (ruleRegistry.get(SpecialistAvailable).length === 0) {
    return 0;
  }

  const types = availableSpecialists(
      city,
      availableSpecialistRegistry,
      ruleRegistry
    ),
    [DefaultType] = types;

  if (!DefaultType) {
    return 0;
  }

  const refused = specialistRegistry
    .getByCity(city)
    .filter(
      (specialist) =>
        !types.some((SpecialistType) => specialist instanceof SpecialistType)
    );

  refused.forEach((specialist: Specialist): void => {
    specialistRegistry.unregister(specialist);
    specialistRegistry.register(new DefaultType(city));
  });

  return refused.length;
};

/**
 * Makes a citizen of `city` a `Specialist` of the first kind it may have (an Entertainer, in Civ1). Returns `null` when
 * the ruleset offers it no specialists.
 */
export const addSpecialist = (
  city: City,
  specialistRegistry: SpecialistRegistry = specialistRegistryInstance,
  availableSpecialistRegistry: AvailableSpecialistRegistry = availableSpecialistRegistryInstance,
  ruleRegistry?: RuleRegistry
): Specialist | null => {
  const [SpecialistType] = availableSpecialists(
    city,
    availableSpecialistRegistry,
    ruleRegistry
  );

  if (!SpecialistType) {
    return null;
  }

  const specialist = new SpecialistType(city);

  specialistRegistry.register(specialist);

  return specialist;
};

/**
 * Turns `specialist` into the next kind its city may have, wrapping back to the first. Returns the `Specialist` that
 * replaces it, or `specialist` itself when there is nothing to change it to.
 */
export const changeSpecialist = (
  specialist: Specialist,
  specialistRegistry: SpecialistRegistry = specialistRegistryInstance,
  availableSpecialistRegistry: AvailableSpecialistRegistry = availableSpecialistRegistryInstance,
  ruleRegistry?: RuleRegistry
): Specialist => {
  const city = specialist.city(),
    types = availableSpecialists(
      city,
      availableSpecialistRegistry,
      ruleRegistry
    ),
    NextType =
      types[
        (types.indexOf(specialist.constructor as typeof Specialist) + 1) %
          types.length
      ];

  if (!NextType || specialist instanceof NextType) {
    return specialist;
  }

  const replacement = new NextType(city);

  specialistRegistry.unregister(specialist);
  specialistRegistry.register(replacement);

  return replacement;
};

/**
 * Puts one of `city`'s specialists back to work, and returns whether there was one to remove: one of a kind a
 * `SpecialistAvailable` rule now refuses the city, if any, or else one of the first kind it may have (Entertainers), or
 * else the last.
 */
const removeSpecialist = (
  city: City,
  specialistRegistry: SpecialistRegistry,
  availableSpecialistRegistry: AvailableSpecialistRegistry,
  ruleRegistry: RuleRegistry = city.ruleRegistry()
): boolean => {
  const specialists = specialistRegistry.getByCity(city),
    types = availableSpecialists(
      city,
      availableSpecialistRegistry,
      ruleRegistry
    ),
    [DefaultType] = types,
    refused =
      ruleRegistry.get(SpecialistAvailable).length === 0
        ? undefined
        : specialists.find(
            (specialist) =>
              !types.some(
                (SpecialistType) => specialist instanceof SpecialistType
              )
          ),
    specialist =
      refused ??
      specialists.find(
        (specialist) => DefaultType && specialist instanceof DefaultType
      ) ??
      specialists[specialists.length - 1];

  if (!specialist) {
    return false;
  }

  specialistRegistry.unregister(specialist);

  return true;
};

export const getHighestValueCityTiles = (city: City) =>
  sortTiles(city.tiles().entries(), city);

/**
 * What `tile` is worth to `city`, weighing each of the yields it gives the city (`City#tileYields`, with `rules`) as
 * `Tile#score` weighs the tile's own: by the first weight whose yield type it is, or 0.
 */
export const cityTileScore = (
  city: City,
  tile: Tile,
  weights: IYieldMap[],
  rules: CityTileYield[] = city.tileYieldRules()
): number =>
  city
    .tileYields(tile, rules)
    .map((tileYield: Yield): number => {
      const [value]: IYieldMap[] = weights.filter(
          ([YieldType]: IYieldMap): boolean => tileYield instanceof YieldType
        ),
        weight: number = value ? value[1] || 1 : 0;

      return tileYield.value() * weight;
    })
    .reduce((total: number, value: number): number => total + value, 0);

/** The yields of every tile `city` works, as they are for the city (`City#tileYields`, with `rules`). */
export const workedTileYields = (
  city: City,
  rules: CityTileYield[] = city.tileYieldRules()
): Yield[] =>
  rules.length === 0
    ? city.tilesWorked().yields(city.player())
    : city
        .tilesWorked()
        .entries()
        .flatMap((tile: Tile): Yield[] => city.tileYields(tile, rules));

/**
 * Sorts `tiles` best first for `city` to work: by `weights`, by default food first, then production (more so while the
 * city works no square with any) and trade (likewise). A square is weighed by what it gives the city: with no
 * `CityTileYield` rules, the tile's own yields (`Tile#score`).
 */
export const sortTiles = (
  tiles: Tile[],
  city: City,
  weights?: [typeof Yield, number][]
): Tile[] => {
  const rules = city.tileYieldRules(),
    tileWeights: [typeof Yield, number][] = weights ?? [
      [Food, 8],
      [
        Production,
        3 *
          (reduceYield(workedTileYields(city, rules), Production) === 0
            ? 3
            : 1),
      ],
      [
        Trade,
        1 * (reduceYield(workedTileYields(city, rules), Trade) === 0 ? 2 : 1),
      ],
    ];

  if (rules.length === 0) {
    return tiles.sort(
      (a: Tile, b: Tile) =>
        b.score(city.player(), tileWeights) -
        a.score(city.player(), tileWeights)
    );
  }

  const scores = new Map<Tile, number>(
    tiles.map((tile: Tile): [Tile, number] => [
      tile,
      cityTileScore(city, tile, tileWeights, rules),
    ])
  );

  return tiles.sort((a: Tile, b: Tile) => scores.get(b)! - scores.get(a)!);
};

export const getHighestValueAvailableCityTiles = (
  city: City,
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance
) =>
  getHighestValueCityTiles(city).filter(
    (tile) =>
      workedTileRegistry.tileCanBeWorkedBy(tile, city) &&
      playerWorldRegistry.getByPlayer(city.player()).includes(tile)
  );

/**
 * Rearranges the tiles `city` works from scratch. Its specialists stay as they are, but for any of a kind the city may
 * no longer have (`replaceRefusedSpecialists`).
 */
export const reassignWorkers = (
  city: City,
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance,
  specialistRegistry: SpecialistRegistry = specialistRegistryInstance,
  availableSpecialistRegistry: AvailableSpecialistRegistry = availableSpecialistRegistryInstance,
  ruleRegistry?: RuleRegistry
) => {
  workedTileRegistry
    .getBy('city', city)
    .forEach((workedTile: WorkedTile) =>
      workedTileRegistry.unregister(workedTile)
    );

  workedTileRegistry.register(new WorkedTile(city.tile(), city));

  replaceRefusedSpecialists(
    city,
    specialistRegistry,
    availableSpecialistRegistry,
    ruleRegistry
  );

  assignWorkers(
    city,
    playerWorldRegistry,
    cityGrowthRegistry,
    workedTileRegistry,
    specialistRegistry,
    availableSpecialistRegistry,
    ruleRegistry
  );
};

/**
 * Places each of `city`'s citizens that has no job on the best tile available, or makes them a specialist if there is
 * no tile left to work.
 */
export const assignWorkers: (
  city: City,
  playerWorldRegistry?: PlayerWorldRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  workedTileRegistry?: WorkedTileRegistry,
  specialistRegistry?: SpecialistRegistry,
  availableSpecialistRegistry?: AvailableSpecialistRegistry,
  ruleRegistry?: RuleRegistry
) => void = (
  city: City,
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance,
  specialistRegistry: SpecialistRegistry = specialistRegistryInstance,
  availableSpecialistRegistry: AvailableSpecialistRegistry = availableSpecialistRegistryInstance,
  ruleRegistry?: RuleRegistry
): void => {
  const cityGrowth = cityGrowthRegistry.getByCity(city),
    placed = () =>
      citizenCount(city, workedTileRegistry, specialistRegistry) >=
      cityGrowth.size() + 1;

  getHighestValueAvailableCityTiles(
    city,
    playerWorldRegistry,
    workedTileRegistry
  ).some((tile) => {
    if (placed()) {
      return true;
    }

    workedTileRegistry.register(new WorkedTile(tile, city));

    return false;
  });

  while (
    !placed() &&
    addSpecialist(
      city,
      specialistRegistry,
      availableSpecialistRegistry,
      ruleRegistry
    )
  ) {}
};

/**
 * Places one new citizen of `city` on the best tile available, or makes them a specialist if there is no tile left.
 */
export const assignWorker: (
  city: City,
  playerWorldRegistry?: PlayerWorldRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  workedTileRegistry?: WorkedTileRegistry,
  specialistRegistry?: SpecialistRegistry,
  availableSpecialistRegistry?: AvailableSpecialistRegistry,
  ruleRegistry?: RuleRegistry
) => void = (
  city: City,
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance,
  specialistRegistry: SpecialistRegistry = specialistRegistryInstance,
  availableSpecialistRegistry: AvailableSpecialistRegistry = availableSpecialistRegistryInstance,
  ruleRegistry?: RuleRegistry
): void => {
  const [newTile] = getHighestValueAvailableCityTiles(
    city,
    playerWorldRegistry,
    workedTileRegistry
  );

  if (!newTile) {
    addSpecialist(
      city,
      specialistRegistry,
      availableSpecialistRegistry,
      ruleRegistry
    );

    return;
  }

  workedTileRegistry.register(new WorkedTile(newTile, city));
};

export type WorkedTileChange = 'removed' | 'added' | 'reassigned' | 'none';

/**
 * Changes whether `tile` is worked by `city`, as a player clicking it on the city map would.
 *
 * A tile the city works stops being worked, and its worker becomes a specialist. Any other tile is worked by a
 * specialist, or by a citizen with no job, if the city has one and is allowed to work it. With every citizen already
 * working a tile, the city's workers are reassigned instead. The city centre is always worked.
 */
export const changeWorkedTile: (
  city: City,
  tile: Tile,
  playerWorldRegistry?: PlayerWorldRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  workedTileRegistry?: WorkedTileRegistry,
  specialistRegistry?: SpecialistRegistry,
  availableSpecialistRegistry?: AvailableSpecialistRegistry,
  ruleRegistry?: RuleRegistry
) => WorkedTileChange = (
  city: City,
  tile: Tile,
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance,
  specialistRegistry: SpecialistRegistry = specialistRegistryInstance,
  availableSpecialistRegistry: AvailableSpecialistRegistry = availableSpecialistRegistryInstance,
  ruleRegistry?: RuleRegistry
): WorkedTileChange => {
  if (tile === city.tile() || !city.tiles().includes(tile)) {
    return 'none';
  }

  if (workedTileRegistry.getByTile(tile)?.city() === city) {
    workedTileRegistry.unregisterByTile(tile);

    addSpecialist(
      city,
      specialistRegistry,
      availableSpecialistRegistry,
      ruleRegistry
    );

    return 'removed';
  }

  const size = cityGrowthRegistry.getByCity(city).size();

  if (workedTileRegistry.getByCity(city).length >= size + 1) {
    reassignWorkers(
      city,
      playerWorldRegistry,
      cityGrowthRegistry,
      workedTileRegistry,
      specialistRegistry,
      availableSpecialistRegistry,
      ruleRegistry
    );

    return 'reassigned';
  }

  if (
    !workedTileRegistry.tileCanBeWorkedBy(tile, city) ||
    !playerWorldRegistry.getByPlayer(city.player()).includes(tile)
  ) {
    return 'none';
  }

  if (citizenCount(city, workedTileRegistry, specialistRegistry) >= size + 1) {
    removeSpecialist(
      city,
      specialistRegistry,
      availableSpecialistRegistry,
      ruleRegistry
    );
  }

  workedTileRegistry.register(new WorkedTile(tile, city));

  return 'added';
};

/**
 * Takes jobs away from `city`'s citizens until it has no more than its size allows: specialists first, then the
 * workers on the least valuable tiles. Any specialist left of a kind the city may no longer have becomes one of a kind
 * it may (`replaceRefusedSpecialists`).
 */
export const releaseCitizens = (
  city: City,
  cityGrowth: CityGrowth,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance,
  specialistRegistry: SpecialistRegistry = specialistRegistryInstance,
  availableSpecialistRegistry: AvailableSpecialistRegistry = availableSpecialistRegistryInstance,
  ruleRegistry?: RuleRegistry
): void => {
  const specialists = specialistRegistry.getByCity(city);

  while (
    specialists.length > 0 &&
    citizenCount(city, workedTileRegistry, specialistRegistry) >
      cityGrowth.size() + 1
  ) {
    specialistRegistry.unregister(specialists.pop()!);
  }

  reduceWorkers(city, cityGrowth).forEach((tile: Tile): void =>
    workedTileRegistry.unregisterByTile(tile)
  );

  replaceRefusedSpecialists(
    city,
    specialistRegistry,
    availableSpecialistRegistry,
    ruleRegistry
  );
};

export const reduceWorkers = (city: City, cityGrowth: CityGrowth): Tile[] =>
  sortTiles(
    city
      .tilesWorked()
      .entries()
      .filter((tile: Tile) => tile !== city.tile()),
    city
  ).slice(cityGrowth.size());

export default assignWorkers;
