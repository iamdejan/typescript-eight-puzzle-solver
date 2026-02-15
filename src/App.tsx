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

export default function App(): JSX.Element {
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
    <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
      <Show when={noSolutionFound()}>
        <Card class="w-full max-w-md border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle class="text-red-700">No Solution Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-red-600">
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
          <CardHeader class="text-center">
            <CardTitle class="text-2xl">8-Puzzle Solver</CardTitle>
            <p class="text-sm text-slate-500">A* Algorithm Demo</p>
          </CardHeader>

          <CardContent class="flex flex-col items-center gap-6">
            <div class="grid grid-cols-3 gap-2 bg-slate-200 p-2 rounded-xl">
              <For each={board()}>
                {(row) => (
                  <For each={row}>{(number) => <Tile value={number} />}</For>
                )}
              </For>
            </div>

            <Show when={solutionPath().length > 0}>
              <div class="flex flex-col items-center gap-2 w-full animate-content-show">
                <p class="text-sm font-semibold text-green-600">
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

            <div class="w-full h-px bg-slate-100" />

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
                <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">
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
                <p class="text-xs text-slate-400">
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
