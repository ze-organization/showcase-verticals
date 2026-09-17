import {
  pageDesignThumbnail,
  type PageDesignRecipe,
} from "./_wireframe-thumbnail";

export const jobPageRecipe = {
  kind: "page-design",
  schemaVersion: "1",
  handle: "job-page@1",
  name: "JobPage",
  displayName: "Job Page",
  thumbnail: pageDesignThumbnail("Job_Page_Template.png", "Job Page"),
  description: "Job page design — header + Job Details partial + footer.",
  appliesTo: ["job@1"],
  partials: [
    "header-utility-bar@1",
    "job-details-partial@1",
    "footer-link-columns@1",
  ],
  layout: { placeholders: {} },
} satisfies PageDesignRecipe;

export default jobPageRecipe;
