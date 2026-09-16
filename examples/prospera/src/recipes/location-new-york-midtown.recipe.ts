import {
  locationPageRecipeFromDemo,
} from "./_location-demo-recipes";
import { LOCATION_DEMOS } from "./_location-demo-data";

const demo = LOCATION_DEMOS.find((item) => item.slug === "new-york-midtown");
if (!demo) throw new Error("Missing location demo new-york-midtown");

export const locationNewYorkMidtownRecipe = locationPageRecipeFromDemo(demo);

export default locationNewYorkMidtownRecipe;
