import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/registry/primitives/core/toggle-group";

type CardViewSwitcherProps = {
  onToggle: (value: string) => void;
  defaultCardView: "list" | "grid";
  value?: "list" | "grid";
};

const CardViewSwitcher = ({
  onToggle,
  defaultCardView,
  value,
}: CardViewSwitcherProps) => {
  return (
    <ToggleGroup
      type="single"
      value={value ?? undefined}
      defaultValue={defaultCardView}
      onValueChange={(next) => onToggle(next || defaultCardView)}
      className="inline-flex"
      variant="rounded"
      size="sm"
    >
      <ToggleGroupItem value="grid" aria-label="Grid View">
        <LibraryIcon name="grid" className="size-4" aria-hidden="true" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List View">
        <LibraryIcon name="list" className="size-4" aria-hidden="true" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export { CardViewSwitcher };

export default CardViewSwitcher;
