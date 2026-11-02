/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import type { NetworkAreaDiagram } from '../../../grid-layout/cards/diagrams/diagram.type';
import type { DiagramConfigPosition } from '../../../../services/explore';
import { getShownVoltageLevelIds, getSvgVoltageLevelIds } from './nad-diagram-utils';

export enum NadEditType {
    MOVE_NODE = 'move-node',
    MOVE_LABEL = 'move-label',
    ADD_VOLTAGE_LEVEL = 'add-voltage-level',
    ADD_FROM_FILTER = 'add-from-filter',
    EXPAND = 'expand',
    EXPAND_ALL = 'expand-all',
    HIDE = 'hide',
    APPLY_FILTER = 'apply-filter',
    REMOVE_FILTER = 'remove-filter',
}

// Filter names label the edit in the history
export type NadEdit =
    | {
          type: NadEditType.MOVE_NODE | NadEditType.MOVE_LABEL;
          voltageLevelId: string;
          position: Partial<DiagramConfigPosition>;
      }
    | { type: NadEditType.ADD_VOLTAGE_LEVEL | NadEditType.EXPAND | NadEditType.HIDE; voltageLevelId: string }
    | { type: NadEditType.EXPAND_ALL }
    | { type: NadEditType.ADD_FROM_FILTER | NadEditType.APPLY_FILTER; filterUuid: UUID; filterName: string }
    | { type: NadEditType.REMOVE_FILTER; filterName: string };

// None when the edit changes nothing
export const applyEdit = (diagram: NetworkAreaDiagram, edit: NadEdit): Partial<NetworkAreaDiagram> | undefined => {
    const { svg, voltageLevelIds, voltageLevelToExpandIds, voltageLevelToOmitIds, filterUuid, positions } = diagram;
    switch (edit.type) {
        case NadEditType.MOVE_NODE:
        case NadEditType.MOVE_LABEL:
            return {
                positions: positions.map((position) =>
                    position.voltageLevelId === edit.voltageLevelId ? { ...position, ...edit.position } : position
                ),
            };
        case NadEditType.ADD_VOLTAGE_LEVEL:
            if (voltageLevelIds.includes(edit.voltageLevelId)) {
                return undefined;
            }
            return {
                voltageLevelIds: [...voltageLevelIds, edit.voltageLevelId],
                voltageLevelToOmitIds: voltageLevelToOmitIds.filter((id) => id !== edit.voltageLevelId),
            };
        case NadEditType.ADD_FROM_FILTER:
            return { filterToAddUuid: edit.filterUuid };
        case NadEditType.EXPAND:
            return {
                voltageLevelIds: voltageLevelIds.filter((id) => id !== edit.voltageLevelId),
                voltageLevelToExpandIds: [...voltageLevelToExpandIds, edit.voltageLevelId],
            };
        case NadEditType.EXPAND_ALL:
            return { voltageLevelToExpandIds: getSvgVoltageLevelIds(svg) };
        case NadEditType.HIDE:
            return {
                voltageLevelIds: voltageLevelIds.filter((id) => id !== edit.voltageLevelId),
                voltageLevelToOmitIds: [...voltageLevelToOmitIds, edit.voltageLevelId],
            };
        case NadEditType.APPLY_FILTER:
            if (edit.filterUuid === filterUuid) {
                return undefined;
            }
            // Like a NAD loaded from the filter
            return {
                filterUuid: edit.filterUuid,
                filterName: edit.filterName,
                voltageLevelIds: [],
                voltageLevelToOmitIds: [],
            };
        case NadEditType.REMOVE_FILTER:
            return { filterUuid: undefined, filterName: undefined, voltageLevelIds: getShownVoltageLevelIds(diagram) };
    }
};
