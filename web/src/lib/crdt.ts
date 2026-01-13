export type Position = {
  index: number[];
  siteId: string;
  clock: number;
};

export class CharacterMeta {
  isDeleted: boolean = false;
}

export class Character {
  id: string;
  value: string;
  position: Position;
  meta: CharacterMeta;

  constructor(
    id: string,
    value: string,
    position: Position,
    meta?: CharacterMeta,
  ) {
    this.id = id;
    this.value = value;
    this.position = position;
    this.meta = meta || new CharacterMeta();
  }
}

export type InsertOp = {
  type: "insert";
  charId: string;
  value: string;
  position: Position;
};

export type DeleteOp = {
  type: "delete";
  charId: string;
};

export type CrdtOp = InsertOp | DeleteOp;

export class CRDTInstance {
  private clock = 0;
  private characters = new Map<string, Character>();
  private BASE: number;
  private siteId: string;
  boundary = 10;

  constructor(base: number, siteId: string) {
    this.BASE = base;
    this.siteId = siteId;
  }

  private tick() {
    return ++this.clock;
  }

  private comparePositions(a: Position, b: Position): number {
    const len = Math.min(a.index.length, b.index.length);

    for (let i = 0; i < len; i++) {
      if (a.index[i] !== b.index[i]) {
        return a.index[i] - b.index[i];
      }
    }

    if (a.index.length !== b.index.length) {
      return a.index.length - b.index.length;
    }

    if (a.siteId !== b.siteId) {
      return a.siteId.localeCompare(b.siteId);
    }

    return a.clock - b.clock;
  }

  private generateBefore(index: number[]): number[] {
    if (index[0] <= this.boundary) return [index[0] - 1];
    return [index[0] - this.boundary];
  }

  private generateAfter(index: number[]): number[] {
    return [...index, this.BASE];
  }

  generateBetween(
    prev: Position | null,
    next: Position | null,
    acc: number[] = [],
  ): Position {
    if (!prev && !next) {
      return { index: [this.BASE], siteId: this.siteId, clock: this.tick() };
    }

    if (!prev) {
      return {
        index: this.generateBefore(next!.index),
        siteId: this.siteId,
        clock: this.tick(),
      };
    }

    if (!next) {
      return {
        index: this.generateAfter(prev.index),
        siteId: this.siteId,
        clock: this.tick(),
      };
    }

    let i = 0;
    const head = acc;
    while (
      i < prev.index.length &&
      i < next.index.length &&
      prev.index[i] === next.index[i]
    ) {
      head.push(prev.index[i]);
      i++;
    }

    const prevDigit = prev.index[i] ?? 0;
    const nextDigit = next.index[i] ?? this.BASE;
    const diff = nextDigit - prevDigit;

    if (diff > 1) {
      head.push(prevDigit + Math.floor(diff / 2));
      return { index: head, siteId: this.siteId, clock: this.tick() };
    }

    head.push(prevDigit);
    return this.generateBetween(
      {
        index: prev.index.slice(i + 1),
        siteId: prev.siteId,
        clock: prev.clock,
      },
      {
        index: next.index.slice(i + 1),
        siteId: next.siteId,
        clock: next.clock,
      },
      head,
    );
  }

  private cachedSortedCharacters: Character[] | null = null;
  private cachedOrderedCharacters: Character[] | null = null;
  private cachedText: string | null = null;

  apply(op: CrdtOp) {
    this.cachedOrderedCharacters = null;
    this.cachedText = null;
    if (op.type === "insert") {
      this.cachedSortedCharacters = null;
      this.characters.set(
        op.charId,
        new Character(op.charId, op.value, op.position),
      );
    }

    if (op.type === "delete") {
      const c = this.characters.get(op.charId);
      if (c) c.meta.isDeleted = true;
    }
  }

  extractText(): string {
    if (this.cachedText) return this.cachedText;
    this.cachedText = this.getOrderedCharacters()
      .map((c) => c.value)
      .join("");
    return this.cachedText;
  }

  getSortedCharacters(): Character[] {
    if (this.cachedSortedCharacters) return this.cachedSortedCharacters;
    this.cachedSortedCharacters = [...this.characters.values()].sort((a, b) =>
      this.comparePositions(a.position, b.position),
    );
    return this.cachedSortedCharacters;
  }

  getOrderedCharacters(): Character[] {
    if (this.cachedOrderedCharacters) return this.cachedOrderedCharacters;
    this.cachedOrderedCharacters = this.getSortedCharacters().filter(
      (c) => !c.meta.isDeleted,
    );
    return this.cachedOrderedCharacters;
  }

  getRelativeIndex(charId: string): number {
    const chars = this.getSortedCharacters();
    let index = 0;
    for (const c of chars) {
      if (c.id === charId) return index;
      if (!c.meta.isDeleted) index++;
    }
    return -1;
  }
}
