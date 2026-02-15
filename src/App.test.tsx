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

    const input = screen.getByPlaceholderText(/e.g. 8 0 6/i) as HTMLInputElement;
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

    const input = screen.getByPlaceholderText(/e.g. 8 0 6/i) as HTMLInputElement;
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

    const input = screen.getByPlaceholderText(/e.g. 8 0 6/i) as HTMLInputElement;
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
    
    const input = screen.getByPlaceholderText(/e.g. 8 0 6/i) as HTMLInputElement;
    const setBtn = screen.getByText("Set");

    fireEvent.input(input, { target: { value: "INVALID TEXT" } });
    fireEvent.click(setBtn);

    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("Invalid format"));
  });
});
