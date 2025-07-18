/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Layout, Layouts } from 'react-grid-layout';
import { Diagram, DiagramParams } from '../diagram.type';
import { useSelector } from 'react-redux';
import { AppState, DiagramLayout } from 'redux/reducer';
import { saveStudyLayout } from 'services/study/study-config';
import { UUID } from 'crypto';
import { useCallback } from 'react';
import { DiagramLayoutParam, StudyLayout } from 'types/study-layout.types';
import { MAX_INT32 } from 'services/utils';

interface UseSaveDiagramLayoutProps {
    layouts: Layouts;
    diagrams: Record<UUID, Diagram>;
}

const frontendToBackendAppLayout = (diagram: DiagramLayout): StudyLayout => {
    const diagramLayoutParams: DiagramLayoutParam[] = [];

    const gridLayoutById: Record<string, Record<string, Pick<Layout, 'x' | 'y' | 'w' | 'h'>>> = {};

    for (const [layoutKey, layouts] of Object.entries(diagram.gridLayout)) {
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
            diagramLayoutParams.push({
                ...param,
                gridLayout: matchingGridLayout,
            });
        }
    });

    return {
        diagramLayoutParams: diagramLayoutParams,
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

    const saveDiagramLayout = useCallback(() => {
        if (!studyUuid) {
            return;
        }

        const diagramParams: DiagramParams[] = Object.values(diagrams).map((diagram) => {
            const { name, svg, ...cleanedFields } = diagram;
            return cleanedFields;
        });

        saveStudyLayout(
            studyUuid,
            frontendToBackendAppLayout({
                gridLayout: layouts,
                params: diagramParams,
            })
        );
    }, [diagrams, layouts, studyUuid]);

    return saveDiagramLayout;
};
