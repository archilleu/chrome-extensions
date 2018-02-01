"use strict"

class BaseView extends Listener {
  constructor(container) {
    super();

    this.$container = $(container);
    this.EVENT_CLICK = "event-click";
    this.EVENT_ADD = "event-add";
  }

  add(data) {
    const item = this._add(data);
    this.notifyListeners(this.EVENT_ADD, item);
  }


  del(item) {
    item.remove();
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

  _add(data) {
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

      self.notifyListeners(self.EVENT_CLICK, this);
    });

    return $item[0];
  }

  _isChecked(item) {
    const current = this.current()[0];
    if (current && current.dataset.id == item.dataset.id)
      return true;

    return false;
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
      this._add(data);
    }
  }


  highlight(item) {
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

  onListDataReady(listData) {
    for (const data of listData) {
      data.sum = data.sum ? dta.sum : 0;
      this._add(data);
    }
  }

  highlight(item) {
    this.$container.find(".note-item").removeClass("on");
    $(item).addClass("on");
  }

}

class NoteView extends BaseView {
  constructor() {
    super(null);
    this.editor = window.editor;
  }

  onDataReady(data) {
    this.editor.setValue(data);
    this.clearChange();
    this.editor.clearHistory();
  }

  onClear(data) {
    this.editor.setValue("");
    this.clearChange();
    this.editor.clearHistory();
  }

  getValue() {
    return this.editor.getValue();
  }

  isChanged() {
    return this.editor.changed;
  }

  clearChange() {
    this.editor.changedCount = 1;
  }
}