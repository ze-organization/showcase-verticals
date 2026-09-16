import { TypographyMuted } from "@/components/registry/primitives/core/typography";
import {
  Link,
  type LinkSource,
} from "@/components/registry/primitives/editables/link";
import {
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
 * Status Item — leaf rendering for `status-list@1`. Drop into
 * `cards-statuses-{*}`. Default is a metric tile; List is an incident row.
 */

export type StatusItemTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "destructive";

export interface StatusItemProps extends CmsProps {
  subject?: TextSource;
  subjectType?: TextSource;
  status?: TextSource;
  statusTone?: TextSource | string;
  value?: TextSource;
  unit?: TextSource;
  metricLabel?: TextSource;
  link?: LinkSource;
}

const BADGE_TONE_CLASS: Record<StatusItemTone, string> = {
  neutral: "bg-muted text-muted-foreground ring-border",
  info: "bg-info/15 text-info ring-info/30",
  success: "bg-success/15 text-success ring-success/30",
  warning: "bg-warning/15 text-warning ring-warning/40",
  destructive: "bg-destructive/15 text-destructive ring-destructive/30",
};

function parseTone(value: TextSource | string | undefined): StatusItemTone {
  const raw = (typeof value === "string" ? value : getSourceText(value))
    ?.trim()
    .toLowerCase();
  if (
    raw === "info" ||
    raw === "success" ||
    raw === "warning" ||
    raw === "destructive"
  ) {
    return raw;
  }
  return "neutral";
}

function StatusBadge({
  status,
  tone,
  isEditing,
}: {
  status?: TextSource;
  tone: StatusItemTone;
  isEditing?: boolean;
}) {
  if (!status || !getSourceText(status)) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium text-xs uppercase tracking-wide ring-1 ring-inset",
        BADGE_TONE_CLASS[tone],
      )}
      data-status-tone={tone}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      <Text value={status} tag="span" isEditing={isEditing} />
    </span>
  );
}

function Metric({
  value,
  unit,
  metricLabel,
  large,
  isEditing,
}: {
  value?: TextSource;
  unit?: TextSource;
  metricLabel?: TextSource;
  large?: boolean;
  isEditing?: boolean;
}) {
  if (!value || !getSourceText(value)) return null;
  return (
    <div className={cn(large ? "mt-3" : "text-end")}>
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            "font-bold font-heading tracking-tight",
            large ? "text-4xl md:text-5xl" : "text-xl",
          )}
        >
          <Text value={value} tag="span" isEditing={isEditing} />
        </span>
        {unit && getSourceText(unit) ? (
          <span className="font-medium text-current/60 text-sm">
            <Text value={unit} tag="span" isEditing={isEditing} />
          </span>
        ) : null}
      </div>
      {metricLabel && getSourceText(metricLabel) ? (
        <div className="mt-0.5 text-current/60 text-xs">
          <Text value={metricLabel} tag="span" isEditing={isEditing} />
        </div>
      ) : null}
    </div>
  );
}

function Tile({
  subject,
  subjectType,
  status,
  statusTone,
  value,
  unit,
  metricLabel,
  link,
  isEditing,
}: StatusItemProps) {
  return (
    <div className="flex flex-col rounded-(--card-radius,var(--radius-xl)) border border-border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {subject && getSourceText(subject) ? (
            <div className="font-medium text-sm">
              <Text value={subject} tag="span" isEditing={isEditing} />
            </div>
          ) : null}
          {subjectType && getSourceText(subjectType) ? (
            <TypographyMuted className="text-xs uppercase tracking-wide">
              <Text value={subjectType} tag="span" isEditing={isEditing} />
            </TypographyMuted>
          ) : null}
        </div>
        <StatusBadge
          status={status}
          tone={parseTone(statusTone)}
          isEditing={isEditing}
        />
      </div>
      <Metric
        value={value}
        unit={unit}
        metricLabel={metricLabel}
        large
        isEditing={isEditing}
      />
      {link && !isEmptySource(link) ? (
        <div className="mt-4 [&_a]:font-medium [&_a]:text-primary [&_a]:text-sm">
          <Link value={link} isEditing={isEditing} />
        </div>
      ) : null}
    </div>
  );
}

function Row({
  subject,
  subjectType,
  status,
  statusTone,
  value,
  unit,
  metricLabel,
  link,
  isEditing,
}: StatusItemProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-border border-b py-4 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          {subject && getSourceText(subject) ? (
            <span className="font-medium">
              <Text value={subject} tag="span" isEditing={isEditing} />
            </span>
          ) : null}
          <StatusBadge
            status={status}
            tone={parseTone(statusTone)}
            isEditing={isEditing}
          />
        </div>
        {subjectType && getSourceText(subjectType) ? (
          <TypographyMuted className="mt-0.5 text-sm">
            <Text value={subjectType} tag="span" isEditing={isEditing} />
          </TypographyMuted>
        ) : null}
      </div>
      <Metric
        value={value}
        unit={unit}
        metricLabel={metricLabel}
        isEditing={isEditing}
      />
      {link && !isEmptySource(link) ? (
        <div className="[&_a]:font-medium [&_a]:text-primary [&_a]:text-sm">
          <Link value={link} isEditing={isEditing} />
        </div>
      ) : null}
    </div>
  );
}

export function Default(props: StatusItemProps) {
  return (
    <div
      className={cn("component status-item", props.styles?.trimEnd())}
      id={props.id}
      data-slot="status-item"
    >
      <Tile {...props} />
    </div>
  );
}

export function List(props: StatusItemProps) {
  return (
    <div
      className={cn("component status-item", props.styles?.trimEnd())}
      id={props.id}
      data-slot="status-item"
    >
      <Row {...props} />
    </div>
  );
}

export const componentType = "universal";
