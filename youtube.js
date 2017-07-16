
function GetPluginURL(linkUrl)
{
  var detectedplugin = ''; var pluginurl = '';
  
  //Testa för YT
  var videoid = null;
  var playlistid = null;

  if(videoid == null) 
  {
    // Testa för Youtube
    videoid = linkUrl.match("[\\?&]v=([^&#]*)");
    playlistid = linkUrl.match("[\\?&]list=([^&#]*)");

    if(videoid == null) videoid = linkUrl.match(".be[\\/]([^&#]*)");
    if(videoid == null) videoid = linkUrl.match(".be[\\%]2F([^&#]*)");
    if(videoid == null) videoid = linkUrl.match("i.ytimg.com/vi/([^&#]*)/");
    
    if(videoid != null)
    {
      detectedplugin = 'youtube';
    }
  }
  
  if(videoid == null) 
  {
    // Testa för SVT
    videoid = linkUrl.match("svtplay.se/([^&#]*)");
    if(videoid != null)
    {
      detectedplugin = 'svt';
    }
  }
  
  if(videoid == null) 
  {
    // Testa för TWITCH Live
    videoid = linkUrl.match("twitch.tv/([^&#]*)");
    if(videoid != null)
    {
      detectedplugin = 'twitch';
    }
  }
  
  if(videoid == null) 
  {
    // Testa för vimeo Live
    videoid = linkUrl.match("vimeo.com/([^&#]*)");
    if(videoid != null)
    {
      detectedplugin = 'vimeo';
    }
  }

  
  if(videoid == null) 
  {
    // Testa för Magnet (Torrent)
    if( (linkUrl.match("magnet:") != null) || (linkUrl.match(".torrent") != null) )
    {
      detectedplugin = 'torrent';
    }
    else
    {
      // Kör med URL direct
      if(linkUrl.length > 6)
      {
        detectedplugin = 'url';
      }
    }
  }
  
  if(playlistid == null) playlistid = '';
  else playlistid = playlistid[1];
  if(videoid == null) videoid = linkUrl;
  else videoid = videoid[1];
  
  var videoparam = ''; var playlistparam = '';
  
  if(detectedplugin == 'youtube')
  {
    pluginurl = 'plugin://plugin.video.youtube/play/?order=default';
    if(videoid) videoparam = "&video_id="+videoid;
    if(playlistid) playlistparam = "&playlist_id="+playlistid;
  }
  
  if(detectedplugin == 'svt')
  {
    pluginurl = 'plugin://plugin.video.svtplay/?mode=video';
    if(videoid) videoparam = "&url="+videoid;
  }
  
  if(detectedplugin == 'twitch')
  {
    pluginurl = 'plugin://plugin.video.twitch/playLive/';
    if(videoid) videoparam = videoid;
  }
  
  if(detectedplugin == 'vimeo')
  {
    pluginurl = 'plugin://plugin.video.vimeo/play/';
    if(videoid) videoparam = "?video_id="+videoid;
  }
  
  if(detectedplugin == 'torrent')
  {
    pluginurl =  'plugin://plugin.video.quasar/play';
    if(videoid) videoparam = "?uri="+videoid;
  }
  
  if(detectedplugin == 'url') 
  {
    videoparam = videoid;
  }
  
  if(detectedplugin == '')
  {
    return 0;
  }
  
  if(videoparam == '' && playlistparam == '') return 0;
  
  var url = pluginurl+playlistparam+videoparam;
  return url;
}

var savedOptions;

function getSavedOptions(callback) {
  chrome.storage.sync.get({
    hostname: 'kodi'
  }, function(items) {
    savedOptions = items;
    if(callback) callback(items);
  });
}

function SubmitForm(reqval) {
  getSavedOptions(function() {
    var url = "http://" + savedOptions.hostname + "/jsonrpc";
    $.get(url, {request: reqval});
  });
}

function ClearAndPlay(linkUrl) {
  var file = GetPluginURL(linkUrl);
  if(file) {
    SubmitForm('[{"jsonrpc":"2.0","method":"Playlist.Clear","params":{"playlistid":1},"id":1},{"jsonrpc":"2.0","method":"Playlist.Add","params":{"playlistid":1,"item":{"file":"'+file+'"}},"id":1},{"jsonrpc":"2.0","method":"Player.Open","params":{"item":{"playlistid":1,"position":0}},"id":1}]');
  }
}

function AddToPlayList(linkUrl) {
  var file = GetPluginURL(linkUrl);
  if(file) {
    SubmitForm('[{"jsonrpc":"2.0","method":"Playlist.Add","params":{"playlistid":1,"item":{"file":"'+file+'"}},"id":1}]');
  }
}

function ClearPlayList() {
  SubmitForm('[{"jsonrpc":"2.0","method":"Playlist.Clear","params":{"playlistid":1},"id":1}]');
}

function PlayPlayList() { 
  SubmitForm('[{"jsonrpc":"2.0","method":"Player.Open","params":{"item":{"playlistid":1,"position":0}},"id":1}]');
}

function onClickHandler(info, tab) {
  if(info.menuItemId == "clearandplay") ClearAndPlay(info.linkUrl ? info.linkUrl : info.pageUrl);
  if(info.menuItemId == "addtoplaylist") AddToPlayList(info.linkUrl ? info.linkUrl : info.pageUrl);
  if(info.menuItemId == "clearplaylist") ClearPlayList();
  if(info.menuItemId == "playplaylist") PlayPlayList();
  if(info.menuItemId == "hostname") OpenPopup();
}

function OpenPopup() {
  chrome.tabs.create({url : "popup.html"}); 
}

chrome.contextMenus.onClicked.addListener(onClickHandler);

chrome.runtime.onInstalled.addListener(function () {
  getSavedOptions( function() {
    createContextMenus();
  });
});

function createContextMenus() {
  var linkContext = ["page", "link"];
  var allContexts = ["page","selection","link","editable","image","video","audio"];

  var parent = chrome.contextMenus.create({
    "title": "Send to Kodi",
    "contexts": allContexts,
    "id": "sendtokodi"
  });

  var id = chrome.contextMenus.create({
    "title": "Host: " + savedOptions.hostname,
    "contexts": allContexts,
    "id": "hostname",
    "parentId": parent
  });

  var id = chrome.contextMenus.create({
    type:'separator',
    "contexts": allContexts,
    "id": "hostname_seperator",
    "parentId": parent
  });

  var title = "Clear and Play";
  var id = chrome.contextMenus.create({
    "title": title,
    "contexts": linkContext,
    "id": "clearandplay",
    "parentId": parent
  });

  var title = "Add to Playlist";
  var id = chrome.contextMenus.create({
    "title": title,
    "contexts": linkContext,
    "id": "addtoplaylist",
    "parentId": parent
  });

  var id = chrome.contextMenus.create({
    type:'separator',
    "contexts": linkContext,
    "id": "seperator",
    "parentId": parent
  });

  var title = "Clear Playlist";
  var id = chrome.contextMenus.create({
    "title": title,
    "contexts": allContexts,
    "id": "clearplaylist",
    "parentId": parent
  });

  var title = "Play Playlist";
  var id = chrome.contextMenus.create({
    "title": title,
    "contexts": allContexts,
    "id": "playplaylist",
    "parentId": parent
  });
}