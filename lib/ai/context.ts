export type AssistantPageContext = {
  pageType?:
    | "dashboard"
    | "project"
    | "inventory"
    | "brief"
    | "calendar"
    | "employees"
    | "finances"
    | "announcements"
    | "chantiers";
  projectId?: string;
  briefId?: string;
  visibleDateRange?: { start: string; end: string };
  route?: string;
  pageLabel?: string;
};

const ROUTE_PATTERNS: { pattern: RegExp; pageType: AssistantPageContext["pageType"] }[] = [
  { pattern: /^\/accueil\/overview/, pageType: "dashboard" },
  { pattern: /^\/accueil\/chantiers/, pageType: "chantiers" },
  { pattern: /^\/accueil\/agenda/, pageType: "calendar" },
  { pattern: /^\/accueil\/annonces/, pageType: "announcements" },
  { pattern: /^\/accueil\/estime/, pageType: "chantiers" },
  { pattern: /^\/employes/, pageType: "employees" },
  { pattern: /^\/patron\/projets\/[^/]+/, pageType: "project" },
  { pattern: /^\/patron\/projets/, pageType: "chantiers" },
  { pattern: /^\/patron\/inventaire/, pageType: "inventory" },
  { pattern: /^\/patron\/affectations/, pageType: "brief" },
  { pattern: /^\/patron\/finances/, pageType: "finances" },
];

export function buildPageContextFromRoute(route: string, projectId?: string, briefId?: string): AssistantPageContext {
  const ctx: AssistantPageContext = { route };
  if (projectId) ctx.projectId = projectId;
  if (briefId) ctx.briefId = briefId;
  for (const { pattern, pageType } of ROUTE_PATTERNS) {
    if (pattern.test(route)) {
      ctx.pageType = pageType;
      break;
    }
  }
  const match = route.match(/^\/patron\/projets\/([^/]+)/);
  if (match) ctx.projectId = match[1];
  return ctx;
}

export function formatPageContextForPrompt(ctx: AssistantPageContext): string {
  const parts: string[] = [];
  if (ctx.route) parts.push(`Page actuelle : ${ctx.route}`);
  if (ctx.pageType) parts.push(`Type de page : ${ctx.pageType}`);
  if (ctx.projectId) parts.push(`Projet en contexte : ${ctx.projectId}`);
  if (ctx.briefId) parts.push(`Brief en contexte : ${ctx.briefId}`);
  if (ctx.pageLabel) parts.push(`Libellé : ${ctx.pageLabel}`);
  if (ctx.visibleDateRange)
    parts.push(`Période visible : ${ctx.visibleDateRange.start} → ${ctx.visibleDateRange.end}`);
  if (parts.length === 0) return "";
  return "Contexte de la page courante :\n" + parts.join("\n");
}
