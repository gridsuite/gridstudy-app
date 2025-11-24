/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Layout, Layouts } from 'react-grid-layout';
import { Diagram, DiagramParams, DiagramType, NETWORK_AREA_DIAGRAM_DETAILS_TYPE } from '../cards/diagrams/diagram.type';
import { useSelector } from 'react-redux';
import { AppState, DiagramGridLayoutConfig } from 'redux/reducer';
import type { UUID } from 'node:crypto';
import { useCallback } from 'react';
import { DiagramGridLayoutDto, DiagramLayoutDto } from 'components/grid-layout/diagram-grid-layout.types';
import { MAX_INT32 } from 'services/utils';
import { saveDiagramGridLayout } from 'services/study/study-config';
import { useSnackMessage } from '@gridsuite/commons-ui';

interface UseSaveDiagramLayoutProps {
    layouts: Layouts;
    diagrams: Record<UUID, Diagram>;
}

const frontendToBackendDiagramGridLayout = (diagram: DiagramGridLayoutConfig): DiagramGridLayoutDto => {
    const diagramLayouts: DiagramLayoutDto[] = [];

    const gridLayoutById: Record<string, Record<string, Pick<Layout, 'x' | 'y' | 'w' | 'h'>>> = {};

    for (const [layoutKey, layouts] of Object.entries(diagram.gridLayouts)) {
        for (const { i, w, h, x, y } of layouts) {
            gridLayoutById[i] = {
                ...gridLayoutById[i],
                [layoutKey]: {
                    w: w,
                    h: h,
                    x: encodeInfinity(x),
                    y: encodeInfinity(y),
                },
            };
        }
    }

    diagram.params.forEach((param) => {
        const matchingGridLayout = gridLayoutById[param.diagramUuid];
        if (matchingGridLayout) {
            // Transform diagram type for backend serialization - cast type to handle backend polymorphism
            let transformedParam: DiagramLayoutDto;
            if (param.type === DiagramType.NETWORK_AREA_DIAGRAM) {
                transformedParam = {
                    type: NETWORK_AREA_DIAGRAM_DETAILS_TYPE,
                    diagramUuid: param.diagramUuid,
                    originalNadConfigUuid: param.nadConfigUuid,
                    originalFilterUuid: param.filterUuid,
                    currentFilterUuid: param.initializationFilterUuid,
                    name: param.name,
                    voltageLevelIds: param.voltageLevelIds,
                    positions: param.positions,
                    diagramPositions: matchingGridLayout,
                } as unknown as DiagramLayoutDto;
            } else {
                transformedParam = { ...param, diagramPositions: matchingGridLayout };
            }
            diagramLayouts.push(transformedParam);
        }
    });

    return {
        diagramLayouts: diagramLayouts,
    };
};

const encodeInfinity = (value: number) => {
    if (value === Infinity) {
        return MAX_INT32;
    }
    return value;
};

export const useSaveDiagramLayout = ({ layouts, diagrams }: UseSaveDiagramLayoutProps) => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const { snackInfo, snackError } = useSnackMessage();

    const saveDiagramLayout = useCallback(() => {
        if (!studyUuid) {
            return;
        }

        const diagramParams: DiagramParams[] = Object.values(diagrams).map((diagram) => {
            const { svg, ...cleanedFields } = diagram;
            return cleanedFields;
        });

        saveDiagramGridLayout(
            studyUuid,
            frontendToBackendDiagramGridLayout({
                gridLayouts: layouts,
                params: diagramParams,
            })
        )
            .then(() => {
                snackInfo({
                    headerId: 'DiagramLayoutStoreSuccess',
                });
            })
            .catch(() => {
                snackError({
                    headerId: 'DiagramLayoutStoreError',
                });
            });
    }, [diagrams, layouts, studyUuid, snackInfo, snackError]);

    return saveDiagramLayout;
};
