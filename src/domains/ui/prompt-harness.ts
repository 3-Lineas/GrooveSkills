import * as p from "@clack/prompts";

export async function promptHarness(harnessExists: boolean): Promise<boolean | symbol> {
  const message = harnessExists
    ? "GrooveSkills Harness is already initialized. Would you like to update agent rules and memory templates?"
    : "Would you like to initialize the GrooveSkills Harness in .grooveskills/ (project memory, ADR, and 3-lane task execution)?";

  const confirm = await p.confirm({
    message,
    initialValue: true,
  });

  return confirm;
}
