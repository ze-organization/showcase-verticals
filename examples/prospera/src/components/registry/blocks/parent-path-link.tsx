"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "next-localization";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";

/**
 * next-localization's I18nContext has no default value, so `useI18n()`
 * returns `undefined` when no `<I18nProvider>` ancestor exists
 * (Sitecore metadata editing payloads, hand-mounted previews) even
 * though the typings promise an instance. Destructuring `{ t }` from
 * that undefined crashed the whole editing canvas; fall back to a
 * no-op translate so every context renders the English defaults.
 */
function useSafeTranslate(): (key: string) => string {
  const i18n = useI18n() as ReturnType<typeof useI18n> | undefined;
  return i18n ? (key) => i18n.t(key) : () => "";
}

export const ParentPathLink = ({ text }: { text: string }) => {
  const pathname = usePathname();
  const t = useSafeTranslate();

  // Split path into segments and remove the last one
  const segments = pathname?.split("/").filter(Boolean);
  segments?.pop();

  // Construct parent path
  const parentPath = `/${segments?.join("/")}`;

  return (
    <Link
      href={parentPath || "/"}
      className="my-4 flex items-center gap-2 text-accent text-sm hover:underline"
    >
      <LibraryIcon name="arrow-left" className="size-4" aria-hidden="true" />
      {text || t("back_button_label") || "Back"}
    </Link>
  );
};
