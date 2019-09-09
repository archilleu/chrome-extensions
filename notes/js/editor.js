class EditorView {

    constructor(option) {
        this._text = "";
        this._isChanged = false;

        if (!option.el) {
            throw new Error("document's el miss");
        }

        this.editor = CodeMirror.fromTextArea(document.querySelector(option.el), {
            tabSize: 4,
            scrollbarStyle: "simple",
            cursorHeight: 0.40,
            extraKeys: {
                /*
                "Esc": function() {
                }
                */
            }
        });


        this.editor.on("changes", () => {
            const curData = this.editor.getValue();
            if (curData.length != this._text.length || curData != this._text) {
                this._isChanged = true;
            } else {
                this._isChanged = false;
            }

            this._text = curData;
            option.changes && option.changes(curData);
        });

    }

    setLineNums(nums) {
        this.editor.setSize("100%", nums * 50);
    }

    setText(text) {
        //有可能输入是纯数字
        if(!isNaN(text)) {
            text = text.toString();
        }

        this._text = text;
        this.editor.setValue(text);
    }

    getText() {
        return this._text;
    }

    clear() {
        this.editor.setValue("");
        this._text = "";
        this._isChanged = false;
    }

    isChanged() {
        return this._isChanged;
    }

    resetChanged() {
        this._isChanged = false;
    }

}