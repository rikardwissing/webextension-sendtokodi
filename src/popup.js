// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.


function saveOptions() {
  var hostname = document.getElementById('hostname').value;
  chrome.storage.local.set({
    hostname: hostname
  }, function() {
    chrome.contextMenus.update("hostname", {title: "Host: " + hostname});
  });
}

function restoreOptions() {
  chrome.storage.local.get({
    hostname: 'kodi'
  }, function(items) {
    document.getElementById('hostname').value = items.hostname;
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.addEventListener('keyup', saveOptions);

