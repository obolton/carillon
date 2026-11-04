import { describe, expect, test } from "vitest";
import { isReactive, unwrap } from "../utils";
import { ReactiveValue, reactive } from "../value";

describe("isReactive", () => {
  test("returns true if the value passed is reactive", () => {
    expect(isReactive(new ReactiveValue(0))).toBe(true);
  });

  test("returns false if the value passed is not reactive", () => {
    expect(isReactive(2)).toBe(false);
  });
});

describe("unwrap", () => {
  test("returns a non-reactive value unchanged", () => {
    expect(unwrap(42)).toBe(42);
  });

  test("unwraps a single reactive layer", () => {
    expect(unwrap(reactive("hello"))).toBe("hello");
  });

  test("unwraps nested reactives fully", () => {
    expect(unwrap(reactive(reactive(reactive(7))))).toBe(7);
  });
});
