import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `AIChat` component (./ai-chat.tsx).
 *
 * Demo-grade AI chat panel backed by a Vercel AI SDK streaming pipeline
 * (BFF route at `/api/ai-chat`, OpenAI by default with a deterministic
 * mock fallback when `OPENAI_API_KEY` is unset).
 *
 * Author surface, grouped by Sitecore template section:
 *
 *   fields    `Content`       Title / Description / PlaceholderText /
 *                              WelcomeMessage / AssistantName.
 *             `Model Tuning`  per-placement `Model` / `Temperature` /
 *                              `MaxTokens` overrides. Blank fields
 *                              fall through to provider defaults.
 *             `Knowledge`     `SystemPrompt` (rich text — HTML is
 *                              stripped client-side before send), the
 *                              `Context` item Treelist, and the
 *                              Sitecore Search source pair. The
 *                              composed system prompt = stripped
 *                              SystemPrompt + live page context (URL,
 *                              title, headings, visible text) + each
 *                              Context item + Skills.
 *             `Composition`   `Skills` Treelist (persona fragments;
 *                              kept separate from Knowledge because
 *                              they shape HOW the assistant responds,
 *                              not WHAT it knows).
 *
 *   variants  Three in-flow rendering variants (separate exported
 *             functions): `Default` / `Compact` / `HeroCollapsible`.
 *             The viewport-pinned floating launcher is its own
 *             component, `ai-chat-widget`.
 *
 *   params    `Position` (sticky placement), `ColorScheme` (shared
 *             `color-scheme@1` enum — tints border, header accent,
 *             assistant bubble, Send button), and the analytics axis
 *             (`InstanceKey` / `InstanceScope` / `TrackEvents` /
 *             `EnablePersistence`). Launcher chrome params moved to
 *             `ai-chat-widget`; earlier `MaxWidth` / `Alignment` knobs
 *             were dropped — surrounding section containers already
 *             constrain width consistently.
 */
export const aiChatRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "ai-chat@1",
  icon: componentIcons["ai-chat@1"],
  name: "ai-chat",
  displayName: "AI Chat",
  description:
    "Streaming AI chat panel. Authors steer per-placement responses via the SystemPrompt field; surface and model settings live on rendering parameters.",

  section: { handle: "ai-section@1" },

  fields: [
    // ---- Content section ----
    {
      name: "Title",
      shape: "text",
      default: {
        en: "AI Chat",
        ar: "محادثة الذكاء الاصطناعي",
        es: "Chat con IA",
        fr: "Chat IA",
        de: "KI-Chat",
        da: "AI-chat",
        ja: "AIチャット",
        "zh-CN": "AI 聊天",
        "zh-TW": "AI 聊天",
        it: "Chat IA",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Heading shown above the conversation.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Description",
      shape: "text",
      default: {
        en: "Ask questions and get quick guidance.",
        ar: "اطرح أسئلتك واحصل على إرشادات سريعة.",
        es: "Haz preguntas y obtén orientación rápida.",
        fr: "Posez vos questions et obtenez des conseils rapides.",
        de: "Stellen Sie Fragen und erhalten Sie schnelle Hilfe.",
        da: "Stil spørgsmål og få hurtig vejledning.",
        ja: "質問すればすぐに答えが得られます。",
        "zh-CN": "提出问题，即刻获得指引。",
        "zh-TW": "提出問題，立即獲得指引。",
        it: "Fai domande e ricevi indicazioni rapide.",
      },
      sitecore: {
        type: "multi-line-text",
        hint: "Subhead under the title. Plain text, no formatting.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "PlaceholderText",
      shape: "text",
      default: {
        en: "Ask a question about this page...",
        ar: "اطرح سؤالاً حول هذه الصفحة...",
        es: "Haz una pregunta sobre esta página...",
        fr: "Posez une question sur cette page...",
        de: "Stellen Sie eine Frage zu dieser Seite …",
        da: "Stil et spørgsmål om denne side...",
        ja: "このページについて質問する...",
        "zh-CN": "就此页面提问...",
        "zh-TW": "針對此頁面提問...",
        it: "Fai una domanda su questa pagina...",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Placeholder text shown inside the composer input.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "WelcomeMessage",
      shape: "text",
      default: {
        en: "Hi, I am here to help. Ask me anything about content, products, or navigation.",
        ar: "مرحبًا، أنا هنا للمساعدة. اسألني عن أي شيء يتعلق بالمحتوى أو المنتجات أو التنقّل.",
        es: "Hola, estoy aquí para ayudarte. Pregúntame lo que quieras sobre contenido, productos o navegación.",
        fr: "Bonjour, je suis là pour vous aider. Posez-moi toutes vos questions sur le contenu, les produits ou la navigation.",
        de: "Hallo, ich helfe Ihnen gerne. Fragen Sie mich alles zu Inhalten, Produkten oder Navigation.",
        da: "Hej, jeg er her for at hjælpe. Spørg mig om alt vedrørende indhold, produkter eller navigation.",
        ja: "こんにちは。お手伝いします。コンテンツや商品、ナビゲーションについて何でもお尋ねください。",
        "zh-CN":
          "您好，我随时为您服务。有关内容、产品或导航的任何问题都可以问我。",
        "zh-TW":
          "您好，我隨時為您服務。有關內容、產品或導覽的任何問題都可以問我。",
        it: "Ciao, sono qui per aiutarti. Chiedimi qualsiasi cosa su contenuti, prodotti o navigazione.",
      },
      sitecore: {
        type: "multi-line-text",
        hint: "First assistant message shown before the user types. Hide via `ShowWelcome=false` on the React side.",
        section: "Content",
        sortOrder: 400,
      },
    },
    {
      name: "AssistantName",
      shape: "text",
      default: {
        en: "Assistant",
        ar: "المساعد",
        es: "Asistente",
        fr: "Assistant",
        de: "Assistent",
        da: "Assistent",
        ja: "アシスタント",
        "zh-CN": "助手",
        "zh-TW": "助理",
        it: "Assistente",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Label shown beside assistant messages. Standard Values default is `Assistant` — overwrite per-placement to brand the assistant (e.g. `Aria`, `Sage`).",
        section: "Content",
        sortOrder: 500,
      },
    },
    {
      name: "Avatar",
      shape: "image",
      role: "avatar",
      // External avatar so a freshly-installed AI Chat shows a bot
      // face without the author having to upload media first. Authors
      // can swap or clear it per-placement; clearing falls back to the
      // generic bot icon baked into the component. `Alt|URL` shape
      // matches the rest of the image-shape recipes.
      default:
        "AI Assistant|https://api.dicebear.com/9.x/bottts/svg?seed=ai-chat",
      sitecore: {
        type: "image",
        hint: "Square avatar shown in the floating-widget header, on the launcher button, and beside each assistant message in the minimal-bubble layout. Square images crop best (recommend 64–128px). Falls back to a generic bot icon when blank.",
        section: "Content",
        sortOrder: 600,
      },
    },
    // ---- Model Tuning section ----
    // Per-placement LLM overrides. All three accept blanks; the BFF
    // and provider defaults take over (Claude Sonnet 4.6 for
    // Anthropic, gpt-4o-mini for OpenAI; temperature 0.7;
    // maxOutputTokens 1024).
    {
      // Free-text on purpose — both Anthropic and OpenAI accept any
      // model id their endpoint understands (Azure OpenAI, Together,
      // Groq, etc. via `*_BASE_URL`). When the value doesn't match
      // the active provider's family (e.g. `gpt-*` while Anthropic
      // is configured), the BFF silently falls back to the provider
      // default.
      name: "Model",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Model id passed to the BFF. Leave blank to use the active provider's default (Claude Sonnet 4.6 for Anthropic, gpt-4o-mini for OpenAI). Examples: `gpt-4o`, `gpt-4o-mini`, `claude-sonnet-4-6`, `claude-3-5-haiku-latest`.",
        section: "Model Tuning",
        sortOrder: 100,
      },
    },
    {
      name: "Temperature",
      shape: "number",
      default: "0.7",
      sitecore: {
        type: "number",
        hint: "Sampling temperature (0.0 - 2.0). Lower = more deterministic; higher = more creative. Default 0.7.",
        section: "Model Tuning",
        sortOrder: 200,
      },
    },
    {
      name: "MaxTokens",
      shape: "integer",
      default: "1024",
      sitecore: {
        type: "integer",
        hint: "Maximum output tokens per assistant turn. Default 1024.",
        section: "Model Tuning",
        sortOrder: 300,
      },
    },
    // ---- Knowledge section ----
    // Everything that grounds the assistant. The React side strips the
    // SystemPrompt's HTML, then concatenates: stripped prompt + live
    // page context (URL / title / headings / visible body, captured
    // at request time) + each Context item's Content. Sitecore Search
    // hits (when SearchSourceId is set) get appended by the BFF as
    // a "## Knowledge" block.
    {
      name: "SystemPrompt",
      shape: "richText",
      default: {
        en: "<p>You are a helpful assistant. Answer concisely and stay on topic.</p>",
        ar: "<p>أنت مساعد مفيد. أجب بإيجاز والتزم بالموضوع.</p>",
        es: "<p>Eres un asistente útil. Responde de forma concisa y cíñete al tema.</p>",
        fr: "<p>Vous êtes un assistant utile. Répondez de manière concise et restez sur le sujet.</p>",
        de: "<p>Sie sind ein hilfreicher Assistent. Antworten Sie prägnant und bleiben Sie beim Thema.</p>",
        da: "<p>Du er en hjælpsom assistent. Svar kortfattet, og hold dig til emnet.</p>",
        ja: "<p>あなたは有能なアシスタントです。簡潔に答え、話題から逸れないでください。</p>",
        "zh-CN": "<p>你是一个乐于助人的助手。请简洁作答并紧扣主题。</p>",
        "zh-TW": "<p>你是一個樂於助人的助手。請簡潔作答並緊扣主題。</p>",
        it: "<p>Sei un assistente utile. Rispondi in modo conciso e rimani in tema.</p>",
      },
      sitecore: {
        type: "rich-text",
        hint: "Per-placement system prompt sent to the LLM. Rich text for authoring structure (lists, emphasis, headings); the client strips HTML before forwarding to the model. Use this to steer tone, scope, and persona for THIS chat instance.",
        section: "Knowledge",
        sortOrder: 100,
      },
    },
    {
      // Supplemental knowledge (facts, policies, excerpts). Each picked
      // `ai-context-item@1` item's `Content` is concatenated into the
      // system prompt at request time.
      name: "Context",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        source: { kind: "filter", types: ["ai-context-item@1"] },
        hint: "Context items appended to the SystemPrompt. Each item's Content text is added in pick order so the assistant can ground answers on these facts.",
        section: "Knowledge",
        sortOrder: 200,
      },
    },
    {
      // Sitecore Search source id (the `Config.id` from
      // `{searchTenant.apiURL}/search-config/v1/config`). When set, the
      // BFF runs a retrieval query against this source on every user
      // turn and injects the top-N matches into the system prompt as
      // a "## Knowledge" section — turns the chat into RAG-lite over a
      // customer-configured corpus.
      //
      // Authoring UI is the `sai/search-source-picker` Sitecore
      // Marketplace custom-field app (sibling repo), mounted via the
      // Plugin field type the same way `matrix.recipe.ts` mounts
      // `sai/matrix-editor`. The plugin reads the org's search-config
      // tenant, presents the available sources, and writes the chosen
      // `Config.id` back through `client.setValue()` — the stored
      // value is still the bare config-id string the BFF consumes, so
      // the React side / API contract don't change. The previous
      // single-line-text fallback is gone; if the plugin isn't
      // installed the field reads as empty and retrieval is skipped.
      name: "SearchSourceId",
      shape: "text",
      sitecore: {
        type: "Plugin",
        source: {
          kind: "plugin",
          id: "sai/search-source",
          defaultAppId: "de8f8957-9bc7-47b0-a9e0-8aaa8a562cb2",
        },
        hint: "Pick a Sitecore Search source to ground every chat turn. Opens the Search Source Picker plugin; leave blank to disable retrieval.",
        section: "Knowledge",
        sortOrder: 300,
      },
    },
    {
      name: "SearchTopK",
      shape: "integer",
      default: "5",
      sitecore: {
        type: "integer",
        hint: "How many search hits to inject as context per turn. Higher = more grounding, lower = less prompt-budget pressure. Ignored when SearchSourceId is blank.",
        section: "Knowledge",
        sortOrder: 400,
      },
    },
    // ---- Composition section ----
    {
      // Reusable behavior fragments (tone, persona, capabilities).
      // Each picked `ai-skill@1` item's `Instructions` is concatenated
      // into the system prompt at request time (client-side, before
      // POST to /api/ai-chat). Kept separate from Knowledge because
      // Skills shape HOW the assistant responds, not WHAT it knows.
      name: "Skills",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        source: { kind: "filter", types: ["ai-skill@1"] },
        hint: "Optional skills appended to the SystemPrompt. Each Skill's Instructions text is concatenated in pick order.",
        section: "Composition",
        sortOrder: 100,
      },
    },
  ],

  /**
   * Three Sitecore rendering variants — separate exported functions in
   * `ai-chat.tsx`, each rendering the same conversation shape with a
   * different in-flow shell. Visual differentiation lives at the variant
   * axis (not a `Variant` param), matching the project's
   * rendering-variant convention. The floating launcher lives in the
   * `ai-chat-widget` component.
   */
  variants: [
    { name: "Default" },
    { name: "Compact" },
    { name: "HeroCollapsible" },
  ],

  params: [
    {
      name: "Position",
      shape: "enum",
      default: "inline",
      sitecore: {
        enumHandle: "position@1",
        hint: "Inline in page flow, or pin to top / bottom (CSS `position: sticky`).",
        sortOrder: 200,
      },
    },
    {
      name: "ColorScheme",
      shape: "enum",
      default: "primary",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Color scheme applied to the outer card border, the header accent strip, the assistant bubble ring, and the Send button. Defaults to Primary; pick Neutral for plain chrome.",
        sortOrder: 300,
      },
    },
    // Analytics axis — matches the alert-banner convention. Authors
    // can opt out per-placement via `TrackEvents=false`; the
    // `InstanceKey` / `InstanceScope` pair gives personalization rules
    // a readable handle to match on instead of the opaque datasource
    // GUID.
    {
      name: "InstanceKey",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Stable handle for personalization (e.g. 'spring-2026-travel-assistant'). Lowercase kebab-case recommended. Leave blank to use the datasource id.",
        section: "Analytics",
        sortOrder: 900,
      },
    },
    {
      name: "InstanceScope",
      shape: "enum",
      default: "site",
      sitecore: {
        enumHandle: "instance-scope@1",
        hint: "Scope of personalization history. Site = same chat everywhere (one shared engagement count). Page = per-URL (count resets per page).",
        section: "Analytics",
        sortOrder: 1000,
      },
    },
    {
      name: "TrackEvents",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Emit view/prompt-submit/response-complete/response-stop/response-error CDP events for this placement. Uncheck to suppress entirely.",
        section: "Analytics",
        sortOrder: 1100,
      },
    },
    {
      name: "EnablePersistence",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Persist conversation history across page reloads. Scope follows InstanceScope (site = localStorage, page = sessionStorage). Uncheck for placements that should always start fresh.",
        section: "Analytics",
        sortOrder: 1200,
      },
    },
  ],

  /**
   * Chat datasources live alongside other AI content — typically a
   * shared `AI Chats` folder so a marketer can configure one chat
   * instance and reuse it across pages, or a per-page folder for
   * placement-specific tuning.
   */
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "AI Chats" },
      { scope: "site", subfolder: "Site Shared AI/AI Chats" },
    ],
  },

  /**
   * CDP events the React component fires through
   * `useComponentAnalytics("ai-chat")`. The meta shape
   * (`AIChatAnalyticsMeta`) is typed alongside the React code in
   * `ai-chat.tsx`.
   */
  // Type strings must match `^[a-zA-Z0-9\-_./]{1,100}$` — Sitecore Edge
  // CDP rejects `:` in the event type. Use `.` to namespace.
  // AI chat events restructured during the taxonomy migration into an
  // engagement funnel. For the in-flow card variants that funnel is two
  // rate-meaningful signals (the floating `widget-opened` step lives on
  // the `ai-chat-widget` recipe, since only a launcher can fire it):
  //
  //   conversation-started    → "they actually engaged, not just hovered"
  //   conversation-deepened   → "the first answer was good enough to continue"
  //
  // The drop from started to deepened is the closest thing to a
  // satisfaction signal we can capture without explicit thumbs UI,
  // and it's good enough for V1. Each fires at most once per session.
  events: [
    {
      name: "view",
      type: "ai-chat.viewed",
      description:
        "Fires once when the chat panel becomes ≥ 50% visible. Routed through SDK pageView().",
      action: "view",
      commitment: "browse",
      emitsIdentity: false,
      emitsAffinity: false,
      cdpEventType: "VIEW",
    },
    {
      name: "conversation-started",
      type: "ai-chat.conversation-started",
      description:
        "Fires when the user submits the first prompt in a session. Distinguishes engaged users from those who just opened the widget.",
      action: "engage",
      intent: "consideration",
      commitment: "engage",
      emitsIdentity: false,
      emitsAffinity: false,
      cdpEventType: "CUSTOM",
    },
    {
      name: "conversation-deepened",
      type: "ai-chat.conversation-deepened",
      description:
        "Fires when the user submits a second prompt after seeing a response — the first answer was good enough to continue. Once per session.",
      action: "engage",
      intent: "decision",
      commitment: "engage",
      emitsIdentity: false,
      emitsAffinity: false,
      cdpEventType: "CUSTOM",
    },
  ],
} satisfies ComponentTemplateRecipe;

export default aiChatRecipe;
