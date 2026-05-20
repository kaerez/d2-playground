import * as monaco from "monaco-editor";
import { createOnigScanner, createOnigString, loadWASM } from "vscode-oniguruma";
import { rehydrateRegexps } from "./configuration";
import { registerLanguages } from "./register";
import { SimpleLanguageInfoProvider, ScopeNameInfo, TextMateGrammar } from "./providers";

import * as config from "./language-configuration.json";
import d2Grammar from "./d2.tmLanguage.json";

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

async function loadVSCodeOnigurumWASM(): Promise<Response | ArrayBuffer> {
  // FIXED: Fetch goes up one directory relative to the compiled /assets/main.js file
  const response = await fetch("../onig.wasm");
  const contentType = response.headers.get("content-type");
  if (contentType === "application/wasm") {
    return response;
  }
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
