export function getTerminalWidth(fallbackWidth: number = 80): number {
  const terminalColumns = process.stdout.columns;
  if (typeof terminalColumns === "number" && terminalColumns > 20) {
    return Math.min(terminalColumns, 100);
  }
  return fallbackWidth;
}

export function wrapText(rawText: string, maxLineWidth: number = 76): string {
  return rawText
    .split("\n")
    .map((line) => {
      if (line.length <= maxLineWidth) {
        return line;
      }
      const words = line.split(" ");
      const wrappedLines: string[] = [];
      let currentLine = "";

      for (const word of words) {
        const potentialLine = currentLine ? `${currentLine} ${word}` : word;
        if (potentialLine.length <= maxLineWidth) {
          currentLine = potentialLine;
        } else {
          if (currentLine) {
            wrappedLines.push(currentLine);
          }
          currentLine = word;
        }
      }

      if (currentLine) {
        wrappedLines.push(currentLine);
      }

      return wrappedLines.join("\n");
    })
    .join("\n");
}
