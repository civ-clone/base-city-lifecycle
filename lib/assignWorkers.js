"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reduceWorkers = exports.releaseCitizens = exports.changeWorkedTile = exports.assignWorker = exports.assignWorkers = exports.reassignWorkers = exports.getHighestValueAvailableCityTiles = exports.sortTiles = exports.workedTileYields = exports.cityTileScore = exports.getHighestValueCityTiles = exports.changeSpecialist = exports.addSpecialist = exports.replaceRefusedSpecialists = exports.availableSpecialists = exports.citizenCount = void 0;
// Lifted from library-city 0.1.4 (`lib/assignWorkers.ts`), so a game's rules can place a city's citizens without
//  depending on library-city (civ-clone/web-renderer Civ2 M2a, R3b). Since then, it asks what each square gives the city
//  (`City#tileYields`, with its `CityTileYield` rules) and which specialists the city may have (`SpecialistAvailable`).
//  With neither kind of rule registered it does exactly what library-city 0.1.4's does.
const AvailableSpecialistRegistry_1 = require("@civ-clone/core-city/AvailableSpecialistRegistry");
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const Food_1 = require("@civ-clone/base-terrain-yield-food/Food");
const Production_1 = require("@civ-clone/base-terrain-yield-production/Production");
const Trade_1 = require("@civ-clone/base-terrain-yield-trade/Trade");
const PlayerWorldRegistry_1 = require("@civ-clone/core-player-world/PlayerWorldRegistry");
const SpecialistRegistry_1 = require("@civ-clone/core-city/SpecialistRegistry");
const WorkedTileRegistry_1 = require("@civ-clone/core-city/WorkedTileRegistry");
const SpecialistAvailable_1 = require("../Rules/SpecialistAvailable");
const reduceYields_1 = require("@civ-clone/core-yield/lib/reduceYields");
const WorkedTile_1 = require("@civ-clone/core-city/WorkedTile");
/**
 * How many citizens `city` has placed: one per worked tile, the city centre included, and one per `Specialist`. A city
 * of size `n` has `n + 1`.
 */
const citizenCount = (city, workedTileRegistry = WorkedTileRegistry_1.instance, specialistRegistry = SpecialistRegistry_1.instance) => workedTileRegistry.getByCity(city).length +
    specialistRegistry.getByCity(city).length;
exports.citizenCount = citizenCount;
/**
 * The kinds of `Specialist` `city` may have: those the ruleset offers (`AvailableSpecialistRegistry`), in its order,
 * less any a `SpecialistAvailable` rule refuses the city. With no such rule, the registry's own entries.
 */
const availableSpecialists = (city, availableSpecialistRegistry = AvailableSpecialistRegistry_1.instance, ruleRegistry = city.ruleRegistry()) => {
    const types = availableSpecialistRegistry.entries();
    if (ruleRegistry.get(SpecialistAvailable_1.default).length === 0) {
        return types;
    }
    return types.filter((SpecialistType) => ruleRegistry
        .process(SpecialistAvailable_1.default, city, SpecialistType)
        .every((available) => available));
};
exports.availableSpecialists = availableSpecialists;
/**
 * Turns each of `city`'s specialists of a kind a `SpecialistAvailable` rule now refuses it (a city that has shrunk, say)
 * into the first kind it may have, and returns how many changed. One with no kind left to become stays as it is. With
 * no such rule nothing is asked and nothing changes.
 */
const replaceRefusedSpecialists = (city, specialistRegistry = SpecialistRegistry_1.instance, availableSpecialistRegistry = AvailableSpecialistRegistry_1.instance, ruleRegistry = city.ruleRegistry()) => {
    if (ruleRegistry.get(SpecialistAvailable_1.default).length === 0) {
        return 0;
    }
    const types = (0, exports.availableSpecialists)(city, availableSpecialistRegistry, ruleRegistry), [DefaultType] = types;
    if (!DefaultType) {
        return 0;
    }
    const refused = specialistRegistry
        .getByCity(city)
        .filter((specialist) => !types.some((SpecialistType) => specialist instanceof SpecialistType));
    refused.forEach((specialist) => {
        specialistRegistry.unregister(specialist);
        specialistRegistry.register(new DefaultType(city));
    });
    return refused.length;
};
exports.replaceRefusedSpecialists = replaceRefusedSpecialists;
/**
 * Makes a citizen of `city` a `Specialist` of the first kind it may have (an Entertainer, in Civ1). Returns `null` when
 * the ruleset offers it no specialists.
 */
const addSpecialist = (city, specialistRegistry = SpecialistRegistry_1.instance, availableSpecialistRegistry = AvailableSpecialistRegistry_1.instance, ruleRegistry) => {
    const [SpecialistType] = (0, exports.availableSpecialists)(city, availableSpecialistRegistry, ruleRegistry);
    if (!SpecialistType) {
        return null;
    }
    const specialist = new SpecialistType(city);
    specialistRegistry.register(specialist);
    return specialist;
};
exports.addSpecialist = addSpecialist;
/**
 * Turns `specialist` into the next kind its city may have, wrapping back to the first. Returns the `Specialist` that
 * replaces it, or `specialist` itself when there is nothing to change it to.
 */
const changeSpecialist = (specialist, specialistRegistry = SpecialistRegistry_1.instance, availableSpecialistRegistry = AvailableSpecialistRegistry_1.instance, ruleRegistry) => {
    const city = specialist.city(), types = (0, exports.availableSpecialists)(city, availableSpecialistRegistry, ruleRegistry), NextType = types[(types.indexOf(specialist.constructor) + 1) %
        types.length];
    if (!NextType || specialist instanceof NextType) {
        return specialist;
    }
    const replacement = new NextType(city);
    specialistRegistry.unregister(specialist);
    specialistRegistry.register(replacement);
    return replacement;
};
exports.changeSpecialist = changeSpecialist;
/**
 * Puts one of `city`'s specialists back to work, and returns whether there was one to remove: one of a kind a
 * `SpecialistAvailable` rule now refuses the city, if any, or else one of the first kind it may have (Entertainers), or
 * else the last.
 */
const removeSpecialist = (city, specialistRegistry, availableSpecialistRegistry, ruleRegistry = city.ruleRegistry()) => {
    var _a;
    const specialists = specialistRegistry.getByCity(city), types = (0, exports.availableSpecialists)(city, availableSpecialistRegistry, ruleRegistry), [DefaultType] = types, refused = ruleRegistry.get(SpecialistAvailable_1.default).length === 0
        ? undefined
        : specialists.find((specialist) => !types.some((SpecialistType) => specialist instanceof SpecialistType)), specialist = (_a = refused !== null && refused !== void 0 ? refused : specialists.find((specialist) => DefaultType && specialist instanceof DefaultType)) !== null && _a !== void 0 ? _a : specialists[specialists.length - 1];
    if (!specialist) {
        return false;
    }
    specialistRegistry.unregister(specialist);
    return true;
};
const getHighestValueCityTiles = (city) => (0, exports.sortTiles)(city.tiles().entries(), city);
exports.getHighestValueCityTiles = getHighestValueCityTiles;
/**
 * What `tile` is worth to `city`, weighing each of the yields it gives the city (`City#tileYields`, with `rules`) as
 * `Tile#score` weighs the tile's own: by the first weight whose yield type it is, or 0.
 */
const cityTileScore = (city, tile, weights, rules = city.tileYieldRules()) => city
    .tileYields(tile, rules)
    .map((tileYield) => {
    const [value] = weights.filter(([YieldType]) => tileYield instanceof YieldType), weight = value ? value[1] || 1 : 0;
    return tileYield.value() * weight;
})
    .reduce((total, value) => total + value, 0);
exports.cityTileScore = cityTileScore;
/** The yields of every tile `city` works, as they are for the city (`City#tileYields`, with `rules`). */
const workedTileYields = (city, rules = city.tileYieldRules()) => rules.length === 0
    ? city.tilesWorked().yields(city.player())
    : city
        .tilesWorked()
        .entries()
        .flatMap((tile) => city.tileYields(tile, rules));
exports.workedTileYields = workedTileYields;
/**
 * Sorts `tiles` best first for `city` to work: by `weights`, by default food first, then production (more so while the
 * city works no square with any) and trade (likewise). A square is weighed by what it gives the city: with no
 * `CityTileYield` rules, the tile's own yields (`Tile#score`).
 */
const sortTiles = (tiles, city, weights) => {
    const rules = city.tileYieldRules(), tileWeights = weights !== null && weights !== void 0 ? weights : [
        [Food_1.default, 8],
        [
            Production_1.default,
            3 *
                ((0, reduceYields_1.reduceYield)((0, exports.workedTileYields)(city, rules), Production_1.default) === 0
                    ? 3
                    : 1),
        ],
        [
            Trade_1.default,
            1 * ((0, reduceYields_1.reduceYield)((0, exports.workedTileYields)(city, rules), Trade_1.default) === 0 ? 2 : 1),
        ],
    ];
    if (rules.length === 0) {
        return tiles.sort((a, b) => b.score(city.player(), tileWeights) -
            a.score(city.player(), tileWeights));
    }
    const scores = new Map(tiles.map((tile) => [
        tile,
        (0, exports.cityTileScore)(city, tile, tileWeights, rules),
    ]));
    return tiles.sort((a, b) => scores.get(b) - scores.get(a));
};
exports.sortTiles = sortTiles;
const getHighestValueAvailableCityTiles = (city, playerWorldRegistry = PlayerWorldRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance) => (0, exports.getHighestValueCityTiles)(city).filter((tile) => workedTileRegistry.tileCanBeWorkedBy(tile, city) &&
    playerWorldRegistry.getByPlayer(city.player()).includes(tile));
exports.getHighestValueAvailableCityTiles = getHighestValueAvailableCityTiles;
/**
 * Rearranges the tiles `city` works from scratch. Its specialists stay as they are, but for any of a kind the city may
 * no longer have (`replaceRefusedSpecialists`).
 */
const reassignWorkers = (city, playerWorldRegistry = PlayerWorldRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance, specialistRegistry = SpecialistRegistry_1.instance, availableSpecialistRegistry = AvailableSpecialistRegistry_1.instance, ruleRegistry) => {
    workedTileRegistry
        .getBy('city', city)
        .forEach((workedTile) => workedTileRegistry.unregister(workedTile));
    workedTileRegistry.register(new WorkedTile_1.default(city.tile(), city));
    (0, exports.replaceRefusedSpecialists)(city, specialistRegistry, availableSpecialistRegistry, ruleRegistry);
    (0, exports.assignWorkers)(city, playerWorldRegistry, cityGrowthRegistry, workedTileRegistry, specialistRegistry, availableSpecialistRegistry, ruleRegistry);
};
exports.reassignWorkers = reassignWorkers;
/**
 * Places each of `city`'s citizens that has no job on the best tile available, or makes them a specialist if there is
 * no tile left to work.
 */
const assignWorkers = (city, playerWorldRegistry = PlayerWorldRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance, specialistRegistry = SpecialistRegistry_1.instance, availableSpecialistRegistry = AvailableSpecialistRegistry_1.instance, ruleRegistry) => {
    const cityGrowth = cityGrowthRegistry.getByCity(city), placed = () => (0, exports.citizenCount)(city, workedTileRegistry, specialistRegistry) >=
        cityGrowth.size() + 1;
    (0, exports.getHighestValueAvailableCityTiles)(city, playerWorldRegistry, workedTileRegistry).some((tile) => {
        if (placed()) {
            return true;
        }
        workedTileRegistry.register(new WorkedTile_1.default(tile, city));
        return false;
    });
    while (!placed() &&
        (0, exports.addSpecialist)(city, specialistRegistry, availableSpecialistRegistry, ruleRegistry)) { }
};
exports.assignWorkers = assignWorkers;
/**
 * Places one new citizen of `city` on the best tile available, or makes them a specialist if there is no tile left.
 */
const assignWorker = (city, playerWorldRegistry = PlayerWorldRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance, specialistRegistry = SpecialistRegistry_1.instance, availableSpecialistRegistry = AvailableSpecialistRegistry_1.instance, ruleRegistry) => {
    const [newTile] = (0, exports.getHighestValueAvailableCityTiles)(city, playerWorldRegistry, workedTileRegistry);
    if (!newTile) {
        (0, exports.addSpecialist)(city, specialistRegistry, availableSpecialistRegistry, ruleRegistry);
        return;
    }
    workedTileRegistry.register(new WorkedTile_1.default(newTile, city));
};
exports.assignWorker = assignWorker;
/**
 * Changes whether `tile` is worked by `city`, as a player clicking it on the city map would.
 *
 * A tile the city works stops being worked, and its worker becomes a specialist. Any other tile is worked by a
 * specialist, or by a citizen with no job, if the city has one and is allowed to work it. With every citizen already
 * working a tile, the city's workers are reassigned instead. The city centre is always worked.
 */
const changeWorkedTile = (city, tile, playerWorldRegistry = PlayerWorldRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance, specialistRegistry = SpecialistRegistry_1.instance, availableSpecialistRegistry = AvailableSpecialistRegistry_1.instance, ruleRegistry) => {
    var _a;
    if (tile === city.tile() || !city.tiles().includes(tile)) {
        return 'none';
    }
    if (((_a = workedTileRegistry.getByTile(tile)) === null || _a === void 0 ? void 0 : _a.city()) === city) {
        workedTileRegistry.unregisterByTile(tile);
        (0, exports.addSpecialist)(city, specialistRegistry, availableSpecialistRegistry, ruleRegistry);
        return 'removed';
    }
    const size = cityGrowthRegistry.getByCity(city).size();
    if (workedTileRegistry.getByCity(city).length >= size + 1) {
        (0, exports.reassignWorkers)(city, playerWorldRegistry, cityGrowthRegistry, workedTileRegistry, specialistRegistry, availableSpecialistRegistry, ruleRegistry);
        return 'reassigned';
    }
    if (!workedTileRegistry.tileCanBeWorkedBy(tile, city) ||
        !playerWorldRegistry.getByPlayer(city.player()).includes(tile)) {
        return 'none';
    }
    if ((0, exports.citizenCount)(city, workedTileRegistry, specialistRegistry) >= size + 1) {
        removeSpecialist(city, specialistRegistry, availableSpecialistRegistry, ruleRegistry);
    }
    workedTileRegistry.register(new WorkedTile_1.default(tile, city));
    return 'added';
};
exports.changeWorkedTile = changeWorkedTile;
/**
 * Takes jobs away from `city`'s citizens until it has no more than its size allows: specialists first, then the
 * workers on the least valuable tiles. Any specialist left of a kind the city may no longer have becomes one of a kind
 * it may (`replaceRefusedSpecialists`).
 */
const releaseCitizens = (city, cityGrowth, workedTileRegistry = WorkedTileRegistry_1.instance, specialistRegistry = SpecialistRegistry_1.instance, availableSpecialistRegistry = AvailableSpecialistRegistry_1.instance, ruleRegistry) => {
    const specialists = specialistRegistry.getByCity(city);
    while (specialists.length > 0 &&
        (0, exports.citizenCount)(city, workedTileRegistry, specialistRegistry) >
            cityGrowth.size() + 1) {
        specialistRegistry.unregister(specialists.pop());
    }
    (0, exports.reduceWorkers)(city, cityGrowth).forEach((tile) => workedTileRegistry.unregisterByTile(tile));
    (0, exports.replaceRefusedSpecialists)(city, specialistRegistry, availableSpecialistRegistry, ruleRegistry);
};
exports.releaseCitizens = releaseCitizens;
const reduceWorkers = (city, cityGrowth) => (0, exports.sortTiles)(city
    .tilesWorked()
    .entries()
    .filter((tile) => tile !== city.tile()), city).slice(cityGrowth.size());
exports.reduceWorkers = reduceWorkers;
exports.default = exports.assignWorkers;
//# sourceMappingURL=assignWorkers.js.map