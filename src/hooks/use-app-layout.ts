/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DiagramParams } from 'components/diagrams/diagram.type';
import { useEffect } from 'react';
import { Layout } from 'react-grid-layout';
import { useDispatch, useSelector } from 'react-redux';
import { setAppLayout } from 'redux/actions';
import { AppLayout, AppState } from 'redux/reducer';
import { getStudyLayout, saveStudyLayout } from 'services/study/study-config';

type DiagramLayoutParam = DiagramParams & Pick<Layout, 'x' | 'y' | 'h' | 'w'>;

export interface StudyLayout {
    diagramLayoutParams: DiagramLayoutParam[];
}

export const useAppLayout = () => {
    const dispatch = useDispatch();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const appLayout = useSelector((state: AppState) => state.appLayout);

    useEffect(() => {
        if (!studyUuid) {
            return;
        }
        getStudyLayout(studyUuid).then((appLayout: StudyLayout) => {
            console.log(appLayout);
            dispatch(setAppLayout(backendToFrontendAppLayout(appLayout)));
        });
    }, [studyUuid, dispatch]);

    //TODO : first load trigger this useEffect, TOFIX
    useEffect(() => {
        if (!studyUuid || !appLayout) {
            return;
        }
        console.log('BEFORE saving', appLayout);
        saveStudyLayout(studyUuid, frontendToBackendAppLayout(appLayout));
    }, [studyUuid, appLayout]);
};

const frontendToBackendAppLayout = (appLayout: AppLayout): StudyLayout => {
    const diagramLayoutParams: DiagramLayoutParam[] = [];

    const idToGridLayoutMap: Map<string, Layout> = appLayout.diagram.gridLayout.reduce((map, cur) => {
        map.set(cur.i, cur);
        return map;
    }, new Map());

    appLayout.diagram.params.forEach((param) => {
        const matchingGridLayout = idToGridLayoutMap.get(param.diagramUuid);
        if (matchingGridLayout) {
            diagramLayoutParams.push({
                w: matchingGridLayout.w,
                h: matchingGridLayout.h,
                x: matchingGridLayout.x,
                y: matchingGridLayout.y,
                ...param,
            });
        }
    });

    return {
        diagramLayoutParams: diagramLayoutParams,
    };
};

const backendToFrontendAppLayout = (studyLayout: StudyLayout): AppLayout => {
    const gridLayout: Layout[] = [];
    const diagramParams: DiagramParams[] = [];

    studyLayout.diagramLayoutParams.forEach((param) => {
        gridLayout.push(backendToFrontendGridLayout(param));
        diagramParams.push(backendToFrontendDiagramParams(param));
    });

    return {
        diagram: {
            gridLayout: gridLayout,
            params: diagramParams,
        },
    };
};

const backendToFrontendGridLayout = (diagramLayoutParam: DiagramLayoutParam): Layout => {
    return {
        i: diagramLayoutParam.diagramUuid,
        w: diagramLayoutParam.w,
        h: diagramLayoutParam.h,
        x: diagramLayoutParam.x,
        y: diagramLayoutParam.y,
    };
};

const backendToFrontendDiagramParams = (diagramLayoutParam: DiagramLayoutParam): DiagramParams => {
    const { x, y, h, w, ...cleanedParams } = diagramLayoutParam;

    return cleanedParams;
};
