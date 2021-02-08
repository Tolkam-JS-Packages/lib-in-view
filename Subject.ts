/**
 * Wrapper for tracking (child) element
 */
export default class Subject {

    // TODO: add more helper methods for common child element operations

    /**
     * @param {HTMLElement} element
     */
    public constructor(public readonly element: HTMLElement) {}

    /**
     * Gets top offset relative to viewport
     *
     * @return {number}
     */
    public top(): number {
        return getRect(this.element).top;
    }

    /**
     * Gets left offset relative to viewport
     *
     * @return {number}
     */
    public left(): number {
        return getRect(this.element).left;
    }

    /**
     * Gets right offset relative to viewport
     *
     * @return {number}
     */
    public right(): number {
        return getRect(this.element).right;
    }

    /**
     * Gets bottom offset relative to viewport
     *
     * @return {number}
     */
    public bottom(): number {
        return getRect(this.element).bottom;
    }

    /**
     * Checks if rendered on screen
     *
     * @return {boolean}
     */
    public isRendered(): boolean {
        const el = this.element;
        return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    }

    /**
     * Gets height
     *
     * @param  {boolean} withMargins
     * @return {number}
     */
    public height(withMargins?: boolean): number {
        const element = this.element;
        let computed;
        let height = getRect(element).height;

        if(withMargins) {
            computed = getComputedStyle(element);
            height += parseInt(computed.marginTop || '0', 10);
            height += parseInt(computed.marginBottom || '0', 10);
        }

        return height;
    }

    /**
     * Gets width
     *
     * @param  {boolean} withMargins
     * @return {number}
     */
    public width(withMargins?: boolean): number {
        const element = this.element;
        let computed;
        let width = getRect(element).width;

        if(withMargins) {
            computed = getComputedStyle(element);
            width += parseInt(computed.marginLeft || '0', 10);
            width += parseInt(computed.marginRight || '0', 10);
        }

        return width;
    }
}

/**
 * Gets ClientRect
 * @param {HTMLElement} element
 */
function getRect(element: HTMLElement) {
    return element.getBoundingClientRect();
}

export interface ISubject extends Subject {}
