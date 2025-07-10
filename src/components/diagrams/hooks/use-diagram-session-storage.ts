/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';
import { Diagram, DiagramParams } from '../diagram.type';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { useEffect } from 'react';
import { setDiagramParamsLayout } from 'redux/actions';

type useDiagramSessionStorageProps = {
    diagrams: Record<UUID, Diagram>;
    onLoadFromSessionStorage: (diagramParams: DiagramParams) => void;
};

export const useDiagramSessionStorage = ({ diagrams, onLoadFromSessionStorage }: useDiagramSessionStorageProps) => {
    const dispatch = useDispatch();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const diagramParams = useSelector((state: AppState) => state.appLayout?.diagram.params);

    // at mount
    useEffect(() => {
        if (!studyUuid || !diagramParams) {
            return;
        }
        diagramParams.forEach((diagramParams) => onLoadFromSessionStorage(diagramParams));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [diagramParams]);

    // at update
    useEffect(() => {
        if (!studyUuid) {
            return;
        }

        const diagramParams: DiagramParams[] = Object.values(diagrams).map((diagram) => {
            const { name, svg, ...cleanedFields } = diagram;
            return cleanedFields;
        });

        dispatch(setDiagramParamsLayout(diagramParams));
    }, [diagrams, studyUuid, dispatch]);
};
