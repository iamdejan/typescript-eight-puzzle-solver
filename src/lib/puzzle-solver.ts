import { PriorityQueue } from "@datastructures-js/priority-queue";

export type PuzzleState = number[][];

function toString(state: PuzzleState): string {
  return JSON.stringify(state);
}

export type Coordinate = { r: number; c: number };

const neighbors: Coordinate[] = [
  { r: -1, c: 0 },
  { r: 0, c: -1 },
  { r: 0, c: 1 },
  { r: 1, c: 0 },
];

const GOAL_STATE: PuzzleState = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 0],
];

type Node = {
  state: PuzzleState;
  g: number; // cost (distance) so far
  f: number; // total cost. f(n) = g(n) + h(n)
  pathSoFar: PuzzleState[];
}; // used inside priority queue

// Check if the puzzle is solvable.
// Reference: https://www.geeksforgeeks.org/dsa/check-instance-8-puzzle-solvable/
export function isSolvable(state: PuzzleState): boolean {
  let count = 0;
  for (let r = 0; r < 2; r++) {
    for (let c = r + 1; c < 3; c++) {
      if (state[c]![r]! > 0 && state[c]![r]! > state[r]![c]!) {
        count += 1;
      }
    }
  }

  return count % 2 == 0;
}

export function solvePuzzle(initialState: PuzzleState): PuzzleState[] | null {
  if (!isSolvable(initialState)) {
    return null;
  }

  const startNode: Node = {
    state: initialState,
    g: 0,
    f: 0, // for simplicity
    pathSoFar: [initialState],
  };

  const visited = new Set<string>();
  const queue = new PriorityQueue<Node>(
    (a, b) => {
      if (a.f < b.f) {
        return -1;
      }
      if (b.f > a.f) {
        return 1;
      }
      return a.g < b.g ? -1 : 1;
    },
    [startNode],
  );

  while (!queue.isEmpty()) {
    const current = queue.pop();
    if (current === null) {
      // should not happen
      continue;
    }

    if (visited.has(toString(current.state))) {
      continue;
    }

    if (heuristic(current.state) === 0) {
      // we reached the goal
      return current.pathSoFar;
    }

    visited.add(toString(current.state));

    const nextStates = generateNextPossibleStates(current.state);
    for (const nextState of nextStates) {
      const g = current.g + 1; // the actual cost will be the current cost + 1, for simplification
      const h = heuristic(nextState);
      const f = g + h;

      const nextNode: Node = {
        state: nextState,
        g: g,
        f: f,
        pathSoFar: [...current.pathSoFar, nextState],
      };

      queue.push(nextNode);
    }
  }

  return null;
}

function generateNextPossibleStates(state: PuzzleState): PuzzleState[] {
  const list: PuzzleState[] = [];

  const emptyCell = findNumber(state, 0);
  for (const neighbor of neighbors) {
    const newR = emptyCell.r + neighbor.r;
    const newC = emptyCell.c + neighbor.c;

    // check if outside of the box
    if (newR < 0 || newR >= 3) {
      continue;
    }
    if (newC < 0 || newC >= 3) {
      continue;
    }

    // create new board, then swap the values
    const newState = structuredClone(state);
    const temp = newState[emptyCell.r]![emptyCell.c]!;
    newState[emptyCell.r]![emptyCell.c] = newState[newR]![newC]!;
    newState[newR]![newC] = temp;

    list.push(newState);
  }

  return list;
}

function findNumber(state: PuzzleState, num: number): Coordinate {
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (state[r]![c]! === num) {
        return { r, c };
      }
    }
  }

  // this should not happen
  return { r: -1, c: -1 };
}

function heuristic(state: PuzzleState): number {
  let totalDistance = 0;

  // Manhattan: d = |x1 - x2| + |y1 - y2|
  for (let i = 1; i <= 9; i++) {
    const numCoordinate = findNumber(state, i);
    const numTargetCoordinate = findNumber(GOAL_STATE, i);

    const distance =
      Math.abs(numCoordinate.r - numTargetCoordinate.r) +
      Math.abs(numCoordinate.c - numTargetCoordinate.c);
    totalDistance += distance;
  }

  return totalDistance;
}
