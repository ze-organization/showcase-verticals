// Color inherits from the nearest `text-*` ancestor via
// `stroke="currentColor"`. The wrapping section-heading helper pins
// the right `text-*` token directly on this SVG based on the
// `AccentLineColor` param (color-scheme@1) so a section can match the
// scribble to its content (primary brand stripe over a primary band,
// etc.). `text-accent` is the default the heading consumers pass for
// installs that don't drive the scheme.
const AccentLine = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 441 25"
      fill="none"
      className={`mt-1 block h-[0.5em] w-[7ch] max-w-full group-[.text-center]/heading:mx-auto group-[.text-end]/heading:ms-auto ${className}`}
      preserveAspectRatio="none"
    >
      <title>Accent Line</title>
      <path
        d="M3 22C93.4059 7.66215 306.974 -12.4108 438 22"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default AccentLine;
