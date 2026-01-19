/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as clients from "../clients.js";
import type * as conversations from "../conversations.js";
import type * as dashboard from "../dashboard.js";
import type * as dealFiles from "../dealFiles.js";
import type * as deals from "../deals.js";
import type * as directMessages from "../directMessages.js";
import type * as favorites from "../favorites.js";
import type * as globalSearch from "../globalSearch.js";
import type * as investorProfiles from "../investorProfiles.js";
import type * as investorQuestionnaires from "../investorQuestionnaires.js";
import type * as messages from "../messages.js";
import type * as neighborhoods from "../neighborhoods.js";
import type * as notificationPreferences from "../notificationPreferences.js";
import type * as notifications from "../notifications.js";
import type * as posts from "../posts.js";
import type * as priceHistory from "../priceHistory.js";
import type * as properties from "../properties.js";
import type * as providerAnalytics from "../providerAnalytics.js";
import type * as providerAvailability from "../providerAvailability.js";
import type * as providerReviews from "../providerReviews.js";
import type * as recommendations from "../recommendations.js";
import type * as search from "../search.js";
import type * as searchHistory from "../searchHistory.js";
import type * as seed from "../seed.js";
import type * as seedAnalyticsData from "../seedAnalyticsData.js";
import type * as seedData from "../seedData.js";
import type * as serviceProviderProfiles from "../serviceProviderProfiles.js";
import type * as serviceRequests from "../serviceRequests.js";
import type * as trending from "../trending.js";
import type * as userFollows from "../userFollows.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  clients: typeof clients;
  conversations: typeof conversations;
  dashboard: typeof dashboard;
  dealFiles: typeof dealFiles;
  deals: typeof deals;
  directMessages: typeof directMessages;
  favorites: typeof favorites;
  globalSearch: typeof globalSearch;
  investorProfiles: typeof investorProfiles;
  investorQuestionnaires: typeof investorQuestionnaires;
  messages: typeof messages;
  neighborhoods: typeof neighborhoods;
  notificationPreferences: typeof notificationPreferences;
  notifications: typeof notifications;
  posts: typeof posts;
  priceHistory: typeof priceHistory;
  properties: typeof properties;
  providerAnalytics: typeof providerAnalytics;
  providerAvailability: typeof providerAvailability;
  providerReviews: typeof providerReviews;
  recommendations: typeof recommendations;
  search: typeof search;
  searchHistory: typeof searchHistory;
  seed: typeof seed;
  seedAnalyticsData: typeof seedAnalyticsData;
  seedData: typeof seedData;
  serviceProviderProfiles: typeof serviceProviderProfiles;
  serviceRequests: typeof serviceRequests;
  trending: typeof trending;
  userFollows: typeof userFollows;
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
