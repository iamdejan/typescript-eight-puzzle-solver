import { createSignal, For, Show, type JSX } from "solid-js";
import "~/app.css";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Button } from "./components/ui/button";
import {
  GOAL_STATE,
  isSolvable,
  PuzzleState,
  shuffle,
  solvePuzzle,
  toString,
} from "./lib/puzzle-solver";
import Tile from "./components/tile";
import { Input } from "./components/ui/input";
import { createTheme } from "./lib/use-theme";

export default function App(): JSX.Element {
  const { theme, toggleTheme } = createTheme();
  const [board, setBoard] = createSignal<PuzzleState>([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 0],
  ]);
  const [noSolutionFound, setNoSolutionFound] = createSignal(false);
  const [solutionPath, setSolutionPath] = createSignal<PuzzleState[]>([]);
  const [solutionStep, setSolutionStep] = createSignal(0);
  const [isSolving, setIsSolving] = createSignal(false);
  const [inputString, setInputString] = createSignal("");

  function handlePrevStep() {
    const newStep = solutionStep() - 1;
    setSolutionStep(newStep);
    if (newStep >= 0 && newStep < solutionPath().length) {
      const path = solutionPath();
      const state = path[newStep]!;
      setBoard(state);
    }
  }

  function handleNextStep() {
    const newStep = solutionStep() + 1;
    setSolutionStep(newStep);
    if (newStep >= 0 && newStep < solutionPath().length) {
      const path = solutionPath();
      const state = path[newStep]!;
      setBoard(state);
    }
  }

  function handleShuffle() {
    const newState = shuffle();
    setBoard(newState);
    setNoSolutionFound(false);
    setSolutionPath([]);
    setSolutionStep(0);
  }

  function handleSolve() {
    setIsSolving(true);
    setNoSolutionFound(false);
    setSolutionPath([]);

    // Allow UI to update before heavy calculation
    setTimeout(() => {
      const currentBoard = board();

      if (!isSolvable(currentBoard)) {
        setNoSolutionFound(true);
        setIsSolving(false);
        return;
      }

      const path = solvePuzzle(currentBoard);

      if (path) {
        setSolutionPath(path);
        setSolutionStep(0);
      } else {
        setNoSolutionFound(true);
      }
      setIsSolving(false);
    }, 100);
  }

  function parseInput(input: string): PuzzleState | null {
    const nums = input
      .trim()
      .split(/[\s,]+/)
      .map((n) => parseInt(n));

    if (nums.length !== 9) {
      return null;
    }

    if (nums.some((n) => isNaN(n) || n < 0 || n > 8)) {
      return null;
    }

    if (new Set(nums).size !== 9) {
      return null;
    }

    const chunked: PuzzleState = [];
    for (let i = 0; i < nums.length; i += 3) {
      chunked.push(nums.slice(i, i + 3));
    }
    return chunked;
  }

  async function handleApplyInput() {
    const newState = parseInput(inputString());
    if (newState) {
      setBoard(newState);
      setNoSolutionFound(false);
      setSolutionPath([]);
      setSolutionStep(0);
    } else {
      alert(
        "Invalid format. Please enter numbers 0-8 separated by spaces (e.g., 1 2 3 4 5 6 7 8 0)",
      );
    }
  }

  return (
    <div class="min-h-screen bg-background flex items-center justify-center p-4 font-sans text-foreground">
      <Show when={noSolutionFound()}>
        <Card class="w-full max-w-md border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardHeader>
            <CardTitle class="text-red-700 dark:text-red-400">
              No Solution Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-red-600 dark:text-red-300">
              The puzzle state you entered is mathematically impossible to
              solve. The 8-puzzle requires an even number of inversions.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="default" onClick={() => setNoSolutionFound(false)}>
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </Show>

      <Show when={!noSolutionFound()}>
        <Card class="w-full max-w-lg shadow-xl">
          <CardHeader class="text-center relative">
            <Button
              variant="outline"
              size="icon"
              class="absolute right-0 top-0 rounded-full"
              onClick={toggleTheme}
              title={`Switch to ${theme() === "light" ? "dark" : "light"} mode`}
            >
              <Show
                when={theme() === "light"}
                fallback={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                  </svg>
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              </Show>
            </Button>
            <CardTitle class="text-2xl">8-Puzzle Solver</CardTitle>
            <p class="text-sm text-muted-foreground">A* Algorithm Demo</p>
          </CardHeader>

          <CardContent class="flex flex-col items-center gap-6">
            <div class="grid grid-cols-3 gap-2 bg-muted p-2 rounded-xl">
              <For each={board()}>
                {(row) => (
                  <For each={row}>{(number) => <Tile value={number} />}</For>
                )}
              </For>
            </div>

            <Show when={solutionPath().length > 0}>
              <div class="flex flex-col items-center gap-2 w-full animate-content-show">
                <p class="text-sm font-semibold text-green-600 dark:text-green-400">
                  Solution Found in {solutionPath().length - 1} step(s)!
                </p>

                <div class="flex items-center justify-center gap-4 w-full">
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={solutionStep() === 0}
                    title="Previous Step"
                  >
                    ←
                  </Button>

                  <span class="text-sm font-medium w-20 text-center text-muted-foreground">
                    Step {solutionStep()} / {solutionPath().length - 1}
                  </span>

                  <Button
                    variant="outline"
                    onClick={handleNextStep}
                    disabled={solutionStep() === solutionPath().length - 1}
                    title="Next Step"
                  >
                    →
                  </Button>
                </div>
              </div>
            </Show>

            <div class="w-full h-px bg-border" />

            <div class="w-full space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleShuffle}
                  disabled={isSolving()}
                >
                  Shuffle
                </Button>
                <Button
                  onClick={handleSolve}
                  disabled={
                    isSolving() || toString(board()) === toString(GOAL_STATE)
                  }
                >
                  {isSolving() ? "Calculating..." : "Solve with A*"}
                </Button>
              </div>

              <div class="space-y-2">
                <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Set Custom State
                </label>
                <div class="flex gap-2">
                  <Input
                    value={inputString()}
                    onInput={(e: { currentTarget: { value: any } }) =>
                      setInputString(e.currentTarget.value)
                    }
                    placeholder="e.g. 8 0 6 5 4 7 2 3 1"
                    disabled={isSolving()}
                  />
                  <Button
                    variant="outline"
                    onClick={handleApplyInput}
                    disabled={isSolving()}
                  >
                    Set
                  </Button>
                </div>
                <p class="text-xs text-muted-foreground">
                  Enter numbers 0-8 (where 0 is empty) separated by spaces.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Show>
    </div>
  );
}
