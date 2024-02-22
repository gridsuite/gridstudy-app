/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const dynamicSimulationResultInvalidations = ['dynamicSimulationResult'];

export type TimeSeriesMetadata = {
    name: string;
};

export type StringTimeSeries = {
    chunks: {
        values: string[];
    }[];
};

export type TimelineEvent = {
    time: number;
    modelName: string;
    message: string;
};

/**
 * Each {@link StringTimeSeries} is corresponding to an array of {@link TimelineEvent}
 *
 * @param src an array of {@link StringTimeSeries}
 * @return an array of {@link TimelineEvent}
 */
export const transformTimeLinesData = (
    src: StringTimeSeries[]
): TimelineEvent[] => {
    return src.flatMap((stringSeries) => {
        const events =
            (stringSeries.chunks && stringSeries.chunks[0].values) ?? [];
        return events.map((event) => JSON.parse(event));
    });
};
