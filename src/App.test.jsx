import { it, describe, expect } from "vitest";

import { fireEvent, render, screen } from "./utils/test-utils";
import App from "./App";

describe("App", () => {
  it("renders the text editor", () => {
    render(<App />);
    const textEditor = screen.getByText("Text editor");
    expect(textEditor).toBeInTheDocument();
  });

  it("disables undo and redo buttons when no changes are made", () => {
    render(<App />);
    const undoButton = screen.getByTestId("btn-undo");
    const redoButton = screen.getByTestId("btn-redo");

    expect(undoButton).toBeDisabled();
    expect(redoButton).toBeDisabled();
  });

  it("allows entering, undoing and redoing text", () => {
    render(<App />);
    const textarea = screen.getByTestId("text-editor");
    const undoButton = screen.getByTestId("btn-undo");
    const redoButton = screen.getByTestId("btn-redo");

    fireEvent.change(textarea, { target: { value: "The" } });
    fireEvent.change(textarea, { target: { value: "The quick" } });
    fireEvent.change(textarea, { target: { value: "The quick brown" } });
    fireEvent.change(textarea, { target: { value: "The quick brown fox" } });

    expect(textarea).toHaveValue("The quick brown fox");
    expect(undoButton).toBeEnabled();
    expect(redoButton).toBeDisabled();

    fireEvent.click(undoButton);

    expect(textarea).toHaveValue("The quick brown");
    expect(redoButton).toBeEnabled();

    fireEvent.click(redoButton);
    expect(textarea).toHaveValue("The quick brown fox");
  });
});
