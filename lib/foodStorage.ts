import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import FoodExhausted from '@civ-clone/core-city-growth/Rules/FoodExhausted';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';

/**
 * Whether a city's food store holds enough for it to grow.
 */
export const hasFoodToGrow = (cityGrowth: CityGrowth): boolean =>
  cityGrowth.progress().value() >= cityGrowth.cost().value();

/**
 * The city grows.
 */
export const grow = (cityGrowth: CityGrowth): void => cityGrowth.grow();

/**
 * Whether a city's food store has run out: it is below 0 once the turn's food is added.
 */
export const isFoodExhausted = (cityGrowth: CityGrowth): boolean =>
  cityGrowth.progress().value() < 0;

/**
 * The city's food has run out: its `FoodExhausted` rules decide what that costs it.
 */
export const exhaustFood = (
  cityGrowth: CityGrowth,
  ruleRegistry: RuleRegistry
): void => {
  ruleRegistry.process(FoodExhausted, cityGrowth);
};
