/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import type { NetworkAreaDiagram } from '../../../grid-layout/cards/diagrams/diagram.type';
import type { DiagramConfigPosition } from '../../../../services/explore';
import type { NadEdit } from './nad-edits';

// Kept besides the initial state: 9 to go back to and the current one
const MAX_LATEST_STATES = 10;

// What edits change. Its arrays are shared with the diagram, never copied.
type NadSnapshot = Pick<
    NetworkAreaDiagram,
    'voltageLevelIds' | 'voltageLevelToOmitIds' | 'filterUuid' | 'filterName' | 'positions'
>;

// A state is labelled by the edit that led to it, none for the initial one. Its snapshot is taken when it is left.
type NadHistoryState = {
    snapshot?: NadSnapshot;
    edit?: NadEdit;
};

export type NadHistory = {
    states: NadHistoryState[];
    index: number;
    // States were dropped between the initial state and the next one kept
    hasDroppedStates: boolean;
};

export type NadHistoryAction = 'undo' | 'redo';

const EMPTY_NAD_HISTORY: NadHistory = { states: [{}], index: 0, hasDroppedStates: false };

// Not the whole diagram: its drawing would stay in memory
const toNadSnapshot = ({
    voltageLevelIds,
    voltageLevelToOmitIds,
    filterUuid,
    filterName,
    positions,
}: NadSnapshot): NadSnapshot => ({
    voltageLevelIds,
    voltageLevelToOmitIds,
    filterUuid,
    filterName,
    positions,
});

const sameIds = (a: string[], b: string[]) => a === b || (a.length === b.length && a.every((id, i) => id === b[i]));

// Going from one to the other only moves nodes and labels: the viewer can do it without the diagram being drawn again
export const isLayoutOnlyChange = (from: NadSnapshot, to: NadSnapshot) =>
    sameIds(from.voltageLevelIds, to.voltageLevelIds) &&
    sameIds(from.voltageLevelToOmitIds, to.voltageLevelToOmitIds) &&
    from.filterUuid === to.filterUuid;

// Positions keep their order and are only appended to, so they can be compared by index
export const changedPositions = (from: DiagramConfigPosition[], to: DiagramConfigPosition[]) =>
    to.filter((position, index) => position !== from[index]);

export const historyTargets = ({ states, index }: NadHistory, action: NadHistoryAction) => {
    const indexes = states.map((_, i) => i);
    return action === 'undo' ? indexes.slice(0, index).reverse() : indexes.slice(index + 1);
};

// The state the undo or redo button goes to. Going back to the initial state over dropped states would undo several
// edits at once: it is only done from the list.
export const historyStep = (history: NadHistory, action: NadHistoryAction): number | undefined => {
    const [target] = historyTargets(history, action);
    return action === 'undo' && target === 0 && history.hasDroppedStates ? undefined : target;
};

export const useNadEditHistory = (isEditMode: boolean) => {
    const [history, setHistory] = useState(EMPTY_NAD_HISTORY);

    const recordEdit = useCallback((current: NadSnapshot, edit: NadEdit) => {
        setHistory(({ states, index, hasDroppedStates }) => {
            const pastStates = states.slice(0, index);
            const currentState = { ...states[index], snapshot: toNadSnapshot(current) };
            const newState = { edit };
            const [initialState, ...laterStates] = [...pastStates, currentState, newState];
            const keptStates = [initialState, ...laterStates.slice(-MAX_LATEST_STATES)];
            return {
                states: keptStates,
                index: keptStates.length - 1,
                // Recorded from the initial state, the new state follows it
                hasDroppedStates: (index > 0 && hasDroppedStates) || laterStates.length > MAX_LATEST_STATES,
            };
        });
    }, []);

    const restoreState = useCallback(
        (target: number, current: NadSnapshot) => {
            const { states, index } = history;
            const targetSnapshot = states[target]?.snapshot;
            if (target === index || !targetSnapshot) {
                return undefined;
            }
            const currentState = { ...states[index], snapshot: toNadSnapshot(current) };
            setHistory({ ...history, states: states.with(index, currentState), index: target });
            return targetSnapshot;
        },
        [history]
    );

    const clearHistory = useCallback(() => setHistory(EMPTY_NAD_HISTORY), []);

    useEffect(() => {
        if (!isEditMode) {
            clearHistory();
        }
    }, [isEditMode, clearHistory]);

    return { history, recordEdit, restoreState, clearHistory };
};
