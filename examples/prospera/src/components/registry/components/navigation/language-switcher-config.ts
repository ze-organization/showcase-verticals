export type LocaleOption = {
  code: string;
  label: string;
  currency: string;
  currencySymbol: string;
};

export const localeOptions: [LocaleOption, ...LocaleOption[]] = [
  { code: "en", label: "EN", currency: "USD", currencySymbol: "$" },
  { code: "fr-FR", label: "FR", currency: "EUR", currencySymbol: "€" },
  { code: "de-DE", label: "DE", currency: "EUR", currencySymbol: "€" },
  { code: "es-ES", label: "ES", currency: "EUR", currencySymbol: "€" },
  // RTL — picking this flips <html dir> via language-switcher.tsx.
  { code: "ar-SA", label: "AR", currency: "SAR", currencySymbol: "﷼" },
];
