import pc from "picocolors";

export function renderBanner(): string {
  const title = pc.bold(pc.white(" GROOVE SKILLS "));
  const badge = pc.bgMagenta(pc.black(title));
  const subtitle = pc.dim("Multi-Agent AI Skills & Architectural Standards");

  return `${badge}  ${subtitle}\n`;
}
