import {
  locationPageRecipeFromDemo,
} from "./_location-demo-recipes";
import { LOCATION_DEMOS } from "./_location-demo-data";

const demo = LOCATION_DEMOS.find((item) => item.slug === "mumbai-bkc");
if (!demo) throw new Error("Missing location demo mumbai-bkc");

export const locationMumbaiBkcRecipe = locationPageRecipeFromDemo(demo);

export default locationMumbaiBkcRecipe;
