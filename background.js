
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
  chrome.storage.local.get({
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
  if(info.menuItemId == "remote_play_pause") RemotePlayPause();
  if(info.menuItemId == "remote_stop") RemoteStop();
  if(info.menuItemId == "remote_volume_100") SetVolume(100);
  if(info.menuItemId == "remote_volume_75") SetVolume(75);
  if(info.menuItemId == "remote_volume_50") SetVolume(50);
  if(info.menuItemId == "remote_volume_25") SetVolume(25);
  if(info.menuItemId == "remote_volume_0") SetVolume(0);
  if(info.menuItemId == "remote_up") SendCommand('Input.Up');
  if(info.menuItemId == "remote_down")  SendCommand('Input.Down');
  if(info.menuItemId == "remote_left") SendCommand('Input.Left');
  if(info.menuItemId == "remote_right") SendCommand('Input.Right');
  if(info.menuItemId == "remote_select") SendCommand('Input.Select');
  if(info.menuItemId == "remote_back") SendCommand('Input.Back');
  if(info.menuItemId == "remote_home") SendCommand('Input.Home');
  if(info.menuItemId == "remote_info") SendCommand('Input.Info');
  if(info.menuItemId == "remote_showosd") SendCommand('Input.ShowOSD');
  if(info.menuItemId == "remote_rotate") SendCommand('Player.Rotate', '{ "playerid": 1 }');
  if(info.menuItemId == "remote_hibernate") SendCommand('System.Hibernate');
  if(info.menuItemId == "remote_reboot") SendCommand('System.Reboot');
  if(info.menuItemId == "remote_shutdown") SendCommand('System.Shutdown');
  if(info.menuItemId == "remote_suspend") SendCommand('System.Suspend');
}

function SendCommand(command, params) {
  params = params || '[]';
  SubmitForm('[{"jsonrpc": "2.0", "method": "'+command+'", "params": '+params+', "id": 1}]');
}

function RemotePlayPause() {
  SubmitForm('[{"jsonrpc": "2.0", "method": "Player.PlayPause", "params": { "playerid": 1 }, "id": 1}]');
}

function RemoteStop() {
  SubmitForm('[{"jsonrpc": "2.0", "method": "Player.Stop", "params": { "playerid": 1 }, "id": 1}]');
}

function SetVolume(volume) {
  SubmitForm('[{"jsonrpc": "2.0", "method": "Application.SetVolume", "params": ['+volume+'], "id": 1}]');
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
    "id": "playlist_seperator",
    "parentId": parent
  });

  var playlist = chrome.contextMenus.create({
    "title": "Playlist Control",
    "contexts": allContexts,
    "id": "playlist",
    "parentId": parent
  });

  var title = "Clear Playlist";
  var id = chrome.contextMenus.create({
    "title": title,
    "contexts": allContexts,
    "id": "clearplaylist",
    "parentId": playlist
  });

  var title = "Play Playlist";
  var id = chrome.contextMenus.create({
    "title": title,
    "contexts": allContexts,
    "id": "playplaylist",
    "parentId": playlist
  });


  /* Remote */
  var id = chrome.contextMenus.create({
    type:'separator',
    "contexts": allContexts,
    "id": "remote_seperator",
    "parentId": parent
  });

  var remote = chrome.contextMenus.create({
    "title": "Remote Control",
    "contexts": allContexts,
    "id": "remote",
    "parentId": parent
  });

  /* PlayPause Stop */
  var id = chrome.contextMenus.create({
    "title": "Play / Pause",
    "contexts": allContexts,
    "id": "remote_play_pause",
    "parentId": remote
  });

  var id = chrome.contextMenus.create({
    "title": "Stop",
    "contexts": allContexts,
    "id": "remote_stop",
    "parentId": remote
  });

  /* Volume */
  var id = chrome.contextMenus.create({
    type:'separator',
    "contexts": allContexts,
    "id": "volume_seperator",
    "parentId": remote
  });

  var volume = chrome.contextMenus.create({
    "title": "Volume",
    "contexts": allContexts,
    "id": "remote_volume",
    "parentId": remote
  });

  var id = chrome.contextMenus.create({
    "title": "Volume 100%",
    "contexts": allContexts,
    "id": "remote_volume_100",
    "parentId": volume
  });

  var id = chrome.contextMenus.create({
    "title": "Volume 75%",
    "contexts": allContexts,
    "id": "remote_volume_75",
    "parentId": volume
  });

  var id = chrome.contextMenus.create({
    "title": "Volume 50%",
    "contexts": allContexts,
    "id": "remote_volume_50",
    "parentId": volume
  });

  var id = chrome.contextMenus.create({
    "title": "Volume 25%",
    "contexts": allContexts,
    "id": "remote_volume_25",
    "parentId": volume
  });

  var id = chrome.contextMenus.create({
    "title": "Volume 0%",
    "contexts": allContexts,
    "id": "remote_volume_0",
    "parentId": volume
  });

  /* */
  var id = chrome.contextMenus.create({
    type:'separator',
    "contexts": allContexts,
    "id": "more_seperator",
    "parentId": remote
  });

  var more = chrome.contextMenus.create({
    "title": "Input",
    "contexts": allContexts,
    "id": "remote_more",
    "parentId": remote
  });

  var id = chrome.contextMenus.create({
    "title": "Select",
    "contexts": allContexts,
    "id": "remote_select",
    "parentId": more
  });

  var id = chrome.contextMenus.create({
    "title": "Back",
    "contexts": allContexts,
    "id": "remote_back",
    "parentId": more
  });

  var id = chrome.contextMenus.create({
    type:'separator',
    "contexts": allContexts,
    "id": "directional_seperator",
    "parentId": more
  });

  var id = chrome.contextMenus.create({
    "title": "Up",
    "contexts": allContexts,
    "id": "remote_up",
    "parentId": more
  });

  var id = chrome.contextMenus.create({
    "title": "Left",
    "contexts": allContexts,
    "id": "remote_left",
    "parentId": more
  });

  var id = chrome.contextMenus.create({
    "title": "Right",
    "contexts": allContexts,
    "id": "remote_right",
    "parentId": more
  });

  var id = chrome.contextMenus.create({
    "title": "Down",
    "contexts": allContexts,
    "id": "remote_down",
    "parentId": more
  });

  var id = chrome.contextMenus.create({
    type:'separator',
    "contexts": allContexts,
    "id": "other_seperator",
    "parentId": more
  });

  var id = chrome.contextMenus.create({
    "title": "Info",
    "contexts": allContexts,
    "id": "remote_info",
    "parentId": more
  });

  var id = chrome.contextMenus.create({
    "title": "Show OSD",
    "contexts": allContexts,
    "id": "remote_showosd",
    "parentId": more
  });

  var id = chrome.contextMenus.create({
    "title": "Home",
    "contexts": allContexts,
    "id": "remote_home",
    "parentId": more
  });

  var id = chrome.contextMenus.create({
    type:'separator',
    "contexts": allContexts,
    "id": "system_seperator",
    "parentId": remote
  });

  var system = chrome.contextMenus.create({
    "title": "System",
    "contexts": allContexts,
    "id": "system",
    "parentId": remote
  });

  var id = chrome.contextMenus.create({
    "title": "Hibernate",
    "contexts": allContexts,
    "id": "remote_hibernate",
    "parentId": system
  });

  var id = chrome.contextMenus.create({
    "title": "Reboot",
    "contexts": allContexts,
    "id": "remote_reboot",
    "parentId": system
  });

  var id = chrome.contextMenus.create({
    "title": "Shutdown",
    "contexts": allContexts,
    "id": "remote_shutdown",
    "parentId": system
  });

  var id = chrome.contextMenus.create({
    "title": "Suspend",
    "contexts": allContexts,
    "id": "remote_suspend",
    "parentId": system
  });
}