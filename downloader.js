// ==UserScript==
// @name         Mediasite Downloader
// @namespace    http://tampermonkey.net/
// @version      0.5
// @updateURL    https://raw.githubusercontent.com/0x00002a/mediasite-dl/main/downloader.js
// @downloadURL  https://raw.githubusercontent.com/0x00002a/mediasite-dl/main/downloader.js
// @description  Download videos from mediasite urls
// @author       Natasha England-Elbro
// @match        https://*/Mediasite/Play/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @homepage     https://github.com/0x00002a/mediasite-dl
// @supportURL   https://github.com/0x00002a/mediasite-dl/issues
// @grant        GM_download
// ==/UserScript==

(function () {
  "use strict";

  // Your code here...
  function waitForLoad(query, callback) {
    const el = document.querySelector(query);
    if (el === null) {
      setTimeout(() => waitForLoad(query, callback), 100);
    } else {
      callback(el);
    }
  }

  waitForLoad("div.vjs-control-bar", (n) => addDlBtn(doDownload, n));

  function cleanVidAPIUrl(url) {
    return url.replace("/manifest(format=m3u8-aapl-isoff,segmentLength=6)", "");
  }

  function calcVideoId() {
    return document.URL.split("/").pop().split("?")[0];
  }
  function getVidName() {
    return document.title.length > 0 ? document.title : calcVideoId();
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
    GM_download({
      url: vid_url,
      name: getVidName() + ".mp4",
      saveAs: true,
      onerror: (e) => {
        console.error(e);
      },
    });
  }

  function calcApiTarget() {
    const url_segs = document.URL.split("/");
    console.info(JSON.stringify(url_segs))
    url_segs.pop()
    url_segs.pop()
    return (
      url_segs.join("/") + "/PlayerService/PlayerService.svc/json/GetPlayerOptions"
    );
  }
  const API_TARGET = calcApiTarget();

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

  function addDlBtn(onclick, to) {
    var dl_btn = document.createElement("button");
    dl_btn.onclick = onclick;
    dl_btn.textContent = "Download";

    dl_btn.style = "color: white;margin-right: 30px;";
    to.prepend(dl_btn)
  }
})();
