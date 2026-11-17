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
  and runs its `TileReassigned` rules; `releaseOccupiedWorkedTiles(player, cityRegistry, unitRegistry,
  workedTileRegistry, ruleRegistry)` does the same at the start of a player's turn for every tile its cities work that
  another player's unit stands on.
- `lib/playerActions`: the city actions a player is offered, each as a check and a list: `hasCityToChooseProduction`
  and `chooseProductionActions`, `hasCityToChangeProduction` and `changeProductionActions`, `hasCity` and
  `changeWorkedTileActions`, `hasSpecialist` and `changeSpecialistActions`.
- `lib/unsupported`: `disbandUnsupported(city, unit)`.
- `lib/claimName`: `claimName(city, cityNames)` and the `CityNames` type.
- `lib/events`: `emitTileWorked(city, tile, engine)`, `emitTileReleased(city, tile, engine)`,
  `emitBuildingHeld(cityBuild, item, held, engine)`, `emitBuildingCancelled(cityBuild, item, reason, engine)` and
  `emitBuildingComplete(cityBuild, built, engine)`, for clients.
- `lib/assignWorkers`: placing a city's citizens on its best tiles or as specialists (`assignWorkers`, `assignWorker`,
  `reassignWorkers`, `releaseCitizens`, `changeWorkedTile`, `addSpecialist`, `changeSpecialist`, `citizenCount` and
  the rest), lifted from library-city 0.1.4. With no `CityTileYield` or `SpecialistAvailable` rule registered they do
  exactly what library-city 0.1.4's do:
  - squares are weighed by what they give the city, `City#tileYields` (core-city's `CityTileYield` rules), not only by
    the tile's own yields: `sortTiles`, `cityTileScore(city, tile, weights)` and `workedTileYields(city)`;
  - specialists are made, cycled and put back to work among the kinds the city may have, `availableSpecialists(city,
    availableSpecialistRegistry, ruleRegistry)`: those the ruleset offers, less any a `SpecialistAvailable` rule
    (`Rules/SpecialistAvailable`) refuses the city. A specialist of a refused kind is the first put back to work, and
    `releaseCitizens` and `reassignWorkers` turn any left into the first kind the city may have
    (`replaceRefusedSpecialists`). `assignWorkers`, `assignWorker`, `reassignWorkers`, `releaseCitizens`,
    `changeWorkedTile`, `addSpecialist` and `changeSpecialist` take a `RuleRegistry` as their last argument; without
    one they ask the city's own (`City#ruleRegistry()`, the game's rules), as `City#tileYields` does.
- `lib/created`: `registerCityBuild`, `registerCityGrowth` and `workCityTile(city, ...)`, which takes the new city's
  centre from any city that worked it (running that city's `TileReassigned` rules) and puts its citizens to work.
- `lib/captured`: `clearCapturedBuild(cityBuild)` (the new owner chooses) and `keepCapturedBuild(cityBuild)` (the item
  stays, repriced, without the queue).
- `lib/destroyed`: `destroyUnits(units)` (skipping any already destroyed), `releaseWorkedTiles(city, ...)` and
  `releaseSpecialists(city, ...)`.

The yield types a ruleset pays unit support with are passed in (`FoodSupportType`, `ProductionSupportType`: a yield
that knows its `unit()`).

A library: it registers no rules (`Rules/SpecialistAvailable` is a rule type for a ruleset to register). The ruleset decides the rules, their ids and order, and when each runs. See
`civ1-city` for Civilization's.
