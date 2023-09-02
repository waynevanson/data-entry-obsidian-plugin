export type UISchema = Structure;

export type Structure =
  | Component
  | {
      $ref: string;
      array: Structure;
      [k: string]: unknown;
    };

export type Component =
  | {
      string: StringComponent;
    }
  | {
      number: NumberComponent;
    }
  | {
      boolean: BooleanComponent;
    }
  | {
      array: ArrayComponent;
    };

export type StringComponent =
  | {
      text: ElementForNull;
    }
  | {
      textarea: ElementForNull;
    }
  | {
      select: ElementForNull;
    };

export type ElementForNull =
  | {
      $ref: string;
      options?: null;
      [k: string]: unknown;
    }
  | string;

export type NumberComponent = {
  number: ElementForNull;
};

export type BooleanComponent =
  | {
      checkbox: ElementForNull;
    }
  | {
      switch: ElementForNull;
    }
  | {
      toggle: ElementForNull;
    };

export type ArrayComponent = {
  checkbox: ElementForNull;
};