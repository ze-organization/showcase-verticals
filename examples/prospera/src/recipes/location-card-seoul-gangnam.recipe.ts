import {
  locationCardRecipeFromDemo,
} from "./_location-demo-recipes";
import { LOCATION_DEMOS } from "./_location-demo-data";

const demo = LOCATION_DEMOS.find((item) => item.slug === "seoul-gangnam");
if (!demo) throw new Error("Missing location demo seoul-gangnam");

export const locationCardSeoulGangnamRecipe = locationCardRecipeFromDemo(demo);

export default locationCardSeoulGangnamRecipe;
