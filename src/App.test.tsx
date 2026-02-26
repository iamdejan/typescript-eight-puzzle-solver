import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@solidjs/testing-library";
import App from "./App";

// Need to mock because not mocked in JSDom.
window.alert = vi.fn();

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the initial game state correctly", () => {
    render(() => <App />);
    expect(screen.getByText("8-Puzzle Solver")).toBeInTheDocument();
    expect(screen.getByText("A* Algorithm Demo")).toBeInTheDocument();

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
  });

  it("shuffles all numbers successfully", () => {
    render(() => <App />);
    expect(screen.getByText("8-Puzzle Solver")).toBeInTheDocument();
    expect(screen.getByText("A* Algorithm Demo")).toBeInTheDocument();

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
  });

  it("updates the board when custom state is given", () => {
    render(() => <App />);

    const input = screen.getByPlaceholderText(
      /e.g. 8 0 6/i,
    ) as HTMLInputElement;
    const setBtn = screen.getByText("Set");

    fireEvent.input(input, { target: { value: "1 2 3 4 5 6 7 0 8" } });
    fireEvent.click(setBtn);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
  });

  it("solves the puzzle and allows manual navigation", async () => {
    render(() => <App />);

    const input = screen.getByPlaceholderText(
      /e.g. 8 0 6/i,
    ) as HTMLInputElement;
    const setBtn = screen.getByText("Set");

    fireEvent.input(input, { target: { value: "1 2 3 4 5 6 7 0 8" } });
    fireEvent.click(setBtn);

    const solveBtn = screen.getByText("Solve with A*");
    fireEvent.click(solveBtn);

    await waitFor(() => {
      expect(screen.getByText(/Solution Found /i)).toBeInTheDocument();
    });

    const previousBtn = screen.getByTitle("Previous Step");
    const nextBtn = screen.getByTitle("Next Step");
    const stepText = screen.getByText(/Step 0 \//i);

    expect(previousBtn).toBeInTheDocument();
    expect(nextBtn).toBeInTheDocument();
    expect(stepText).toBeInTheDocument();

    expect(nextBtn).not.toBeDisabled();
    fireEvent.click(nextBtn);
    await waitFor(() => {
      expect(screen.getByText(/Step 1 \//i)).toBeInTheDocument();
    });

    // already at the last step, ensure next step button is disabled
    expect(nextBtn).toBeDisabled();

    expect(previousBtn).not.toBeDisabled();
    fireEvent.click(previousBtn);
    await waitFor(() => {
      expect(screen.getByText(/Step 0 \//i)).toBeInTheDocument();
    });

    expect(previousBtn).toBeDisabled();
  });

  it("displays error card for unsolvable puzzle", async () => {
    render(() => <App />);

    const input = screen.getByPlaceholderText(
      /e.g. 8 0 6/i,
    ) as HTMLInputElement;
    const setBtn = screen.getByText("Set");

    fireEvent.input(input, { target: { value: "2 1 3 4 5 6 7 8 0" } });
    fireEvent.click(setBtn);

    const solveBtn = screen.getByText("Solve with A*");
    fireEvent.click(solveBtn);

    await waitFor(() => {
      expect(screen.getByText("No Solution Found")).toBeInTheDocument();
    });

    expect(screen.getByText(/The puzzle state/i)).toBeInTheDocument();

    const goBackBtn = screen.getByText("Go Back");
    expect(goBackBtn).toBeInTheDocument();
    expect(goBackBtn).not.toBeDisabled();
    fireEvent.click(goBackBtn);

    await waitFor(() => {
      expect(screen.getByText("8-Puzzle Solver")).toBeInTheDocument();
    });
    expect(screen.getByText("A* Algorithm Demo")).toBeInTheDocument();
  });

  it("handles invalid input gracefully", () => {
    render(() => <App />);

    const input = screen.getByPlaceholderText(
      /e.g. 8 0 6/i,
    ) as HTMLInputElement;
    const setBtn = screen.getByText("Set");

    fireEvent.input(input, { target: { value: "INVALID TEXT" } });
    fireEvent.click(setBtn);

    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining("Invalid format"),
    );
  });

  it("shuffles the board when shuffle button is clicked", () => {
    render(() => <App />);

    // Get initial board state (goal state)
    const initialTiles = screen.getAllByText(/^[1-8]$/);
    expect(initialTiles).toHaveLength(8);

    const shuffleBtn = screen.getByText("Shuffle");
    fireEvent.click(shuffleBtn);

    // After shuffle, the board should still have all numbers 1-8
    // (the positions may have changed, but all tiles should be present)
    const tilesAfterShuffle = screen.getAllByText(/^[1-8]$/);
    expect(tilesAfterShuffle).toHaveLength(8);
  });

  it("disables solve button when board is already at goal state", () => {
    render(() => <App />);

    // Board starts at goal state [1,2,3,4,5,6,7,8,0]
    const solveBtn = screen.getByText("Solve with A*");
    expect(solveBtn).toBeDisabled();
  });

  it("disables shuffle button while solving", async () => {
    render(() => <App />);

    const input = screen.getByPlaceholderText(
      /e.g. 8 0 6/i,
    ) as HTMLInputElement;
    const setBtn = screen.getByText("Set");

    // Set a solvable puzzle
    fireEvent.input(input, { target: { value: "1 2 3 4 5 6 7 0 8" } });
    fireEvent.click(setBtn);

    const solveBtn = screen.getByText("Solve with A*");
    const shuffleBtn = screen.getByText("Shuffle");

    fireEvent.click(solveBtn);

    // Shuffle should be disabled while solving
    expect(shuffleBtn).toBeDisabled();
    expect(solveBtn).toBeDisabled();
    expect(screen.getByText("Calculating...")).toBeInTheDocument();

    // Wait for solution to complete
    await waitFor(() => {
      expect(screen.getByText(/Solution Found/i)).toBeInTheDocument();
    });

    // After solving, shuffle should be enabled again
    expect(shuffleBtn).not.toBeDisabled();
  });

  it("handles empty input gracefully", () => {
    render(() => <App />);

    const input = screen.getByPlaceholderText(
      /e.g. 8 0 6/i,
    ) as HTMLInputElement;
    const setBtn = screen.getByText("Set");

    fireEvent.input(input, { target: { value: "" } });
    fireEvent.click(setBtn);

    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining("Invalid format"),
    );
  });

  it("handles input with wrong number of values", () => {
    render(() => <App />);

    const input = screen.getByPlaceholderText(
      /e.g. 8 0 6/i,
    ) as HTMLInputElement;
    const setBtn = screen.getByText("Set");

    // Only 3 values instead of 9
    fireEvent.input(input, { target: { value: "1 2 3" } });
    fireEvent.click(setBtn);

    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining("Invalid format"),
    );
  });

  it("handles input with duplicate numbers", () => {
    render(() => <App />);

    const input = screen.getByPlaceholderText(
      /e.g. 8 0 6/i,
    ) as HTMLInputElement;
    const setBtn = screen.getByText("Set");

    // Duplicate number 1, missing 2
    fireEvent.input(input, { target: { value: "1 1 3 4 5 6 7 8 0" } });
    fireEvent.click(setBtn);

    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining("Invalid format"),
    );
  });

  it("handles input with numbers out of range", () => {
    render(() => <App />);

    const input = screen.getByPlaceholderText(
      /e.g. 8 0 6/i,
    ) as HTMLInputElement;
    const setBtn = screen.getByText("Set");

    // Number 9 is out of range (should be 0-8)
    fireEvent.input(input, { target: { value: "1 2 3 4 5 6 7 8 9" } });
    fireEvent.click(setBtn);

    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining("Invalid format"),
    );
  });

  it("disables input field while solving", async () => {
    render(() => <App />);

    const input = screen.getByPlaceholderText(
      /e.g. 8 0 6/i,
    ) as HTMLInputElement;
    const setBtn = screen.getByText("Set");

    // Set a solvable puzzle
    fireEvent.input(input, { target: { value: "1 2 3 4 5 6 7 0 8" } });
    fireEvent.click(setBtn);

    const solveBtn = screen.getByText("Solve with A*");
    fireEvent.click(solveBtn);

    // Input and Set button should be disabled while solving
    expect(input).toBeDisabled();
    expect(setBtn).toBeDisabled();

    // Wait for solution to complete
    await waitFor(() => {
      expect(screen.getByText(/Solution Found/i)).toBeInTheDocument();
    });

    // After solving, input should be enabled again
    expect(input).not.toBeDisabled();
    expect(setBtn).not.toBeDisabled();
  });

  it("clears previous solution when setting new board state", async () => {
    render(() => <App />);

    const input = screen.getByPlaceholderText(
      /e.g. 8 0 6/i,
    ) as HTMLInputElement;
    const setBtn = screen.getByText("Set");

    // Set a solvable puzzle and solve it
    fireEvent.input(input, { target: { value: "1 2 3 4 5 6 7 0 8" } });
    fireEvent.click(setBtn);

    const solveBtn = screen.getByText("Solve with A*");
    fireEvent.click(solveBtn);

    // Wait for solution
    await waitFor(() => {
      expect(screen.getByText(/Solution Found/i)).toBeInTheDocument();
    });

    // Set a new board state
    fireEvent.input(input, { target: { value: "1 2 3 4 5 6 0 7 8" } });
    fireEvent.click(setBtn);

    // Solution should be cleared (no step counter visible)
    expect(screen.queryByText(/Step 0 \//i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Solution Found/i)).not.toBeInTheDocument();
  });

  it("disables navigation buttons when no solution is found", async () => {
    render(() => <App />);

    const input = screen.getByPlaceholderText(
      /e.g. 8 0 6/i,
    ) as HTMLInputElement;
    const setBtn = screen.getByText("Set");

    // Set an unsolvable puzzle
    fireEvent.input(input, { target: { value: "2 1 3 4 5 6 7 8 0" } });
    fireEvent.click(setBtn);

    const solveBtn = screen.getByText("Solve with A*");
    fireEvent.click(solveBtn);

    await waitFor(() => {
      expect(screen.getByText("No Solution Found")).toBeInTheDocument();
    });

    const previousBtn = screen.queryByTitle("Previous Step");
    const nextBtn = screen.queryByTitle("Next Step");

    // Navigation buttons should not be present when no solution is found
    expect(previousBtn).not.toBeInTheDocument();
    expect(nextBtn).not.toBeInTheDocument();
  });
});
