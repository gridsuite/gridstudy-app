export const PAGE_OPTIONS = [25, 100, 500, 1000];

export const DEFAULT_PAGE_COUNT = PAGE_OPTIONS[0];

export const DATA_KEY_TO_SORT_KEY: Record<string, string> = {
    elementId: 'fault.id',
    faultType: 'fault.faultType',
    connectableId: 'connectableId',
    current: 'current',
    limitType: 'limitViolations.limitType',
    limitMin: 'ipMin',
    limitMax: 'ipMax',
    deltaCurrentIpMin: 'deltaCurrentIpMin',
    deltaCurrentIpMax: 'deltaCurrentIpMax',
    shortCircuitPower: 'shortCircuitPower',
};
