import {
  addRule,
  ConfigDefinition,
  ConfigRegistryInstance,
  Logger,
  PackageJsonGlob,
  RuleRegistryInstance,
  TypescriptSourceGlob,
  WorkspacesGlob,
} from "@boll/core";
import {
  CrossPackageDependencyDetector,
  NodeModulesReferenceDetector,
  RedundantImportsDetector,
  SrcDetector,
  TransitiveDependencyDetector
} from "@boll/rules-typescript";
import { ESLintPreferConstRule } from "@boll/rules-external-tools";
import { EnsureBoll } from "@boll/rules-monorepo";
import { EnforceRationale, NoRedundantDepsRule } from "@boll/rules-core";

let bootstrapRun = false;
export const bootstrapRecommendedConfiguration = () => {
  if (bootstrapRun) return;

  // TypeScript rules
  RuleRegistryInstance.register("CrossPackageDependencyDetector", () => new CrossPackageDependencyDetector());
  RuleRegistryInstance.register("NodeModulesReferenceDetector", () => new NodeModulesReferenceDetector());
  RuleRegistryInstance.register("RedundantImportsDetector", () => new RedundantImportsDetector());
  RuleRegistryInstance.register("SrcDetector", () => new SrcDetector());
  RuleRegistryInstance.register("TransitiveDependencyDetector", () => new TransitiveDependencyDetector());

  // External tools rules
  RuleRegistryInstance.register("ESLintPreferConstRule", (l: Logger) => new ESLintPreferConstRule(l));

  // Core rules
  RuleRegistryInstance.register("NoRedundantDepsRule", (l: Logger) => new NoRedundantDepsRule(l));
  RuleRegistryInstance.register("EnforceRationale", () => new EnforceRationale());
  RuleRegistryInstance.register("PackageConsistency", (l: Logger, options: any) => new EnforceRationale(options));
  addRule(EnsureBoll);

  ConfigRegistryInstance.register(RecommendedConfig);
  ConfigRegistryInstance.register(MonorepoConfig);
  bootstrapRun = true;
};
export const bootstrap = bootstrapRecommendedConfiguration;

export const RecommendedConfig: ConfigDefinition = {
  name: "boll:recommended",
  ruleSets: [
    {
      fileLocator: new TypescriptSourceGlob(),
      checks: {
        file: [
          { rule: "SrcDetector" },
          { rule: "CrossPackageDependencyDetector" },
          { rule: "TransitiveDependencyDetector" },
          { rule: "NodeModulesReferenceDetector" },
          { rule: "RedundantImportsDetector" }
        ]
      }
    },
    {
      fileLocator: new PackageJsonGlob(),
      checks: { file: [{ rule: "NoRedundantDepsRule" }, { rule: "PackageConsistency" }] }
    }
  ]
};

export const MonorepoConfig: ConfigDefinition = {
  name: "boll:monorepo",
  ruleSets: [
    {
      fileLocator: new WorkspacesGlob(),
      checks: {
        meta: [{ rule: "EnsureBoll" }]
      }
    },
    {
      fileLocator: new TypescriptSourceGlob(),
      checks: {
        file: [
          { rule: "SrcDetector" },
          { rule: "CrossPackageDependencyDetector" },
          { rule: "TransitiveDependencyDetector" },
          { rule: "NodeModulesReferenceDetector" },
          { rule: "RedundantImportsDetector" }
        ],
      }
    }
  ]
};