import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";
import { attackScenarioSchema } from "./schema";
import type { AttackScenario } from "./types";

const YAML_EXTENSIONS = new Set([".yaml", ".yml"]);

async function findYamlFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return findYamlFiles(fullPath);
      if (entry.isFile() && YAML_EXTENSIONS.has(path.extname(entry.name))) {
        return [fullPath];
      }
      return [];
    }),
  );

  return files.flat().sort();
}

export async function loadScenarios(rootDir: string): Promise<AttackScenario[]> {
  const files = await findYamlFiles(rootDir);
  const scenarios = await Promise.all(
    files.map(async (file) => {
      const raw = await readFile(file, "utf8");
      const parsed = yaml.load(raw);
      const result = attackScenarioSchema.safeParse(parsed);

      if (!result.success) {
        throw new Error(
          `Invalid attack scenario ${file}: ${result.error.message}`,
        );
      }

      return result.data;
    }),
  );

  const ids = new Set<string>();
  for (const scenario of scenarios) {
    if (ids.has(scenario.id)) {
      throw new Error(`Duplicate attack scenario id: ${scenario.id}`);
    }
    ids.add(scenario.id);
  }

  return scenarios;
}
