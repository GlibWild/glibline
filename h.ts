type ElementAttrs = { [key: string]: any };
type ChildElement = HTMLElement | Node | string;

export function h(tag: string, attrs: ElementAttrs, ...children: ChildElement[]): HTMLElement {
    const element = document.createElement(tag);

    for (let key in attrs) {
        if (key.startsWith('on') && typeof attrs[key] === 'function') {
            element.addEventListener(key.substring(2).toLowerCase(), attrs[key]);
        } else {
            element.setAttribute(key, attrs[key]);
        }
    }

    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else {
            element.appendChild(child);
        }
    });

    return element;
}
