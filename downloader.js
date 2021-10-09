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

function getCookie(name) {
  let decoded = decodeURIComponent(document.cookie);
  let all_cookies = decoded.split(";");
  let seperated = all_cookies.split(" = ");
  let target_cookie = decoded.split(" = ").findIndex(name);
  if (target_cookie === -1) {
    return null;
  } else {
    return decoded[target_cookie + 1];
  }
}

function calcVideoId() {
  return document.URL.split("/").pop().split("?")[0];
}

function loadAuthCookies() {
  const global_auth_name = "MediasiteAuth"; // If signed in using AAD (microsoft stuffs)
  const vid_id = calcVideoId(); // If signed in using blackboard
  const per_vid_cookie_name = "MediasiteAuthTickets-" + vid_id;
  let per_vid_cookie = getCookie(per_vid_cookie_name);
  let global_auth_cookie = getCookie(global_auth_name);
  if (per_vid_cookie === null && global_auth_cookie === null) {
    console.error("failed to find authentication cookie");
  } else if (per_vid_cookie === null) {
    return { global_auth_name: global_auth_cookie };
  } else {
    return { per_vid_cookie_name: per_vid_cookie }; // TODO: Check if either have expired and/or which is older
  }
}

function buildVidRequestJson() {
  return {
    getPlayerOptionsRequest: {
      ResourceId: calcVideoId(),
      QueryString: "?autostart=true",
      UseScreenReader: false,
      UrlReferrer: document.URL,
    },
  };
}

function handleVidAPIResp(resp) {
  const vid_url = resp.d.Presentation.Streams[0].VideoUrls[1].Location;

  console.debug("url: " + vid_url);
  window.open(vid_url, "_blank");
}

const API_TARGET =
  "https://mediasite.bris.ac.uk/Mediasite/PlayerService/PlayerService.svc/json/GetPlayerOptions";

function doDownload() {
  const req = new XMLHttpRequest();
  req.open("POST", API_TARGET, true);
  req.onload = function () {
    console.log(this.responseText);
    const resp = JSON.parse(this.responseText);
    handleVidAPIResp(resp);
  };
  req.setRequestHeader("Content-Type", "application/json");
  req.send(JSON.stringify(buildVidRequestJson()));
  //console.debug("url: " + vid_url);

  /*const el = document.createElement("a");
  el.target = "_blank";
  el.href = vid_url;
  document.body.appendChild(el);
  el.click();
  document.body.removeChild(el);*/
  //window.open(vid_url, "_blank");
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
