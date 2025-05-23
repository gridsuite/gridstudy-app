/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { useEffect } from 'react';
import { Layouts } from 'react-grid-layout';
import {
    loadDiagramsGridLayoutFromSessionStorage,
    syncDiagramsGridLayoutWithSessionStorage,
} from 'redux/session-storage/diagram-grid-layout';

const keyToKeepInSessionStorage = ['i', 'x', 'y', 'h', 'w']; // static

type useDiagramsGridLayoutSessionStorageProps = {
    layouts: Layouts;
    onLoadFromSessionStorage: (layout: Layouts) => void;
};

export const useDiagramsGridLayoutSessionStorage = ({
    layouts,
    onLoadFromSessionStorage,
}: useDiagramsGridLayoutSessionStorageProps) => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    // at mount
    useEffect(() => {
        if (!studyUuid) {
            return;
        }
        onLoadFromSessionStorage(loadDiagramsGridLayoutFromSessionStorage(studyUuid));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // at update
    useEffect(() => {
        if (!studyUuid) {
            return;
        }
        if (!layouts) {
            return;
        }
        syncDiagramsGridLayoutWithSessionStorage(
            Object.fromEntries(
                Object.entries(layouts).map(([key, layoutArray]) => {
                    return [
                        key,
                        layoutArray
                            .filter((layout) => layout.i !== 'Adder')
                            .map((layout) =>
                                Object.fromEntries(
                                    Object.entries(layout).filter(([key]) => keyToKeepInSessionStorage.includes(key))
                                )
                            ),
                    ];
                })
            ),
            studyUuid
        );
    }, [layouts, studyUuid]);
};
