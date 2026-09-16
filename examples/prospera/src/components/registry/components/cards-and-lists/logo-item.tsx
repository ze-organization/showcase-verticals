import { ArrowLink } from "@/components/registry/primitives/editables/arrow-link";
import {
  type ImageSource,
  NextImage,
} from "@/components/registry/primitives/editables/image";
import type { LinkSource } from "@/components/registry/primitives/editables/link";
import {
  RichText,
  type RichTextSource,
} from "@/components/registry/primitives/editables/richtext";
import {
  getLinkHref,
  getSourceText,
  isEmptySource,
} from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import type { CmsProps } from "@/lib/registry/sitecore";

/**
 * Logo Item — leaf rendering for `logo-wall@1`. Drop into `logo-wall-{*}`.
 * Default is a strip/grid tile; Recognition is the award-row treatment.
 */

export interface LogoItemProps extends CmsProps {
  logo?: ImageSource;
  name?: TextSource;
  description?: RichTextSource;
  link?: LinkSource;
}

function Tile({ logo, name, link, isEditing }: LogoItemProps) {
  const label = getSourceText(name);
  const href = getLinkHref(link);
  const image = (
    <NextImage
      value={logo}
      width={160}
      height={64}
      className="h-12 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
      alt={label}
      placeholder={isEditing ? "Logo" : undefined}
      isEditing={isEditing}
    />
  );
  if (href && !isEditing) {
    return (
      <a
        href={href}
        className="flex items-center justify-center px-6 py-4"
        aria-label={label || undefined}
      >
        {image}
      </a>
    );
  }
  return <span className="flex items-center justify-center px-6 py-4">{image}</span>;
}

function RecognitionRow({
  logo,
  name,
  description,
  link,
  isEditing,
}: LogoItemProps) {
  const label = getSourceText(name);
  const hasDescription = description != null && !isEmptySource(description);
  const hasLink = link != null && !isEmptySource(link);
  return (
    <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:gap-8">
      <div className="flex w-40 shrink-0 items-center">
        <NextImage
          value={logo}
          width={160}
          height={64}
          className="h-12 w-auto object-contain"
          alt={label}
          placeholder={isEditing ? "Logo" : undefined}
          isEditing={isEditing}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {label || isEditing ? (
          <span className="wrap-break-word font-heading font-semibold text-lg">
            <Text value={name} tag="span" isEditing={isEditing} />
          </span>
        ) : null}
        {hasDescription || isEditing ? (
          <div className="wrap-break-word text-muted-foreground text-sm leading-relaxed [&_p]:mb-0">
            <RichText
              value={description}
              placeholder="Description"
              isEditing={isEditing}
            />
          </div>
        ) : null}
      </div>
      {hasLink || isEditing ? (
        <div className="shrink-0 sm:self-center">
          <ArrowLink
            value={link}
            isEditing={isEditing}
            placeholder="Link"
            hideBorder
            className="text-accent"
          />
        </div>
      ) : null}
    </div>
  );
}

export function Default(props: LogoItemProps) {
  return (
    <div
      className={cn("component logo-item", props.styles?.trimEnd())}
      id={props.id}
      data-slot="logo-item"
    >
      <Tile {...props} />
    </div>
  );
}

export function Recognition(props: LogoItemProps) {
  return (
    <div
      className={cn("component logo-item", props.styles?.trimEnd())}
      id={props.id}
      data-slot="logo-item"
    >
      <RecognitionRow {...props} />
    </div>
  );
}

export const componentType = "universal";
