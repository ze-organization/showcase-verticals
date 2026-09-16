import {
  locationCardRecipeFromDemo,
} from "./_location-demo-recipes";
import { LOCATION_DEMOS } from "./_location-demo-data";

const demo = LOCATION_DEMOS.find((item) => item.slug === "sydney-circular-quay");
if (!demo) throw new Error("Missing location demo sydney-circular-quay");

export const locationCardSydneyCircularQuayRecipe = locationCardRecipeFromDemo(demo);

export default locationCardSydneyCircularQuayRecipe;
