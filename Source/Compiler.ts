import * as ts from "typescript";
import Transformers from "./Transformers/Index";
import PostCSS from "./PostCSS";
import { writeFileSync } from "fs";
import { join } from "path";

const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: path => path,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: () => ts.sys.newLine
};

function mergeTransformers(
  t1: ts.CustomTransformers,
  t2: ts.CustomTransformers
) {
  if (!t2) return t1;
  return {
    after: t1.after ? t1.after.concat(t2.after) : t2.after,
    before: t1.before ? t1.before.concat(t2.before) : t2.before,
    afterDeclarations: t1.afterDeclarations
      ? t1.afterDeclarations.concat(t2.afterDeclarations)
      : t2.afterDeclarations
  } as ts.CustomTransformers;
}

function watchMain() {
  const configPath = ts.findConfigFile(".", ts.sys.fileExists, "tsconfig.json");
  if (!configPath) {
    throw new Error("Could not find a valid 'tsconfig.json'.");
  }

  const createProgram = ts.createEmitAndSemanticDiagnosticsBuilderProgram;

  const host = ts.createWatchCompilerHost(
    configPath,
    {},
    ts.sys,
    createProgram,
    reportDiagnostic,
    reportWatchStatusChanged
  );

  const origPostProgramCreate = host.afterProgramCreate;

  host.afterProgramCreate = program => {
    const org = program.emit;
    program.emit = function(
      targetSourceFile?: ts.SourceFile,
      writeFile?: ts.WriteFileCallback,
      cancellationToken?: ts.CancellationToken,
      emitOnlyDtsFiles?: boolean,
      customTransformers?: ts.CustomTransformers
    ) {
      const R = org(
        targetSourceFile,
        writeFile,
        cancellationToken,
        emitOnlyDtsFiles,
        mergeTransformers(Transformers, customTransformers)
      );
      Promise.all(Object.values(PostCSS.Styles)).then(x =>
        writeFileSync(join(program.getCompilerOptions().outDir, "Style.css"), x.join(""))
      );
      return R;
    };
    origPostProgramCreate!(program);
    try {
    } catch (ex) {
      console.error("[TS]", ex);
    }
  };

  ts.createWatchProgram(host).getProgram();
}

function reportDiagnostic(diagnostic: ts.Diagnostic) {
  console.error(
    "Error",
    diagnostic.code,
    ":",
    ts.flattenDiagnosticMessageText(
      diagnostic.messageText,
      formatHost.getNewLine()
    )
  );
}

function reportWatchStatusChanged(diagnostic: ts.Diagnostic) {
  console.info(ts.formatDiagnostic(diagnostic, formatHost));
}

watchMain();