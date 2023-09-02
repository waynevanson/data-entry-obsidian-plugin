export type UISchema = UISchemable;

export type UISchemable =
  | Component
  | {
      $ref: string;
      array: UISchemable;
      [k: string]: unknown;
    };

export type Component = ComponentValue | ComponentLayout;

export type ComponentValue =
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

export type ComponentLayout =
  | {
      label: string;
    }
  | {
      horizontal: UISchemable;
    }
  | {
      vertical: UISchemable;
    };