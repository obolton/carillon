import type { ListChange } from "./types";

export interface ListChangeOperations<T, Moved> {
  remove(item: T, index: number): void;
  detach(item: T, index: number): Moved;
  insert(item: T, index: number): void;
  attach(item: T, index: number, moved: Moved): void;
}

export function applyListChange<T, Moved>(
  change: ListChange<T>,
  operations: ListChangeOperations<T, Moved>,
): void {
  const arrivals: Array<
    | { kind: "insert"; item: T; index: number }
    | { kind: "attach"; item: T; index: number; moved: Moved }
  > = change.added.map((entry) => ({
    kind: "insert",
    item: entry.item,
    index: entry.index,
  }));

  const departures = [
    ...change.removed.map((entry) => ({
      kind: "remove" as const,
      item: entry.item,
      index: entry.index,
    })),
    ...change.moved.map((entry) => ({
      kind: "detach" as const,
      item: entry.item,
      index: entry.from,
      target: entry.index,
    })),
  ];
  departures.sort((left, right) => right.index - left.index);
  for (const departure of departures) {
    if (departure.kind === "remove") {
      operations.remove(departure.item, departure.index);
    } else {
      arrivals.push({
        kind: "attach",
        item: departure.item,
        index: departure.target,
        moved: operations.detach(departure.item, departure.index),
      });
    }
  }

  arrivals.sort((left, right) => left.index - right.index);
  for (const arrival of arrivals) {
    if (arrival.kind === "insert") {
      operations.insert(arrival.item, arrival.index);
    } else {
      operations.attach(arrival.item, arrival.index, arrival.moved);
    }
  }
}
