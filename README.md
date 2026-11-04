# Carillon

Reactive values and collections for TypeScript.

A `carillon` is a musical instrument with a set of bells played together in harmony.

- Explicit subscriptions and `AbortSignal` support for cleanup.
- Derived (`derive`) and combined (`combine`) values that declare their inputs and subscribe to them lazily. No automatic dependency tracking.
- No runtime dependencies. ESM only, with TypeScript types included.

## Installation

```sh
pnpm add carillon
```

Carillon targets ES2025. It runs on Node 22 or later and in current browsers.

## Usage

### Reactive values

```ts
import { reactive } from "carillon";

const count = reactive(0);

const unsubscribe = count.subscribe((r) => {
  console.log(`count is now ${r.value}`);
});

count.value = 1; // logs "count is now 1"
count.value = 1; // unchanged, so no notification
unsubscribe();
```

Pass an `AbortSignal` to tie a subscription to a lifetime:

```ts
const controller = new AbortController();
count.subscribe(onChange, controller.signal);
controller.abort(); // unsubscribes
```

### Derived and combined values

```ts
import { combine, reactive } from "carillon";

const price = reactive(10);
const quantity = reactive(2);

const doubled = price.derive((p) => p * 2);
const total = combine({ price, quantity }, ({ price, quantity }) => price * quantity);

total.subscribe((t) => console.log(`total: ${t.value}`));
quantity.value = 3; // logs "total: 30"
```

### Flags

```ts
import { flag } from "carillon";

const open = flag(false);
open.on();
open.toggle();
open.off();
```

### Arrays

```ts
import { array } from "carillon";

const items = array(["a", "b"]);
items.push("c"); // notifies
items.splice(0, 1); // notifies
items.filter((item) => item !== "b"); // filters in place and notifies
items.replace(["x", "y"]);
items.clear();
```

### Sets

```ts
import { set } from "carillon";

const selected = set<number>();

selected.subscribe((s, change) => {
  console.log("added", change.added, "removed", change.removed);
});

selected.add(1, 2); // added [1, 2]
selected.toggle(1); // removed [1]
selected.replace([2, 3]); // added [3]
```

### Applying list changes

`applyListChange` applies a `ListChange` (removed, added and moved entries) to a target.

```ts
import { applyListChange, type ListChange } from "carillon";

function sync(parent: HTMLElement, change: ListChange<HTMLElement>) {
  const insert = (item: HTMLElement, index: number) => {
    parent.insertBefore(item, parent.children[index] ?? null);
  };
  applyListChange(change, {
    remove: (item) => item.remove(),
    detach: (item) => {
      item.remove();
      return item;
    },
    insert,
    attach: insert,
  });
}
```

### Utilities

```ts
import { isReactive, reactive, unwrap } from "carillon";

isReactive(reactive(1)); // true
unwrap(reactive(reactive("nested"))); // "nested"
unwrap("plain"); // "plain"
```

## API

| Export                                     | Description                                                                       |
| ------------------------------------------ | --------------------------------------------------------------------------------- |
| `reactive(value)` / `ReactiveValue`        | A single mutable value. Notifies when set to a different (`!==`) value.           |
| `flag(value)` / `ReactiveFlag`             | A boolean value with `on()`, `off()` and `toggle()`.                              |
| `array(items)` / `ReactiveArray`           | A mutable array with notifying `push`, `splice`, `filter`, `replace` and `clear`. |
| `set(items?)` / `ReactiveSet`              | A set that notifies with a `SetChange` (`added`, `removed`).                      |
| `combine(inputs, transform?)` / `Combined` | Combines a record of reactives into one value.                                    |
| `Computed`                                 | The result of `derive`. Subscribes to its input lazily.                           |
| `BaseReactive`                             | Abstract base class for custom reactive types.                                    |
| `applyListChange(change, operations)`      | Applies a `ListChange` in a safe order.                                           |
| `isReactive(value)`                        | Type guard for reactives.                                                         |
| `unwrap(value)`                            | Unwraps nested reactives to a plain value.                                        |

## Development

```sh
pnpm install
pnpm check # typecheck, lint, format check, test and build
pnpm build # bundle to dist/
pnpm dev # rebuild on changes
```

## License

[MIT](./LICENSE)
