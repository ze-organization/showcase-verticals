import {
  locationCardRecipeFromDemo,
} from "./_location-demo-recipes";
import { LOCATION_DEMOS } from "./_location-demo-data";

const demo = LOCATION_DEMOS.find((item) => item.slug === "mexico-city-reforma");
if (!demo) throw new Error("Missing location demo mexico-city-reforma");

export const locationCardMexicoCityReformaRecipe = locationCardRecipeFromDemo(demo);

export default locationCardMexicoCityReformaRecipe;
