import { describe, expect, test } from "vitest";
import { applyListChange } from "../list";
import type { ListChange } from "../types";

// Applies a change to a plain array via array-mutating operations — the
// in-memory meaning of a change, used here as the oracle.
function applyToArray<T>(items: readonly T[], change: ListChange<T>): T[] {
  const result = [...items];
  applyListChange<T, T>(change, {
    remove: (_item, index) => {
      result.splice(index, 1);
    },
    detach: (_item, index) => result.splice(index, 1)[0]!,
    insert: (item, index) => {
      result.splice(index, 0, item);
    },
    attach: (item, index) => {
      result.splice(index, 0, item);
    },
  });
  return result;
}

describe("applyListChange", () => {
  test("applies a mixed batch of removes, a move, and an add", () => {
    // [A, B, C, D] -> [X, C, A]
    const change: ListChange<string> = {
      removed: [
        { item: "B", index: 1 },
        { item: "D", index: 3 },
      ],
      added: [{ item: "X", index: 0 }],
      moved: [{ item: "A", from: 0, index: 2 }],
    };

    expect(applyToArray(["A", "B", "C", "D"], change)).toEqual(["X", "C", "A"]);
  });

  test("applies several simultaneous moves", () => {
    // [a, b, c, d, e] -> [c, d, a, b, e]
    const change: ListChange<string> = {
      removed: [],
      added: [],
      moved: [
        { item: "a", from: 0, index: 2 },
        { item: "b", from: 1, index: 3 },
      ],
    };

    expect(applyToArray(["a", "b", "c", "d", "e"], change)).toEqual(["c", "d", "a", "b", "e"]);
  });

  test("passes each move's detached handle to its attach", () => {
    const change: ListChange<string> = {
      removed: [],
      added: [],
      moved: [{ item: "a", from: 0, index: 1 }],
    };

    const attached: { item: string; handle: string }[] = [];
    applyListChange<string, string>(change, {
      remove: () => {},
      detach: (item) => `handle:${item}`,
      insert: () => {},
      attach: (item, _index, handle) => attached.push({ item, handle }),
    });

    expect(attached).toEqual([{ item: "a", handle: "handle:a" }]);
  });

  test("applies an empty change as a no-op", () => {
    const change: ListChange<string> = { removed: [], added: [], moved: [] };
    expect(applyToArray(["a", "b"], change)).toEqual(["a", "b"]);
  });
});
