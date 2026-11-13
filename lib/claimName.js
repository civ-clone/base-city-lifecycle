"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimName = void 0;
/**
 * `city`'s name is claimed, so that no city founded later is given it too.
 */
const claimName = (city, cityNames) => cityNames.claim(city.name());
exports.claimName = claimName;
//# sourceMappingURL=claimName.js.map