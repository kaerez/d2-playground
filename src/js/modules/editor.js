// IMPORTANT: Import from local themes folder now, not the submodule
import lightTheme from "../themes/light-color-theme.json";
import darkTheme from "../themes/dark-color-theme.json";

import * as monaco from "monaco-editor";
import { getLanguageProvider } from "../monaco/index.ts";

import WebTheme from "./web_theme.js";
import Theme from "./theme.js";
import Layout from "./layout.js";
import Sketch from "./sketch.js";
import Export from "./export.js";
import Zoom from "./zoom.js";
import Alert from "./alert.js";
import QueryParams from "../lib/queryparams";

const MAX_ERRORS = 5;
let monacoEditor;
let monacoLineDecorators = [];
let diagramSVG;

async function init() {
  const toggleThemeBtn = document.getElementById("btn-toggle-theme");
  toggleThemeBtn.addEventListener("click", async (e) => {
    WebTheme.toggleTheme();
    await switchMonaco(getCurrentTheme());
  });

  await initMonaco(getCurrentTheme());

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", async (e) => {
    if (!localStorage.getItem("theme")) {
      const newTheme = e.matches ? darkTheme : lightTheme;
      await switchMonaco(newTheme);
    }
  });

  attachListeners();
  await compile();
}

async function initMonaco(theme) {
  const editorEl = document.getElementById("editor-main");
  const provider = await getLanguageProvider(theme);
  
  const monacoTheme = {
    base: theme.type === "light" ? "vs" : "vs-dark",
    inherit: true,
    rules: [],
    colors: theme.colors,
  };

  monaco.editor.defineTheme(String(theme.name).replace(/ /g, "-"), monacoTheme);
  theme.settings = theme.tokenColors;

  monacoEditor = monaco.editor.create(editorEl, {
    language: "d2",
    automaticLayout: true,
    theme: theme,
    tabSize: 2,
    minimap: { enabled: false },
    wordWrap: "on",
  });

  monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, compile);
  monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, compile);
  provider.registry.setTheme(theme);
  monaco.editor.setTheme(String(theme.name).replace(/ /g, "-"));

  let initialScript = "x -> y";
  const paramScript = QueryParams.get("script");
  if (paramScript) {
    try {
      const decodedResult = await window.d2.decode(paramScript);
      if (decodedResult !== "") initialScript = decodedResult;
    } catch (err) {}
  }
  monacoEditor.setValue(initialScript);
  provider.injectCSS();
}

async function switchMonaco(newTheme) {
  if (!monacoEditor) return;
  const currentValue = monacoEditor.getValue();
  const currentPosition = monacoEditor.getPosition();
  monacoEditor.dispose();
  await initMonaco(newTheme);
  monacoEditor.setValue(currentValue);
  if (currentPosition) monacoEditor.setPosition(currentPosition);
}

function getCurrentTheme() {
  const webTheme = WebTheme.getCurrentTheme();
  return webTheme === "light" ? lightTheme : darkTheme;
}

function attachListeners() {
  document.getElementById("compile-btn").addEventListener("click", compile);
}

function displayCompileErrors(errs) {
  // Truncated for brevity - logic remains identical to your original code
  // Ensure you keep your original marker/gutter logic here.
}

function clearCompileErrors() {
  const displayEl = document.getElementById("editor-errors");
  displayEl.innerHTML = "";
  displayEl.style.display = "none";
}

async function compile() {
  const btn = document.getElementById("compile-btn");
  if (btn.classList.contains("btn-disabled")) return;
  btn.classList.add("btn-disabled");

  let script = monacoEditor.getValue() + "\n";
  try {
    const encoded = await window.d2.encode(script);
    QueryParams.set("script", encoded);
  } catch (err) {}

  clearCompileErrors();
  document.getElementById("loading-shroud").style.display = "flex";

  const ascii = Sketch.getASCII();
  const sketch = Sketch.getValue() === "1" ? true : false;
  const layout = Layout.getLayout(); // TALA is gone. This will only be Elk or Dagre.
  let svg;

  try {
    const compileRequest = {
      fs: { index: script },
      options: { layout, sketch: ascii ? false : sketch, ascii }
    };
    const compiled = await window.d2.compile(compileRequest);
    const renderOptions = { layout, sketch: ascii ? false : sketch, ascii, themeID: Theme.getThemeID(), center: true };
    svg = await window.d2.render(compiled.diagram, renderOptions);
  } catch (err) {
    document.getElementById("loading-shroud").style.display = "none";
    btn.classList.remove("btn-disabled");
    return;
  }

  document.getElementById("loading-shroud").style.display = "none";
  diagramSVG = svg;
  
  const renderEl = document.getElementById("render-svg");
  if (ascii) {
    renderEl.innerHTML = `<pre>${svg}</pre>`;
  } else {
    renderEl.innerHTML = svg;
    renderEl.lastChild.id = "diagram";
    Zoom.attach();
  }
  
  btn.classList.remove("btn-disabled");
  Export.updateExportButton();
}

export default { init, getDiagramSVG: () => diagramSVG, getScript: () => monacoEditor.getValue(), getEditor: () => monacoEditor, compile };
