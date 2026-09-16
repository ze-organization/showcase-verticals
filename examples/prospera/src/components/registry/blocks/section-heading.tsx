"use client";

import type { ReactNode } from "react";
import {
  adaptSectionHeadingParams,
  type BandHeadingPlacement,
  BAND_INLINE_HEADING_GRID_CLASS,
  type HeadingAnimation,
  type HeadingLayout,
  type HeadingLevel,
  type HeadingSize,
  type ListingHeadingInput,
  parseBandHeadingPlacement,
  parseHeadingAnimation,
  parseHeadingLayout,
  parseHeadingLevel,
  parseHeadingSize,
  resolveListingHeading,
  type SectionHeadingAxisProps,
  type SectionHeadingParams,
  SectionWrapper,
  type SplitFooterAlignment,
} from "@/components/registry/blocks/section-heading.helpers";
import type { TextSource } from "@/components/registry/primitives/editables/text";

export type {
  BandHeadingPlacement,
  HeadingAnimation,
  HeadingLayout,
  HeadingLevel,
  HeadingSize,
  ListingHeadingInput,
  SectionHeadingAxisProps,
  SectionHeadingParams,
  SplitFooterAlignment,
};
export {
  adaptSectionHeadingParams,
  BAND_INLINE_HEADING_GRID_CLASS,
  parseBandHeadingPlacement,
  parseHeadingAnimation,
  parseHeadingLayout,
  parseHeadingLevel,
  parseHeadingSize,
  resolveListingHeading,
};

export interface SectionHeadingProps {
  title?: TextSource;
  lead?: TextSource;
  /** Optional kicker line above the title (shared `Eyebrow` block). */
  eyebrow?: TextSource;
  isEditing?: boolean;
  layout?: HeadingLayout;
  children?: ReactNode;
  footer?: ReactNode;
  splitFooterAlignment?: SplitFooterAlignment;
  wrapperClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  sectionContainerClassName?: string;
  centeredContainerClassName?: string;
  sectionTitleClassName?: string;
  centeredTitleClassName?: string;
  sectionLeadClassName?: string;
  centeredLeadClassName?: string;
  headingOptions?: {
    animation?: HeadingAnimation;
    size?: HeadingSize;
    level?: HeadingLevel;
    titleClassName?: string;
    classes?: {
      sectionContainerClassName?: string;
      centeredContainerClassName?: string;
      sectionTitleClassName?: string;
      centeredTitleClassName?: string;
      sectionLeadClassName?: string;
      centeredLeadClassName?: string;
    };
  };
}

export function SectionHeading(props: SectionHeadingProps) {
  return <SectionWrapper {...props} />;
}
