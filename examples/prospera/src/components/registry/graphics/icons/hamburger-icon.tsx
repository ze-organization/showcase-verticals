import type React from "react";

interface HamburgerIconProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isOpen: boolean;
}

const HamburgerIcon: React.FC<HamburgerIconProps> = ({
  isOpen,
  className = "",
  ...props
}) => (
  <button
    type="button"
    className={`relative h-4 w-6 cursor-pointer ${className}`}
    aria-label={isOpen ? "Close menu" : "Open menu"}
    aria-expanded={isOpen}
    {...props}
  >
    <span
      className={`absolute inset-x-0 h-0.5 bg-foreground transition-all duration-300 ease-out ${isOpen ? "top-1/2 rotate-45" : "top-0"} `}
    />
    <span
      className={`absolute inset-x-0 h-0.5 bg-foreground transition-all duration-100 ease-out ${isOpen ? "opacity-0" : "top-1/2"} `}
    />
    <span
      className={`absolute inset-x-0 h-0.5 bg-foreground transition-all duration-300 ease-out ${isOpen ? "top-1/2 -rotate-45" : "top-full"} `}
    />
  </button>
);

export default HamburgerIcon;
