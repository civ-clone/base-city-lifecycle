"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exhaustFood = exports.isFoodExhausted = exports.grow = exports.hasFoodToGrow = void 0;
const FoodExhausted_1 = require("@civ-clone/core-city-growth/Rules/FoodExhausted");
/**
 * Whether a city's food store holds enough for it to grow.
 */
const hasFoodToGrow = (cityGrowth) => cityGrowth.progress().value() >= cityGrowth.cost().value();
exports.hasFoodToGrow = hasFoodToGrow;
/**
 * The city grows.
 */
const grow = (cityGrowth) => cityGrowth.grow();
exports.grow = grow;
/**
 * Whether a city's food store has run out: it is below 0 once the turn's food is added.
 */
const isFoodExhausted = (cityGrowth) => cityGrowth.progress().value() < 0;
exports.isFoodExhausted = isFoodExhausted;
/**
 * The city's food has run out: its `FoodExhausted` rules decide what that costs it.
 */
const exhaustFood = (cityGrowth, ruleRegistry) => {
    ruleRegistry.process(FoodExhausted_1.default, cityGrowth);
};
exports.exhaustFood = exhaustFood;
//# sourceMappingURL=foodStorage.js.map