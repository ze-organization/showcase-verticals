/**
 * Page Builder / Content Editor `__Icon` values for recipe-emitted
 * components and sections.
 *
 * Custom grayscale PNGs live at
 * `/sitecore/media library/Project/starter-collection/starter/Icons`.
 * Media item names match the handle without `@1` (`hero.png` → `hero`).
 * Values are Sitecore media thumbnail URLs so Pages shows the uploaded file.
 */
export const mediaIcon = (guid: string) =>
  `/-/media/${guid.replace(/-/g, "")}.ashx?thn=1&db=master&v=2` as const;

export const componentIcons = {
  // Layout
  "container@1": mediaIcon("b7844f13-66a5-4470-98f1-a2cd48821160"),
  "column-splitter@1": mediaIcon("6bf0b33a-6e69-4aeb-804d-cb5c90d322c6"),
  "row-splitter@1": mediaIcon("c844b72c-77bd-4ca5-ad2c-860579e1309b"),
  "section-wrapper@1": mediaIcon("0af9e320-c4b0-4f2c-9034-7a44ada8c13e"),
  "scroll-scene@1": mediaIcon("e4090c25-630b-4a39-aee0-198c1366bf15"),
  "scroll-to-top@1": mediaIcon("3125b2bc-94ec-4634-b0b2-dfde2a3e709a"),

  // Heros, banners, and promos
  "hero@1": mediaIcon("4beaf452-65b5-46c7-83fe-56696bb07d32"),
  "hero-carousel@1": mediaIcon("5ded62b6-c19c-4eb8-a482-60f35ed174ee"),
  "promo@1": mediaIcon("d8e1bf9e-d97f-43c6-a15a-cec62e9ab8d5"),
  "tagline-banner@1": mediaIcon("0249678b-5c63-4949-b92c-a67fc60141d3"),
  "alert-banner@1": mediaIcon("96fe0ed8-d388-4cf2-a4df-846252dea81d"),
  "inline-banner@1": mediaIcon("4d57edd3-d9be-494e-8c93-1ed67edee7a1"),
  "countdown-banner@1": mediaIcon("ffcd9cea-83f6-48e1-8d21-07e8ec1f6ee5"),
  "subscription-banner@1": mediaIcon("76ae548c-f93b-4f7b-aee8-31b82de75c2d"),
  "consent-banner@1": mediaIcon("6b942dc9-540d-4877-a4c3-ed760acf08c3"),
  "article-header@1": mediaIcon("52f8653a-8b8d-414c-9006-387c2d15b150"),

  // Cards, tiles, and items
  "card-block@1": mediaIcon("9fc9be7d-de69-40f3-bdd5-d8f00b0a81d1"),
  "feature-card@1": mediaIcon("ca6319df-e6c3-4784-9502-cdec6aa25d33"),
  "article-card@1": mediaIcon("6ea4d05a-14e4-49d4-8aa1-cc96682b00f8"),
  "product-card@1": mediaIcon("2e0658a7-44f9-4eab-898f-0d2d3d446a2c"),
  "person-card@1": mediaIcon("07c0152a-b1a9-4e80-94ab-c3a7bd3ef066"),
  "location-card@1": mediaIcon("255b9563-dc44-494a-87b9-c9f1eae23fae"),
  "destination-card@1": mediaIcon("43a97b23-4880-49ce-a03b-4daff155d9b1"),
  "offer-card@1": mediaIcon("df3cab3b-6059-40b2-b2ed-7a13dfb169e2"),
  "review-card@1": mediaIcon("391958a7-0137-429d-a248-dc1079d313c5"),
  "callout-card@1": mediaIcon("4a6ce8e1-a618-4db5-86ca-d1f370f4ddfc"),
  "pricing-card@1": mediaIcon("badbd761-dc31-4153-9dcf-339a9a61e7b1"),
  "stats-card@1": mediaIcon("a942c247-de28-408c-ae48-5830d51e8c7c"),
  "badge-block@1": mediaIcon("fc1b0510-3fb8-4f80-a5d9-02f37a9e2a1f"),
  "avatar-block@1": mediaIcon("97bff8c1-7b2c-42bf-baa2-14f9d821230c"),
  "logo-item@1": mediaIcon("68bb6e76-f841-4eac-9a73-741986fc8e21"),
  "quick-link-tile@1": mediaIcon("0a3a2946-9579-4201-abf9-5ddfbe1250bc"),
  "story-item@1": mediaIcon("99efece0-8003-46be-b347-4cd3877b6ef6"),
  "versus-item@1": mediaIcon("66635bfd-8b57-40fb-a5a2-fb4f25aba4be"),
  "status-item@1": mediaIcon("61f2a9b5-b8e8-44e4-a411-a2a08f331b90"),
  "ranking-row@1": mediaIcon("63e2c0cd-591f-4dc5-b47b-b24e450c49e4"),
  "media-item@1": mediaIcon("c3238243-0a38-485c-b9d0-eb465b588511"),
  "accordion-item-rendering@1": mediaIcon("87dcd033-e907-499b-973d-c88f848723f2"),
  "tab-rendering@1": mediaIcon("be5a66ad-7a1d-4054-b4cb-6d2e2cb435b5"),
  "lead-form-field@1": mediaIcon("2030e9e9-fa44-4a10-ae55-21a67c9c22f5"),

  // Lists, grids, and rails
  "articles-list-grid@1": mediaIcon("3ff42b0f-ae7c-4952-8876-61f6c2dd3039"),
  "products-list-grid@1": mediaIcon("7e179080-d1af-4e3a-a428-47a5643f8e67"),
  "person-list-grid@1": mediaIcon("a025f218-827a-416e-acc0-ab348757e551"),
  "locations-list-grid@1": mediaIcon("b9f899e8-a975-4cea-95dc-d5a8b999bafa"),
  "destinations-list-grid@1": mediaIcon("cb852036-1fcb-457e-ab6b-4f3f42d19ab4"),
  "offers-list-grid@1": mediaIcon("b4b94091-0615-436d-9a73-08b7d08d4505"),
  "features-list-grid@1": mediaIcon("a43c934d-cc52-4e64-911e-7ef9c9a018ad"),
  "reviews-list-grid@1": mediaIcon("625171bf-2b15-4d63-b1fe-007cb15c9654"),
  "stats-list-grid@1": mediaIcon("65a59bf5-d6cc-4b60-ba50-542fc1cbedfa"),
  "media-gallery-list-grid@1": mediaIcon("9ff1a851-59d8-4d32-ae42-f7c09ef1c44f"),
  "pricing-list-grid@1": mediaIcon("8ba00ef7-54a8-4795-9b70-c1bee7cea27c"),
  "status-list@1": mediaIcon("42edde4c-87b9-4bdb-b51f-64837007ad67"),
  "versus-list@1": mediaIcon("cf392db2-2e62-42d6-b03f-4b91b54553c9"),
  "link-list@1": mediaIcon("ea08ab9a-9e29-4dfc-90d6-1d8a7a466924"),
  "linked-items-rail@1": mediaIcon("85a96770-487a-42e4-b5ae-e2bee230b016"),
  "stories-rail@1": mediaIcon("e04126cf-29e5-495d-9320-14dfd441fb2b"),
  "logo-wall@1": mediaIcon("22b79b89-0929-4c28-b9d1-edf1f1779f81"),
  "ranking-table@1": mediaIcon("ca8dee29-739c-49c1-9418-fffb620d828f"),
  "matrix@1": mediaIcon("4e1ce01e-e64e-4dde-91ad-ebbe521dc24e"),
  "quick-links-tiles@1": mediaIcon("d9715c99-dcae-484c-a7fb-5b7528659459"),
  "media-wall@1": mediaIcon("5ca42a03-724d-4348-bafc-b9503ebca719"),

  // Carousels
  "articles-carousel@1": mediaIcon("eedf11bc-2c3e-41ab-99c9-93dbcdc77407"),
  "products-carousel@1": mediaIcon("c01661fe-6249-4af4-be07-70d9914e249e"),
  "person-carousel@1": mediaIcon("ac4a4222-7c11-4352-b18e-8e4866a56674"),
  "locations-carousel@1": mediaIcon("c8c6234a-adc3-440d-b81c-c3cf867460b7"),
  "destinations-carousel@1": mediaIcon("b16ea574-05ea-48e9-88d2-f6f359e19a10"),
  "offers-carousel@1": mediaIcon("0f9e9ffd-7d8c-413a-8f30-53edf8fd3bd9"),
  "features-carousel@1": mediaIcon("486ab9cc-1585-4c70-869e-c86ad1092b11"),
  "reviews-carousel@1": mediaIcon("fa1c9414-74d0-41c6-8a0f-4efd2ff4a9c9"),
  "stats-carousel@1": mediaIcon("7b2c6d00-4092-4055-9892-0812feb97d83"),
  "media-carousel@1": mediaIcon("c016d27c-4d9c-4e1e-983b-eed6c7b64855"),
  "pricing-carousel@1": mediaIcon("b432b82e-2ab4-4e09-919f-68998a15ec95"),

  // Page-details shells
  "article-details@1": mediaIcon("dfa07ca2-ee26-4e63-8c91-2245e70a1a11"),
  "article-with-toc-details@1": mediaIcon("b2cb63e1-e224-48ba-9545-0f80ea269904"),
  "news-details@1": mediaIcon("34745545-002e-402b-8599-dcce7d8b2be2"),
  "case-study-details@1": mediaIcon("0bb7131a-f18a-4b37-8a6f-0c065bfe74cb"),
  "event-details@1": mediaIcon("ff48e57f-7ce1-40e9-9df7-bd3c290e428d"),
  "job-details@1": mediaIcon("37695a0e-0cb2-4682-94ac-aed0721a18bd"),
  "product-details@1": mediaIcon("7cb408f1-e871-40e8-b57d-fd78fe451b08"),
  "service-details@1": mediaIcon("7681d80f-e61c-432b-8b22-5575b8464b07"),
  "partner-details@1": mediaIcon("e02827d0-aa98-4284-a370-d94d61dbb802"),
  "person-details@1": mediaIcon("8118dfe9-a241-4a81-80fe-494bf6556234"),
  "location-details@1": mediaIcon("325e5994-73e0-4dc5-8031-247e6c5a6080"),
  "destination-details@1": mediaIcon("6ff8319e-6be0-4d03-afd6-8274399d3c64"),
  "offer-details@1": mediaIcon("cfbdfa26-bb97-4117-8a83-c95f60bd9e1d"),
  "landing-details@1": mediaIcon("7f44ef84-fd06-45ff-a264-46b4deda752b"),
  "wildcard-detail@1": mediaIcon("cb4af10b-3db1-4d37-aed3-46eb01dc57dc"),
  "wildcard-experience@1": mediaIcon("48428a56-f9f9-426e-98ec-29f46170a552"),

  // Forms
  "form-builder@1": mediaIcon("57e905a9-5342-41fd-b44d-cc1347b263bd"),
  "lead-form@1": mediaIcon("42d6b030-534b-421f-8b1a-bacb1ba56d21"),
  "form-text-field@1": mediaIcon("848d97e6-fb6a-4c70-8cbb-aa9e19da3bf7"),
  "form-textarea-field@1": mediaIcon("c0e82cee-ceb7-4e93-bf07-b5d43ec877a0"),
  "form-select-field@1": mediaIcon("2a1c004c-7864-47d5-9cd3-3ed9879eb020"),
  "form-checkbox-field@1": mediaIcon("40e0de15-0bf9-4bb8-aa04-612a1bc4f1f9"),
  "form-date-field@1": mediaIcon("489f1494-b585-4a2b-af24-ac48e335832a"),
  "form-phone-field@1": mediaIcon("9913b812-ce57-4938-853d-82943e3f4a7d"),
  "form-address-field@1": mediaIcon("aaa17d61-82a7-4712-823f-4ceee7aad790"),
  "form-upload-field@1": mediaIcon("4051ba8b-4e3c-42b4-b402-e081f96c9be8"),
  "form-range-field@1": mediaIcon("17528a4a-3c79-412f-98af-7692a9ede6ab"),
  "form-rating-field@1": mediaIcon("25cc4124-da00-45bb-a8cd-0c87959a1f57"),
  "form-fieldset@1": mediaIcon("16296f43-277c-41b6-b7da-8c6bf2d7c77c"),
  "form-fieldset-array@1": mediaIcon("169f3b44-bf2b-4baf-ab4f-1262e8323645"),
  "form-step@1": mediaIcon("83a7196b-e251-40d8-ad16-66f74ea4c96e"),
  "form-summary@1": mediaIcon("f0ee5eab-9e1d-4d80-b71f-a74eae4562b6"),
  "form-conditional@1": mediaIcon("2ca19482-28b5-464b-bdba-a2a4b7159519"),
  "subscribe-section@1": mediaIcon("4bef1330-8fd1-4edb-9d6b-17feadad7163"),

  // Navigation and chrome
  "header@1": mediaIcon("8fee7f04-afe2-4516-ab05-4ebdff10f047"),
  "footer@1": mediaIcon("77caccbb-aa4d-4403-b945-c680c5baa908"),
  "main-nav@1": mediaIcon("ffcda314-82fa-45d3-bb08-c71a9c48c0a6"),
  "mega-menu@1": mediaIcon("7fb15583-31d6-4d8b-b4c3-913ff61b0475"),
  "mobile-menu@1": mediaIcon("b372435f-1d16-47fc-9e3a-61cad55a46b9"),
  "breadcrumb@1": mediaIcon("7fd8a460-6879-442c-bce2-73a259f317cb"),
  "language-switcher@1": mediaIcon("355c41a6-f475-456a-a818-e9a41ace5e6a"),
  "tree-navigation@1": mediaIcon("f407f51f-e262-43ec-80ea-785e1a375ca6"),
  "utility-trigger@1": mediaIcon("2926a7af-25e6-4e4b-b83e-b62a6d37bd43"),

  // Search
  "search-bar@1": mediaIcon("bfeeae31-5d91-4108-8d75-d252f0d78f3c"),
  "search-experience@1": mediaIcon("f7e5cb9f-ef26-4cac-acbd-c2503b95e79a"),
  "filter-panel@1": mediaIcon("ade502d2-1b58-4d1f-a22c-4c834e646135"),
  "search-controls-bar@1": mediaIcon("800203d9-83bc-44dc-912e-e80383ad442c"),
  "search-pagination-bar@1": mediaIcon("48f4b665-fadc-43c6-b995-963c6ed1a9a4"),
  "location-search-bar@1": mediaIcon("8e1f4186-ad7e-4943-82ba-a047aefa637e"),
  "search-booking-bar@1": mediaIcon("d9ffb93e-924e-4a8d-a92c-6688334fa1e6"),
  "search-booking-mode@1": mediaIcon("201cf5e3-ed61-4e7c-a155-51b973fd0182"),
  "search-booking-segment@1": mediaIcon("aa90e718-8994-4ca3-8781-30026d6c72ff"),
  "travel-search@1": mediaIcon("9ab613d5-0728-4c67-9d9c-6b8e6c1f4e7a"),
  "locations-map@1": mediaIcon("0e5d6e92-28f8-49c7-a1a7-b1a6950ae6d1"),

  // Media and UI
  "image@1": mediaIcon("c90ef522-6aac-423d-8323-871d84bd6987"),
  "video@1": mediaIcon("c54dbcf6-90f4-4674-9c8d-4c750638b77b"),
  "code-snippet@1": mediaIcon("75adc7b2-3980-4546-975f-e611554f48ce"),
  "content-block@1": mediaIcon("63bfb038-ed81-4af6-b055-2315093fb386"),
  "block-quote@1": mediaIcon("0f76738c-0784-4d37-a8ce-10b290e18631"),
  "cta-button@1": mediaIcon("96c7f8b1-d570-4c2b-87bb-42ddce5ef50b"),
  "accordion-block@1": mediaIcon("d22992b8-fa11-4c90-84a6-357940a39637"),
  "visual-accordion@1": mediaIcon("d2ec3b31-a973-46e9-b2d5-dab22bbbdfc8"),
  "tabs-block@1": mediaIcon("d0dc54c6-976d-49f0-be7c-dfddfaee6fe5"),
  "visual-tabs@1": mediaIcon("2726b375-4eea-4675-951a-2fe3f6316816"),
  "recipe-spec@1": mediaIcon("69dde246-a599-4a36-af6d-e1e32a2a968f"),

  // Social and AI
  "social-share@1": mediaIcon("362db7ef-5ec9-46ee-b30d-4978bd7b4ade"),
  "social-links@1": mediaIcon("006a0692-e1c3-4b2f-8a56-043e279e5003"),
  "ai-chat@1": mediaIcon("a2821d65-bbe0-4210-9ed1-96a67f576ddc"),
  "ai-chat-widget@1": mediaIcon("22def71c-1fa0-43bb-84d5-cf19ae2335d2"),
} as const;

export const sectionIcons = {
  "layout-section@1": mediaIcon("b9f5d001-8594-4e9a-a1f5-7c6ee65e75bc"),
  "heros-and-promos-section@1": mediaIcon("fab2b942-1e01-4142-b6bf-532e86d53f80"),
  "cards-and-lists-section@1": mediaIcon("4c5a525b-8a38-4e47-b252-e17d2c235363"),
  "page-details-section@1": mediaIcon("e83df990-3c49-4d65-891f-4b6132b73dc8"),
  "navigation-section@1": mediaIcon("07b6f4a9-827a-484a-baf9-631bca2bcb6e"),
  "forms-section@1": mediaIcon("2e004411-ec1d-478f-a0b0-c4c75f73b98f"),
  "search-section@1": mediaIcon("c8e46970-cff2-457b-a060-396bc39ca3f1"),
  "social-section@1": mediaIcon("66572aff-557e-42e2-bc03-3fdaa1111b9c"),
  "ai-section@1": mediaIcon("11d41489-73cc-4237-8d05-bddc9895c65b"),
  "feedback-section@1": mediaIcon("2f070e8f-4f70-466e-82b2-a4a27363e746"),
  "ui-section@1": mediaIcon("432f3739-3aa8-4d96-ad59-16d487025bcf"),
} as const;

function assertUnique(
  maps: ReadonlyArray<{ readonly [handle: string]: string }>,
): void {
  const seen = new Map<string, string>();
  for (const map of maps) {
    for (const [handle, icon] of Object.entries(map)) {
      const prev = seen.get(icon);
      if (prev) {
        throw new Error(
          `Duplicate Page Builder icon ${icon}: ${prev} and ${handle}`,
        );
      }
      seen.set(icon, handle);
    }
  }
}

assertUnique([componentIcons, sectionIcons]);
