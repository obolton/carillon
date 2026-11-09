import { describe, expect, test, vi } from "vitest";
import { Combined, combine } from "../combined";
import { ReactiveValue, reactive } from "../value";

describe("Combined", () => {
  test("combines multiple reactive values", () => {
    const a = new ReactiveValue(1);
    const b = new ReactiveValue("hello");
    const combined = combine({ a, b });
    expect(combined.value).toStrictEqual({ a: 1, b: "hello" });
  });

  test("updates when any input changes", () => {
    const a = new ReactiveValue(1);
    const b = new ReactiveValue(2);
    const combined = combine({ a, b });
    const subscriber = vi.fn();
    combined.subscribe(subscriber);

    a.value = 10;
    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(combined.value).toStrictEqual({ a: 10, b: 2 });

    b.value = 20;
    expect(subscriber).toHaveBeenCalledTimes(2);
    expect(combined.value).toStrictEqual({ a: 10, b: 20 });
  });

  test("works with derive for multi-input computed", () => {
    const a = new ReactiveValue(1);
    const b = new ReactiveValue(2);
    const sum = combine({ a, b }).derive(({ a, b }) => a + b);
    expect(sum.value).toBe(3);

    a.value = 10;
    expect(sum.value).toBe(12);
  });

  test("subscribes to each input once", () => {
    const a = new ReactiveValue(1);
    const b = new ReactiveValue(2);
    const subscribeA = vi.spyOn(a, "subscribe");
    const subscribeB = vi.spyOn(b, "subscribe");
    const combined = combine({ a, b });
    combined.subscribe(vi.fn());
    combined.subscribe(vi.fn());
    expect(subscribeA).toHaveBeenCalledTimes(1);
    expect(subscribeB).toHaveBeenCalledTimes(1);
  });

  test("does not subscribe to its inputs when the signal is already aborted", () => {
    const a = new ReactiveValue(1);
    const subscribe = vi.spyOn(a, "subscribe");
    const combined = combine({ a });
    const controller = new AbortController();
    controller.abort();
    combined.subscribe(vi.fn(), controller.signal);
    expect(subscribe).not.toHaveBeenCalled();
  });

  test("caches the combined value while subscribed", () => {
    const a = new ReactiveValue(1);
    const b = new ReactiveValue(2);
    const transform = vi.fn(({ a, b }: { a: number; b: number }) => a + b);
    const combined = combine({ a, b }, transform);
    combined.subscribe(vi.fn());
    const results = [combined.value, combined.value, combined.value];
    expect(results).toStrictEqual([3, 3, 3]);
    expect(transform).toHaveBeenCalledTimes(1);
  });

  test("recomputes on every read when unsubscribed", () => {
    const a = new ReactiveValue(1);
    const b = new ReactiveValue(2);
    const transform = vi.fn(({ a, b }: { a: number; b: number }) => a + b);
    const combined = combine({ a, b }, transform);
    expect(combined.value).toBe(3);
    expect(combined.value).toBe(3);
    expect(transform).toHaveBeenCalledTimes(2);
  });

  test("recomputes after subscribing when an input changed while unsubscribed", () => {
    const a = new ReactiveValue(1);
    const b = new ReactiveValue(2);
    const combined = combine({ a, b }, ({ a, b }) => a + b);
    expect(combined.value).toBe(3);
    a.value = 10;
    combined.subscribe(vi.fn());
    expect(combined.value).toBe(12);
  });

  describe("unsubscribe", () => {
    test("stays subscribed to its inputs while other subscribers remain", () => {
      const a = new ReactiveValue(1);
      const combined = combine({ a });
      const first = vi.fn();
      const second = vi.fn();
      const unsubscribeFirst = combined.subscribe(first);
      combined.subscribe(second);
      unsubscribeFirst();
      a.value = 2;
      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledTimes(1);
    });

    test("unsubscribes from its inputs when the last subscriber is removed", () => {
      const a = new ReactiveValue(1);
      const b = new ReactiveValue(2);
      const unsubscribeA = vi.spyOn(a, "unsubscribe");
      const unsubscribeB = vi.spyOn(b, "unsubscribe");
      const combined = combine({ a, b });
      const unsubscribe = combined.subscribe(vi.fn());
      expect(unsubscribeA).not.toHaveBeenCalled();
      unsubscribe();
      expect(unsubscribeA).toHaveBeenCalledTimes(1);
      expect(unsubscribeB).toHaveBeenCalledTimes(1);
    });

    test("unsubscribes from its inputs when the signal is aborted", () => {
      const a = new ReactiveValue(1);
      const unsubscribeA = vi.spyOn(a, "unsubscribe");
      const combined = combine({ a });
      const controller = new AbortController();
      const subscriber = vi.fn();
      combined.subscribe(subscriber, controller.signal);
      controller.abort();
      a.value = 2;
      expect(subscriber).not.toHaveBeenCalled();
      expect(unsubscribeA).toHaveBeenCalledTimes(1);
    });
  });

  describe("disconnect", () => {
    test("removes all subscribers and unsubscribes from its inputs", () => {
      const a = new ReactiveValue(1);
      const b = new ReactiveValue(2);
      const unsubscribeA = vi.spyOn(a, "unsubscribe");
      const unsubscribeB = vi.spyOn(b, "unsubscribe");
      const combined = combine({ a, b });
      const subscriber = vi.fn();
      combined.subscribe(subscriber);
      combined.subscribe(vi.fn());
      combined.disconnect();
      a.value = 10;
      b.value = 20;
      expect(subscriber).not.toHaveBeenCalled();
      expect(unsubscribeA).toHaveBeenCalledTimes(1);
      expect(unsubscribeB).toHaveBeenCalledTimes(1);
    });
  });
});

describe("combine", () => {
  test("returns a Combined instance", () => {
    const a = reactive(1);
    const b = reactive(2);
    const combined = combine({ a, b });
    expect(combined).toBeInstanceOf(Combined);
  });

  test("accepts an optional transform function", () => {
    const a = reactive(1);
    const b = reactive(2);
    const sum = combine({ a, b }, ({ a, b }) => a + b);
    expect(sum.value).toBe(3);

    a.value = 10;
    expect(sum.value).toBe(12);
  });

  test("transform function receives updated values", () => {
    const firstName = reactive("John");
    const lastName = reactive("Doe");
    const fullName = combine(
      { firstName, lastName },
      ({ firstName, lastName }) => `${firstName} ${lastName}`,
    );

    expect(fullName.value).toBe("John Doe");

    firstName.value = "Jane";
    expect(fullName.value).toBe("Jane Doe");

    lastName.value = "Smith";
    expect(fullName.value).toBe("Jane Smith");
  });

  test("notifies subscribers when transform result changes", () => {
    const a = reactive(1);
    const b = reactive(2);
    const sum = combine({ a, b }, ({ a, b }) => a + b);
    const subscriber = vi.fn();
    sum.subscribe(subscriber);

    a.value = 10;
    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(sum.value).toBe(12);
  });
});
