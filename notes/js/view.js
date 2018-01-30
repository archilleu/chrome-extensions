"use strict"

class BaseView extends Listener {
  constructor(container) {
    super();

    this.$container = $(container);
    this.EVENT_CLICK = "event-click";
    this.EVENT_DELETE = "event-delete";
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

  onListDataReady(listData) {
    for (const data of listData) {
      data.sum = data.sum ? dta.sum : 0;
      this.add(data);
    }
  }

  add(data) {
    var template = new HtmlTemplate(this.template);
    var html = template.format(data);

    const $item = $(html);
    this.$container.append($item);
    $item.click({
      container: this
    }, function(event) {
      const self = event.data.container;

      //如果该项选中则返回
      if (self._isChecked(this))
        return;

      self._highlight(this);
      self.notifyListeners(self.EVENT_CLICK, this);
    });
  }

  del(folder) {
    folder.remove();
  }

  current() {
    return this.$container.find(".on");
  }

  onEmpty() {
    this.empty();
  }

  empty() {
    this.$container.empty();
  }

  _highlight(item) {
    this.$container.find(".folder-item").removeClass("on");
    $(item).addClass("on");
  }

  _isChecked(item) {
    const current = this.current()[0];
    if (current && current.dataset.id == item.dataset.id)
      return true;

    return false;
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

  onListDataReady(listData) {
    for (const data of listData) {
      data.sum = data.sum ? dta.sum : 0;
      this.add(data);
    }
  }

  add(data) {
    var template = new HtmlTemplate(this.template);
    var html = template.format(data);

    const $item = $(html);
    this.$container.append($item);
    $item.click({
      container: this
    }, function(event) {
      const self = event.data.container;

      //如果该项选中则返回
      if (self._isChecked(this))
        return;

      self._highlight(this);
      self.notifyListeners(self.EVENT_CLICK, this);
    });
  }

  del(file) {
    file.remove();
  }

  onEmpty() {
    this.empty();
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

  _isChecked(item) {
    const current = this.current()[0];
    if (current && current.dataset.id == item.dataset.id)
      return true;

    return false;
  }
}

class NoteView extends BaseView {
  constructor() {
    super(null);
    this.editor = window.editor;
  }

  onDataReady(data) {
    this.editor.setValue(data);
  }

  onClear(data) {
    this.editor.setValue("");
  }

  getValue() {
    return this.editor.getValue();
  }
}

class Interaction {
  constructor() {
    this.loading = new Loading("images/loading.gif");
    this.tips = new Tips();
  }

  loading() {
    this.onLoadingShow();
  }

  onLoadingShow() {
    this.loading.show();
  }

  onLoadingHide() {
    this.loading.hide();
  }

  onTips(tip) {
    const msg = "status:" + tip.status + " msg:" + (tip.msg ? tip.msg : "网络不通...");
    this.tips.show(msg);
  }
}