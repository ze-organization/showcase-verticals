import {
  locationPageRecipeFromDemo,
} from "./_location-demo-recipes";
import { LOCATION_DEMOS } from "./_location-demo-data";

const demo = LOCATION_DEMOS.find((item) => item.slug === "tokyo-marunouchi");
if (!demo) throw new Error("Missing location demo tokyo-marunouchi");

export const locationTokyoMarunouchiRecipe = locationPageRecipeFromDemo(demo);

export default locationTokyoMarunouchiRecipe;
