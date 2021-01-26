import Context, { IContext, TEventHandler } from './Context';
import Subject, { ISubject } from './Subject';

/**
 * Class for tracking element visibility relative to it's scrolling parent
 *
 */
export default class InView {

    /**
     * Context instance
     * @type {Context}
     */
    public readonly context: Context;

    /**
     * Subject instance
     * @type {Subject}
     */
    public readonly subject: Subject;

    /**
     * Options
     * @type {IOptions}
     */
    protected options: IOptions;

    /**
     * Context events callback
     * @type {ICallback}
     */
    protected callback: ICallback;

    /**
     * @param {HTMLElement} element
     * @param {ICallback}   callback
     * @param {IOptions}    options
     */
    public constructor(
        element: HTMLElement,
        callback: ICallback,
        options: IOptions = {}
    ) {
        // default options
        options = this.options = {
            windowEvents: ['DOMContentLoaded', 'resize'],
            offset: {},
            offsetPercentageMode: 'parent',
            ...options,
        };

        this.validateOptions(options);

        this.callback = callback;
        this.subject = new Subject(element);
        this.context = new Context(options.context || element.ownerDocument!);

        // start listening by default
        this.context.listen(this.eventsHandler, options.windowEvents);
    }

    /**
     * Forces recalculation
     *
     * @return {void}
     */
    public recalculate = () => {
        this.eventsHandler();
    };

    /**
     * Stops listening of context events
     *
     */
    public stop() {
        this.context.unlisten(this.eventsHandler);
    }

    /**
     * Handles context events
     */
    protected eventsHandler = () => {
        const { context, options, getSubjectPosition } = this;

        // stop if scrolled less than defined minimum pixels
        const scrollAmount = options.scrollAmount || {top: 0, left: 0};
        const scrollTopDiff = Math.abs(context.scrollTopDiff());
        const scrollLeftDiff = Math.abs(context.scrollLeftDiff());

        if (
            (scrollTopDiff > 0 && scrollTopDiff <= scrollAmount.top!)
            || (scrollLeftDiff > 0 && scrollLeftDiff <= scrollAmount.left!)
        ) {
            return;
        }

        const parentHeight = context.innerHeight();
        const parentWidth = context.innerWidth();
        // const parentScrollTop = context.scrollTop();
        // const parentScrollLeft = context.scrollLeft();

        const parentTop = context.top();
        const parentLeft = context.left();
        const parentBottom = parentTop + parentHeight;
        const parentRight = parentLeft + parentWidth;

        const childTop = getSubjectPosition('top');
        const childLeft = getSubjectPosition('left');
        const childBottom = getSubjectPosition('bottom');
        const childRight = getSubjectPosition('right');

        const topVisible = childTop >= parentTop && childTop < parentBottom;
        const bottomVisible = childBottom < parentBottom && childBottom >= parentTop;
        const leftVisible = childLeft >= parentLeft && childLeft < parentRight;
        const rightVisible = childRight <= parentRight && childRight >= parentLeft;
        const overflowY = childTop <= parentTop && childBottom >= parentBottom;
        const overflowX = childLeft <= parentLeft && childRight >= parentRight;

        const visibility = {
            visible: (topVisible || bottomVisible || overflowY) && (leftVisible || rightVisible || overflowX),
            topLeft: topVisible && leftVisible,
            topRight: topVisible && rightVisible,
            bottomLeft: bottomVisible && leftVisible,
            bottomRight: bottomVisible && rightVisible,
        };

        this.callback(visibility);
    };

    /**
     * Gets subject position with offset
     *
     * @param {"top" | "left" | "right" | "bottom"} position
     * @return {number}
     */
    protected getSubjectPosition = (position: 'top' | 'left' | 'right' | 'bottom'): number => {
        const that = this;
        const { subject, context, options } = that;
        const offset = options.offset!;
        const value = subject[position]();
        const positionOffset = offset[position];
        const sign = position === 'top' || position === 'left' ? 1 : -1;
        let result = value;

        if (!positionOffset) {
            return result;
        }

        if (typeof positionOffset === 'number') {
            result += positionOffset * sign;
        } else if (typeof positionOffset === 'function') {
            result += positionOffset.call(that, subject, context) * sign;
        } else {
            let dimension: number;
            const dimProp = position === 'top' || position === 'bottom' ? 'height' : 'width';
            if(options.offsetPercentageMode === 'parent') {
                dimension = context['inner' + (dimProp.charAt(0).toUpperCase() + dimProp.substr(1))]();
            } else {
                dimension = subject[dimProp]();
            }

            result += dimension / 100 * (parseInt(positionOffset, 10) * sign);
        }

        return Math.floor(result);
    };

    /**
     * Validates instance options
     *
     * @param {IOptions} options
     */
    protected validateOptions(options: IOptions) {
        const offset = options.offset!;
        for (const k in offset) {
            const v = offset[k];

            // check string offset
            if (typeof v === 'string' && v.lastIndexOf('%') !== v.length - 1) {
                throw new TypeError('String offset value must be percentage, e.g. "50%"');
            }
        }
    }
}

export interface IOptions {

    // Scrolling parent element, defaults to window
    context?: HTMLElement;

    // window events to listen to besides context's scroll event
    windowEvents?: string[];

    // Subject element detection offset
    offset?: IOffset;

    // element to get dimension from,  when offset is set in percents
    offsetPercentageMode?: TPercentageMode;

    // minimum scrolled pixels to consider as change
    scrollAmount?: IScrollAmount;
}

export interface IVisibility {
    visible: boolean;
    topLeft: boolean;
    topRight: boolean;
    bottomLeft: boolean;
    bottomRight: boolean;
}

export type ICallback = (visibility: IVisibility) => void;

export type TPercentageMode = 'parent' | 'self';

// returned number must be negative to increase virtual element size and expand its bounds (visible earlier),
// or positive to decrease (visible later)
export type TOffset = number|string|((subject: Subject, context: Context) => number);

export interface IOffset {
    top?: TOffset;
    left?: TOffset;
    right?: TOffset;
    bottom?: TOffset;
}

export interface IScrollAmount {
    top?: number;
    left?: number;
}

export { ISubject, IContext };
