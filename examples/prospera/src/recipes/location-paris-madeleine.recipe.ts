import {
  locationPageRecipeFromDemo,
} from "./_location-demo-recipes";
import { LOCATION_DEMOS } from "./_location-demo-data";

const demo = LOCATION_DEMOS.find((item) => item.slug === "paris-madeleine");
if (!demo) throw new Error("Missing location demo paris-madeleine");

export const locationParisMadeleineRecipe = locationPageRecipeFromDemo(demo);

export default locationParisMadeleineRecipe;
