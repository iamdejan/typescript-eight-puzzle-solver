import { describe, expect, it } from "vitest";
import {
  GOAL_STATE,
  isSolvable,
  PuzzleState,
  solvePuzzle,
  toString,
} from "./puzzle-solver";

describe("8-Puzzle Logic", () => {
  describe("isSolvable", () => {
    it("returns 'true' for the goal state", () => {
      expect(isSolvable(GOAL_STATE)).toBeTruthy();
    });

    it("returns 'true' for solvable shuffled state", () => {
      const shuffledState: PuzzleState = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 0, 8],
      ];
      expect(isSolvable(shuffledState)).toBeTruthy();
    });

    it("return 'false' for unsolvable shuffled state", () => {
      const shuffledState: PuzzleState = [
        [2, 1, 3],
        [4, 5, 6],
        [7, 8, 0],
      ];
      expect(isSolvable(shuffledState)).toBeFalsy();
    });
  });

  describe("solvePuzzle (A*)", () => {
    it("returns a path of length 1 (start state) if already solved", () => {
      const path = solvePuzzle(GOAL_STATE);
      expect(path).not.toBeNullable();
      expect(path!.length).toBe(1);
      expect(toString(path![0]!)).toBe(toString(GOAL_STATE));
    });

    it("returns 'null' immediately for unsolvable puzzle", () => {
      const path = solvePuzzle([
        [2, 1, 3],
        [4, 5, 6],
        [7, 8, 9],
      ]);
      expect(path).toBeNull();
    });

    it("returns the path for complex solvable puzzle", () => {
      const path = solvePuzzle([
        [8, 6, 7],
        [2, 5, 4],
        [3, 0, 1],
      ]);
      expect(path).not.toBeNullable();
      expect(path!.length).toBe(32);
    });
  });
});
