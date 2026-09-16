import {
  locationPageRecipeFromDemo,
} from "./_location-demo-recipes";
import { LOCATION_DEMOS } from "./_location-demo-data";

const demo = LOCATION_DEMOS.find((item) => item.slug === "johannesburg-sandton");
if (!demo) throw new Error("Missing location demo johannesburg-sandton");

export const locationJohannesburgSandtonRecipe = locationPageRecipeFromDemo(demo);

export default locationJohannesburgSandtonRecipe;
