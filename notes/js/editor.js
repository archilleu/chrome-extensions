class EditorView {

    constructor(option) {
        this.text = "";
        this.changedCount = 0;

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
            this.text = this.editor.getValue();
            this.changedCount++;
        });

    }

    setLineNums(nums) {
        this.editor.setSize("100%", nums * 50);
    }

    setText(text) {
        this.text = text;
        this.editor.setValue(text);
    }

    getText() {
        return this.text;
    }

    clear() {
        this.editor.setValue("");
        this.text = "";
        this.changedCount = 0;
    }

    isChanged() {
        return this.changedCount != 0;
    }

}