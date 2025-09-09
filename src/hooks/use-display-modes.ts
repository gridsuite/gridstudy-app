/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setToggleOptions } from '../redux/actions';
import { StudyDisplayMode } from '../components/network-modification.type';
import { AppState } from '../redux/reducer';

function isEmptySelection(modes: StudyDisplayMode[]) {
    return modes.length === 0;
}

function isGridOnlyToGridAndModifications(prev: StudyDisplayMode[], next: StudyDisplayMode[]) {
    return (
        prev.length === 1 &&
        prev.includes(StudyDisplayMode.GRID_LAYOUT_PANEL) &&
        (next.includes(StudyDisplayMode.MODIFICATIONS) || next.includes(StudyDisplayMode.EVENT_SCENARIO)) &&
        next.includes(StudyDisplayMode.GRID_LAYOUT_PANEL) &&
        next.length === 2
    );
}

function isAllOptionsSelectedToGridOnly(next: StudyDisplayMode[]) {
    return (
        !next.includes(StudyDisplayMode.TREE) &&
        (next.includes(StudyDisplayMode.MODIFICATIONS) || next.includes(StudyDisplayMode.EVENT_SCENARIO)) &&
        next.includes(StudyDisplayMode.GRID_LAYOUT_PANEL)
    );
}

function isModificationsSelectedAlone(next: StudyDisplayMode[]) {
    return (
        !next.includes(StudyDisplayMode.TREE) &&
        (next.includes(StudyDisplayMode.MODIFICATIONS) || next.includes(StudyDisplayMode.EVENT_SCENARIO)) &&
        !next.includes(StudyDisplayMode.GRID_LAYOUT_PANEL)
    );
}

export function useDisplayModes() {
    const dispatch = useDispatch();
    const toggleOptions = useSelector((state: AppState) => state.toggleOptions);

    const applyModes = useCallback(
        (modes: StudyDisplayMode[]) => {
            dispatch(setToggleOptions(modes));
        },
        [dispatch]
    );

    const handleAllOptionsSelectedToGridOnly = useCallback(() => {
        applyModes([StudyDisplayMode.GRID_LAYOUT_PANEL]);
    }, [applyModes]);

    const handleGridOnlyToGridAndModifications = useCallback(
        (filteredModes: StudyDisplayMode[]) => {
            const { TREE, MODIFICATIONS, EVENT_SCENARIO, GRID_LAYOUT_PANEL } = StudyDisplayMode;
            applyModes([
                TREE,
                filteredModes.includes(MODIFICATIONS) ? MODIFICATIONS : EVENT_SCENARIO,
                GRID_LAYOUT_PANEL,
            ]);
        },
        [applyModes]
    );

    function ensureMutualExclusion(modes: StudyDisplayMode[], previousModes: StudyDisplayMode[]): StudyDisplayMode[] {
        const hasModifications = modes.includes(StudyDisplayMode.MODIFICATIONS);
        const hasEventScenario = modes.includes(StudyDisplayMode.EVENT_SCENARIO);

        // If both are selected, determine which one was just clicked
        if (hasModifications && hasEventScenario) {
            const hadModifications = previousModes.includes(StudyDisplayMode.MODIFICATIONS);
            const hadEventScenario = previousModes.includes(StudyDisplayMode.EVENT_SCENARIO);

            // If MODIFICATIONS was just clicked (wasn't there before), remove EVENT_SCENARIO
            if (!hadModifications && hadEventScenario) {
                return modes.filter((mode) => mode !== StudyDisplayMode.EVENT_SCENARIO);
            }

            // If EVENT_SCENARIO was just clicked (wasn't there before), remove MODIFICATIONS
            if (!hadEventScenario && hadModifications) {
                return modes.filter((mode) => mode !== StudyDisplayMode.MODIFICATIONS);
            }
        }

        return modes;
    }

    const onViewModeChange = useCallback(
        (_event: React.MouseEvent, newModes: StudyDisplayMode[]) => {
            const filteredModes = ensureMutualExclusion(newModes, toggleOptions);

            if (isEmptySelection(filteredModes) || isModificationsSelectedAlone(filteredModes)) {
                return;
            }

            if (isGridOnlyToGridAndModifications(toggleOptions, filteredModes)) {
                handleGridOnlyToGridAndModifications(filteredModes);
                return;
            }

            if (isAllOptionsSelectedToGridOnly(filteredModes)) {
                handleAllOptionsSelectedToGridOnly();
                return;
            }
            applyModes(filteredModes);
        },
        [toggleOptions, applyModes, handleGridOnlyToGridAndModifications, handleAllOptionsSelectedToGridOnly]
    );

    return {
        onViewModeChange,
        applyModes,
    };
}
