/**
 * Provider barrel — importing this side-effect registers all providers
 * the registry knows about. Coveo + Algolia adapters are absent on
 * purpose: they're customer responsibilities (the registry is a
 * frontend-only showcase, not a bundled multi-provider search hub).
 *
 * To use Coveo or Algolia, a tenant adds a provider client file under
 * this directory and imports it from their app entry point.
 */
import "./custom";
import "./sitecore-search";
