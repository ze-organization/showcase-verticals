export type SearchArticle = {
  id: string;
  title?: string;
  name?: string;
  subtitle?: string;
  url: string;
  description?: string;
  content_text?: string;
  image_url?: string;
  type?: string;
  source_id?: string;
};

export type SearchFacetValue = {
  id: string;
  text: string;
  count?: number;
  /** Optional swatch value (hex/rgb/hsl/css color) for color-like facet options. */
  swatch?: string;
  min?: number;
  max?: number;
};

export type SearchFacet = {
  id: string;
  label: string;
  type?: "list" | "range";
  /** Optional display mode for list facets. */
  display?: "default" | "color-circles" | "size-inline";
  values: SearchFacetValue[];
};

export type SearchSortOption = {
  value: string;
  label: string;
};

export type SearchSuggestion = {
  text: string;
};

export type SearchQuestion = {
  question: string;
  answer: string;
};
