// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var hostname;

function saveOptions() {
  var hostname = document.getElementById('hostname').value;
  chrome.storage.local.set({
    hostname: hostname
  }, function() {
    restoreOptions();
  });
}

function restoreOptions() {
  chrome.storage.local.get({
    hostname: 'kodi'
  }, function(items) {
    hostname = items.hostname;
    $('#hostname').val(items.hostname);
    $('#hostname_span').html(items.hostname);
    chrome.contextMenus.update("hostname", {title: "Host: " + items.hostname});
  });
}

document.addEventListener('DOMContentLoaded', function() {
  restoreOptions();
  
  $('#hostname_change').click(startEditing);
  $('form').submit(doneEditing);

  init();
});

function init() {
  $('#form_view').hide();
  $('#default_view').show();

  $(document).bind('keydown', keyboardControl);
  $(document).focus();
}

function startEditing() {
  $('#form_view').show();
  $('#default_view').hide();
  $('#hostname').focus();

  $(document).unbind('keydown', keyboardControl);
}

function doneEditing() {
  saveOptions();
  init();

  return false;
}

var commandBindings = {
  ' ': [
    ['Input.ExecuteAction', '{"action": "playpause"}']
  ],
  'p': [
    ['Input.ExecuteAction', '{"action": "playpause"}']
  ],

  'arrowleft': [
    ['Input.Left'],
  ],
  'arrowright': [
    ['Input.Right'],
  ],
  'arrowup': [
    ['Input.Up'],
  ],
  'arrowdown': [
    ['Input.Down'],
  ],
  'enter': [
    ['Input.Select']
  ],
  'backspace': [
    ['Input.Back']
  ],

  'shift+arrowleft': [
    ['Input.ExecuteAction', '{"action": "stepback"}']
  ],
  ',': [
    ['Input.ExecuteAction', '{"action": "stepback"}']
  ],
  'shift+arrowright': [
    ['Input.ExecuteAction', '{"action": "stepforward"}']
  ],
  '.': [
    ['Input.ExecuteAction', '{"action": "stepback"}']
  ],
  'shift+arrowup': [
    ['Input.ExecuteAction', '{"action": "bigstepforward"}']
  ],
  'shift+arrowdown': [
    ['Input.ExecuteAction', '{"action": "bigstepback"}']
  ],
  'shift+enter': [
    ['Input.ExecuteAction', '{"action": "osd"}']
  ],

  'i': [
    ['Input.ExecuteAction', '{"action": "info"}']
  ],
  'o': [
    ['Input.ExecuteAction', '{"action": "osd"}']
  ],
  'm': [
    ['Input.ExecuteAction', '{"action": "menu"}']
  ],
  'q': [
    ['Input.ExecuteAction', '{"action": "queue"}']
  ],
  'z': [
    ['Input.ExecuteAction', '{"action": "zoomin"}']
  ],
  'shift+z': [
    ['Input.ExecuteAction', '{"action": "zoomout"}']
  ],
  '+': [
    ['Input.ExecuteAction', '{"action": "volumeup"}']
  ],
  '-': [
    ['Input.ExecuteAction', '{"action": "volumedown"}']
  ]
}

function keyboardControl(e) {
  // console.log(e);

  var key = e.key;
  if(e.shiftKey) {
    key = 'Shift+'+e.key;
  }
  key = key.toLowerCase();

  if(commandBindings[key]) {
    for(var i=0; i < commandBindings[key].length; i++) {
      // console.log(commandBindings[key][i]);
      SendCommand(commandBindings[key][i][0], commandBindings[key][i][1]);
    }
  }
}
//Input.ExecuteAction","params": {"action": "stepforward"},
function SendCommand(command, params) {
  params = params || '[]';
  SubmitForm('[{"jsonrpc": "2.0", "method": "'+command+'", "params": '+params+', "id": 1}]');
}

function SubmitForm(reqval) {
  var url = "http://" + hostname + "/jsonrpc";
  $.get(url, {request: reqval});
}














