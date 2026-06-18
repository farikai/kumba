/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_9psb from "../actions/9psb.js";
import type * as analytics from "../analytics.js";
import type * as beneficiaries from "../beneficiaries.js";
import type * as budgets from "../budgets.js";
import type * as crons from "../crons.js";
import type * as lib_9psb from "../lib/9psb.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as rag from "../rag.js";
import type * as scheduled from "../scheduled.js";
import type * as seed from "../seed.js";
import type * as sellers from "../sellers.js";
import type * as users from "../users.js";
import type * as wallet from "../wallet.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/9psb": typeof actions_9psb;
  analytics: typeof analytics;
  beneficiaries: typeof beneficiaries;
  budgets: typeof budgets;
  crons: typeof crons;
  "lib/9psb": typeof lib_9psb;
  orders: typeof orders;
  products: typeof products;
  rag: typeof rag;
  scheduled: typeof scheduled;
  seed: typeof seed;
  sellers: typeof sellers;
  users: typeof users;
  wallet: typeof wallet;
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
