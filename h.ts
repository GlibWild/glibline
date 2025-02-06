import { ElementAttrs, ChildElement } from "./type";

export function h(
  tag: string,
  attrs: ElementAttrs,
  ...args: [ChildElement[]] | ChildElement[]
): HTMLElement {
  const element = document.createElement(tag);

  for (let key in attrs) {
    if (key.startsWith("on") && typeof attrs[key] === "function") {
      element.addEventListener(key.substring(2).toLowerCase(), attrs[key]);
    } else {
      element.setAttribute(key, attrs[key]);
    }
  }
  if (args.length === 1) {
    if (
      args[0] instanceof HTMLElement ||
      args[0] instanceof Node ||
      typeof args[0] === "string"
    ) {
      args.forEach((child) => {
        if (typeof child === "string") {
          element.appendChild(document.createTextNode(child));
        } else {
          element.appendChild(child);
        }
      });
    } else {
      const children = args[0] as ChildElement[];
      children.forEach((child) => {
        if (typeof child === "string") {
          element.appendChild(document.createTextNode(child));
        } else {
          element.appendChild(child);
        }
      });
    }
  } else if (args.length > 1) {
    args.forEach((child) => {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
  }
  return element;
}
