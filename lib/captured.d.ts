import CityBuild from '@civ-clone/core-city-build/CityBuild';
/**
 * Clears what a captured city was building, so its new owner chooses: the item was its previous owner's choice, at
 * its previous owner's price (civ-clone/web-renderer#670, #500). The city is asked for as a captured city's even if
 * its previous owner had chosen nothing (civ-clone/web-renderer#716).
 */
export declare const clearCapturedBuild: (cityBuild: CityBuild) => void;
/**
 * A captured city keeps what it was building, at its new owner's price, without its previous owner's queue
 * (civ-clone/web-renderer#670). Asked for as a captured city's if nothing was being built (civ-clone/web-renderer#716).
 */
export declare const keepCapturedBuild: (cityBuild: CityBuild) => void;
