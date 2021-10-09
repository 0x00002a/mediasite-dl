Mediasite Downloader 
=====================

This repo contains my work on creating a downloader for mediasite videos, since my usual downloader plugin doesn't 
work and the player sucks.

Using the tapermonkey script
------------------------------

1. Open `downloader.js` 
2. click the "raw" button 
3. copy paste into new tapermonkey script 
4. go to mediasite video 
5. click download 
6. wait

Note: If it doesn't offer you a download dialog, go to:

1. tapermonkey settings 
2. config mode -> advanced 
3. Downloads -> download mode -> browser api


Files in this repo 
-------------------

- `download.py`: Python script which works but requires some manual extraction of cookies from the browser 
- `downloader.js`: Tapermonkey script which adds a handy "download" button to the controls of the mediasite player which downloads the video



License 
---------

Everything in here is MIT licensed. tl;dr do what you like but credit me (full license [here](LICENSE))
