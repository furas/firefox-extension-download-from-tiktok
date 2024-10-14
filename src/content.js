//---------------------------------------------------------------------
// This code has access to HTML on page but not to function `download`
// and to function assigned to button on toolbar.
// It uses `onMessage.addListener` to get message from `background.js`
// and execute `getLinks()` or `getImages()` which get links from HTML,
// and send these links back to `background.js` (`sendResponse()`)
//---------------------------------------------------------------------

//---------------------------------------------------------------------
// get `url` from main `video/audio/slides` on page
//---------------------------------------------------------------------

function getMainVideo() {
    console.log('Get Main Video');

    //--- old method (before 2024.10.14) ---
    
    var result = document.querySelector('.tiktok-web-player video');
    
    if(result == null) {
        console.log(`content.js: video: null`);
        return null;
    } 
       
    result = result.src;

    if(result != "") {
        console.log(`content.js: video[src]: ${result}`);
        return result;
    }
    console.log(`content.js: video[src]: ""`);

    //--- new method (since 2024.10.14) ---
    
    var result = document.querySelector('.tiktok-web-player video source');

    if(result == null) {
        console.log(`content.js: video source: null`);
        return null;
    } 

    result = result.src;

    if(result != "") {
        console.log(`content.js: video source[src]: ${result}`);
        return result;
    }
    console.log(`content.js: video source[src]: ""`);
        
    return null;
}

function getMainAudio() {
    console.log('Get Main Audio');
    
    var result = document.querySelector('audio');
    
    if(result == null) {
        console.log(`content.js: audio: null`);

        return null;
    }
    
    result = result.src;
        
    if(result != "") {
         console.log(`content.js: audio src: ${result}`);
        
         return result;
    }

    console.log(`content.js: audio src: ""`);
    
    return null;
}

function getMainPhotos() {
    console.log('Get Main Photos');
    
    var items = document.querySelectorAll('img[class*="ImgPhotoSlide"]');

    if(items != null) {
        var results = [];
        for(let i = 0 ; i < items.length ; i++) {
            results.push(items[i].src);
        }
        console.log(`content.js: img[class*="ImgPhotoSlide"][src]: ${results}`);

        return results;
    }

    console.log(`content.js: img[class*="ImgPhotoSlide"]: null`);

    return null;    
}

//---------------------------------------------------------------------
// get command from background.js and send back urls 
//---------------------------------------------------------------------

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    //console.log(`message.command: ${message.command}`);
    
    if (message.command === "main_video") {
        sendResponse({
            video_url: getMainVideo(), 
            audio_url: null, 
            photo_urls: null, 
            tab_url: message.tab_url
        });
    }
    
    if (message.command === "main_audio") {
        sendResponse({
            video_url: null,
            audio_url: getMainAudio(),  
            photo_urls: null, 
            tab_url: message.tab_url
        });
    }
    
    if (message.command === "main_photo") {
        sendResponse({
            video_url: null,  
            audio_url: getMainAudio(), 
            photo_urls: getMainPhotos(), 
            tab_url: message.tab_url
        });
    }
});

