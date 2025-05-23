/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';
import { Diagram, DiagramParams } from '../diagram.type';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { useEffect } from 'react';
import { loadDiagramsFromSessionStorage, syncDiagramsWithSessionStorage } from 'redux/session-storage/diagram-state';

const keyToKeepInSessionStorage = ['type', 'voltageLevelId', 'substationId', 'voltageLevelIds', 'depth']; // static

type useDiagramSessionStorageProps = {
    diagrams: Record<UUID, Diagram>;
    onLoadFromSessionStorage: (diagramParams: DiagramParams) => void;
};

export const useDiagramSessionStorage = ({ diagrams, onLoadFromSessionStorage }: useDiagramSessionStorageProps) => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    // at mount
    useEffect(() => {
        if (!studyUuid) {
            return;
        }
        const diagrams: DiagramParams[] = loadDiagramsFromSessionStorage(studyUuid);
        diagrams.forEach((diagramParams) => onLoadFromSessionStorage(diagramParams));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // at update
    useEffect(() => {
        if (!studyUuid) {
            return;
        }
        // save diagrams to session storage
        const diagramParams = Object.values(diagrams).map((diagram) =>
            Object.fromEntries(Object.entries(diagram).filter(([key]) => keyToKeepInSessionStorage.includes(key)))
        );
        syncDiagramsWithSessionStorage(diagramParams, studyUuid);
    }, [diagrams, studyUuid]);
};
