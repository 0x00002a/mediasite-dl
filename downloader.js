// ==UserScript==
// @name         blackboard-dl
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Natasha England-ELbro
// @match        https://mediasite.bris.ac.uk/Mediasite/Play/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @require https://cdn.jsdelivr.net/gh/CoeJoder/waitForKeyElements.js@v1.2/waitForKeyElements.js
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // Your code here...
})();

waitForKeyElements("#MediaElement", (n) => addDlBtn(doDownload));

function findVideoEl() {
  let candidates = document.querySelector("#MediaElement");
  if (candidates === null) {
    console.error("failed to find video");
  }
  return candidates;
}

function doDownload() {
  const vid_url = findVideoEl().getAttribute("src").replace("blob:", "");
  console.debug("url: " + vid_url);

  /*const el = document.createElement("a");
  el.target = "_blank";
  el.href = vid_url;
  document.body.appendChild(el);
  el.click();
  document.body.removeChild(el);*/
  window.open(vid_url, "_blank");
}

const dl_btn_observer = new window.MutationObserver((m, o) =>
  doAddDownloadBtn()
);

function doAddDownloadBtn() {
  addDlBtn(doDownload);
}

function addDlBtn(onclick) {
  let btn = document.createElement("button");
  btn.onclick = onclick;
  btn.textContent = "Download";
  dl_btn_observer.observe(btn, {
    subtree: true,
    attributes: false,
    childList: true,
    characterData: false,
  });
  btn.style = "color: white;";
  document
    .querySelector("div.controlBar")
    .querySelector("div.generalControls")
    .prepend(btn);
}

function addRedrawHook(on_redraw) {
  let play_btn = document.querySelector("button");
  if (play_btn === null) {
    console.error("failed to find play btn");
    return;
  }
  play_btn.onclick += on_redraw;
}
const initBlackboardDl = function () {
  //addRedrawHook(() => addDlBtn(doDownload));
  //addDlBtn(doDownload);
};

// Just a trick to get around the sandbox restrictions in Firefox / Greasemonkey
// Greasemonkey => Inject code into the main window
// Tampermonkey & Violentmonkey => Execute code directly
if (typeof GM_info === "object" && GM_info.scriptHandler === "Greasemonkey") {
  window.eval("(" + initBlackboardDl.toString() + ")();");
} else {
  initBlackboardDl();
}
