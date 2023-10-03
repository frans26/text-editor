import { useRef, useState } from "react";

import "./App.css";

function App() {
  const [text, setText] = useState("");

  const textAreaRef = useRef(null);

  const [changes, setChanges] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Function to handle text changes
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);

    let change = [];

    // check if the new change is adding a char or string
    if (newText.search(text) === 0) {
      change = [
        {
          type: "add",
          data: newText.slice(text.length),
        },
      ];
    } else {
      // this means that the current text is completely replaced
      // e.g. highlight all and paste new text
      change = [
        {
          type: "replace-1",
          data: text,
        },
        {
          type: "replace",
          data: newText,
        },
      ];

      // if the `newText` is searched on the current `text`
      // this means a deletion by backspace or cut (ctrl + x)
      // this also handles complete delete (newText = '')
      if (text.search(newText) === 0) {
        change = [
          {
            type: "delete",
            data: text.slice(newText.length),
          },
        ];
      }
    }

    setChanges((c) => c.concat(change));

    // on change of the text input
    // empty the redo stack
    setRedoStack([]);
  };

  // Function to perform undo operation
  const handleUndo = () => {
    if (changes.length > 0) {
      const stack = [...changes];
      const lastChange = stack.pop();
      const redo = [lastChange];

      let newText = "";

      // check for change type
      if (lastChange.type === "add") {
        // remove lastChange.data from the text, starting from the end
        newText = text.slice(0, -lastChange.data.length);
      } else if (lastChange.type === "delete") {
        // add the lastChange to the newText
        newText = text + lastChange.data;
      } else if (lastChange.type === "replace") {
        // this means that the text have been completely changed
        // we'll have to use the prev item of the stack with `replace-1` type
        const prevStack = stack.pop();
        redo.push(prevStack);
        newText = prevStack.data;
      }

      // used the ref to prevent triggering of the textarea onChange event
      textAreaRef.current.value = newText;

      // update the state
      setText(newText);
      setChanges(stack);
      setRedoStack((r) => r.concat(redo));
    }
  };

  // Function to perform redo operation
  const handleRedo = () => {
    if (redoStack.length > 0) {
      // clone the redo stack to prevent the mutation of the redoStack state
      const stack = [...redoStack];
      const lastChange = stack.pop();
      const change = [lastChange];

      let newText = "";
      // check for change type
      if (lastChange.type === "add") {
        // add the lastChange to the newText
        newText = text + lastChange.data;
      } else if (lastChange.type === "delete") {
        // remove lastChange.data from the text, starting from the end
        newText = text.slice(0, -lastChange.data.length);
      } else if (lastChange.type === "replace-1") {
        // this means that the text have been completely changed
        // we'll have to use the prev item of the stack with `replace` type
        const prevStack = stack.pop();
        change.push(prevStack);
        newText = prevStack.data;
      }

      // used the ref to prevent triggering of the textarea onChange event
      textAreaRef.current.value = newText;

      // update the state
      setText(newText);
      setChanges((c) => c.concat(change));
      setRedoStack(stack);
    }
  };

  return (
    <main>
      <h1>Text editor</h1>

      <p>Simple text editor that can undo/redo</p>

      <div>
        <textarea
          id="text-editor"
          data-testid="text-editor"
          name="text-editor"
          rows="10"
          cols="100"
          ref={textAreaRef}
          onChange={handleTextChange}
        ></textarea>
      </div>

      <button
        id="btn-undo"
        data-testid="btn-undo"
        onClick={handleUndo}
        disabled={changes.length === 0}
      >
        {"< Undo"}
      </button>

      <button
        id="btn-redo"
        data-testid="btn-redo"
        onClick={handleRedo}
        disabled={redoStack.length === 0}
      >
        {"Redo >"}
      </button>
    </main>
  );
}

export default App;
