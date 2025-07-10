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

const keyToKeepInSessionStorage = [
    'diagramUuid',
    'type',
    'voltageLevelId',
    'substationId',
    'voltageLevelIds',
    'depth',
    'elementUuid',
    'elementType',
    'elementName', // TODO this is the name of the NAD from element, it could change in explore then it's not updated in session storage
    // we must get the name from the uuid when we open the diagram and update it by notification if necessary Hack for now.
]; // static

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
        // save diagrams to session storage
        const diagramParams = Object.values(diagrams).map((diagram) =>
            Object.fromEntries(Object.entries(diagram).filter(([key]) => keyToKeepInSessionStorage.includes(key)))
        );
        //TODO: remove cast
        dispatch(setDiagramParamsLayout(diagramParams as DiagramParams[]));
        // syncDiagramsWithSessionStorage(diagramParams, studyUuid);
    }, [diagrams, studyUuid, dispatch]);
};
