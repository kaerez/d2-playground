import Editor from "./editor.js";
import QueryParams from "../lib/queryparams";

let layout = "dagre";

function init() {
  document.getElementById("layout-btn").addEventListener("click", toggleMenu);
  document.getElementById("layout-menu").addEventListener("mouseleave", hideMenu);

  for (const el of document.getElementsByClassName("layout-menu-item")) {
    if (el.textContent.toLowerCase() !== "tala") {
      el.addEventListener("click", changeLayout);
    } else {
      el.style.display = "none"; 
    }
  }
  
  const keyEl = document.getElementById("key");
  if (keyEl) keyEl.style.display = "none";
  
  readQueryParam();
}

function readQueryParam() {
  const paramLayout = QueryParams.get("layout");
  if (!paramLayout || paramLayout.toLowerCase() === "tala") {
    QueryParams.del("layout");
    return;
  }

  for (const el of document.getElementsByClassName("layout-menu-item")) {
    if (paramLayout.toLowerCase() === el.textContent.toLowerCase()) {
      document.getElementById("current-layout").textContent = el.textContent;
      layout = el.textContent.toLowerCase();
    }
  }
}

function changeLayout(e) {
  layout = e.target.textContent.toLowerCase();
  document.getElementById("current-layout").textContent = e.target.textContent;
  QueryParams.set("layout", layout);
  hideMenu();
  if (Editor.getDiagramSVG()) {
    Editor.compile();
  }
}

function toggleMenu() {
  const menu = document.getElementById("layout-menu");
  menu.style.display = menu.style.display == "none" ? "block" : "none";
}

function hideMenu() {
  document.getElementById("layout-menu").style.display = "none";
}

function getLayout() {
  return layout;
}

export default {
  init,
  getLayout,
};
