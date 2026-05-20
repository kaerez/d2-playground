import * as monaco from "monaco-editor";
import { createOnigScanner, createOnigString, loadWASM } from "vscode-oniguruma";

// VITE WEB WORKER INJECTION: Load the raw worker entry script inline via Vite syntax
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

// Most of this code is derived from https://github.com/bolinfest/monaco-tm
import { rehydrateRegexps } from "./configuration";
import { registerLanguages } from "./register";
import { SimpleLanguageInfoProvider, ScopeNameInfo, TextMateGrammar } from "./providers";

import * as config from "./language-configuration.json";
import d2Grammar from "./d2.tmLanguage.json";

// Establish Monaco worker allocation map globally on self before construction
(self as any).MonacoEnvironment = {
  getWorker: function (_workerId: string, _label: string) {
    return new EditorWorker();
  }
};

const languages: monaco.languages.ILanguageExtensionPoint[] = [
  {
    id: "d2",
    extensions: [".d2"],
    aliases: ["d2", "d2"],
  },
];

interface DemoScopeNameInfo extends ScopeNameInfo {
  path: string;
}

const grammars: { [scopeName: string]: DemoScopeNameInfo } = {
  "source.d2": {
    language: "d2",
    path: "d2.tmLanguage.json",
  },
};

const fetchGrammar = async (scopeName: string): Promise<TextMateGrammar> => {
  let grammar;
  switch (scopeName) {
    case "source.d2":
      grammar = d2Grammar;
      break;
  }
  return { type: "json", grammar: JSON.stringify(grammar) };
};

const fetchConfiguration = async (): Promise<monaco.languages.LanguageConfiguration> => {
  rehydrateRegexps(config);
  return config as monaco.languages.LanguageConfiguration;
};

// Derived from https://github.com/microsoft/vscode/blob/829230a5a83768a3494ebbc61144e7cde9105c73/src/vs/workbench/services/textMate/browser/textMateService.ts#L33-L40
async function loadVSCodeOnigurumWASM(): Promise<Response | ArrayBuffer> {
  // PUBLIC ROOT REFACTOR: Point absolute domain route directly to your public folder asset
  const response = await fetch("/onig.wasm");
  const contentType = response.headers.get("content-type");
  if (contentType === "application/wasm") {
    return response;
  }

  // Using the response directly only works if the server sets the MIME type 'application/wasm'.
  // Otherwise, a TypeError is thrown when using the streaming compiler.
  // We therefore use the non-streaming compiler fallback.
  return response.arrayBuffer();
}

const getLanguageProvider = async (theme: any) => {
  const data: ArrayBuffer | Response = await loadVSCodeOnigurumWASM();
  await loadWASM(data);

  const onigLib = Promise.resolve({
    createOnigScanner,
    createOnigString,
  });

  const provider = new SimpleLanguageInfoProvider({
    grammars,
    fetchGrammar,
    configurations: languages.map((language) => language.id),
    fetchConfiguration,
    theme,
    onigLib,
    monaco,
  });
  
  registerLanguages(
    languages,
    (language: string) => provider.fetchLanguageInfo(language),
    monaco
  );

  return provider;
};

export { getLanguageProvider, SimpleLanguageInfoProvider };
