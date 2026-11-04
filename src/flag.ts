import { ReactiveValue } from "./value";

export class ReactiveFlag extends ReactiveValue<boolean> {
  on() {
    this.value = true;
  }

  off() {
    this.value = false;
  }

  toggle() {
    this.value = !this.value;
  }
}

export function flag(initialValue: boolean) {
  return new ReactiveFlag(initialValue);
}
