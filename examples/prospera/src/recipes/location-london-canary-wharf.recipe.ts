import {
  locationPageRecipeFromDemo,
} from "./_location-demo-recipes";
import { LOCATION_DEMOS } from "./_location-demo-data";

const demo = LOCATION_DEMOS.find((item) => item.slug === "london-canary-wharf");
if (!demo) throw new Error("Missing location demo london-canary-wharf");

export const locationLondonCanaryWharfRecipe = locationPageRecipeFromDemo(demo);

export default locationLondonCanaryWharfRecipe;
