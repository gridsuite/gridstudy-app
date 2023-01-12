import EventEmitter from 'eventemitter3';

const eventCenter = new EventEmitter();

export const PlotEvents = {
    ON_RELAYOUT: 'onRelayout',
};
export { eventCenter };
