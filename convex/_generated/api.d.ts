/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as dealFiles from "../dealFiles.js";
import type * as deals from "../deals.js";
import type * as favorites from "../favorites.js";
import type * as investorProfiles from "../investorProfiles.js";
import type * as messages from "../messages.js";
import type * as neighborhoods from "../neighborhoods.js";
import type * as priceHistory from "../priceHistory.js";
import type * as properties from "../properties.js";
import type * as search from "../search.js";
import type * as seed from "../seed.js";
import type * as seedData from "../seedData.js";
import type * as serviceProviderProfiles from "../serviceProviderProfiles.js";
import type * as serviceRequests from "../serviceRequests.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  dealFiles: typeof dealFiles;
  deals: typeof deals;
  favorites: typeof favorites;
  investorProfiles: typeof investorProfiles;
  messages: typeof messages;
  neighborhoods: typeof neighborhoods;
  priceHistory: typeof priceHistory;
  properties: typeof properties;
  search: typeof search;
  seed: typeof seed;
  seedData: typeof seedData;
  serviceProviderProfiles: typeof serviceProviderProfiles;
  serviceRequests: typeof serviceRequests;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
