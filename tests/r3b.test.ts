import * as base from '../lib/assignWorkers';
import * as library from '@civ-clone/library-city/lib/assignWorkers';
import { describe, it } from 'mocha';
import {
  destroyUnits,
  releaseSpecialists,
  releaseWorkedTiles,
} from '../lib/destroyed';
import {
  registerCityBuild,
  registerCityGrowth,
  workCityTile,
} from '../lib/created';
import AvailableCityBuildItemsRegistry from '@civ-clone/core-city-build/AvailableCityBuildItemsRegistry';
import AvailableSpecialistRegistry from '@civ-clone/core-city/AvailableSpecialistRegistry';
import CityBuildRegistry from '@civ-clone/core-city-build/CityBuildRegistry';
import CityGrowthRegistry from '@civ-clone/core-city-growth/CityGrowthRegistry';
import Effect from '@civ-clone/core-rule/Effect';
import PlayerWorldRegistry from '@civ-clone/core-player-world/PlayerWorldRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Specialist from '@civ-clone/core-city/Specialist';
import SpecialistRegistry from '@civ-clone/core-city/SpecialistRegistry';
import TileReassigned from '@civ-clone/core-city/Rules/TileReassigned';
import WorkedTile from '@civ-clone/core-city/WorkedTile';
import WorkedTileRegistry from '@civ-clone/core-city/WorkedTileRegistry';
import { emitBuildingComplete } from '../lib/events';
import { expect } from 'chai';
import { releaseOccupiedWorkedTiles } from '../lib/occupiedTiles';

class Entertainer extends Specialist {}
class Scientist extends Specialist {}

const named = (name: string, extra: object = {}) => ({ name, ...extra } as any),
  // A city with no tiles of its own to work, but its centre.
  standInCity = (name: string, centre: unknown, player: unknown) =>
    named(name, {
      tile: () => centre,
      tiles: () => ({ entries: () => [], includes: () => false }),
      tilesWorked: () => ({ yields: () => [], entries: () => [] }),
      player: () => player,
    }),
  growthOf = (size: number) =>
    ({ getByCity: () => ({ size: () => size }) } as any);

describe('assignWorkers', (): void => {
  // The compiled functions, with the yields named the same way: library-city's come from its `Yields` module.
  const source = (fn: unknown): string =>
    String(fn)
      .replace(/Yields_1\.(Food|Production|Trade)/g, '$1')
      .replace(/(Food|Production|Trade)_1\.default/g, '$1');

  it("is library-city's, unchanged", (): void => {
    const names = Object.keys(library).filter(
      (name) => typeof (library as any)[name] === 'function'
    );

    expect(names).to.not.be.empty;
    expect(
      Object.keys(base).filter(
        (name) => typeof (base as any)[name] === 'function'
      )
    ).to.have.members(names);

    names.forEach((name: string): void => {
      expect(source((base as any)[name]), name).to.equal(
        source((library as any)[name])
      );
    });
  });

  it('places citizens as specialists of the first kind offered, and turns one into the next kind', (): void => {
    const specialistRegistry = new SpecialistRegistry(),
      available = new AvailableSpecialistRegistry(),
      city = standInCity('city', named('centre'), named('player'));

    available.register(Entertainer, Scientist);

    const specialist = base.addSpecialist(city, specialistRegistry, available)!;

    expect(specialist).to.instanceOf(Entertainer);
    expect(
      base.citizenCount(city, new WorkedTileRegistry(), specialistRegistry)
    ).to.equal(1);

    const changed = base.changeSpecialist(
      specialist,
      specialistRegistry,
      available
    );

    expect(changed).to.instanceOf(Scientist);
    expect(specialistRegistry.getByCity(city)).to.eql([changed]);
    expect(
      base.addSpecialist(
        city,
        specialistRegistry,
        new AvailableSpecialistRegistry()
      )
    ).to.null;
  });
});

describe('created', (): void => {
  it('gives a new city its build, asked for as a new one, and its growth', (): void => {
    const city = named('city'),
      ruleRegistry = new RuleRegistry(),
      cityBuildRegistry = new CityBuildRegistry(),
      cityGrowthRegistry = new CityGrowthRegistry(),
      cityBuild = registerCityBuild(
        city,
        cityBuildRegistry,
        new AvailableCityBuildItemsRegistry(),
        ruleRegistry
      ),
      cityGrowth = registerCityGrowth(city, cityGrowthRegistry, ruleRegistry);

    expect(cityBuildRegistry.getByCity(city)).to.equal(cityBuild);
    expect(cityBuild.cleared()).to.eql({ reason: 'created', item: null });
    expect(cityGrowthRegistry.getByCity(city)).to.equal(cityGrowth);
    expect(cityGrowth.size()).to.equal(1);
  });

  it('works its own centre, and lets the city that worked it choose again first', (): void => {
    const centre = named('centre'),
      player = named('player'),
      previous = standInCity('previous', named('elsewhere'), player),
      city = standInCity('city', centre, player),
      workedTileRegistry = new WorkedTileRegistry(),
      ruleRegistry = new RuleRegistry(),
      log: unknown[][] = [];

    workedTileRegistry.register(new WorkedTile(centre as any, previous));

    ruleRegistry.register(
      new TileReassigned(
        new Effect((...args: unknown[]) => {
          log.push([
            ...args,
            workedTileRegistry.getByTile(centre as any)!.city(),
          ]);
        })
      )
    );

    workCityTile(
      city,
      ruleRegistry,
      new PlayerWorldRegistry(),
      growthOf(0),
      workedTileRegistry,
      new SpecialistRegistry(),
      new AvailableSpecialistRegistry()
    );

    expect(workedTileRegistry.getByTile(centre as any)!.city()).to.equal(city);
    expect(log).to.eql([[previous, centre, city]]);
  });

  it('places a citizen with no tile to work as a specialist', (): void => {
    const city = standInCity('city', named('centre'), named('player')),
      specialistRegistry = new SpecialistRegistry(),
      available = new AvailableSpecialistRegistry();

    available.register(Entertainer);

    workCityTile(
      city,
      new RuleRegistry(),
      new PlayerWorldRegistry(),
      growthOf(1),
      new WorkedTileRegistry(),
      specialistRegistry,
      available
    );

    expect(specialistRegistry.getByCity(city)).to.have.length(1);
  });
});

describe('destroyed', (): void => {
  it('destroys only the units not destroyed already', (): void => {
    const log: string[] = [],
      unit = (name: string, destroyed: boolean) =>
        named(name, {
          destroyed: () => destroyed,
          destroy: () => log.push(name),
        });

    destroyUnits([unit('a', false), unit('b', true), unit('c', false)]);

    expect(log).to.eql(['a', 'c']);
  });

  it("frees the city's tiles and its specialists, and no other city's", (): void => {
    const city = named('city'),
      other = named('other'),
      workedTileRegistry = new WorkedTileRegistry(),
      specialistRegistry = new SpecialistRegistry(),
      kept = new WorkedTile(named('kept') as any, other),
      keptSpecialist = new Entertainer(other);

    workedTileRegistry.register(
      new WorkedTile(named('a') as any, city),
      kept,
      new WorkedTile(named('b') as any, city)
    );
    specialistRegistry.register(
      new Entertainer(city),
      keptSpecialist,
      new Scientist(city)
    );

    releaseWorkedTiles(city, workedTileRegistry);
    releaseSpecialists(city, specialistRegistry);

    expect(workedTileRegistry.entries()).to.eql([kept]);
    expect(specialistRegistry.entries()).to.eql([keptSpecialist]);
  });
});

describe('releaseOccupiedWorkedTiles', (): void => {
  it("releases the tiles another player's unit stands on, never the centre, and hands them to TileReassigned", (): void => {
    const player = named('player'),
      enemy = named('enemy'),
      centre = named('centre'),
      occupied = named('occupied'),
      own = named('own'),
      free = named('free'),
      city = named('city', { tile: () => centre }),
      workedTileRegistry = new WorkedTileRegistry(),
      ruleRegistry = new RuleRegistry(),
      log: unknown[][] = [],
      unitsOn: Map<unknown, unknown[]> = new Map([
        [centre, [named('enemyOnCentre', { player: () => enemy })]],
        [occupied, [named('enemyUnit', { player: () => enemy })]],
        [own, [named('ownUnit', { player: () => player })]],
      ]),
      centreWorked = new WorkedTile(centre, city),
      ownWorked = new WorkedTile(own, city),
      freeWorked = new WorkedTile(free, city);

    workedTileRegistry.register(
      centreWorked,
      new WorkedTile(occupied, city),
      ownWorked,
      freeWorked
    );

    ruleRegistry.register(
      new TileReassigned(new Effect((...args: unknown[]) => log.push(args)))
    );

    releaseOccupiedWorkedTiles(
      player,
      { getByPlayer: () => [city] } as any,
      { getByTile: (tile: unknown) => unitsOn.get(tile) ?? [] } as any,
      workedTileRegistry,
      ruleRegistry
    );

    expect(workedTileRegistry.entries()).to.eql([
      centreWorked,
      ownWorked,
      freeWorked,
    ]);
    expect(log).to.eql([[city, occupied]]);
  });
});

describe('emitBuildingComplete', (): void => {
  it('tells clients of the build and what was built', (): void => {
    const emitted: unknown[][] = [],
      cityBuild = named('cityBuild'),
      built = named('built');

    emitBuildingComplete(cityBuild, built, {
      emit: (...args: unknown[]) => emitted.push(args),
    } as any);

    expect(emitted).to.eql([['city:building-complete', cityBuild, built]]);
  });
});
