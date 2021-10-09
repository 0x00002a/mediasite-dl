// ==UserScript==
// @name         blackboard-dl
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Natasha England-ELbro
// @match        https://mediasite.bris.ac.uk/Mediasite/Play/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @require https://cdn.jsdelivr.net/gh/CoeJoder/waitForKeyElements.js@v1.2/waitForKeyElements.js
// @grant        GM_download
// ==/UserScript==

(function () {
  "use strict";

  // Your code here...
  waitForKeyElements("#MediaElement", (n) => addDlBtn(doDownload));


  function cleanVidAPIUrl(url) {
    return url.replace("/manifest(format=m3u8-aapl-isoff,segmentLength=6)", "");
  }

  function calcVideoId() {
    return document.URL.split("/").pop().split("?")[0];
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
    const vid_url = cleanVidAPIUrl(
      resp.d.Presentation.Streams[0].VideoUrls[1].Location
    );

    console.debug("url: " + vid_url);
    GM_download({ url: vid_url, name: calcVideoId() + ".mp4", saveAs: true });
  }

  const API_TARGET =
    "https://mediasite.bris.ac.uk/Mediasite/PlayerService/PlayerService.svc/json/GetPlayerOptions";

  function doDownload() {
    const req = new XMLHttpRequest();
    req.open("POST", API_TARGET, true);
    req.onload = function () {
      const resp = JSON.parse(this.responseText);
      handleVidAPIResp(resp);
    };
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(buildVidRequestJson()));
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

  
})();