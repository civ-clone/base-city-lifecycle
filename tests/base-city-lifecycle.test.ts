import { describe, it } from 'mocha';
import { buildWithProduction, storeFood } from '../lib/processYield';
import {
  changeProductionActions,
  changeSpecialistActions,
  changeWorkedTileActions,
  chooseProductionActions,
  hasCity,
  hasCityToChangeProduction,
  hasCityToChooseProduction,
  hasSpecialist,
} from '../lib/playerActions';
import {
  emitBuildingHeld,
  emitTileReleased,
  emitTileWorked,
} from '../lib/events';
import {
  emitFoodStorageExhausted,
  emptyFoodStore,
  foodSupportedUnit,
  loseFoodSupportedUnit,
  shrinkFromFamine,
} from '../lib/famine';
import { enemyWorkedTile, releaseEnemyWorkedTile } from '../lib/occupiedTiles';
import {
  exhaustFood,
  grow,
  hasFoodToGrow,
  isFoodExhausted,
} from '../lib/foodStorage';
import {
  isNotAnotherCity,
  isNotOccupiedByEnemy,
  isNotWorked,
} from '../lib/canBeWorked';
import {
  ChangeProduction,
  CityBuild as CityBuildAction,
} from '@civ-clone/core-city-build/PlayerActions';
import ChangeSpecialist from '@civ-clone/core-city/PlayerActions/ChangeSpecialist';
import ChangeWorkedTile from '@civ-clone/core-city/PlayerActions/ChangeWorkedTile';
import CivilDisorder from '@civ-clone/core-city-happiness/Rules/CivilDisorder';
import Effect from '@civ-clone/core-rule/Effect';
import FoodExhausted from '@civ-clone/core-city-growth/Rules/FoodExhausted';
import FoodStorage from '@civ-clone/core-city-growth/Yields/FoodStorage';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import TileReassigned from '@civ-clone/core-city/Rules/TileReassigned';
import Unsupported from '@civ-clone/core-unit/Rules/Unsupported';
import Yield from '@civ-clone/core-yield/Yield';
import { claimName } from '../lib/claimName';
import { disbandUnsupported } from '../lib/unsupported';
import { expect } from 'chai';

class Grain extends Yield {}
class Ore extends Yield {}

// A yield paid for a unit, as a city's unit support is.
class Fed extends Yield {
  private _unit: any;

  constructor(value: number, unit: any) {
    super(value);

    this._unit = unit;
  }

  unit(): any {
    return this._unit;
  }
}
class Kept extends Fed {}

const recordingEngine = () => {
    const emitted: unknown[][] = [];

    return {
      emitted,
      engine: {
        emit: (...args: unknown[]): void => {
          emitted.push(args);
        },
      } as any,
    };
  },
  named = (name: string, extra: object = {}) => ({ name, ...extra } as any),
  standInGrowth = (
    progress: number,
    cost: number,
    yields: Yield[] = [],
    log: unknown[][] = []
  ) =>
    ({
      city: () => ({ yields: () => yields }),
      progress: () => new Yield(progress),
      cost: () => new Yield(cost),
      grow: (...args: unknown[]) => log.push(['grow', ...args]),
      shrink: (...args: unknown[]) => log.push(['shrink', ...args]),
      empty: (...args: unknown[]) => log.push(['empty', ...args]),
    } as any);

describe('events', (): void => {
  it('tells clients of a worked or released tile and a held build, with just those arguments', (): void => {
    const { emitted, engine } = recordingEngine(),
      city = named('city'),
      tile = named('tile'),
      cityBuild = named('cityBuild'),
      item = named('item');

    emitTileWorked(city, tile, engine);
    emitTileReleased(city, tile, engine);
    emitBuildingHeld(cityBuild, item, ['a', null], engine);

    expect(emitted).to.eql([
      ['city:tile-worked', city, tile],
      ['city:tile-released', city, tile],
      ['city:building-held', cityBuild, item, ['a', null]],
    ]);
  });
});

describe('foodStorage', (): void => {
  it('grows once the store holds the cost, and runs out below 0', (): void => {
    expect(hasFoodToGrow(standInGrowth(19, 20))).to.false;
    expect(hasFoodToGrow(standInGrowth(20, 20))).to.true;
    expect(hasFoodToGrow(standInGrowth(21, 20))).to.true;
    expect(isFoodExhausted(standInGrowth(0, 20))).to.false;
    expect(isFoodExhausted(standInGrowth(-1, 20))).to.true;
  });

  it('grows the city with no cause, and hands a city out of food to the FoodExhausted rules', (): void => {
    const log: unknown[][] = [],
      cityGrowth = standInGrowth(-1, 20, [], log),
      ruleRegistry = new RuleRegistry(),
      exhausted: unknown[][] = [];

    ruleRegistry.register(
      new FoodExhausted(
        new Effect((...args: unknown[]) => exhausted.push(args))
      )
    );

    grow(cityGrowth);
    exhaustFood(cityGrowth, ruleRegistry);

    expect(log).to.eql([['grow']]);
    expect(exhausted).to.eql([[cityGrowth]]);
  });
});

describe('famine', (): void => {
  const founder = named('founder', { destroy: () => {} }),
    other = named('other');

  it('finds the first unit fed by a yield of the given type, skipping yields for no unit', (): void => {
    expect(
      foodSupportedUnit(
        standInGrowth(0, 0, [
          new Grain(2),
          new Fed(1, null),
          new Kept(1, other),
          new Fed(1, founder),
        ]),
        Fed
      )
    ).to.equal(other);
    expect(
      foodSupportedUnit(
        standInGrowth(0, 0, [new Kept(1, other), new Fed(1, founder)]),
        Kept
      )
    ).to.equal(other);
    expect(
      foodSupportedUnit(
        standInGrowth(0, 0, [new Grain(1), new Fed(1, null)]),
        Fed
      )
    ).to.null;
  });

  it('tells clients of the famine, with the unit lost to it only when there is one', (): void => {
    const { emitted, engine } = recordingEngine(),
      city = named('city'),
      cityGrowth = { city: () => city } as any;

    emitFoodStorageExhausted(cityGrowth, null, engine);
    emitFoodStorageExhausted(cityGrowth, founder, engine);

    expect(emitted).to.eql([
      ['city:food-storage-exhausted', city],
      ['city:food-storage-exhausted', city, founder],
    ]);
    expect(emitted[0]).to.length(2);
  });

  it('loses the first unit fed, or shrinks the city for its famine, and empties the store', (): void => {
    const destroyed: unknown[][] = [],
      unit = named('unit', {
        destroy: (...args: unknown[]) => destroyed.push(args),
      }),
      log: unknown[][] = [],
      cityGrowth = standInGrowth(-1, 20, [new Fed(1, unit)], log);

    loseFoodSupportedUnit(cityGrowth, Fed);
    shrinkFromFamine(cityGrowth);
    emptyFoodStore(cityGrowth);

    expect(destroyed).to.eql([[]]);
    expect(log).to.eql([['shrink', FoodExhausted], ['empty']]);
  });
});

describe('processYield', (): void => {
  it("adds the city's food to its store as FoodStorage, then checks it", (): void => {
    const log: unknown[][] = [],
      city = named('city'),
      cityGrowth = {
        add: (food: Yield) =>
          log.push(['add', food instanceof FoodStorage, food.value()]),
        check: () => log.push(['check']),
      };

    storeFood(new Grain(3), city, {
      getByCity: (forCity: unknown) => {
        expect(forCity).to.equal(city);

        return cityGrowth;
      },
    } as any);

    expect(log).to.eql([['add', true, 3], ['check']]);
  });

  const unitAt = (name: string, distance: number) =>
      named(name, {
        tile: () => ({ distanceFrom: () => distance }),
      }),
    setUp = (disorder: boolean) => {
      const log: unknown[][] = [],
        ruleRegistry = new RuleRegistry(),
        city = named('city', {
          tile: () => ({}),
          yields: () => {
            log.push(['yields']);

            return [];
          },
        }),
        cityBuild = {
          add: (production: Yield) => log.push(['add', production.value()]),
          check: () => log.push(['check']),
        };

      ruleRegistry.register(
        new Unsupported(
          new Effect((forCity: unknown, unit: any, cityYield: Yield) =>
            log.push(['unsupported', unit.name, cityYield.value()])
          )
        ),
        new CivilDisorder(
          new Effect(() => {
            log.push(['disorder?']);

            return disorder;
          })
        )
      );

      return {
        log,
        ruleRegistry,
        city,
        cityBuildRegistry: { getByCity: () => cityBuild } as any,
      };
    };

  it('loses the furthest units it can no longer support, until production is back to 0, then builds with what is left', (): void => {
    const { log, ruleRegistry, city, cityBuildRegistry } = setUp(false),
      cityYields: Yield[] = [
        new Kept(-1, unitAt('near', 1)),
        new Kept(-1, null),
        new Kept(-1, unitAt('far', 5)),
        new Ore(-1),
        new Kept(-1, unitAt('middle', 3)),
      ],
      production = new Grain(-2);

    buildWithProduction(
      production,
      city,
      cityYields,
      Kept,
      cityBuildRegistry,
      ruleRegistry
    );

    expect(log).to.eql([
      ['unsupported', 'far', -1],
      ['unsupported', 'middle', -1],
      ['yields'],
      ['disorder?'],
      ['add', 0],
      ['check'],
    ]);
    expect(production.value()).to.equal(-2);
  });

  it('builds nothing while there is civil disorder, but still checks the build', (): void => {
    const { log, ruleRegistry, city, cityBuildRegistry } = setUp(true);

    buildWithProduction(
      new Grain(4),
      city,
      [new Kept(-1, unitAt('near', 1))],
      Kept,
      cityBuildRegistry,
      ruleRegistry
    );

    expect(log).to.eql([['yields'], ['disorder?'], ['check']]);
  });
});

describe('canBeWorked', (): void => {
  const player = named('player'),
    enemy = named('enemy'),
    city = named('city', { player: () => player }),
    tile = named('tile');

  it('is not worked yet', (): void => {
    expect(isNotWorked(tile, { tileIsWorked: () => false } as any)).to.true;
    expect(isNotWorked(tile, { tileIsWorked: () => true } as any)).to.false;
  });

  it("has no other player's unit on it", (): void => {
    const unitsOf = (...players: unknown[]) =>
      ({
        getByTile: () => players.map((owner) => ({ player: () => owner })),
      } as any);

    expect(isNotOccupiedByEnemy(tile, city, unitsOf())).to.true;
    expect(isNotOccupiedByEnemy(tile, city, unitsOf(player))).to.true;
    expect(isNotOccupiedByEnemy(tile, city, unitsOf(player, enemy))).to.false;
  });

  it("isn't another city's centre", (): void => {
    const cityOn = (other: unknown) => ({ getByTile: () => other } as any);

    expect(isNotAnotherCity(tile, city, cityOn(null))).to.true;
    expect(isNotAnotherCity(tile, city, cityOn(city))).to.true;
    expect(isNotAnotherCity(tile, city, cityOn(named('other')))).to.false;
  });
});

describe('claimName and disbandUnsupported', (): void => {
  it("claims the city's name", (): void => {
    const claimed: string[] = [];

    claimName(named('city', { name: () => 'Ur' }), {
      claim: (name: string) => claimed.push(name),
    });

    expect(claimed).to.eql(['Ur']);
  });

  it('destroys the unit, by no one', (): void => {
    const destroyed: unknown[][] = [];

    disbandUnsupported(
      named('city'),
      named('unit', { destroy: (...args: unknown[]) => destroyed.push(args) })
    );

    expect(destroyed).to.eql([[]]);
  });
});

describe('playerActions', (): void => {
  const player = named('player'),
    building = { building: () => named('item') },
    idle = { building: () => null },
    cities = [named('a'), named('b'), named('c')],
    builds = new Map<unknown, unknown>([
      [cities[0], building],
      [cities[1], idle],
      [cities[2], building],
    ]),
    cityRegistry = { getByPlayer: () => cities } as any,
    cityBuildRegistry = {
      getByCity: (city: unknown) => builds.get(city),
    } as any;

  it('offers a choice of production for each city building nothing, and a change for each building something', (): void => {
    expect(hasCityToChooseProduction(player, cityRegistry, cityBuildRegistry))
      .to.true;
    expect(hasCityToChangeProduction(player, cityRegistry, cityBuildRegistry))
      .to.true;

    const choose = chooseProductionActions(
        player,
        cityRegistry,
        cityBuildRegistry
      ),
      change = changeProductionActions(player, cityRegistry, cityBuildRegistry);

    expect(choose.map((action) => action.constructor)).to.eql([
      CityBuildAction,
    ]);
    expect(choose.map((action) => action.value())).to.eql([idle]);
    expect(change.map((action) => action.constructor)).to.eql([
      ChangeProduction,
      ChangeProduction,
    ]);
    expect(change.map((action) => action.value())).to.eql([building, building]);

    const allBuilding = { getByCity: () => building } as any;

    expect(hasCityToChooseProduction(player, cityRegistry, allBuilding)).to
      .false;
    expect(chooseProductionActions(player, cityRegistry, allBuilding)).to.eql(
      []
    );
    expect(
      hasCityToChangeProduction(player, cityRegistry, {
        getByCity: () => idle,
      } as any)
    ).to.false;
  });

  it('offers a worked-tile change for each city, and a specialist change for each specialist', (): void => {
    const noCities = { getByPlayer: () => [] } as any,
      specialists = new Map<unknown, unknown[]>([
        [cities[0], []],
        [cities[1], ['s1', 's2']],
        [cities[2], ['s3']],
      ]),
      specialistRegistry = {
        getByCity: (city: unknown) => specialists.get(city),
      } as any;

    expect(hasCity(player, cityRegistry)).to.true;
    expect(hasCity(player, noCities)).to.false;

    const worked = changeWorkedTileActions(player, cityRegistry);

    expect(worked.map((action) => action.constructor)).to.eql([
      ChangeWorkedTile,
      ChangeWorkedTile,
      ChangeWorkedTile,
    ]);
    expect(worked.map((action) => action.value())).to.eql(cities);

    expect(hasSpecialist(player, cityRegistry, specialistRegistry)).to.true;
    expect(hasSpecialist(player, cityRegistry, { getByCity: () => [] } as any))
      .to.false;

    const changes = changeSpecialistActions(
      player,
      cityRegistry,
      specialistRegistry
    );

    expect(changes.map((action) => action.constructor)).to.eql([
      ChangeSpecialist,
      ChangeSpecialist,
      ChangeSpecialist,
    ]);
    expect(changes.map((action) => action.value())).to.eql(['s1', 's2', 's3']);
  });
});

describe('occupiedTiles', (): void => {
  const player = named('player'),
    enemy = named('enemy'),
    centre = named('centre'),
    tile = named('tile'),
    enemyCity = named('enemyCity', {
      tile: () => centre,
      player: () => enemy,
    }),
    unit = named('unit', { player: () => player }),
    workedBy = (city: unknown, on: unknown) => ({
      city: () => city,
      tile: () => on,
    }),
    registryOf = (workedTile: unknown, log: unknown[][] = []) =>
      ({
        getByTile: () => workedTile,
        unregister: (...args: unknown[]) => log.push(['unregister', ...args]),
      } as any);

  it("finds a tile another player's city works, other than its centre", (): void => {
    const worked = workedBy(enemyCity, tile);

    expect(enemyWorkedTile(unit, tile, registryOf(null))).to.null;
    expect(enemyWorkedTile(unit, tile, registryOf(worked))).to.equal(worked);
    expect(
      enemyWorkedTile(unit, centre, registryOf(workedBy(enemyCity, centre)))
    ).to.null;
    expect(
      enemyWorkedTile(
        unit,
        tile,
        registryOf(
          workedBy(
            named('own', { tile: () => centre, player: () => player }),
            tile
          )
        )
      )
    ).to.null;
  });

  it("releases it from the city and hands the city to its TileReassigned rules, only when it's still worked", (): void => {
    const log: unknown[][] = [],
      ruleRegistry = new RuleRegistry(),
      worked = workedBy(enemyCity, tile);

    ruleRegistry.register(
      new TileReassigned(
        new Effect((...args: unknown[]) => log.push(['reassigned', ...args]))
      )
    );

    releaseEnemyWorkedTile(unit, tile, registryOf(null, log), ruleRegistry);

    expect(log).to.eql([]);

    releaseEnemyWorkedTile(unit, tile, registryOf(worked, log), ruleRegistry);

    expect(log).to.eql([
      ['unregister', worked],
      ['reassigned', enemyCity, tile],
    ]);
  });
});
