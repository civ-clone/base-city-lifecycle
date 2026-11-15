import {
  addSpecialist,
  availableSpecialists,
  changeSpecialist,
  changeWorkedTile,
  cityTileScore,
  releaseCitizens,
  replaceRefusedSpecialists,
  sortTiles,
  workedTileYields,
} from '../lib/assignWorkers';
import AvailableSpecialistRegistry from '@civ-clone/core-city/AvailableSpecialistRegistry';
import CityGrowthRegistry from '@civ-clone/core-city-growth/CityGrowthRegistry';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Food from '@civ-clone/base-terrain-yield-food/Food';
import PlayerWorldRegistry from '@civ-clone/core-player-world/PlayerWorldRegistry';
import Production from '@civ-clone/base-terrain-yield-production/Production';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Specialist from '@civ-clone/core-city/Specialist';
import SpecialistAvailable from '../Rules/SpecialistAvailable';
import SpecialistRegistry from '@civ-clone/core-city/SpecialistRegistry';
import Trade from '@civ-clone/base-terrain-yield-trade/Trade';
import WorkedTile from '@civ-clone/core-city/WorkedTile';
import WorkedTileRegistry from '@civ-clone/core-city/WorkedTileRegistry';
import Yield from '@civ-clone/core-yield/Yield';
import { expect } from 'chai';

class Entertainer extends Specialist {}
class TaxCollector extends Specialist {}
class Scientist extends Specialist {}

const named = (name: string, extra: object = {}) => ({ name, ...extra } as any);

describe('SpecialistAvailable', (): void => {
  const setUp = (size: number, withRule: boolean) => {
    const ruleRegistry = new RuleRegistry(),
      available = new AvailableSpecialistRegistry(),
      specialistRegistry = new SpecialistRegistry(),
      city = named('city', { size, ruleRegistry: () => ruleRegistry });

    available.register(Entertainer, TaxCollector, Scientist);

    if (withRule) {
      // Only entertainers below size 5.
      ruleRegistry.register(
        new SpecialistAvailable(
          new Criterion(
            (city: any, SpecialistType: typeof Specialist): boolean =>
              SpecialistType !== Entertainer
          ),
          new Effect((city: any): boolean => city.size >= 5)
        )
      );
    }

    return { available, city, ruleRegistry, specialistRegistry };
  };

  it("offers every kind registered, as the registry's own list, with no rule", (): void => {
    const { available, city, ruleRegistry } = setUp(3, false);

    expect(availableSpecialists(city, available, ruleRegistry)).to.eql([
      Entertainer,
      TaxCollector,
      Scientist,
    ]);
  });

  it('leaves out the kinds a rule refuses the city', (): void => {
    const small = setUp(3, true),
      large = setUp(5, true);

    expect(
      availableSpecialists(small.city, small.available, small.ruleRegistry)
    ).to.eql([Entertainer]);
    expect(
      availableSpecialists(large.city, large.available, large.ruleRegistry)
    ).to.eql([Entertainer, TaxCollector, Scientist]);
  });

  it('cycles a specialist only through the kinds its city may have', (): void => {
    [
      [3, [Entertainer, Entertainer]],
      [5, [TaxCollector, Scientist, Entertainer]],
    ].forEach(([size, expected]) => {
      const { available, city, ruleRegistry, specialistRegistry } = setUp(
          size as number,
          true
        ),
        seen: (typeof Specialist)[] = [];

      let specialist = addSpecialist(
        city,
        specialistRegistry,
        available,
        ruleRegistry
      )!;

      expect(specialist).instanceOf(Entertainer);

      (expected as (typeof Specialist)[]).forEach((): void => {
        specialist = changeSpecialist(
          specialist,
          specialistRegistry,
          available,
          ruleRegistry
        );

        seen.push(specialist.constructor as typeof Specialist);
      });

      expect(seen).to.eql(expected);
      expect(specialistRegistry.getByCity(city)).to.eql([specialist]);
    });
  });

  it("asks the city's own rules when none are passed", (): void => {
    const { available, city } = setUp(3, true);

    expect(availableSpecialists(city, available)).to.eql([Entertainer]);
    expect(
      changeSpecialist(
        addSpecialist(city, new SpecialistRegistry(), available)!,
        new SpecialistRegistry(),
        available
      )
    ).instanceOf(Entertainer);
  });

  it('turns a kind the city may no longer have into one it may, once it shrinks', (): void => {
    const { available, city, ruleRegistry, specialistRegistry } = setUp(
        5,
        true
      ),
      taxCollector = new TaxCollector(city),
      entertainer = new Entertainer(city);

    specialistRegistry.register(taxCollector, entertainer);

    // Still size 5: nothing changes.
    expect(
      replaceRefusedSpecialists(city, specialistRegistry, available)
    ).to.equal(0);

    city.size = 4;
    city.tilesWorked = () => ({ entries: () => [], yields: () => [] });
    city.player = () => null;
    city.tile = () => null;
    city.tileYieldRules = () => [];

    releaseCitizens(
      city,
      { size: () => 4 } as any,
      { getByCity: () => [], getTilesByCity: () => [] } as any,
      specialistRegistry,
      available
    );

    expect(
      specialistRegistry
        .getByCity(city)
        .map((specialist) => specialist.constructor)
    ).to.eql([Entertainer, Entertainer]);
    expect(specialistRegistry.getByCity(city)).to.include(entertainer);
    expect(ruleRegistry.get(SpecialistAvailable)).to.have.length(1);
  });

  it('changes no specialist with no rule', (): void => {
    const { available, city, specialistRegistry } = setUp(3, false),
      scientist = new Scientist(city);

    specialistRegistry.register(scientist);

    expect(
      replaceRefusedSpecialists(city, specialistRegistry, available)
    ).to.equal(0);
    expect(specialistRegistry.getByCity(city)).to.eql([scientist]);
  });

  it('makes no specialist when the city may have none', (): void => {
    const { available, city, ruleRegistry, specialistRegistry } = setUp(
      3,
      false
    );

    ruleRegistry.register(new SpecialistAvailable(new Effect(() => false)));

    expect(addSpecialist(city, specialistRegistry, available, ruleRegistry))
      .null;
  });

  it('puts a specialist of a kind the city may no longer have back to work first', (): void => {
    const ruleRegistry = new RuleRegistry(),
      available = new AvailableSpecialistRegistry(),
      specialistRegistry = new SpecialistRegistry(),
      workedTileRegistry = new WorkedTileRegistry(),
      cityGrowthRegistry = {
        getByCity: () => ({ size: () => 2 }),
      } as unknown as CityGrowthRegistry,
      playerWorldRegistry = {
        getByPlayer: () => ({ includes: () => true }),
      } as unknown as PlayerWorldRegistry,
      centre = named('centre'),
      square = named('square'),
      city = named('city', {
        tile: () => centre,
        tiles: () => ({ includes: () => true }),
        player: () => named('player'),
      });

    available.register(Entertainer, Scientist);
    // A city that may have Scientists only.
    ruleRegistry.register(
      new SpecialistAvailable(
        new Criterion(
          (city: unknown, SpecialistType: typeof Specialist): boolean =>
            SpecialistType === Entertainer
        ),
        new Effect((): boolean => false)
      )
    );

    workedTileRegistry.register(new WorkedTile(centre, city));
    workedTileRegistry.tileCanBeWorkedBy = () => true;

    const entertainer = new Entertainer(city),
      scientist = new Scientist(city);

    specialistRegistry.register(entertainer, scientist);

    expect(
      changeWorkedTile(
        city,
        square,
        playerWorldRegistry,
        cityGrowthRegistry,
        workedTileRegistry,
        specialistRegistry,
        available,
        ruleRegistry
      )
    ).to.equal('added');
    expect(specialistRegistry.getByCity(city)).to.eql([scientist]);
  });
});

describe('CityTileYield in placing workers', (): void => {
  // Squares whose own yields are [food, production, trade], and a stand-in city that gives `bonus` more food on the
  //  squares named in it, as a `CityTileYield` rule would.
  const square = (name: string, [food, production, trade]: number[]) => {
      const yields = [
        new Food(food),
        new Production(production),
        new Trade(trade),
      ];

      return named(name, {
        yields: () => yields,
        score: (player: unknown, weights: [typeof Yield, number][]) =>
          yields
            .map(
              (tileYield) =>
                tileYield.value() *
                (weights.find(([Type]) => tileYield instanceof Type)?.[1] ?? 0)
            )
            .reduce((total, value) => total + value, 0),
      });
    },
    cityWith = (rules: unknown[], bonus: Map<unknown, number>, worked: any[]) =>
      named('city', {
        player: () => null,
        tileYieldRules: () => rules,
        tilesWorked: () => ({
          entries: () => worked,
          yields: () => worked.flatMap((tile) => tile.yields()),
        }),
        tileYields: (tile: any, given: unknown[]) =>
          given.length === 0
            ? tile.yields()
            : tile
                .yields()
                .map((tileYield: Yield) =>
                  tileYield instanceof Food
                    ? new Food(tileYield.value() + (bonus.get(tile) ?? 0))
                    : tileYield
                ),
      });

  it("weighs a square as `Tile#score` does, with the city's yields", (): void => {
    const a = square('a', [2, 1, 0]),
      city = cityWith(['rule'], new Map([[a, 3]]), []),
      weights: [typeof Yield, number][] = [
        [Food, 8],
        [Production, 3],
      ];

    expect(cityTileScore(city, a, weights, [])).to.equal(
      a.score(null, weights)
    );
    expect(cityTileScore(city, a, weights, ['rule'] as any)).to.equal(
      5 * 8 + 1 * 3
    );
  });

  it("sorts by what each square gives the city once there's a rule", (): void => {
    const a = square('a', [2, 0, 0]),
      b = square('b', [3, 0, 0]),
      c = square('c', [1, 0, 0]),
      bonus = new Map([[c, 3]]);

    expect(
      sortTiles([a, b, c], cityWith([], bonus, [])).map(({ name }) => name)
    ).to.eql(['b', 'a', 'c']);
    expect(
      sortTiles([a, b, c], cityWith(['rule'], bonus, [])).map(
        ({ name }) => name
      )
    ).to.eql(['c', 'b', 'a']);
  });

  it("asks the city's yields of the squares it works for its production and trade so far", (): void => {
    const worked = square('worked', [1, 0, 0]),
      city = cityWith(['rule'], new Map([[worked, 2]]), [worked]);

    expect(workedTileYields(city, []) === undefined).false;
    expect(
      workedTileYields(city, ['rule'] as any).map((tileYield) =>
        tileYield.value()
      )
    ).to.eql([3, 0, 0]);
    expect(
      workedTileYields(city, []).map((tileYield) => tileYield.value())
    ).to.eql([1, 0, 0]);
  });
});
