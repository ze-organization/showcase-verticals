import type { ComponentParams } from "@/lib/registry/sitecore";

type ResolveEditingModeInput = {
  isEditing?: boolean;
  params?: ComponentParams;
};

const EDIT_MODE_VALUES = new Set(["1", "true", "yes", "edit", "editing"]);
const EDIT_MODE_PARAM_KEYS = [
  "isEditing",
  "pageEditing",
  "sc_mode",
  "scMode",
  "mode",
] as const;

/**
 * Resolves authoring/editing mode without useSitecore().
 * Prefers explicit props and then checks known rendering parameters.
 */
export function resolveEditingMode({
  isEditing,
  params,
}: ResolveEditingModeInput): boolean {
  if (typeof isEditing === "boolean") return isEditing;
  if (!params) return false;

  for (const key of EDIT_MODE_PARAM_KEYS) {
    const raw = params[key];
    if (typeof raw !== "string") continue;
    const value = raw.trim().toLowerCase();
    if (EDIT_MODE_VALUES.has(value)) return true;
  }

  return false;
}
