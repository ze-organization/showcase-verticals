import {
  locationCardRecipeFromDemo,
} from "./_location-demo-recipes";
import { LOCATION_DEMOS } from "./_location-demo-data";

const demo = LOCATION_DEMOS.find((item) => item.slug === "toronto-financial-district");
if (!demo) throw new Error("Missing location demo toronto-financial-district");

export const locationCardTorontoFinancialDistrictRecipe = locationCardRecipeFromDemo(demo);

export default locationCardTorontoFinancialDistrictRecipe;
