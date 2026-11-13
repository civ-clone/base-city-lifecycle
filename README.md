# base-city-lifecycle

A city's turn and what goes with it, as a library for a ruleset's city rules:

- `lib/processYield`: `storeFood(food, city, cityGrowthRegistry)` puts a city's food for the turn into its store and
  checks it. `buildWithProduction(production, city, cityYields, ProductionSupportType, cityBuildRegistry, ruleRegistry)`
  puts its production into its build and checks it: while production net of unit support is below 0, the units it
  can't support go to the `Unsupported` rules, furthest from the city first, and nothing is added while a
  `CivilDisorder` rule holds.
- `lib/foodStorage`: `hasFoodToGrow(cityGrowth)` and `grow(cityGrowth)`; `isFoodExhausted(cityGrowth)` (the store is
  below 0) and `exhaustFood(cityGrowth, ruleRegistry)`, which runs the `FoodExhausted` rules.
- `lib/famine`: `foodSupportedUnit(cityGrowth, FoodSupportType)`, the first unit a city feeds;
  `emitFoodStorageExhausted(cityGrowth, unit, engine)`; `loseFoodSupportedUnit(cityGrowth, FoodSupportType)`,
  `shrinkFromFamine(cityGrowth)` and `emptyFoodStore(cityGrowth)`.
- `lib/canBeWorked`: `isNotWorked(tile, workedTileRegistry)`, `isNotOccupiedByEnemy(tile, city, unitRegistry)` and
  `isNotAnotherCity(tile, city, cityRegistry)`.
- `lib/occupiedTiles`: `enemyWorkedTile(unit, tile, workedTileRegistry)`, a tile another player's city works (not its
  centre), and `releaseEnemyWorkedTile(unit, tile, workedTileRegistry, ruleRegistry)`, which takes it from that city
  and runs its `TileReassigned` rules.
- `lib/playerActions`: the city actions a player is offered, each as a check and a list: `hasCityToChooseProduction`
  and `chooseProductionActions`, `hasCityToChangeProduction` and `changeProductionActions`, `hasCity` and
  `changeWorkedTileActions`, `hasSpecialist` and `changeSpecialistActions`.
- `lib/unsupported`: `disbandUnsupported(city, unit)`.
- `lib/claimName`: `claimName(city, cityNames)` and the `CityNames` type.
- `lib/events`: `emitTileWorked(city, tile, engine)`, `emitTileReleased(city, tile, engine)` and
  `emitBuildingHeld(cityBuild, item, held, engine)`, for clients.

The yield types a ruleset pays unit support with are passed in (`FoodSupportType`, `ProductionSupportType`: a yield
that knows its `unit()`).

A library: it registers no rules. The ruleset decides the rules, their ids and order, and when each runs. See
`civ1-city` for Civilization's.
