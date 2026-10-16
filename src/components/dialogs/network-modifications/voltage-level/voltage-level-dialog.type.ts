/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export interface BusbarSectionMeasurementV {
    value?: number | null;
    validity?: boolean | null;
}

export interface BusbarSectionFormInfos {
    id: string;
    name?: string;
    vertPos?: number;
    horizPos?: number;
    measurementV?: BusbarSectionMeasurementV | null;
}

export interface BusbarSectionMeasurementFormItem {
    busbarSectionId: string;
    value: number | null;
    validity: boolean | null;
}
