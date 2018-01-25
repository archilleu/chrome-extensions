"use strict"

function HtmlTemplate(html) {
  this.html = html;
}

HtmlTemplate.prototype.replaceAll = function(exp, str) {
  return this.html.replace(new RegExp(exp, "gm"), str);
}
HtmlTemplate.prototype.format = function(args) {
  if (arguments.length < 1) {
    return this.html;
  }

  var data = arguments;
  if (arguments.length == 1 && typeof(args) == "object") {
    data = args;
  }
  for (var key in data) {
    var value = data[key];
    if (undefined != value) {
      this.html = this.replaceAll("\\{" + key + "\\}", value);
    }
  }

  return this.html;
}

class BaseView {
  constructor(container) {
    this.container = container;
    this.$container = $(container);
    this.listeners = {};
  }

  addListener(type, listener) {
    this.listeners[type] = listener;
  }

  notifyListeners(type, target) {
    if (type) {
      const listener = this.listeners[type];
      listener && listener(target);
      return;
    }

    for (listener of this.listeners) {
      listener(target);
    }
  }
}

class NoteFolderView extends BaseView {
  constructor(container) {
    super(container);
    this.template =
      '<div class="folder-item" data-id=' + '{id}' + '>' +
      '<div class="folder-icon all-icon"></div>' +
      '<div class="folder-info">' +
      '<div class="files-sum">' + '{sum}' + '</div>' +
      '<div class="folder-name">' + '{name}' + '</div>' +
      '</div>' +
      '</div>';
  }

  add(data) {
    var template = new HtmlTemplate(this.template);
    var html = template.format(data);

    const $item = $(html);
    this.$container.append($item);
    $item.click({
      container: this
    }, function(event) {
      event.data.container._highlight(this);
      event.data.container.notifyListeners("click", this);
    });
  }

  current() {
    return this.$container.find(".on");
  }

  _highlight(item) {
    this.$container.find(".folder-item").removeClass("on");
    $(item).addClass("on");
  }

}

class NoteFilesView extends BaseView {
  constructor(container) {
    super(container);
    this.template =
      '<div class="note-item" data-id=' + '{id}' + '>' +
      '<div class="item-status">' +
      '<div class="time">' + '{modifiedTime}' + '</div>' +
      '<div class="fav"></div>' +
      '<div class="image-note"></div>' +
      '</div>' +
      '<div class="note-title">' +
      '<span>' + '{description}' + '</span>' +
      '</div>' +
      '</div>';
  }

  add(data) {
    var template = new HtmlTemplate(this.template);
    var html = template.format(data);

    const $item = $(html);
    this.$container.append($item);
    $item.click({
      container: this
    }, function(event) {
      event.data.container._highlight(this);
      event.data.container.notifyListeners("click", this);
    });
  }

  empty() {
    this.$container.empty();
  }

  current() {
    return this.$container.find(".on");
  }

  _highlight(item) {
    this.$container.find(".note-item").removeClass("on");
    $(item).addClass("on");
  }

}

class NoteView extends BaseView {
  constructor(container) {
    super(container);
  }

  onContentReady(data) {
    this.container.setValue(data);
  }

}