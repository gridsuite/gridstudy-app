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

type UseDiagramsGridLayoutInitializationProps = {
    onLoadDiagramLayout: (layout: Layouts) => void;
};

export const useDiagramsGridLayoutInitialization = ({
    onLoadDiagramLayout,
}: UseDiagramsGridLayoutInitializationProps) => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const gridLayouts = useSelector((state: AppState) => state.diagramGridLayout.gridLayouts);

    useEffect(() => {
        if (!studyUuid) {
            return;
        }
        onLoadDiagramLayout(gridLayouts);
    }, [gridLayouts, onLoadDiagramLayout, studyUuid]);
};
