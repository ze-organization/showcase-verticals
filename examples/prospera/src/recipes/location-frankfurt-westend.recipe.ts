import {
  locationPageRecipeFromDemo,
} from "./_location-demo-recipes";
import { LOCATION_DEMOS } from "./_location-demo-data";

const demo = LOCATION_DEMOS.find((item) => item.slug === "frankfurt-westend");
if (!demo) throw new Error("Missing location demo frankfurt-westend");

export const locationFrankfurtWestendRecipe = locationPageRecipeFromDemo(demo);

export default locationFrankfurtWestendRecipe;
