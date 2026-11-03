import * as prompts from "@clack/prompts";

export async function promptConfirmOverwrite(): Promise<boolean | symbol> {
  return await prompts.confirm({
    message:
      "Some skills already exist in this project. Would you like to overwrite them with the latest version?",
    initialValue: true,
  });
}
