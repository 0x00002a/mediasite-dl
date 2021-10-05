#!/usr/bin/env python3
import sys
import urllib3 as url3
import urllib as url
import shutil
import requests
from io import BytesIO
import json
import os


class Progressbar:
    _curr: int
    _max: int
    _curr_prog: float

    def __init__(self, max: int):
        self._max = max
        self._curr = 0
        self._curr_prog = 0

    def update(self, curr: int):
        self._curr = curr
        prog = self._curr / float(self._max) * 100
        diff = prog - self._curr_prog
        self._print()

    def _print(self):
        prog = self._curr / self._max
        needed_chars = len(str(self._max))
        max_len = 50.0
        print(end="\r" + " " * int(max_len) + "]" + "\r" +
              "{} / {}: ".format(str(self._curr).zfill(needed_chars), self._max) + "[" + "=" * int(prog * max_len))

    def increment(self, num):
        self.update(self._curr + num)


def extract_resource_id(target: str) -> str:
    end_sec = target.split("/")[-1].split("?")[0]
    return end_sec


def clean_vid_url(url: str) -> str:
    return url.replace("/manifest(format=m3u8-aapl-isoff,segmentLength=6)", "")


if __name__ == '__main__':
    target = sys.argv[1]
    cookie_val = sys.argv[2]

    res_id = extract_resource_id(target)

    cookies = {"MediasiteAuthTickets-{}".format(res_id): cookie_val}

    print("resource id: {}".format(res_id))

    req_data = {
        "getPlayerOptionsRequest": {
            "ResourceId": res_id,
            "QueryString": "?autostart=true",
            "UseScreenReader": False,
            "UrlReferrer": target,
        }}

    json_target = "https://mediasite.bris.ac.uk/Mediasite/PlayerService/PlayerService.svc/json/GetPlayerOptions"
    print("data: {}".format(json.dumps(req_data)))
    req = requests.post(json_target, cookies=cookies,
                        json=req_data)

    response_j: dict = req.json()
    vid_url = response_j["d"]["Presentation"]["Streams"][0]["VideoUrls"][1]["Location"]
    vid_url = clean_vid_url(vid_url)

    vid_res = requests.get(vid_url, cookies=cookies, stream=True)
    total = int(vid_res.headers["Content-Length"])
    bar = Progressbar(total)
    with open("output.mp4", "wb") as f:
        for chunk in vid_res.iter_content(chunk_size=2048):
            f.write(chunk)
            bar.increment(2048)
