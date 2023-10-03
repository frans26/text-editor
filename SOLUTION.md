# Text editor solution

## Getting Started

Requirements:

- Node 18+

Install dependencies

```
npm install
```

Run dev environment

```
npm run dev
```

Run test

```
npm run test
```

### Implementation Decisions

1. Used `textarea` for the text editor area.
2. Used `ref` instead of `state` for the textarea value. This prevents the `onChange` event trigger of the `textarea` that might cause unnecessary text state mismatch.
3. For handling the stack trace, I decided to use 3 types of handling text input change

- **add** - handling the added text/s in input. Each letter or word(copy/pasting) will be added to the change stack. This always clears the `RedoStack`
  **note:** limited to handling added text/s at the end of the current text input, adding in other parts will be handled by **replace** & **replace-1** type

  ```
  e.g.
  changes = []

  > typing 't', 'e', 's', 't' will result
  changes = [
    {
      "type": "add",
      "data": "t"
    },
    {
      "type": "add",
      "data": "e"
    },
    {
      "type": "add",
      "data": "s"
    },
    {
      "type": "add",
      "data": "t"
    }
  ]
  > display "test" in the `textarea`

  > adding a copy/pasted "word" will result
  changes = [
    {
      "type": "add",
      "data": "t"
    },
    {
      "type": "add",
      "data": "e"
    },
    {
      "type": "add",
      "data": "s"
    },
    {
      "type": "add",
      "data": "t"
    },
    {
      "type": "add",
      "data": "word"
    }
  ]
  > display "testword" in the `textarea`
  ```

- **delete** - handling the deleted text/s in the input [backspace, delete, cut(ctrl+x)].
  **note:** limited to handling delete text/s at the end of the current text input, adding in other parts will be handled by **replace** & **replace-1** type

  ```
  e.g.
  changes = changes = [
    {
      "type": "add",
      "data": "t"
    },
    {
      "type": "add",
      "data": "e"
    },
    {
      "type": "add",
      "data": "s"
    },
    {
      "type": "add",
      "data": "t"
    },
    {
      "type": "add",
      "data": "word"
    }
  ]

  > delete input by using `backspace` will result
  changes = [
    {
      "type": "add",
      "data": "t"
    },
    {
      "type": "add",
      "data": "e"
    },
    {
      "type": "add",
      "data": "s"
    },
    {
      "type": "add",
      "data": "t"
    },
    {
      "type": "add",
      "data": "word"
    },
    {
      "type": "delete",
      "data": "d"
    }
  ]
  > display "testwor" in the `textarea`

  > highlight and cut "wor" will result
  changes = [
    {
      "type": "add",
      "data": "t"
    },
    {
      "type": "add",
      "data": "e"
    },
    {
      "type": "add",
      "data": "s"
    },
    {
      "type": "add",
      "data": "t"
    },
    {
      "type": "add",
      "data": "word"
    },
    {
      "type": "delete",
      "data": "d"
    },
    {
      "type": "delete",
      "data": "wor"
    }
  ]
  > display "test" in the `textarea`
  ```

  - **replace** & **replace-1** - handling the text not handled by **add** and **delete** in the input.

  ```
  e.g.
  changes = [
    {
      "type": "add",
      "data": "t"
    },
    {
      "type": "add",
      "data": "e"
    },
    {
      "type": "add",
      "data": "s"
    },
    {
      "type": "add",
      "data": "t"
    },
    {
      "type": "add",
      "data": "word"
    },
    {
      "type": "delete",
      "data": "d"
    },
    {
      "type": "delete",
      "data": "wor"
    }
  ]
  > display "test" in the `textarea`
  > highlight "test" and replace "change" will result
  changes = [
    {
      "type": "add",
      "data": "t"
    },
    {
      "type": "add",
      "data": "e"
    },
    {
      "type": "add",
      "data": "s"
    },
    {
      "type": "add",
      "data": "t"
    },
    {
      "type": "add",
      "data": "word"
    },
    {
      "type": "delete",
      "data": "d"
    },
    {
      "type": "delete",
      "data": "wor"
    },
    {
      "type": "replace-1",
      "data": "test"
    },
    {
      "type": "replace",
      "data": "change"
    }
  ]
  > display "change" in the `textarea`
  ```

4. Undo functionality - get the last change from the `changes` stack and check the `type`
   if `type = 'add'`, using the `string.slice(0, -data.length)`, this removes the `value of lastChange.data` from the text
   if `type = 'delete'`, just add the `value of lastChange.data` to the current text
   if `type = 'replace'`, pop again the `changes` stack to get the `type = 'replace-1'` item, use the `value of prevStack.data` as the current text
   After checking the type, the lastChange item is pushed to the RedoStack

5. Redo functionality - get the last change from the `changes` stack and check the `type`
   if `type = 'add'`, just add the `value of lastChange.data` to the current text
   if `type = 'delete'`, using the `string.slice(0, -data.length)`, this removes the `value of lastChange.data` from the text
   if `type = 'replace-1'`, pop again the `changes` stack to get the `type = 'replace'` item, use the `value of prevStack.data` as the current text
   After checking the type, the lastChange item is pushed to the UndoStack
6. Time complexity:
   ```
    string.slice() - 0(N)
    string.search() - 0(N)
    arr.push() - 0(1)
    arr.pop() - 0(1)
    arr.concat() - 0(N)
   ```

### Potential Questions and Assumptions

1. Assumption: The undo/redo functionality does not need to persist across page reloads.
2. Assumption: Redo history is always cleared on any changes from the input.
3. Assumption: The UI is minimalistic, did not add beautiful css-styling and don't implement rich text editing features like formatting or syntax highlighting.
4. Question: Should there be a confirmation prompt when the user clicks undo or redo, or should the actions be performed immediately?
   4.1. Assumption: Actions are performed immediately.
