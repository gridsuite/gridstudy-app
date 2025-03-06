/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export type SegmentInfo = {
    segmentDistanceValue: number;
    segmentTypeValue: string;
    segmentTypeId: string;
    segmentResistance: number;
    segmentReactance: number;
    segmentSusceptance: number;
};

export type LineTypeSegmentFormData = {
    totalResistance: number;
    totalReactance: number;
    totalSusceptance: number;
    segments: SegmentInfo[];
};

// DTO from back-end
export type LineTypeInfo = {
    id: string;
    type: string;
    category: string;
    voltage: number;
    conductorType: string;
    section: number;
    linearResistance: number;
    linearReactance: number;
    linearCapacity: number;
};
