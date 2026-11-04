import { describe, expect, test, vi } from "vitest";
import { ReactiveArray, array } from "../array";

describe("ReactiveArray", () => {
  describe("length", () => {
    test("returns the array length", () => {
      const arr = new ReactiveArray([1, 2, 3]);
      expect(arr).toHaveLength(3);
    });

    test("updates after push", () => {
      const arr = new ReactiveArray([1, 2]);
      arr.push(3);
      expect(arr).toHaveLength(3);
    });

    test("updates after clear", () => {
      const arr = new ReactiveArray([1, 2, 3]);
      arr.clear();
      expect(arr).toHaveLength(0);
    });
  });

  describe("push", () => {
    test("adds items and notifies subscribers", () => {
      const arr = new ReactiveArray([1, 2]);
      const subscriber = vi.fn();
      arr.subscribe(subscriber);

      arr.push(3);

      expect(arr.value).toEqual([1, 2, 3]);
      expect(subscriber).toHaveBeenCalledTimes(1);
    });
  });

  describe("splice", () => {
    test("removes items and notifies subscribers", () => {
      const arr = new ReactiveArray([1, 2, 3]);
      const subscriber = vi.fn();
      arr.subscribe(subscriber);

      arr.splice(1, 1);

      expect(arr.value).toEqual([1, 3]);
      expect(subscriber).toHaveBeenCalledTimes(1);
    });

    test("replaces items and notifies subscribers", () => {
      const arr = new ReactiveArray([1, 2, 3]);
      const subscriber = vi.fn();
      arr.subscribe(subscriber);

      arr.splice(1, 1, 10);

      expect(arr.value).toEqual([1, 10, 3]);
      expect(subscriber).toHaveBeenCalledTimes(1);
    });
  });

  describe("clear", () => {
    test("removes all items", () => {
      const arr = new ReactiveArray([1, 2, 3]);

      arr.clear();

      expect(arr.value).toEqual([]);
    });

    test("notifies subscribers", () => {
      const arr = new ReactiveArray([1, 2, 3]);
      const subscriber = vi.fn();
      arr.subscribe(subscriber);

      arr.clear();

      expect(subscriber).toHaveBeenCalledTimes(1);
    });
  });

  describe("replace", () => {
    test("replaces all items", () => {
      const arr = new ReactiveArray([1, 2, 3]);

      arr.replace([4, 5]);

      expect(arr.value).toEqual([4, 5]);
    });

    test("notifies subscribers", () => {
      const arr = new ReactiveArray([1, 2, 3]);
      const subscriber = vi.fn();
      arr.subscribe(subscriber);

      arr.replace([4, 5]);

      expect(subscriber).toHaveBeenCalledTimes(1);
    });
  });

  describe("filter", () => {
    test("keeps items matching the predicate", () => {
      const arr = new ReactiveArray([1, 2, 3, 4, 5]);

      arr.filter((n) => n % 2 === 0);

      expect(arr.value).toEqual([2, 4]);
    });

    test("notifies subscribers", () => {
      const arr = new ReactiveArray([1, 2, 3]);
      const subscriber = vi.fn();
      arr.subscribe(subscriber);

      arr.filter((n) => n > 1);

      expect(subscriber).toHaveBeenCalledTimes(1);
    });

    test("provides index and array to predicate", () => {
      const arr = new ReactiveArray(["a", "b", "c"]);
      const predicate = vi.fn(() => true);

      arr.filter(predicate);

      expect(predicate).toHaveBeenCalledWith("a", 0, expect.any(Array));
      expect(predicate).toHaveBeenCalledWith("b", 1, expect.any(Array));
      expect(predicate).toHaveBeenCalledWith("c", 2, expect.any(Array));
    });
  });

  describe("iteration", () => {
    test("supports for...of", () => {
      const arr = new ReactiveArray([1, 2, 3]);
      const result: number[] = [];

      for (const item of arr) {
        result.push(item);
      }

      expect(result).toEqual([1, 2, 3]);
    });

    test("entries returns key-value pairs", () => {
      const arr = new ReactiveArray(["a", "b"]);

      expect([...arr.entries()]).toEqual([
        [0, "a"],
        [1, "b"],
      ]);
    });

    test("keys returns indices", () => {
      const arr = new ReactiveArray(["a", "b"]);

      expect([...arr.keys()]).toEqual([0, 1]);
    });

    test("values returns items", () => {
      const arr = new ReactiveArray(["a", "b"]);

      expect([...arr.values()]).toEqual(["a", "b"]);
    });
  });

  describe("find and findIndex", () => {
    test("find returns matching item", () => {
      const arr = new ReactiveArray([1, 2, 3]);

      expect(arr.find((n) => n > 1)).toBe(2);
    });

    test("findIndex returns matching index", () => {
      const arr = new ReactiveArray([1, 2, 3]);

      expect(arr.findIndex((n) => n > 1)).toBe(1);
    });
  });
});

describe("array", () => {
  test("returns a ReactiveArray", () => {
    const arr = array([1, 2, 3]);

    expect(arr).toBeInstanceOf(ReactiveArray);
    expect(arr.value).toEqual([1, 2, 3]);
  });
});
