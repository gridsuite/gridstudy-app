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

type UseDiagramsGridLayoutProps = {
    onLoadDiagramLayout: (layout: Layouts) => void;
};

export const useDiagramsGridLayout = ({ onLoadDiagramLayout }: UseDiagramsGridLayoutProps) => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const gridLayout = useSelector((state: AppState) => state.appLayout?.diagram.gridLayout);

    // at mount
    useEffect(() => {
        if (!studyUuid) {
            return;
        }
        onLoadDiagramLayout(gridLayout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};
