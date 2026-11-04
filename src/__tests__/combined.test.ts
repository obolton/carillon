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
