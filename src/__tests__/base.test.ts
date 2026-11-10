import { describe, expect, test, vi } from "vitest";
import { Computed } from "../base";
import { ReactiveValue } from "../value";
import { ReactiveArray } from "../array";

describe("BaseReactive", () => {
  describe("subscribe", () => {
    test("unsubscribes when the signal is aborted", () => {
      const r = new ReactiveValue(1);
      const controller = new AbortController();
      const subscriber = vi.fn();
      r.subscribe(subscriber, controller.signal);
      r.value = 2;
      expect(subscriber).toHaveBeenCalledTimes(1);

      controller.abort();
      r.value = 3;
      expect(subscriber).toHaveBeenCalledTimes(1);
    });

    test("does not subscribe when the signal is already aborted", () => {
      const r = new ReactiveValue(1);
      const controller = new AbortController();
      controller.abort();
      const subscriber = vi.fn();
      const unsubscribe = r.subscribe(subscriber, controller.signal);
      r.value = 2;
      expect(subscriber).not.toHaveBeenCalled();
      expect(unsubscribe()).toBe(false);
    });

    test("subscribes the same callback with more than one signal", () => {
      const r = new ReactiveValue(0);
      const first = new AbortController();
      const second = new AbortController();
      const subscriber = vi.fn();
      r.subscribe(subscriber, first.signal);
      r.subscribe(subscriber, second.signal);

      first.abort();
      r.value = 1;
      expect(subscriber).not.toHaveBeenCalled();

      r.subscribe(subscriber);
      second.abort();
      r.value = 2;
      expect(subscriber).toHaveBeenCalledTimes(1);
    });
  });

  describe("unsubscribe", () => {
    test("stops listening to the signal", () => {
      const r = new ReactiveValue(0);
      const controller = new AbortController();
      const subscriber = vi.fn();
      const unsubscribe = r.subscribe(subscriber, controller.signal);
      unsubscribe();

      r.subscribe(subscriber);
      controller.abort();
      r.value = 1;
      expect(subscriber).toHaveBeenCalledTimes(1);
    });
  });

  describe("disconnect", () => {
    test("stops listening to the signal", () => {
      const r = new ReactiveValue(0);
      const controller = new AbortController();
      const subscriber = vi.fn();
      r.subscribe(subscriber, controller.signal);
      r.disconnect();

      r.subscribe(subscriber);
      controller.abort();
      r.value = 1;
      expect(subscriber).toHaveBeenCalledTimes(1);
    });
  });
});

describe("Computed", () => {
  test("computes a value from a single input", () => {
    const r = new ReactiveValue(1);
    const computed = new Computed(r, (input) => input + 1);
    expect(computed.value).toBe(2);
    r.value = 3;
    expect(computed.value).toBe(4);
  });

  test("subscribes to a computed value", () => {
    const r = new ReactiveValue(1);
    const computed = new Computed(r, (input) => input % 2);
    const subscriber = vi.fn();
    computed.subscribe(subscriber);
    r.value = 3;
    expect(subscriber).toHaveBeenCalledTimes(1);
  });

  test("does not subscribe to its input when the signal is already aborted", () => {
    const r = new ReactiveValue(1);
    const subscribe = vi.spyOn(r, "subscribe");
    const computed = new Computed(r, (input) => input + 1);
    const controller = new AbortController();
    controller.abort();
    computed.subscribe(vi.fn(), controller.signal);
    expect(subscribe).not.toHaveBeenCalled();
  });

  test("defers the computation until the computed value is read", () => {
    const r = new ReactiveValue(1);
    const transform = vi.fn((value: number) => value + 1);
    const computed = new Computed(r, transform);
    expect(transform).toHaveBeenCalledTimes(0);
    expect(computed.value).toBe(2);
    expect(transform).toHaveBeenCalledTimes(1);
  });

  test("caches the computed value while subscribed", () => {
    const r = new ReactiveValue(1);
    const transform = vi.fn((value: number) => value + 1);
    const computed = new Computed(r, transform);
    computed.subscribe(vi.fn());
    const results = [computed.value, computed.value, computed.value];
    expect(results).toStrictEqual([2, 2, 2]);
    expect(transform).toHaveBeenCalledTimes(1);
  });

  describe("unsubscribe", () => {
    test("stays subscribed to its input while other subscribers remain", () => {
      const r = new ReactiveValue(1);
      const computed = new Computed(r, (input) => input + 1);
      const first = vi.fn();
      const second = vi.fn();
      const unsubscribeFirst = computed.subscribe(first);
      computed.subscribe(second);
      unsubscribeFirst();
      r.value = 2;
      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledTimes(1);
    });

    test("unsubscribes from its input when the last subscriber is removed", () => {
      const r = new ReactiveValue(1);
      const unsubscribeInput = vi.spyOn(r, "unsubscribe");
      const computed = new Computed(r, (input) => input + 1);
      const unsubscribe = computed.subscribe(vi.fn());
      expect(unsubscribeInput).not.toHaveBeenCalled();
      unsubscribe();
      expect(unsubscribeInput).toHaveBeenCalledTimes(1);
    });
  });

  describe("disconnect", () => {
    test("removes all subscribers and unsubscribes from its input", () => {
      const r = new ReactiveValue(1);
      const unsubscribeInput = vi.spyOn(r, "unsubscribe");
      const computed = new Computed(r, (input) => input + 1);
      const subscriber = vi.fn();
      computed.subscribe(subscriber);
      computed.subscribe(vi.fn());
      computed.disconnect();
      r.value = 2;
      expect(subscriber).not.toHaveBeenCalled();
      expect(unsubscribeInput).toHaveBeenCalledTimes(1);
    });
  });

  describe("markAsStale", () => {
    test("notifies subscribers when the recomputed value changes", () => {
      const r = new ReactiveValue(1);
      let factor = 1;
      const computed = new Computed(r, (input) => input * factor);
      const subscriber = vi.fn();
      computed.subscribe(subscriber);
      expect(computed.value).toBe(1);
      factor = 2;
      computed.markAsStale();
      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(computed.value).toBe(2);
    });

    test("does not notify when the recomputed value is unchanged", () => {
      const r = new ReactiveValue(1);
      const transform = vi.fn((value: number) => value + 1);
      const computed = new Computed(r, transform);
      const subscriber = vi.fn();
      computed.subscribe(subscriber);
      expect(computed.value).toBe(2);
      computed.markAsStale();
      expect(subscriber).not.toHaveBeenCalled();
      expect(transform).toHaveBeenCalledTimes(2);
    });

    test("does not recompute when unsubscribed", () => {
      const r = new ReactiveValue(1);
      const transform = vi.fn((value: number) => value + 1);
      const computed = new Computed(r, transform);
      computed.markAsStale();
      expect(transform).not.toHaveBeenCalled();
    });
  });

  describe("unsubscribed", () => {
    test("recomputes on every read", () => {
      const r = new ReactiveValue(1);
      const transform = vi.fn((value: number) => value + 1);
      const computed = new Computed(r, transform);
      expect(computed.value).toBe(2);
      expect(computed.value).toBe(2);
      expect(transform).toHaveBeenCalledTimes(2);
    });

    test("reflects in-place mutations of the input", () => {
      const items = new ReactiveArray([1, 2]);
      const count = new Computed(items, (list) => list.length);
      expect(count.value).toBe(2);
      items.push(3);
      expect(count.value).toBe(3);
    });

    test("keeps chained computed values fresh", () => {
      const items = new ReactiveArray([1, 2]);
      const count = new Computed(items, (list) => list.length);
      const label = new Computed(count, (value) => `${value} items`);
      expect(label.value).toBe("2 items");
      items.push(3);
      expect(label.value).toBe("3 items");
    });

    test("recomputes when resubscribed after a change", () => {
      const r = new ReactiveValue(1);
      const computed = new Computed(r, (value) => value + 1);
      const unsubscribe = computed.subscribe(vi.fn());
      expect(computed.value).toBe(2);
      unsubscribe();
      r.value = 5;
      computed.subscribe(vi.fn());
      expect(computed.value).toBe(6);
    });
  });
});
