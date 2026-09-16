import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `AIChatWidget` component (./ai-chat-widget.tsx).
 *
 * The viewport-pinned floating sibling of `ai-chat`. Same streaming
 * pipeline (BFF route at `/api/ai-chat`), same author surface for
 * identity / grounding / model tuning — but its rendering parameters
 * are the launcher chrome that only makes sense for a floating
 * placement, and it has no `Position` param because it is always
 * fixed to the viewport corner.
 *
 * Author surface, grouped by Sitecore template section:
 *
 *   fields    `Content`          Title / Description / PlaceholderText /
 *                                 WelcomeMessage / AssistantName / Avatar.
 *             `Model Tuning`     Model / Temperature / MaxTokens.
 *             `Knowledge`        SystemPrompt / Context / Search source.
 *             `Composition`      Skills.
 *
 *   variants  Single `Default` — the floating launcher + slide-up panel.
 *
 *   params    `ColorScheme`, the `Floating Launcher` group
 *             (`LauncherShape` / `LauncherStyle` / `LauncherIcon` /
 *             `LauncherLabel` / `LauncherSize` / `Placement`), the
 *             `Panel` group (`PanelHeaderStyle` / `PanelSize`), and the
 *             analytics axis (`InstanceKey` / `InstanceScope` /
 *             `TrackEvents` / `EnablePersistence`). `Placement` picks
 *             the viewport corner (logical bottom-end / bottom-start);
 *             there is no in-flow Position — always viewport-pinned.
 */
export const aiChatWidgetRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "ai-chat-widget@1",
  icon: componentIcons["ai-chat-widget@1"],
  name: "ai-chat-widget",
  displayName: "AI Chat Widget",
  description:
    "Viewport-pinned floating AI chat. A launcher button fixes to the corner and opens a slide-up panel; author identity + grounding on the datasource, launcher + panel chrome on rendering parameters. WHEN TO PICK: include this component whenever the source site shows a floating chat / AI-assistant launcher (usually the bottom-inline-end corner — a branded circular bubble, or a labeled pill like 'Ask AI' / 'Chat'). Match the observed launcher: circular avatar/icon bubble → LauncherShape=round; labeled pill → LauncherShape=pill + LauncherLabel; AI-framed assistant → LauncherIcon=sparkle; live-chat framing → LauncherIcon=chat. Match the panel: colored header bar → PanelHeaderStyle=solid; minimal white panel → PanelHeaderStyle=plain. Default placement is bottom-end; only move it if the source shows otherwise.",

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
        hint: "Heading shown in the open panel header and used as the launcher's accessible label.",
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
      // External avatar so a freshly-installed widget shows a bot face
      // (on the closed launcher and in the panel header) without the
      // author having to upload media first. `Alt|URL` shape matches
      // the rest of the image-shape recipes.
      default:
        "AI Assistant|https://api.dicebear.com/9.x/bottts/svg?seed=ai-chat",
      sitecore: {
        type: "image",
        hint: "Square avatar shown on the closed launcher button and in the panel header, and beside each assistant message. Square images crop best (recommend 64–128px). Falls back to a generic bot icon when blank.",
        section: "Content",
        sortOrder: 600,
      },
    },
    // ---- Model Tuning section ----
    {
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
   * Single Sitecore rendering variant — the floating launcher + panel.
   * Maps to the `Default` export in `ai-chat-widget.tsx`.
   */
  variants: [{ name: "Default" }],

  params: [
    {
      name: "ColorScheme",
      shape: "enum",
      default: "primary",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Color scheme applied to the launcher fill, the panel border, the header accent strip, the assistant bubble ring, and the Send button. Defaults to Primary; pick Neutral for plain chrome.",
        sortOrder: 300,
      },
    },
    // ---- Floating Launcher ----
    {
      name: "LauncherShape",
      shape: "enum",
      default: "round",
      sitecore: {
        enumHandle: "ai-chat-launcher-shape@1",
        hint: "Shape of the floating launcher button. Round (default) is a 56px avatar tile; Pill widens to fit a label.",
        section: "Floating Launcher",
        sortOrder: 400,
      },
    },
    {
      name: "LauncherStyle",
      shape: "enum",
      default: "solid",
      sitecore: {
        enumHandle: "ai-chat-launcher-style@1",
        hint: "Launcher fill style. Solid follows the ColorScheme fill; Outline reads as more passive; Gradient routes to the matching gradient scheme.",
        section: "Floating Launcher",
        sortOrder: 500,
      },
    },
    {
      name: "LauncherIcon",
      shape: "enum",
      default: "avatar",
      sitecore: {
        enumHandle: "ai-chat-launcher-icon@1",
        hint: "Face shown on the closed launcher. Avatar (default — the Avatar field's image, falling back to the bot icon when blank), a Monogram of the title's first letter, the generic Bot icon, a Chat bubble (source launcher reads as live chat/support), or AI Sparkles (source frames the widget as an AI assistant / 'Ask AI').",
        section: "Floating Launcher",
        sortOrder: 600,
      },
    },
    {
      name: "LauncherLabel",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional label rendered inside the pill-shaped launcher (e.g. 'Ask AI', 'Help'). Ignored when LauncherShape is Round. Falls back to the chat Title when blank.",
        section: "Floating Launcher",
        sortOrder: 700,
      },
    },
    {
      name: "LauncherSize",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "ai-chat-launcher-size@1",
        hint: "Launcher size preset. Default (56px tile) matches almost every source site; Compact for dense utility sites; Large when the source gives the launcher real visual weight.",
        section: "Floating Launcher",
        sortOrder: 750,
      },
    },
    {
      name: "Placement",
      shape: "enum",
      default: "bottom-end",
      sitecore: {
        enumHandle: "ai-chat-widget-placement@1",
        hint: "Viewport corner for the launcher and panel. Bottom end (default) is the near-universal chat-widget corner and flips automatically under RTL; pick Bottom start only when the source site shows the widget in the other corner.",
        section: "Floating Launcher",
        sortOrder: 800,
      },
    },
    // ---- Panel ----
    {
      name: "PanelHeaderStyle",
      shape: "enum",
      default: "tinted",
      sitecore: {
        enumHandle: "ai-chat-panel-header-style@1",
        hint: "Open-panel header treatment. Tinted (default) is a soft brand accent; Solid fills the header with the ColorScheme (pick when the source panel shows a colored header bar with contrast text); Plain is a clean white/background header (pick for minimal monochrome panels).",
        section: "Panel",
        sortOrder: 810,
      },
    },
    {
      name: "PanelSize",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "ai-chat-panel-size@1",
        hint: "Open-panel footprint. Compact is the classic ~360x520 support panel; Default is roomier (~448x576); Tall stretches toward the viewport height for content-heavy assistants. All presets clamp to small viewports.",
        section: "Panel",
        sortOrder: 820,
      },
    },
    // Analytics axis — matches the ai-chat convention. Authors can opt
    // out per-placement via `TrackEvents=false`; the `InstanceKey` /
    // `InstanceScope` pair gives personalization rules a readable handle
    // to match on instead of the opaque datasource GUID.
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
        hint: "Emit widget-opened / conversation-started / conversation-deepened / view CDP events for this placement. Uncheck to suppress entirely.",
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
   * Widget datasources live alongside other AI content — typically a
   * shared folder so a marketer can configure one widget instance and
   * reuse it across pages, or a per-page folder for placement-specific
   * tuning.
   */
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "AI Chat Widgets" },
      { scope: "site", subfolder: "Site Shared AI/AI Chat Widgets" },
    ],
  },

  /**
   * CDP events the React component fires through
   * `useComponentAnalytics("ai-chat-widget")`. Mirrors the `ai-chat`
   * three-stage engagement funnel plus `widget-opened`, which only the
   * floating launcher can fire:
   *
   *   widget-opened           → "they noticed and were curious"
   *   conversation-started    → "they actually engaged, not just hovered"
   *   conversation-deepened   → "the first answer was good enough to continue"
   *
   * Each fires at most once per session. Type strings must match
   * `^[a-zA-Z0-9\-_./]{1,100}$` — Sitecore Edge CDP rejects `:`; use `.`.
   */
  events: [
    {
      name: "view",
      type: "ai-chat-widget.viewed",
      description:
        "Fires once when the widget mounts and becomes ≥ 50% visible. Routed through SDK pageView().",
      action: "view",
      commitment: "browse",
      emitsIdentity: false,
      emitsAffinity: false,
      cdpEventType: "VIEW",
    },
    {
      name: "widget-opened",
      type: "ai-chat-widget.widget-opened",
      description:
        "Fires when the user opens the floating chat button (first paint of the panel via user gesture). Once per session.",
      action: "engage",
      intent: "research",
      commitment: "engage",
      emitsIdentity: false,
      emitsAffinity: false,
      cdpEventType: "CUSTOM",
    },
    {
      name: "conversation-started",
      type: "ai-chat-widget.conversation-started",
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
      type: "ai-chat-widget.conversation-deepened",
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

export default aiChatWidgetRecipe;
