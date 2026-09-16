import {
  locationPageRecipeFromDemo,
} from "./_location-demo-recipes";
import { LOCATION_DEMOS } from "./_location-demo-data";

const demo = LOCATION_DEMOS.find((item) => item.slug === "dubai-difc");
if (!demo) throw new Error("Missing location demo dubai-difc");

export const locationDubaiDifcRecipe = locationPageRecipeFromDemo(demo);

export default locationDubaiDifcRecipe;
