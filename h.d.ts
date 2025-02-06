import { ElementAttrs, ChildElement } from "./type";

export declare function h(
  tag: string,
  attrs: ElementAttrs,
  ...children: ChildElement[]
): void;

export declare function h(
  tag: string,
  attrs: ElementAttrs,
  children?: ChildElement[]
): void;
