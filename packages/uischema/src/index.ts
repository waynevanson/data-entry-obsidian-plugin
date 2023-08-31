// import * as sum from './sum';
import { Sum } from './sum';
import { Treeable } from './treeson';
import * as treeable from './treeson';

export type Reference = string;

export interface ElementRef {
  $ref: Reference;
}

export interface Element<A> extends ElementRef {
  options?: A;
}

export type UILeaf = Sum<{
  string: Sum<{
    text: ElementRef;
    textarea: ElementRef;
    select: ElementRef;
  }>;
  number: Sum<{
    slider: ElementRef;
  }>;
  boolean: Sum<{
    switch: ElementRef;
    checkbox: ElementRef;
    toggle: ElementRef;
  }>;
  array: Sum<{
    checkbox: ElementRef;
  }>;
}>;

export interface UIArray {
  array: ElementRef & { items: UI };
}

export type UI = UIArray | UILeaf;

function toTreeable(ui: UI): Treeable<UILeaf> {}
// labels,

// add decoder
// input has optional values eventually.
// use mitosis to create components?

// think about how we will apply state changes
// optics.
// can we just use default values? We only need to keep track of the value when we submit, which we can do as we are in
// a form which will supply us object stuff i think
// nah looks like we need to keep some form state too..
