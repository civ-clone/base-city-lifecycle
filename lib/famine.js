"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emptyFoodStore = exports.shrinkFromFamine = exports.loseFoodSupportedUnit = exports.emitFoodStorageExhausted = exports.foodSupportedUnit = void 0;
const FoodExhausted_1 = require("@civ-clone/core-city-growth/Rules/FoodExhausted");
/**
 * The first unit `cityGrowth`'s city feeds, as a `FoodSupportType` yield, in the order of the city's yields (the order
 *  its units were built), or `null`.
 */
const foodSupportedUnit = (cityGrowth, FoodSupportType) => {
    var _a, _b;
    return (_b = (_a = cityGrowth
        .city()
        .yields()
        .find((cityYield) => cityYield instanceof FoodSupportType &&
        cityYield.unit() !== null)) === null || _a === void 0 ? void 0 : _a.unit()) !== null && _b !== void 0 ? _b : null;
};
exports.foodSupportedUnit = foodSupportedUnit;
/**
 * Tells clients that `cityGrowth`'s city has run out of food, with the unit it will lose for it, when there is one.
 */
const emitFoodStorageExhausted = (cityGrowth, unit, engine) => {
    if (unit === null) {
        engine.emit('city:food-storage-exhausted', cityGrowth.city());
        return;
    }
    engine.emit('city:food-storage-exhausted', cityGrowth.city(), unit);
};
exports.emitFoodStorageExhausted = emitFoodStorageExhausted;
/**
 * The city loses the first unit it feeds (see `foodSupportedUnit`), which must exist.
 */
const loseFoodSupportedUnit = (cityGrowth, FoodSupportType) => (0, exports.foodSupportedUnit)(cityGrowth, FoodSupportType).destroy();
exports.loseFoodSupportedUnit = loseFoodSupportedUnit;
/**
 * The city shrinks, because its food ran out.
 */
const shrinkFromFamine = (cityGrowth) => cityGrowth.shrink(FoodExhausted_1.default);
exports.shrinkFromFamine = shrinkFromFamine;
/**
 * The city's food store is emptied.
 */
const emptyFoodStore = (cityGrowth) => cityGrowth.empty();
exports.emptyFoodStore = emptyFoodStore;
//# sourceMappingURL=famine.js.map