export interface ReactiveCapabilityCurvePoints {
    p?: number | null;
    maxQ?: number | null;
    minQ?: number | null;
}

export interface MinMaxReactiveLimitsFormInfos {
    minQ?: number | null;
    maxQ?: number | null;
}

export type ReactiveCapabilityCurve = { maxQ: number; minQ: number; p: number }[] | null | undefined;
