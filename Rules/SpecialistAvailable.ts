import City from '@civ-clone/core-city/City';
import Rule from '@civ-clone/core-rule/Rule';
import Specialist from '@civ-clone/core-city/Specialist';

/**
 * Whether a city may have specialists of a kind, of those the ruleset makes available to every city
 * (`AvailableSpecialistRegistry`). A kind is available to a city unless one of the rules whose criteria are met answers
 * `false`; with no rule, every kind is. `lib/assignWorkers` asks it whenever it makes a citizen a specialist or changes
 * a specialist's kind, so a player can't cycle a specialist to a kind the city may not have.
 *
 * ```ts
 * // A ruleset whose small cities may only have entertainers.
 * new SpecialistAvailable(
 *   'my-rules:city/specialist-available/small-cities',
 *   new Criterion((city: City, SpecialistType: typeof Specialist) => SpecialistType !== Entertainer),
 *   new Effect((city: City) => sizeOf(city) >= 5)
 * )
 * ```
 */
export class SpecialistAvailable extends Rule<
  [City, typeof Specialist],
  boolean
> {}

export default SpecialistAvailable;
