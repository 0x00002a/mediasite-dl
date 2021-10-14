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

### Auto updating 

Note this script \*should\* automatically update itself when a new version is pushed. I say should because it isn't really 
tested yet and due to github caching it can sometimes take a while. This does of course mean you are trusting me not to push
malicious code. If you don't like that, remove downloadUrl and updateUrl from the script when you install it.


License 
---------

Everything in here is MIT licensed. tl;dr do what you like but credit me (full license [here](LICENSE))
