(function(){
  'use strict';

  var loadButton, saveButton, removeButton, imageElement;

  loadButton = document.getElementById('js-load');
  saveButton = document.getElementById('js-save');
  removeButton = document.getElementById('js-remove');
  imageElement = document.getElementById('js-image');

  loadButton.addEventListener('click', load, false);
  saveButton.addEventListener('click', save, false);
  removeButton.addEventListener('click', remove, false);

  function open() {
    return new Promise(function(resolve, reject) {
      var request;
      
      try {
       request = indexedDB.open('Image', 1);
      } catch(e) {
        reject(e);
      }

      request.onerror = function(event) {
        reject(event);
      };
      request.onupgradeneeded = function(event) {
        var db, store;

        db = event.target.result;

        store = db.createObjectStore('ImageStore', {
          keyPath: 'id'
        });
        store.createIndex('id', 'id', {
          unique: true
        });
      };
      request.onsuccess = function(event) {
        resolve(event.target.result);
      };
    });
  }

  function save() {
    open().then(function(db) {
      return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();

        xhr.open('GET', 'image.jpg');
        xhr.responseType = 'blob';

        xhr.onerror = function() {
          reject(xhr.responseText);
        };
        xhr.onload = function() {
          if (xhr.status === 200) {
            resolve({
              db: db,
              xhr: xhr
            });
          } else {
            reject(xhr.responseText);
          }
        };
        xhr.send();
      });
    }).then(function(data) {
      var db, xhr, blob, transaction, store, request;

      db = data.db;
      xhr = data.xhr;

      blob = new Blob([xhr.response], {
        type: 'image/jpg'
      });

      transaction = db.transaction(['ImageStore'], 'readwrite');
      store = transaction.objectStore('ImageStore');

      request = store.put({
        id: 1,
        value: blob
      });
    })['catch'](function(err) {
      console.error(err);
    });
  }

  function load() {
    open().then(function(db) {
      return new Promise(function(resolve, reject) {
        var transaction, store, index, request;

        transaction = db.transaction(['ImageStore'], 'readonly');
        store = transaction.objectStore('ImageStore');
        index = store.index('id');

        request = index.get(1);
        request.onerror = function(err) {
          reject(err);
        };
        request.onsuccess = function(event) {
          resolve(event);
        };
      });
    }).then(function(event) {
      imageElement.src = URL.createObjectURL(event.target.result.value);
    })['catch'](function(err) {
      console.error(err);
    });
  }

  function remove() {
    var request = indexedDB.deleteDatabase('Image');

    request.onerror = function(err) {
      console.error(err);
    };
    request.onsuccess = function() {
      console.log('remove sucessed');
    };
  }

}());
