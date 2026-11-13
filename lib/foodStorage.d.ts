import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
/**
 * Whether a city's food store holds enough for it to grow.
 */
export declare const hasFoodToGrow: (cityGrowth: CityGrowth) => boolean;
/**
 * The city grows.
 */
export declare const grow: (cityGrowth: CityGrowth) => void;
/**
 * Whether a city's food store has run out: it is below 0 once the turn's food is added.
 */
export declare const isFoodExhausted: (cityGrowth: CityGrowth) => boolean;
/**
 * The city's food has run out: its `FoodExhausted` rules decide what that costs it.
 */
export declare const exhaustFood: (
  cityGrowth: CityGrowth,
  ruleRegistry: RuleRegistry
) => void;
