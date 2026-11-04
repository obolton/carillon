import { describe, expect, test, vi } from "vitest";
import { ReactiveSet, set } from "../set";

describe("ReactiveSet", () => {
  describe("value", () => {
    test("preserves insertion order", () => {
      const s = new ReactiveSet(["b", "a", "c"]);
      expect(Array.from(s.value)).toEqual(["b", "a", "c"]);
    });

    test("reflects mutations", () => {
      const s = new ReactiveSet(["a"]);
      s.add("b");
      expect(Array.from(s.value)).toEqual(["a", "b"]);
    });
  });

  describe("size", () => {
    test("returns the set size", () => {
      const s = new ReactiveSet([1, 2, 3]);
      expect(s.size).toBe(3);
    });

    test("returns 0 for an empty set", () => {
      const s = new ReactiveSet();
      expect(s.size).toBe(0);
    });
  });

  describe("has", () => {
    test("returns true for existing items", () => {
      const s = new ReactiveSet(["a", "b"]);
      expect(s.has("a")).toBe(true);
    });

    test("returns false for missing items", () => {
      const s = new ReactiveSet(["a", "b"]);
      expect(s.has("c")).toBe(false);
    });
  });

  describe("add", () => {
    test("adds items to the end", () => {
      const s = new ReactiveSet(["a"]);
      s.add("b", "c");
      expect(Array.from(s)).toEqual(["a", "b", "c"]);
    });

    test("keeps the position of re-added items", () => {
      const s = new ReactiveSet(["a", "b"]);
      s.add("a");
      expect(Array.from(s)).toEqual(["a", "b"]);
    });

    test("notifies once with the added items", () => {
      const s = new ReactiveSet<string>();
      const subscriber = vi.fn();
      s.subscribe(subscriber);

      s.add("a", "b");

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenCalledWith(s, { added: ["a", "b"], removed: [] });
    });

    test("only reports items that were missing", () => {
      const s = new ReactiveSet(["a"]);
      const subscriber = vi.fn();
      s.subscribe(subscriber);

      s.add("a", "b");

      expect(subscriber).toHaveBeenCalledWith(s, { added: ["b"], removed: [] });
    });

    test("does not notify when all items are already present", () => {
      const s = new ReactiveSet(["a"]);
      const subscriber = vi.fn();
      s.subscribe(subscriber);

      s.add("a");

      expect(subscriber).not.toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    test("removes existing items and returns true", () => {
      const s = new ReactiveSet([1, 2]);

      expect(s.delete(1)).toBe(true);
      expect(s.has(1)).toBe(false);
      expect(s.size).toBe(1);
    });

    test("returns false for missing items", () => {
      const s = new ReactiveSet([1]);

      expect(s.delete(2)).toBe(false);
    });

    test("notifies once with the removed items", () => {
      const s = new ReactiveSet([1, 2, 3]);
      const subscriber = vi.fn();
      s.subscribe(subscriber);

      s.delete(1, 3, 4);

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenCalledWith(s, { added: [], removed: [1, 3] });
    });

    test("does not notify when the items are missing", () => {
      const s = new ReactiveSet([1]);
      const subscriber = vi.fn();
      s.subscribe(subscriber);

      s.delete(2);

      expect(subscriber).not.toHaveBeenCalled();
    });
  });

  describe("toggle", () => {
    test("adds a missing item", () => {
      const s = new ReactiveSet<number>();
      s.toggle(1);
      expect(s.has(1)).toBe(true);
    });

    test("removes an existing item", () => {
      const s = new ReactiveSet([1]);
      s.toggle(1);
      expect(s.has(1)).toBe(false);
    });

    test("notifies with the change", () => {
      const s = new ReactiveSet<number>();
      const subscriber = vi.fn();
      s.subscribe(subscriber);

      s.toggle(1);
      expect(subscriber).toHaveBeenLastCalledWith(s, { added: [1], removed: [] });

      s.toggle(1);
      expect(subscriber).toHaveBeenLastCalledWith(s, { added: [], removed: [1] });
    });
  });

  describe("clear", () => {
    test("removes all items", () => {
      const s = new ReactiveSet([1, 2, 3]);
      s.clear();
      expect(s.size).toBe(0);
    });

    test("notifies with the removed items", () => {
      const s = new ReactiveSet([1, 2]);
      const subscriber = vi.fn();
      s.subscribe(subscriber);

      s.clear();

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenCalledWith(s, { added: [], removed: [1, 2] });
    });

    test("does not notify when already empty", () => {
      const s = new ReactiveSet();
      const subscriber = vi.fn();
      s.subscribe(subscriber);

      s.clear();

      expect(subscriber).not.toHaveBeenCalled();
    });
  });

  describe("replace", () => {
    test("replaces all items, adopting the new order", () => {
      const s = new ReactiveSet([1, 2]);
      s.replace([3, 2]);
      expect(Array.from(s)).toEqual([3, 2]);
    });

    test("deduplicates the new items", () => {
      const s = new ReactiveSet<number>();
      s.replace([1, 2, 1]);
      expect(Array.from(s)).toEqual([1, 2]);
    });

    test("notifies once with the membership diff", () => {
      const s = new ReactiveSet([1, 2]);
      const subscriber = vi.fn();
      s.subscribe(subscriber);

      s.replace([2, 3]);

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenCalledWith(s, { added: [3], removed: [1] });
    });

    test("does not notify when items and order are identical", () => {
      const s = new ReactiveSet([1, 2]);
      const subscriber = vi.fn();
      s.subscribe(subscriber);

      s.replace([1, 2]);

      expect(subscriber).not.toHaveBeenCalled();
    });

    test("keeps the same value instance", () => {
      const s = new ReactiveSet([1, 2]);
      const value = s.value;

      s.replace([3, 4]);

      expect(s.value).toBe(value);
      expect(Array.from(value)).toEqual([3, 4]);
    });

    test("notifies with an empty diff on a pure reorder", () => {
      const s = new ReactiveSet(["a", "b"]);
      const subscriber = vi.fn();
      s.subscribe(subscriber);

      s.replace(["b", "a"]);

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenCalledWith(s, { added: [], removed: [] });
      expect(Array.from(s)).toEqual(["b", "a"]);
    });
  });

  describe("derive", () => {
    test("membership derives notify only when the result changes", () => {
      const s = new ReactiveSet(["a"]);
      const isSelected = s.derive((items) => items.has("a"));
      const subscriber = vi.fn();
      isSelected.subscribe(subscriber);
      expect(isSelected.value).toBe(true);

      s.add("b");
      expect(subscriber).not.toHaveBeenCalled();

      s.delete("a");
      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(isSelected.value).toBe(false);
    });
  });

  describe("iteration", () => {
    test("supports for...of", () => {
      const s = new ReactiveSet([1, 2, 3]);
      const result: number[] = [];

      for (const item of s) {
        result.push(item);
      }

      expect(result).toEqual([1, 2, 3]);
    });

    test("entries returns value-value pairs", () => {
      const s = new ReactiveSet(["a", "b"]);

      expect([...s.entries()]).toEqual([
        ["a", "a"],
        ["b", "b"],
      ]);
    });

    test("keys returns items", () => {
      const s = new ReactiveSet(["a", "b"]);

      expect([...s.keys()]).toEqual(["a", "b"]);
    });

    test("values returns items", () => {
      const s = new ReactiveSet(["a", "b"]);

      expect([...s.values()]).toEqual(["a", "b"]);
    });
  });
});

describe("set", () => {
  test("returns a ReactiveSet", () => {
    const s = set([1, 2, 3]);

    expect(s).toBeInstanceOf(ReactiveSet);
    expect(s.size).toBe(3);
  });

  test("creates an empty set with no arguments", () => {
    const s = set();

    expect(s).toBeInstanceOf(ReactiveSet);
    expect(s.size).toBe(0);
  });
});
