(function(exports) {
  //model 处理数据
  var Model = function(line) {
    this.$line = $(line);
    this.listeners = {};
    this.clientHeight = $(".codeMirror-measure-length")[0].clientHeight;
    this.$measure = $("#codeMirror-measure-length");
    this.substrsClientWidth = [];


    //修正点击位置范围
    this.__defineGetter__("AMENDMENT", function() {
      return 3;
    })

    this.init();
  }

  Model.prototype.addListener = function(name, model, listener, param) {
    this.listeners[name] = {
      model: model,
      listener: listener,
      param: param
    };
  }

  Model.prototype.notifyListeners = function(name) {
    const action = this.listeners[name];
    action.listener(action.model, action.param);
  }


  Model.prototype.init = function() {
    this._getSubstrsClientWidth();
  }

  Model.prototype.onInsertClick = function(model, param) {
    model._cursorXPos(param);
    model._cursorYPos(param);
    model._prepareContent();

    model.notifyListeners("insert-click", null);
  }

  //计算字符串每一个长度的子字符串占用的屏幕宽度，使用$measure度量
  Model.prototype._getSubstrsClientWidth = function() {
    const text = this.$line.find(".edit-current").text();

    this.substrsClientWidth.push(0);
    for (let i = 1; i <= text.length; i++) {
      const subText = text.substr(0, i);
      this.$measure.text(subText);
      this.substrsClientWidth.push(this.$measure.width());
    }
    this.substrsClientWidth.push(this.$measure.width() + 1);
  }

  //获取鼠标点击X位置
  Model.prototype._cursorXPos = function(event) {

    for (var i = 0; i < this.substrsClientWidth.length; i++) {
      if ((this.substrsClientWidth[i] + this.AMENDMENT) > event.offsetX) {
        this.idx = i;
        this.xpos = this.substrsClientWidth[this.idx];
        return;
      }
    }

    //没有在范围表示到了行尾;
    this.idx = i - 1,
      this.xpos = this.substrsClientWidth[this.idx];
  }

  //获取鼠标点击Y位置
  Model.prototype._cursorYPos = function(event) {
    this.ypos = Math.floor((event.offsetY + this.$line[0].offsetTop) / this.clientHeight) * this.clientHeight;
  }

  Model.prototype._prepareContent = function() {
    text = $(this.$line.find(".edit-current")).text();

    this.spanPrefix = text.substr(0, this.idx);
    this.spanCurrent = "";
    this.spanSuffix = text.substr(this.idx);
  }

  Model.prototype.inputTextWidth = function(inputText) {
    $measure.text(inputText);
    return $measure.width();
  }

  var View = function(model) {
    this.model = model;
    this.$line = model.$line;
    this.$cursor = $(".codeMirror-cursor");
    var self = this;

    this.$prefix = this.$line.find(".edit-prefix");
    this.$current = this.$line.find(".edit-current");
    this.$suffix = this.$line.find(".edit-suffix");
  }

  View.prototype._setCursor = function(model) {
    this.$cursor.css({
      top: model.ypos,
      left: model.xpos
    })
  }

  View.prototype._prepareContent = function(model) {
    this.$prefix.text(model.spanPrefix);
    this.$current.text(model.spanCurrent);
    this.$suffix.text(model.spanSuffix);
  }

  View.prototype.onInsertClick = function(model, param) {
    this._prepareContent(model);
    this._setCursor(model);

    model.addListener("on-input", model, this.onInput, null);
  }

  View.prototype.onInput = function(model, param) {}

  View.prototype.updateContent = function() {
    //     $("#codeMirror-measure-text").focus();
    // let left = parseInt($(".codeMirror-cursor").css("left"));
    // $("#codeMirror-measure-text").keyup(function(){
    //   const inputText = $("#codeMirror-measure-text").val();
    //   readjustInputCursor(left, inputText);
    //   $(this).find(".edit-cursor").text(inputText);
    // }.bind(this));
  }

  View.prototype.updateCursor = function() {
    this.$cursor.css({
      top: this.model.ypos,
      left: this.model.xpos
    });
  }

  View.prototype.updateInput = function() {

  }

  var Controller = function(model, view) {
    this.model = model;
    this.view = view;
    this.listeners = {};
  }

  Controller.prototype.bindClickEvent = function() {
    model.addListener("click", null);
  }

  Controller.prototype.addListener = function(name, model, listener, param) {
    this.listeners[name] = {
      model: model,
      listener: listener,
      param: param
    };
  }

  Controller.prototype.notifyListeners = function(name) {
    const action = this.listeners[name];
    action.listener(action.model, action.param);
  }

  exports.Model = Model;
  exports.View = View;
  exports.Controller = Controller;

})(window);


$(function() {
  $(".codeMirror-line").click(function(event) {
    const model = new Model(this);
    const view = new View(model);
    model.addListener("insert-click", model, view.onInsertClick.bind(view), null);
    const controller = new Controller(model, view);
    controller.addListener("line-click", model, model.onInsertClick.bind(model), event);
    controller.notifyListeners("line-click");
  });
});
