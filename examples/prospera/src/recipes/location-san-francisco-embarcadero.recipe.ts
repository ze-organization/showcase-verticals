import {
  locationPageRecipeFromDemo,
} from "./_location-demo-recipes";
import { LOCATION_DEMOS } from "./_location-demo-data";

const demo = LOCATION_DEMOS.find((item) => item.slug === "san-francisco-embarcadero");
if (!demo) throw new Error("Missing location demo san-francisco-embarcadero");

export const locationSanFranciscoEmbarcaderoRecipe = locationPageRecipeFromDemo(demo);

export default locationSanFranciscoEmbarcaderoRecipe;
