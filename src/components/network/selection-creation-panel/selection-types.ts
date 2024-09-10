/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export enum SELECTION_TYPES {
    FILTER = 'FILTER',
    CONTIGENCY_LIST = 'CONTIGENCY_LIST',
    NAD = 'NAD',
}

export function selectionTypeToLabel(selectionType: SELECTION_TYPES) {
    switch (selectionType) {
        case SELECTION_TYPES.CONTIGENCY_LIST:
            return 'ContingencyLists';
        case SELECTION_TYPES.FILTER:
            return 'filter';
        case SELECTION_TYPES.NAD:
            return 'NetworkAreaDiagram';
    }
}
