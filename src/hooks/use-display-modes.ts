/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setToggleOptions, setModificationsDrawerOpen } from '../redux/actions';
import { StudyDisplayMode } from '../components/network-modification.type';
import { AppState } from '../redux/reducer';

function isEmptySelection(modes: StudyDisplayMode[]) {
    return modes.length === 0;
}

function isGridOnlyToGridAndModifications(prev: StudyDisplayMode[], next: StudyDisplayMode[]) {
    return (
        prev.length === 1 &&
        prev.includes(StudyDisplayMode.DIAGRAM_GRID_LAYOUT) &&
        next.includes(StudyDisplayMode.MODIFICATIONS) &&
        next.includes(StudyDisplayMode.DIAGRAM_GRID_LAYOUT) &&
        next.length === 2
    );
}

function isAllOptionsSelectedToGridOnly(next: StudyDisplayMode[]) {
    return (
        !next.includes(StudyDisplayMode.TREE) &&
        next.includes(StudyDisplayMode.MODIFICATIONS) &&
        next.includes(StudyDisplayMode.DIAGRAM_GRID_LAYOUT)
    );
}

function isModificationsSelectedAlone(next: StudyDisplayMode[]) {
    return (
        !next.includes(StudyDisplayMode.TREE) &&
        next.includes(StudyDisplayMode.MODIFICATIONS) &&
        !next.includes(StudyDisplayMode.DIAGRAM_GRID_LAYOUT)
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

    const openModifications = useCallback(
        (modes: StudyDisplayMode[]) => {
            dispatch(setModificationsDrawerOpen(modes.includes(StudyDisplayMode.MODIFICATIONS)));
        },
        [dispatch]
    );

    const handleAllOptionsSelectedToGridOnly = useCallback(() => {
        applyModes([StudyDisplayMode.DIAGRAM_GRID_LAYOUT]);
    }, [applyModes]);

    const handleGridOnlyToGridAndModifications = useCallback(() => {
        const modes = [StudyDisplayMode.TREE, StudyDisplayMode.MODIFICATIONS, StudyDisplayMode.DIAGRAM_GRID_LAYOUT];
        applyModes(modes);
    }, [applyModes]);

    const onViewModeChange = useCallback(
        (_event: React.MouseEvent, newModes: StudyDisplayMode[]) => {
            if (isEmptySelection(newModes) || isModificationsSelectedAlone(newModes)) {
                return;
            }

            if (isGridOnlyToGridAndModifications(toggleOptions, newModes)) {
                handleGridOnlyToGridAndModifications();
                openModifications(newModes);
                return;
            }

            if (isAllOptionsSelectedToGridOnly(newModes)) {
                handleAllOptionsSelectedToGridOnly();
                return;
            }

            openModifications(newModes);
            applyModes(newModes);
        },
        [
            toggleOptions,
            openModifications,
            applyModes,
            handleGridOnlyToGridAndModifications,
            handleAllOptionsSelectedToGridOnly,
        ]
    );

    return {
        onViewModeChange,
        applyModes,
    };
}
