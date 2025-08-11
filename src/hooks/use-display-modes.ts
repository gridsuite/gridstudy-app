/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setToggleOptions, setModificationsDrawerOpen } from '../redux/actions';
import { StudyDisplayMode } from '../components/network-modification.type';
import { AppState } from '../redux/reducer';

export function useDisplayModes() {
    const dispatch = useDispatch();
    const toggleOptions = useSelector((state: AppState) => state.toggleOptions);
    const [displayModes, setDisplayModes] = useState<string[]>(toggleOptions);
    const prevViewModesRef = useRef<string[]>(toggleOptions);

    const isEmptySelection = useCallback((modes: string[]) => modes.length === 0, []);

    const isGridOnlyToGridAndModifications = useCallback(
        (prev: string[], next: string[]) =>
            prev.length === 1 &&
            prev.includes(StudyDisplayMode.DIAGRAM_GRID_LAYOUT) &&
            next.includes(StudyDisplayMode.MODIFICATIONS) &&
            next.includes(StudyDisplayMode.DIAGRAM_GRID_LAYOUT) &&
            next.length === 2,
        []
    );

    const isAllOptionsSelectedToGridOnly = useCallback(
        (next: string[]) =>
            !next.includes(StudyDisplayMode.TREE) &&
            next.includes(StudyDisplayMode.MODIFICATIONS) &&
            next.includes(StudyDisplayMode.DIAGRAM_GRID_LAYOUT),
        []
    );

    const isModificationsSelectedAlone = useCallback(
        (next: string[]) =>
            !next.includes(StudyDisplayMode.TREE) &&
            next.includes(StudyDisplayMode.MODIFICATIONS) &&
            !next.includes(StudyDisplayMode.DIAGRAM_GRID_LAYOUT),
        []
    );

    const applyModes = useCallback(
        (modes: string[]) => {
            dispatch(setToggleOptions(modes));
            setDisplayModes(modes);
            prevViewModesRef.current = modes;
        },
        [dispatch]
    );

    const openModifications = useCallback(
        (modes: string[]) => {
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
        (_event: React.MouseEvent, newModes: string[]) => {
            if (isEmptySelection(newModes) || isModificationsSelectedAlone(newModes)) {
                return;
            }

            if (isGridOnlyToGridAndModifications(prevViewModesRef.current, newModes)) {
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
            isEmptySelection,
            isModificationsSelectedAlone,
            isGridOnlyToGridAndModifications,
            isAllOptionsSelectedToGridOnly,
            openModifications,
            applyModes,
            handleGridOnlyToGridAndModifications,
            handleAllOptionsSelectedToGridOnly,
        ]
    );

    return {
        displayModes,
        onViewModeChange,
        applyModes,
    };
}
