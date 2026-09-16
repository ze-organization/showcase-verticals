"use client";

import {
  DetailsEyebrow,
  DetailsShell,
  DetailsTitle,
} from "@/components/registry/components/page-details/_details-shell";
import { NamedIcon } from "@/components/registry/graphics/icons/named-icon/named-icon";
import { Button } from "@/components/registry/components/ui/cta-button";
import { NextImage as Image } from "@/components/registry/primitives/editables/image";
import { RichText } from "@/components/registry/primitives/editables/richtext";
import { Text } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import {
  detailsTextAlignClass,
  type DetailsShellParams,
} from "@/lib/registry/details-shell";
import {
  pickImage,
  pickLink,
  pickText,
} from "@/lib/registry/page-details-fields";
import {
  type Field,
  type ImageField,
  type LinkField,
  type Page,
  Placeholder,
  type RichTextField,
  useSitecore,
} from "@/lib/registry/sitecore";
import type { ComponentProps } from "@/lib/registry/sitecore-types";
import { sxaPlaceholderName } from "@/lib/registry/sxa-placeholder-name";
import { sitecorePassthrough } from "@/lib/registry/with-sitecore";

interface Fields {
  Title: Field<string>;
  Eyebrow: Field<string>;
  ShortDescription: Field<string>;
  PrimaryAction: LinkField;
  SecondaryAction: LinkField;
  Image: ImageField;
  VideoUrl: Field<string>;
  Feature1IconName: Field<string>;
  Feature1Title: Field<string>;
  Feature1Description: RichTextField;
  Feature2IconName: Field<string>;
  Feature2Title: Field<string>;
  Feature2Description: RichTextField;
  Feature3IconName: Field<string>;
  Feature3Title: Field<string>;
  Feature3Description: RichTextField;
  Stat1Number: Field<string>;
  Stat1Label: Field<string>;
  Stat2Number: Field<string>;
  Stat2Label: Field<string>;
  Stat3Number: Field<string>;
  Stat3Label: Field<string>;
  TestimonialQuote: RichTextField;
  TestimonialAuthorName: Field<string>;
  TestimonialAuthorTitle: Field<string>;
  TestimonialAuthorImage: ImageField;
  PartnerLogosImage: ImageField;
  Faq1Question: Field<string>;
  Faq1Answer: RichTextField;
  Faq2Question: Field<string>;
  Faq2Answer: RichTextField;
  Faq3Question: Field<string>;
  Faq3Answer: RichTextField;
  Faq4Question: Field<string>;
  Faq4Answer: RichTextField;
  Faq5Question: Field<string>;
  Faq5Answer: RichTextField;
  FinalCtaTitle: Field<string>;
  FinalCtaSubhead: RichTextField;
  FinalCtaAction: LinkField;
}

interface LandingDetailsProps extends Omit<ComponentProps, "params"> {
  fields?: Partial<Fields>;
  params?: ComponentProps["params"] & DetailsShellParams;
  page?: Page;
}

function resolveFields(
  renderingFields: Partial<Fields> | undefined,
  routeFields: Record<string, unknown> | undefined,
): Partial<Fields> {
  const route = (routeFields ?? {}) as Partial<Fields>;
  const r = renderingFields ?? {};
  return {
    Title: pickText(r.Title, route.Title),
    Eyebrow: pickText(r.Eyebrow, route.Eyebrow),
    ShortDescription: pickText(r.ShortDescription, route.ShortDescription),
    PrimaryAction: pickLink(r.PrimaryAction, route.PrimaryAction),
    SecondaryAction: pickLink(r.SecondaryAction, route.SecondaryAction),
    Image: pickImage(r.Image, route.Image),
    VideoUrl: pickText(r.VideoUrl, route.VideoUrl),
    Feature1IconName: pickText(r.Feature1IconName, route.Feature1IconName),
    Feature1Title: pickText(r.Feature1Title, route.Feature1Title),
    Feature1Description: pickText(
      r.Feature1Description,
      route.Feature1Description,
    ),
    Feature2IconName: pickText(r.Feature2IconName, route.Feature2IconName),
    Feature2Title: pickText(r.Feature2Title, route.Feature2Title),
    Feature2Description: pickText(
      r.Feature2Description,
      route.Feature2Description,
    ),
    Feature3IconName: pickText(r.Feature3IconName, route.Feature3IconName),
    Feature3Title: pickText(r.Feature3Title, route.Feature3Title),
    Feature3Description: pickText(
      r.Feature3Description,
      route.Feature3Description,
    ),
    Stat1Number: pickText(r.Stat1Number, route.Stat1Number),
    Stat1Label: pickText(r.Stat1Label, route.Stat1Label),
    Stat2Number: pickText(r.Stat2Number, route.Stat2Number),
    Stat2Label: pickText(r.Stat2Label, route.Stat2Label),
    Stat3Number: pickText(r.Stat3Number, route.Stat3Number),
    Stat3Label: pickText(r.Stat3Label, route.Stat3Label),
    TestimonialQuote: pickText(r.TestimonialQuote, route.TestimonialQuote),
    TestimonialAuthorName: pickText(
      r.TestimonialAuthorName,
      route.TestimonialAuthorName,
    ),
    TestimonialAuthorTitle: pickText(
      r.TestimonialAuthorTitle,
      route.TestimonialAuthorTitle,
    ),
    TestimonialAuthorImage: pickImage(
      r.TestimonialAuthorImage,
      route.TestimonialAuthorImage,
    ),
    PartnerLogosImage: pickImage(r.PartnerLogosImage, route.PartnerLogosImage),
    Faq1Question: pickText(r.Faq1Question, route.Faq1Question),
    Faq1Answer: pickText(r.Faq1Answer, route.Faq1Answer),
    Faq2Question: pickText(r.Faq2Question, route.Faq2Question),
    Faq2Answer: pickText(r.Faq2Answer, route.Faq2Answer),
    Faq3Question: pickText(r.Faq3Question, route.Faq3Question),
    Faq3Answer: pickText(r.Faq3Answer, route.Faq3Answer),
    Faq4Question: pickText(r.Faq4Question, route.Faq4Question),
    Faq4Answer: pickText(r.Faq4Answer, route.Faq4Answer),
    Faq5Question: pickText(r.Faq5Question, route.Faq5Question),
    Faq5Answer: pickText(r.Faq5Answer, route.Faq5Answer),
    FinalCtaTitle: pickText(r.FinalCtaTitle, route.FinalCtaTitle),
    FinalCtaSubhead: pickText(r.FinalCtaSubhead, route.FinalCtaSubhead),
    FinalCtaAction: pickLink(r.FinalCtaAction, route.FinalCtaAction),
  };
}

function hasText(field?: { value?: unknown }): boolean {
  const value = field?.value;
  if (typeof value !== "string") return false;
  return value.replace(/<[^>]+>/g, "").trim().length > 0;
}

function hasHref(link?: LinkField): boolean {
  const href = link?.value?.href;
  return typeof href === "string" && href.trim().length > 0;
}

function hasImage(field?: ImageField): boolean {
  const src = field?.value && typeof field.value === "object" ? field.value.src : undefined;
  return Boolean(src);
}

function youtubeId(url: string): string | undefined {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/,
  );
  return match?.[1];
}

function LandingDetails({
  params,
  fields,
  rendering,
  page: pageFromSdk,
}: LandingDetailsProps) {
  const { page: pageFromHook } = useSitecore();
  const page = pageFromSdk ?? pageFromHook;
  const routeFields = page?.layout?.sitecore?.route?.fields as
    | Record<string, unknown>
    | undefined;
  const resolved = resolveFields(fields, routeFields);
  const id = params?.RenderingIdentifier;
  const fullWidthKey = sxaPlaceholderName(
    rendering,
    "landing-details-full-width",
    params?.DynamicPlaceholderId,
  );
  const isPageEditing = page?.mode?.isEditing ?? false;
  const videoUrl =
    typeof resolved.VideoUrl?.value === "string"
      ? resolved.VideoUrl.value.trim()
      : "";
  const yt = videoUrl ? youtubeId(videoUrl) : undefined;

  const features = [1, 2, 3].map((n) => {
    const title = resolved[`Feature${n}Title` as keyof Fields] as
      | Field<string>
      | undefined;
    const description = resolved[`Feature${n}Description` as keyof Fields] as
      | RichTextField
      | undefined;
    const icon = resolved[`Feature${n}IconName` as keyof Fields] as
      | Field<string>
      | undefined;
    return { n, title, description, icon };
  });
  const showFeatures =
    isPageEditing ||
    features.some((f) => hasText(f.title) || hasText(f.description));

  const stats = [1, 2, 3].map((n) => ({
    n,
    number: resolved[`Stat${n}Number` as keyof Fields] as Field<string> | undefined,
    label: resolved[`Stat${n}Label` as keyof Fields] as Field<string> | undefined,
  }));
  const showStats =
    isPageEditing || stats.some((s) => hasText(s.number) || hasText(s.label));

  const faqs = [1, 2, 3, 4, 5].map((n) => ({
    n,
    question: resolved[`Faq${n}Question` as keyof Fields] as
      | Field<string>
      | undefined,
    answer: resolved[`Faq${n}Answer` as keyof Fields] as
      | RichTextField
      | undefined,
  }));
  const visibleFaqs = faqs.filter(
    (item) => isPageEditing || (hasText(item.question) && hasText(item.answer)),
  );
  const showFaq = visibleFaqs.length > 0;

  const showTestimonial =
    isPageEditing ||
    hasText(resolved.TestimonialQuote) ||
    hasText(resolved.TestimonialAuthorName);
  const showLogos = isPageEditing || hasImage(resolved.PartnerLogosImage);
  const showFinalCta =
    isPageEditing ||
    hasText(resolved.FinalCtaTitle) ||
    hasHref(resolved.FinalCtaAction);

  return (
    <DetailsShell
      params={params}
      className="landing-details"
      id={id}
      fullWidth={
        rendering ? (
          <Placeholder name={fullWidthKey} rendering={rendering} />
        ) : null
      }
    >
      <div className="grid grid-cols-12 @[768px]:gap-8 gap-y-8">
          <div
            className={cn(
              "@[768px]:col-span-6 col-span-12 flex flex-col justify-center",
              detailsTextAlignClass(params),
            )}
          >
            <DetailsEyebrow
              params={params}
              value={resolved.Eyebrow}
              isEditing={isPageEditing}
            />
            <DetailsTitle
              params={params}
              value={resolved.Title}
              isEditing={isPageEditing}
            />
            <Text
              tag="p"
              className="mt-5 font-medium text-lg text-muted-foreground tracking-wide"
              value={resolved.ShortDescription}
              isEditing={isPageEditing}
              placeholder="Short description"
            />
            {(isPageEditing ||
              hasHref(resolved.PrimaryAction) ||
              hasHref(resolved.SecondaryAction)) && (
              <div className="mt-8 flex flex-wrap gap-3">
                {(isPageEditing || hasHref(resolved.PrimaryAction)) && (
                  <Button link={resolved.PrimaryAction} showArrow />
                )}
                {(isPageEditing || hasHref(resolved.SecondaryAction)) && (
                  <Button
                    link={resolved.SecondaryAction}
                    variant="outline"
                  />
                )}
              </div>
            )}
          </div>
          <div className="@[768px]:col-span-6 col-span-12 aspect-video w-full overflow-hidden rounded-lg">
            {yt ? (
              <iframe
                title={resolved.Title?.value ?? "Hero video"}
                src={`https://www.youtube.com/embed/${yt}`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : videoUrl ? (
              <video
                src={videoUrl}
                controls
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                value={resolved.Image}
                className="h-full w-full object-cover"
                isEditing={isPageEditing}
                placeholder="Image"
              />
            )}
          </div>
        </div>

        {showFeatures ? (
          <div className="grid grid-cols-1 gap-6 @[768px]:grid-cols-3 @[768px]:py-12 py-6">
            {features.map((feature) => {
              if (
                !isPageEditing &&
                !hasText(feature.title) &&
                !hasText(feature.description)
              ) {
                return null;
              }
              const iconName =
                typeof feature.icon?.value === "string"
                  ? feature.icon.value
                  : "";
              return (
                <div
                  key={feature.n}
                  className="rounded-lg border border-border/50 bg-background p-6"
                >
                  {iconName ? (
                    <NamedIcon name={iconName} className="mb-4 size-8" />
                  ) : null}
                  <Text
                    tag="h2"
                    className="text-xl"
                    value={feature.title}
                    isEditing={isPageEditing}
                    placeholder={`Feature ${feature.n} title`}
                  />
                  <RichText
                    className="mt-3 text-muted-foreground"
                    value={feature.description}
                    isEditing={isPageEditing}
                    placeholder={`Feature ${feature.n} description`}
                  />
                </div>
              );
            })}
          </div>
        ) : null}

        {showStats ? (
          <div className="grid grid-cols-1 gap-6 @[768px]:grid-cols-3 @[768px]:py-12 py-6">
            {stats.map((stat) => {
              if (
                !isPageEditing &&
                !hasText(stat.number) &&
                !hasText(stat.label)
              ) {
                return null;
              }
              return (
                <div key={stat.n} className="text-center">
                  <Text
                    tag="p"
                    className="font-semibold text-4xl tracking-tight"
                    value={stat.number}
                    isEditing={isPageEditing}
                    placeholder={`Stat ${stat.n} number`}
                  />
                  <Text
                    tag="p"
                    className="mt-2 text-muted-foreground"
                    value={stat.label}
                    isEditing={isPageEditing}
                    placeholder={`Stat ${stat.n} label`}
                  />
                </div>
              );
            })}
          </div>
        ) : null}

        {showTestimonial || showLogos ? (
          <div className="@[768px]:py-12 py-6">
            {showTestimonial ? (
              <figure className="mx-auto max-w-3xl rounded-lg border border-border/50 bg-background p-8">
                <blockquote>
                  <RichText
                    className="text-lg"
                    value={resolved.TestimonialQuote}
                    isEditing={isPageEditing}
                    placeholder="Testimonial quote"
                  />
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-4">
                  {isPageEditing || hasImage(resolved.TestimonialAuthorImage) ? (
                    <div className="size-12 overflow-hidden rounded-full">
                      <Image
                        value={resolved.TestimonialAuthorImage}
                        className="h-full w-full object-cover"
                        isEditing={isPageEditing}
                        placeholder="Author image"
                      />
                    </div>
                  ) : null}
                  <div>
                    <Text
                      tag="p"
                      className="font-medium"
                      value={resolved.TestimonialAuthorName}
                      isEditing={isPageEditing}
                      placeholder="Author name"
                    />
                    <Text
                      tag="p"
                      className="text-muted-foreground text-sm"
                      value={resolved.TestimonialAuthorTitle}
                      isEditing={isPageEditing}
                      placeholder="Author title"
                    />
                  </div>
                </figcaption>
              </figure>
            ) : null}
            {showLogos ? (
              <div className="mx-auto mt-8 max-w-4xl">
                <Image
                  value={resolved.PartnerLogosImage}
                  className="h-auto w-full object-contain"
                  isEditing={isPageEditing}
                  placeholder="Partner logos"
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {showFaq ? (
          <div className="mx-auto max-w-3xl @[768px]:py-12 py-6">
            <h2 className="mb-6 text-2xl">Frequently asked</h2>
            <div className="divide-y divide-border">
              {visibleFaqs.map((item) => (
                <details key={item.n} className="group py-4">
                  <summary className="cursor-pointer list-none font-medium">
                    <Text
                      tag="span"
                      value={item.question}
                      isEditing={isPageEditing}
                      placeholder={`FAQ ${item.n} question`}
                    />
                  </summary>
                  <RichText
                    className="mt-3 text-muted-foreground"
                    value={item.answer}
                    isEditing={isPageEditing}
                    placeholder={`FAQ ${item.n} answer`}
                  />
                </details>
              ))}
            </div>
          </div>
        ) : null}

        {showFinalCta ? (
          <div className="my-8 rounded-lg bg-primary px-6 py-12 text-center text-primary-foreground @[768px]:px-12">
            <Text
              tag="h2"
              className="text-3xl"
              value={resolved.FinalCtaTitle}
              isEditing={isPageEditing}
              placeholder="Final CTA title"
            />
            <RichText
              className="mx-auto mt-4 max-w-2xl"
              value={resolved.FinalCtaSubhead}
              isEditing={isPageEditing}
              placeholder="Final CTA subhead"
            />
            {(isPageEditing || hasHref(resolved.FinalCtaAction)) && (
              <div className="mt-6 flex justify-center">
                <Button link={resolved.FinalCtaAction} showArrow />
              </div>
            )}
          </div>
        ) : null}
    </DetailsShell>
  );
}

export const Default = sitecorePassthrough(LandingDetails);

export const componentType = "universal";
