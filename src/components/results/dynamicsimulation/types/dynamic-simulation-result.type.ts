/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// This type is derived from the {@link com.powsybl.timeseries.TimeSeriesMetadata}
export type TimeSeriesMetadata = {
    name: string;
};

// This type is taken from the {@link com.powsybl.dynamicsimulation.TimelineEvent}
export type TimelineEvent = {
    time: number;
    modelName: string;
    message: string;
};

export type TimelineEventKeyType = keyof TimelineEvent;
