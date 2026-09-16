import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/registry/primitives/core/item";
import {
  Image,
  type ImageSource,
} from "@/components/registry/primitives/editables/image";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import type { CmsProps } from "@/lib/registry/sitecore";

export interface AvatarBlockProps extends CmsProps {
  /** Display name. Used for initials fallback and alt text. */
  name?: TextSource;
  /** Optional avatar image. */
  image?: ImageSource;
  /** Optional short description or role (e.g. "Head of Experience"). */
  description?: TextSource;
  /**
   * Mirrors the shared `size@1` Sitecore enum. `"default"` resolves to
   * `md` — avatar's natural default — per the
   * "each component owns the meaning of Default" convention on `size@1`.
   */
  size?: "default" | "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * Mirrors the shared `avatar-layout@1` Sitecore enum. `"default"`
   * resolves to `row` — avatar's natural default — per the
   * "each component owns the meaning of Default" convention.
   */
  layout?: "default" | "row" | "stack";
}

const sizeClasses = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-10 w-10 text-xs",
  md: "h-16 w-16 sm:h-20 sm:w-20 text-sm",
  lg: "h-24 w-24 text-base",
  xl: "h-32 w-32 text-lg",
};

function makeInitials(name: string | undefined): string {
  if (!name) return "??";
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0] ?? "")
      .join("")
      .toUpperCase()
      .slice(0, 2) || "??"
  );
}

function readName(name: TextSource | undefined): string | undefined {
  if (name == null) return undefined;
  if (typeof name === "string") return name;
  return name.value;
}

// Pull the URL out of either a Sitecore `ImageField` (`{ value: { src }}`)
// or a plain `{ src }` shape. Returns undefined when nothing parseable
// is present so the AvatarFallback (initials) takes over cleanly.
// Radix's `AvatarPrimitive.Image` renders an `<img>` directly from
// `src` and only mounts when load resolves; passing a `<Image>` child
// to it (as the prior implementation did) was a no-op — Radix ignored
// the child, no `src` was set, and the avatar never showed.
function resolveAvatarSrc(image: ImageSource | undefined): string | undefined {
  if (image == null) return undefined;
  const obj = image as {
    src?: string;
    value?: { src?: string };
  };
  return obj.value?.src ?? obj.src ?? undefined;
}

/**
 * Sitecore-registered avatar block. CMS-agnostic at the file level —
 * accepts either raw values or polymorphic Sitecore field sources, so
 * the same component works in standalone and CMS-driven contexts.
 *
 * For CMS use, this component pairs with the `mapAvatarBlock` adapter
 * in `./avatar-block.sitecore.ts`, which normalises either an
 * `avatar-item@1` or `author@1` datasource shape into these props.
 * Wire it up in the consumer app's component map:
 *
 *   componentMap.set(
 *     "AvatarBlock",
 *     withSitecore<AvatarBlockFields, AvatarBlockProps>(
 *       AvatarBlock,
 *       mapAvatarBlock,
 *     ),
 *   );
 */
export function AvatarBlock({
  name,
  image,
  description,
  size = "md",
  layout = "row",
  styles,
  id,
  isEditing,
}: AvatarBlockProps) {
  const resolvedSize = size === "default" ? "md" : size;
  const resolvedLayout = layout === "default" ? "row" : layout;
  const initials = makeInitials(readName(name));
  const avatarSrc = resolveAvatarSrc(image);

  return (
    <Item
      id={id}
      className={cn(
        // Transparent shell so the avatar adopts whatever surface
        // (page bg, section card, dark hero) it's dropped onto. The
        // `Item` primitive defaults to `bg-background`; override here.
        "rounded-xl border-border bg-transparent shadow-sm",
        // Row: center name+description vertically against the avatar
        // image — top-aligning made multi-line names look orphaned
        // next to the round avatar.
        // Stack: start-align (items-start, NOT items-center) so the
        // avatar and the name+description column both hug the inline-
        // start edge — a center-aligned stack pulls name/description
        // away from any surrounding content's start axis and reads as
        // a floating tile instead of part of the page flow. Stays
        // RTL-correct via the logical items-start token.
        resolvedLayout === "row" && "flex-row items-center",
        resolvedLayout === "stack" && "flex-col items-start",
        styles?.trimEnd(),
      )}
    >
      {/*
        Always render through the registry Image editable (matches the
        Card pattern). The wrapping div recreates the avatar circle so
        the editing-mode preview matches the runtime treatment, and the
        initials fallback only mounts when there's no image AND we're
        not in editing mode — otherwise the Image primitive owns the
        slot (either showing the asset or the EditPlaceholder stub).
        Radix's AvatarPrimitive.Image renders a raw `<img>` and can't
        host Sitecore's editable image surface (no asChild on the
        primitive, and the load-state coordination with AvatarFallback
        would suppress the chrome handles), so it's dropped in favour
        of the editable primitive.
      */}
      {/*
        Corner shape is a THEME primitive, not a param — mirrors how
        `--card-radius`/`--button-radius` are consumed. Default is
        fully round (9999px); a theme overrides `--avatar-radius` for
        square (0) or soft-square (e.g. 0.5rem) avatars. Deliberately
        no Shape rendering param — per the "rounding is controlled by
        the primitives themselves" principle.
      */}
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-[var(--avatar-radius,9999px)] bg-muted",
          sizeClasses[resolvedSize],
        )}
      >
        {avatarSrc || isEditing ? (
          <Image
            value={image}
            placeholder="Avatar"
            isEditing={isEditing}
            alt={readName(name) ?? ""}
            className="size-full object-cover"
          />
        ) : (
          <span className="font-medium text-muted-foreground">{initials}</span>
        )}
      </div>
      <ItemContent className="gap-1">
        <ItemTitle className="text-foreground">
          <Text
            value={name}
            tag="span"
            placeholder="Name"
            isEditing={isEditing}
          />
        </ItemTitle>
        {(description != null || isEditing) && (
          <ItemDescription className="text-muted-foreground text-sm">
            <Text
              value={description}
              tag="span"
              placeholder="Description"
              isEditing={isEditing}
            />
          </ItemDescription>
        )}
      </ItemContent>
    </Item>
  );
}

export default AvatarBlock;

// Sitecore component-map variant. The Sitecore Headless SDK resolves
// `component.default || component.Default || component`, so this alias
// keeps the layout service's `componentName: "AvatarBlock"` working.
export const Default = AvatarBlock;

/**
 * `universal` opts this file into BOTH the server and client
 * component maps the SDK generates (component-map.ts +
 * component-map.client.ts). Server-only by default would land
 * here in the server map alone, which means Sitecore Pages chrome
 * (browser-side) cannot look the component up and its named-export
 * named-export variants fail to resolve. No runtime
 * behaviour change: the file stays a plain RSC server component
 * (no useState, no client-only hooks here); the universal marker
 * is purely a generate-map signal.
 */
export const componentType = "universal";
