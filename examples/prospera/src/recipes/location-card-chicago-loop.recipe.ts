import {
  locationCardRecipeFromDemo,
} from "./_location-demo-recipes";
import { LOCATION_DEMOS } from "./_location-demo-data";

const demo = LOCATION_DEMOS.find((item) => item.slug === "chicago-loop");
if (!demo) throw new Error("Missing location demo chicago-loop");

export const locationCardChicagoLoopRecipe = locationCardRecipeFromDemo(demo);

export default locationCardChicagoLoopRecipe;
