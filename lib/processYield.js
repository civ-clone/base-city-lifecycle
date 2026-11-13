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
 *  Nothing is added to the build while a `CivilDisorder` rule holds for the city.
 */
const buildWithProduction = (production, city, cityYields, ProductionSupportType, cityBuildRegistry, ruleRegistry) => {
    const cityBuild = cityBuildRegistry.getByCity(city), availableProduction = production.clone();
    cityYields
        .filter((cityYield) => cityYield instanceof ProductionSupportType)
        .sort((yieldA, yieldB) => {
        var _a, _b, _c, _d;
        return ((_b = (_a = yieldB.unit()) === null || _a === void 0 ? void 0 : _a.tile().distanceFrom(city.tile())) !== null && _b !== void 0 ? _b : 0) -
            ((_d = (_c = yieldA.unit()) === null || _c === void 0 ? void 0 : _c.tile().distanceFrom(city.tile())) !== null && _d !== void 0 ? _d : 0);
    })
        .forEach((cityYield) => {
        if (availableProduction.value() >= 0) {
            return;
        }
        const unit = cityYield.unit();
        if (unit === null) {
            return;
        }
        ruleRegistry.process(Unsupported_1.default, city, unit, cityYield);
        availableProduction.subtract(cityYield);
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