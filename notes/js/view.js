$(function() {

  function NoteFolderView() {
    this.$noteFolders = $(".folder-container");
    this.listeners = [];
  }

  NoteFolderView.prototype.add = function(data) {
    const item =
      '<div class="folder-item" data-id=' + data.id + '>' +
      '<div class="folder-icon all-icon"></div>' +
      '<div class="folder-info">' +
      '<div class="files-sum">' + data.sum + '</div>' +
      '<div class="folder-name">' + data.name + '</div>' +
      '</div>' +
      '</div>';

    const $item = $(item);
    this.$noteFolders.append($item);
    $item.click(this.bindClick);
  }

  NoteFolderView.prototype.bindClick = function() {
    $(".folder-container .folder-item").removeClass("on");
    $(this).addClass("on");
    window.noteFolderView.notifyListeners(this.dataset.id);
  }

  NoteFolderView.prototype.notifyListeners = function(folderId) {
    for (var listener of this.listeners) {
      listener(folderId);
    }
  }

  NoteFolderView.prototype.addListener = function(listener) {
    this.listeners.push(listener);
  }

  NoteFolderView.prototype.getCurrentSelectFolder = function() {
    return this.$noteFolders.find(".on");
  }

  function NoteFileView() {
    this.$noteFiles = $(".note-list");
    this.listeners = [];
  }

  NoteFileView.prototype.add = function(data) {
    const item =
      '<div class="note-item ">' +
      '<div class="item-status" data-id=' + data.id + '>' +
      '<div class="time">' + (data.modifiedTime ? new Date().toLocaleDateString() : data.modifiedTime.toLocaleDateString()) + '</div>' +
      '<div class="fav"></div>' +
      '<div class="image-note"></div>' +
      '</div>' +
      '<div class="note-title">' +
      '<span>' + data.description + '</span>' +
      '</div>' +
      '</div>'
    const $item = $(item);
    this.$noteFiles.append($item);
    $item.click(this.bindClick);
  }

  NoteFileView.prototype.emptyList = function() {
    this.$noteFiles.empty();
  }

  NoteFileView.prototype.bindClick = function() {
    $(".note-list .note-item").removeClass("on");
    $(this).addClass("on");
    window.noteFileView.notifyListeners(this.dataset.id);
  }

  NoteFileView.prototype.notifyListeners = function(fileId) {
    for (var listener of this.listeners) {
      listener(fileId);
    }
  }

  NoteFileView.prototype.addListener = function(listener) {
    this.listeners.push(listener);
  }

  function NoteView() {
    this.editor = window.editor;
    this.listeners = [];
  }

  noteView.prototype.onNoteFileClick = function(event) {
    const data = event.data;
    editor.setValue(data);
  }

  NoteView.prototype.notifyListeners = function(fileId) {
    for (var listener of this.listeners) {
      listener(fileId);
    }
  }

  NoteView.prototype.addListener = function(listener) {
    this.listeners.push(listener);
  }

  window.noteFolderView = new NoteFolderView();
  window.noteFileView = new NoteFileView();
  window.noteView = new NoteView();
})