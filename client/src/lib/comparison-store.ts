// Comparison state management
class ComparisonStore {
  private selectedIds: Set<number> = new Set();
  private listeners: Array<(ids: number[]) => void> = [];

  subscribe(listener: (ids: number[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    const ids = Array.from(this.selectedIds);
    this.listeners.forEach(listener => listener(ids));
  }

  add(id: number) {
    this.selectedIds.add(id);
    this.notify();
  }

  remove(id: number) {
    this.selectedIds.delete(id);
    this.notify();
  }

  toggle(id: number) {
    if (this.selectedIds.has(id)) {
      this.remove(id);
    } else {
      this.add(id);
    }
  }

  clear() {
    this.selectedIds.clear();
    this.notify();
  }

  getSelected(): number[] {
    return Array.from(this.selectedIds);
  }

  hasSelected(id: number): boolean {
    return this.selectedIds.has(id);
  }

  getCount(): number {
    return this.selectedIds.size;
  }
}

export const comparisonStore = new ComparisonStore();