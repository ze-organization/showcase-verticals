import {
  locationCardRecipeFromDemo,
} from "./_location-demo-recipes";
import { LOCATION_DEMOS } from "./_location-demo-data";

const demo = LOCATION_DEMOS.find((item) => item.slug === "singapore-raffles-place");
if (!demo) throw new Error("Missing location demo singapore-raffles-place");

export const locationCardSingaporeRafflesPlaceRecipe = locationCardRecipeFromDemo(demo);

export default locationCardSingaporeRafflesPlaceRecipe;
