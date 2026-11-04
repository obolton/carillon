import { describe, expect, test } from "vitest";
import { ReactiveFlag, flag } from "../flag";

describe("ReactiveFlag", () => {
  test("sets the initial value", () => {
    const r = new ReactiveFlag(true);
    expect(r.value).toBe(true);
  });

  test("turns on", () => {
    const r = new ReactiveFlag(false);
    r.on();
    expect(r.value).toBe(true);
  });

  test("turns off", () => {
    const r = new ReactiveFlag(true);
    r.off();
    expect(r.value).toBe(false);
  });

  test("toggles on", () => {
    const r = new ReactiveFlag(false);
    r.toggle();
    expect(r.value).toBe(true);
  });

  test("toggles off", () => {
    const r = new ReactiveFlag(true);
    r.toggle();
    expect(r.value).toBe(false);
  });
});

describe("flag", () => {
  test("returns a ReactiveFlag", () => {
    const r = flag(false);
    expect(r).toBeInstanceOf(ReactiveFlag);
    expect(r.value).toBe(false);
  });
});
