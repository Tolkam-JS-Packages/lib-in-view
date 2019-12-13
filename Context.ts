const DIR_NONE  = 0;
const DIR_UP    = 1;
const DIR_DOWN  = 2;
const DIR_LEFT  = 3;
const DIR_RIGHT = 4;

/**
 * Wrapper for scrolling (parent) element
 */
export default class Context {

    /**
     * Scroll direction constants
     */
    public readonly DIR_NONE = DIR_NONE;
    public readonly DIR_UP = DIR_UP;
    public readonly DIR_DOWN = DIR_DOWN;
    public readonly DIR_LEFT = DIR_LEFT;
    public readonly DIR_RIGHT = DIR_RIGHT;

    /**
     * Last fired event
     * @type {Event}
     */
    public event: Event | null = null;

    /**
     * If element is a document instance flag
     * @type {boolean}
     */
    protected isDoc = true;

    /**
     * Current scroll data
     *
     * @type {object}
     */
    protected scroll = {
        top: 0,
        left: 0,
        topDiff: 0,
        leftDiff: 0,
        dirY: DIR_NONE,
        dirX: DIR_NONE,
    };

    /**
     * Registered defaultView(window) events
     * @type {string[]}
     */
    protected windowEvents: string[] = [];

    /**
     * Bound listener
     * @type {Function}
     */
    protected boundListener: (e: Event) => void;

    /**
     * @param {HTMLElement | Document} element
     */
    public constructor(public readonly element: HTMLElement | Document) {
        this.isDoc = isDoc(element);
        this.populateScroll();
    }

    /**
     * Gets top offset relative to viewport
     *
     * @return {number}
     */
    public top(): number {
        return this.isDoc ? 0 : getRect(this.element as HTMLElement).top;
    }

    /**
     * Gets left offset relative to viewport
     *
     * @return {number}
     */
    public left(): number {
        return this.isDoc ? 0 : getRect(this.element as HTMLElement).left;
    }

    /**
     * Gets scroll amount from top
     *
     * @return {number}
     */
    public scrollTop(): number {
        return this.scroll.top;
    }

    /**
     * Gets scroll amount from left
     *
     * @return {number}
     */
    public scrollLeft(): number {
        return this.scroll.left;
    }

    /**
     * Gets top position difference compared to last event
     *
     * @return {number}
     */
    public scrollTopDiff(): number {
        return this.scroll.topDiff;
    }

    /**
     * Gets left position difference compared to last event
     *
     * @return {number}
     */
    public scrollLeftDiff(): number {
        return this.scroll.leftDiff;
    }

    /**
     * Gets inner height
     *
     * @return {number}
     */
    public innerHeight(): number {
        return getElement(this.element).clientHeight;
    }

    /**
     * Gets inner width
     *
     * @return {number}
     */
    public innerWidth(): number {
        return getElement(this.element).clientWidth;
    }

    /**
     * Gets vertical scroll direction
     *
     * @return {number}
     */
    public get scrollDirY() {
        return this.scroll.dirY;
    }

    /**
     * Gets horizontal scroll direction
     *
     * @return {number}
     */
    public get scrollDirX() {
        return this.scroll.dirX;
    }

    /**
     * Starts listening context events
     *
     * @param {TEventHandler} handler
     * @param {string[]}      windowEvents
     * @return {void}
     */
    public listen(handler: TEventHandler, windowEvents?: string[]): void {
        const that = this;
        const { element } = that;

        that.boundListener = that.listener.bind(that, handler);

        // subscribe to default event
        element.addEventListener('scroll', that.boundListener);

        // subscribe to extra window events
        if (windowEvents) {
            that.windowEvents = windowEvents;
            for (const eventName of windowEvents) {
                getWindow(element).addEventListener(eventName, that.boundListener);
            }
        }
    }

    /**
     * Stops listening context events
     *
     * @param {TEventHandler} handler
     * @return {void}
     */
    public unlisten(handler: TEventHandler): void {
        const that = this;
        const { element, windowEvents } = that;

        element.removeEventListener('scroll', that.boundListener);

        if (windowEvents) {
            for (const eventName of windowEvents) {
                getWindow(element).removeEventListener(eventName, that.boundListener);
            }
        }
    }

    /**
     * Event listener
     *
     * @param {TEventHandler} handler
     * @param {Event}         e
     * @return {void}
     */
    protected listener(handler: TEventHandler, e: Event): void {
        const that = this;

        // store event ref
        that.event = e;

        that.populateScroll();
        handler(e);
    }

    /**
     * Populates scroll position and calculates scroll direction
     *
     * @return {void}
     */
    protected populateScroll = () => {
        const that = this;
        const element = getElement(that.element);
        const { scroll } = that;
        const { scrollTop, scrollLeft } = element;

        scroll.topDiff = scrollTop - scroll.top;
        scroll.leftDiff = scrollLeft - scroll.left;

        scroll.dirY = scrollTop === scroll.top ? DIR_NONE
            : scrollTop > scroll.top ? DIR_DOWN : DIR_UP;

        scroll.dirX = scrollLeft === scroll.left ? DIR_NONE
            : scrollLeft > scroll.left ? DIR_RIGHT : DIR_LEFT;

        scroll.top = scrollTop;
        scroll.left = scrollLeft;
    }
}

/**
 * Checks if element is document
 *
 * @param {Element | Document} element
 */
function isDoc(element: Element | Document): element is Document {
    return element instanceof Document;
}

/**
 * Gets element's window
 *
 * @param  {HTMLElement | Document}  element
 * @return {Window}
 */
function getWindow(element: HTMLElement | Document): Window {
    return isDoc(element) ? element.defaultView! : element.ownerDocument!.defaultView!;
}

/**
 * Gets HTML element
 *
 * @param {HTMLElement | Document} element
 * @return {HTMLElement}
 */
function getElement(element: HTMLElement | Document): HTMLElement {
    return isDoc(element) ? element.documentElement : element;
}


/**
 * Gets BoundingClientRect
 * @param {HTMLElement} element
 */
function getRect(element: HTMLElement) {
    return element.getBoundingClientRect();
}

export type TEventHandler = (e: Event) => void;

export interface IContext extends Context {}
