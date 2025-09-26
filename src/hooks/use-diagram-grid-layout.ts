/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DiagramType } from 'components/grid-layout/cards/diagrams/diagram.type';
import { useEffect } from 'react';
import { Layouts } from 'react-grid-layout';
import { useDispatch, useSelector } from 'react-redux';
import { setDiagramGridLayout } from 'redux/actions';
import { AppState, DiagramGridLayoutConfig } from 'redux/reducer';
import { getDiagramGridLayout } from 'services/study/study-config';
import { MAX_INT32 } from 'services/utils';
import { DiagramGridLayoutDto } from 'components/grid-layout/diagram-grid-layout.types';

export const useDiagramGridLayout = () => {
    const dispatch = useDispatch();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    useEffect(() => {
        if (!studyUuid) {
            return;
        }
        getDiagramGridLayout(studyUuid).then((diagramGridLayout: DiagramGridLayoutDto | null) => {
            // if not layout is found, 204 is returned with null value
            if (diagramGridLayout) {
                dispatch(setDiagramGridLayout(backendToFrontendGridLayout(diagramGridLayout)));
            }
        });
    }, [studyUuid, dispatch]);
};

const decodeInfinity = (value: number) => {
    if (value === MAX_INT32) {
        return Infinity;
    }
    return value;
};

const backendToFrontendGridLayout = (diagramGridLayout: DiagramGridLayoutDto): DiagramGridLayoutConfig => {
    const gridLayoutResult: Layouts = {};

    for (const { diagramUuid, diagramPositions } of diagramGridLayout.diagramLayouts) {
        for (const [layoutKey, layoutValues] of Object.entries(diagramPositions)) {
            if (!gridLayoutResult[layoutKey]) {
                gridLayoutResult[layoutKey] = [];
            }
            gridLayoutResult[layoutKey].push({
                ...layoutValues,
                i: diagramUuid,
                x: decodeInfinity(layoutValues.x),
                y: decodeInfinity(layoutValues.y),
            });
        }
    }

    return {
        gridLayouts: gridLayoutResult,
        params: diagramGridLayout.diagramLayouts.map((layout) => {
            if (layout.type === DiagramType.NETWORK_AREA_DIAGRAM) {
                return {
                    type: layout.type,
                    diagramUuid: layout.diagramUuid,
                    nadConfigUuid: layout.originalNadConfigUuid,
                    initializationNadConfigUuid: layout.currentNadConfigUuid,
                    filterUuid: layout.filterUuid,
                    name: layout.name,
                    voltageLevelIds: [],
                    voltageLevelToExpandIds: [],
                    voltageLevelToOmitIds: [],
                    positions: [],
                };
            }
            return layout;
        }),
    };
};
