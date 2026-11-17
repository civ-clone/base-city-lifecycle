"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWithProduction = exports.storeFood = void 0;
const CivilDisorder_1 = require("@civ-clone/core-city-happiness/Rules/CivilDisorder");
const FoodStorage_1 = require("@civ-clone/core-city-growth/Yields/FoodStorage");
const Unsupported_1 = require("@civ-clone/core-unit/Rules/Unsupported");
/**
 * A city's food for the turn, net of what its citizens and units eat, goes into its food store, and the store is checked:
 *  its `FoodStorage` rules decide whether the city grows or its food has run out.
 */
const storeFood = (food, city, cityGrowthRegistry) => {
    const cityGrowth = cityGrowthRegistry.getByCity(city);
    cityGrowth.add(new FoodStorage_1.default(food));
    cityGrowth.check();
};
exports.storeFood = storeFood;
/**
 * A city's production for the turn goes into what it is building, and the build is checked.
 *
 * While the production, net of its units' support, is below 0, the units it can't support go, furthest from the city
 *  first: each is handed to the `Unsupported` rules, and its support (a `ProductionSupportType` yield) is given back.
 *  While production is short, a unit destroyed since `cityYields` was worked out (or by an earlier disband) gives its
 *  support back first, and isn't lost again.
 *  Nothing is added to the build while a `CivilDisorder` rule holds for the city.
 */
const buildWithProduction = (production, city, cityYields, ProductionSupportType, cityBuildRegistry, ruleRegistry) => {
    const cityBuild = cityBuildRegistry.getByCity(city), availableProduction = production.clone();
    const supportYields = cityYields
        .filter((cityYield) => cityYield instanceof ProductionSupportType)
        .sort((yieldA, yieldB) => {
        var _a, _b, _c, _d;
        return ((_b = (_a = yieldB.unit()) === null || _a === void 0 ? void 0 : _a.tile().distanceFrom(city.tile())) !== null && _b !== void 0 ? _b : 0) -
            ((_d = (_c = yieldA.unit()) === null || _c === void 0 ? void 0 : _c.tile().distanceFrom(city.tile())) !== null && _d !== void 0 ? _d : 0);
    }), givenBack = new Set(), giveBack = (cityYield) => {
        givenBack.add(cityYield);
        availableProduction.subtract(cityYield);
    }, 
    // While the city is short, a unit already gone (cargo lost with a transport disbanded here, before or during this
    //  loop, or Settlers lost to famine) stands in for one that would be disbanded: its support is given back, and it
    //  isn't lost again. With production to spare, its support for the turn is still owed (civ-clone/web-renderer#1000).
    giveBackDestroyed = () => supportYields.forEach((cityYield) => {
        var _a;
        if (availableProduction.value() < 0 &&
            !givenBack.has(cityYield) &&
            ((_a = cityYield.unit()) === null || _a === void 0 ? void 0 : _a.destroyed()) === true) {
            giveBack(cityYield);
        }
    });
    supportYields.forEach((cityYield) => {
        giveBackDestroyed();
        if (availableProduction.value() >= 0 || givenBack.has(cityYield)) {
            return;
        }
        const unit = cityYield.unit();
        if (unit === null) {
            return;
        }
        ruleRegistry.process(Unsupported_1.default, city, unit, cityYield);
        giveBack(cityYield);
    });
    const updatedCityYields = city.yields();
    // No production happens when there's civil disorder.
    if (!ruleRegistry
        .process(CivilDisorder_1.default, city, updatedCityYields)
        .some((result) => result)) {
        cityBuild.add(availableProduction);
    }
    cityBuild.check();
};
exports.buildWithProduction = buildWithProduction;
//# sourceMappingURL=processYield.js.map