/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DiagramParams } from '../diagram.type';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { useEffect } from 'react';

type UseDiagramParamsProps = { onLoadDiagramParams: (diagramParams: DiagramParams) => void };

export const useDiagramParams = ({ onLoadDiagramParams }: UseDiagramParamsProps) => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const diagramParams = useSelector((state: AppState) => state.appLayoutInit?.diagram.params);

    // at mount
    useEffect(() => {
        if (!studyUuid || !diagramParams) {
            return;
        }
        diagramParams.forEach((diagramParams) => onLoadDiagramParams(diagramParams));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};
