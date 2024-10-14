
FOLDER = 'tiktok-download';

PHOTOS_IN_SUBFOLDER = true;

//---------------------------------------------------------------------
// generate current date as 'YYYY.MM.DD'
//---------------------------------------------------------------------

function formatDate(date) {
    var year = date.getFullYear();
    
    var month = date.getMonth() + 1;
    month = (month>9?'':'0') + month
    
    var day = date.getDate();
    day = (day>9?'':'0') + day
    
    var hours = date.getHours();
    hours = (hours>9?'':'0') + hours
    
    var minutes = date.getMinutes();
    minutes = (minutes>9?'':'0') + minutes
    
    var seconds = date.getSeconds();
    seconds = (seconds>9?'':'0') + seconds

    date = [year, month, day].join('.');
    time = [hours, minutes, seconds].join('.');
    
    return [date, time];
}

//---------------------------------------------------------------------

function onStartedDownload(id) {
  console.log(`Started downloading: ${id}`);
}

//---------------------------------------------------------------------

function onFailedDownload(error) {
  console.log(`Download failed: ${error}`);
}

//---------------------------------------------------------------------
// download from remote `url` to local `filename`
//---------------------------------------------------------------------

function download(downloadUrl, dowloadFilename) {
    console.log(`${dowloadFilename} : ${downloadUrl}`);

    var downloading = browser.downloads.download({
        url : downloadUrl,
        filename : dowloadFilename,
        saveAs: false
    });

    downloading.then(onStartedDownload, onFailedDownload);
}

//---------------------------------------------------------------------
// send system notification with number of files to download
//---------------------------------------------------------------------

function notify(title, message) {
  console.log("nitify(): background script sends message");
  //var title = browser.i18n.getMessage("notificationTitle");
  //var content = browser.i18n.getMessage("notificationContent", message.tab_url);

  browser.notifications.create({
    "type": "basic",
//    "iconUrl": browser.extension.getURL("icons/link-48.png"),
    "title": title,
    "message": message
  });
}

//---------------------------------------------------------------------

function handleResponse(message, sender, sendResponse) {
    console.log(`message: ${message}`)
    console.log(`message.tab_url: ${message.tab_url}`)

    console.log(`message.video_url: ${message.video_url}`)
    console.log(`message.audio_url: ${message.audio_url}`)
    console.log(`message.photo_urls: ${message.photo_urls}`)

    var parts = formatDate(new Date());
    var date = parts[0];
    var time = parts[1];
    
    //browser.downloads.showDefaultFolder();  // useful when program doesn't download
    
    if(message.tab_url.includes('@') == false){
        console.log(`URL bez @: ${message.tab_url}`);
        notify(`URL bez @: ${message.tab_url}`);
        return;
    }
    
    // split at username
    var filename = message.tab_url.split('@')[1]
    // remove arguments after ?
    if(filename.includes('?') == true){
        filename = filename.split('?')[0];
    }
    
    // change name
    filename = filename.replace('/video/', '/').replace('/photo/', '/')
    filename = filename.replaceAll('/', '-')

    // download video
    if(message.video_url != null){
        var ext = message.video_url.match('mime_type=video_([^&]*)')    
        ext = (ext != null ? `.${ext[1]}` : '');
    
        var fullpath = `${FOLDER}/${date}-@${filename}-video${ext}`;
    
        download(message.video_url, fullpath);
        
        console.log(`Download Video: @${filename} ${fullpath}`)    
        
        notify(`Download Video: 1`, `@${filename}`);
    }
    
    // download audio
    if(message.audio_url != null){
        //var ext = message.audio_url.match('mime_type=video_([^&]*)')    
        var ext = '.mp3';
        //ext = (ext != null ? `.${ext[1]}` : '');
    
        var fullpath = `${FOLDER}/${date}-@${filename}/@${filename}-audio${ext}`;

        download(message.audio_url, fullpath);
    
        console.log(`Download Audio: @${filename} ${fullpath}`)    
        
        notify(`Download Audio: 1`, `@${filename}`);
    }

    // download photos
    if(message.photo_urls != null){
        var length = Math.round(message.photo_urls.length/3);
        for(var i=0;i<length;i++) {
            var photo_url = message.photo_urls[i];

            //var ext = message.photo_url.match('mime_type=video_([^&]*)')    
            var ext = '.jpg';
            //ext = (ext != null ? `.${ext[1]}` : '');
        
            if(PHOTOS_IN_SUBFOLDER){
                var fullpath = `${FOLDER}/${date}-@${filename}/@${filename}-photo-${i+1}${ext}`;
            }else{
                var fullpath = `${FOLDER}/@${filename}-photo-${i+1}${ext}`;
            }

            download(photo_url, fullpath);

            console.log(`Download Photos: @${filename} ${fullpath}`)    
        }
        notify(`Download Photos: ${length}`, `@${filename}`);
    }
};

//---------------------------------------------------------------------

browser.browserAction.onClicked.addListener((tab) => {
    //console.log('title: ' + tab.title);
    //console.log('url: ' + tab.url);
    //console.log(tab);

    if(tab.url.match('/video/')){
        var message = browser.tabs.sendMessage(tab.id, {command: "main_video", tab_url: tab.url});
        message.then(handleResponse)
    } 
    
    if(tab.url.match('/photo/')){
        var message = browser.tabs.sendMessage(tab.id, {command: "main_photo", tab_url: tab.url});
        message.then(handleResponse)
    }           
    
});
