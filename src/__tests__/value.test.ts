import { describe, expect, test, vi } from "vitest";
import { ReactiveValue, reactive } from "../value";

describe("ReactiveValue", () => {
  describe("constructor", () => {
    test("sets the initial value", () => {
      const r = new ReactiveValue(1);
      expect(r.value).toBe(1);
    });
  });

  describe("subscribe", () => {
    test("returns an unsubscribe callback", () => {
      const r = new ReactiveValue(1);
      const unsubscribe = r.subscribe(vi.fn());
      expect(unsubscribe).toBeInstanceOf(Function);
    });
  });

  describe("unsubscribe", () => {
    test("returns true if the subscriber was removed", () => {
      const r = new ReactiveValue(1);
      const subscriber = vi.fn();
      r.subscribe(subscriber);
      expect(r.unsubscribe(subscriber)).toBe(true);
    });

    test("returns false if the subscriber was not removed", () => {
      const r = new ReactiveValue(1);
      const subscriber = vi.fn();
      expect(r.unsubscribe(subscriber)).toBe(false);
    });
  });

  test("notifies subscribers when the value is updated", () => {
    const r = new ReactiveValue(1);
    const subscribers = [vi.fn(), vi.fn()] as const;
    r.subscribe(subscribers[0]);
    r.value = 2;
    expect(subscribers[0]).toHaveBeenCalledTimes(1);
    expect(subscribers[1]).toHaveBeenCalledTimes(0);
    r.subscribe(subscribers[1]);
    r.value = 3;
    expect(subscribers[0]).toHaveBeenCalledTimes(2);
    expect(subscribers[1]).toHaveBeenCalledTimes(1);
  });

  test("does not notify subscribers if the value is set but unchanged", () => {
    const r = new ReactiveValue(1);
    const subscriber = vi.fn();
    r.subscribe(subscriber);
    r.value = 1;
    expect(subscriber).toHaveBeenCalledTimes(0);
  });

  test("does not notify subscribers after they have been removed", () => {
    const r = new ReactiveValue(1);
    const subscriber = vi.fn();
    r.subscribe(subscriber);
    r.value = 2;
    expect(subscriber).toHaveBeenCalledTimes(1);
    r.unsubscribe(subscriber);
    r.value = 3;
    expect(subscriber).toHaveBeenCalledTimes(1);
  });
});

describe("reactive", () => {
  test("returns a ReactiveValue", () => {
    const r = reactive(1);
    expect(r).toBeInstanceOf(ReactiveValue);
    expect(r.value).toBe(1);
  });
});
