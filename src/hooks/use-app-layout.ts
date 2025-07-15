/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import { Layouts } from 'react-grid-layout';
import { useDispatch, useSelector } from 'react-redux';
import { setAppLayoutInit } from 'redux/actions';
import { AppLayout, AppState } from 'redux/reducer';
import { getStudyLayout } from 'services/study/study-config';
import { MAX_INT32 } from 'services/utils';
import { StudyLayout } from 'types/study-layout.types';

export const useAppLayout = () => {
    const dispatch = useDispatch();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    useEffect(() => {
        if (!studyUuid) {
            return;
        }
        getStudyLayout(studyUuid).then((appLayout: StudyLayout | null) => {
            // if not layout is found, 204 is returned with null value
            if (appLayout) {
                dispatch(setAppLayoutInit(backendToFrontendAppLayout(appLayout)));
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

const backendToFrontendAppLayout = (studyLayout: StudyLayout): AppLayout => {
    const gridLayoutResult: Layouts = {};

    for (const { diagramUuid, gridLayout } of studyLayout.diagramLayoutParams) {
        for (const [layoutKey, layoutValues] of Object.entries(gridLayout)) {
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
        diagram: {
            gridLayout: gridLayoutResult,
            params: studyLayout.diagramLayoutParams,
        },
    };
};
