import picocolors from "picocolors";

export function renderBanner(): string {
  const title = picocolors.bold(picocolors.white(" GROOVE SKILLS "));
  const badge = picocolors.bgMagenta(picocolors.black(title));
  const subtitle = picocolors.dim("Multi-Agent AI Skills & Architectural Standards");

  return `${badge}  ${subtitle}\n`;
}
