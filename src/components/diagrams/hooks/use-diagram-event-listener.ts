/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState, DiagramEvent, DiagramEventType } from 'redux/reducer';
import { UUID } from 'crypto';
import { DiagramParams, DiagramType } from '../diagram.type';
import { resetDiagramEvent } from 'redux/actions';

type UseDiagramEventListenerProps = {
    createDiagram: (diagram: DiagramParams) => void;
    removeDiagram: (id: UUID) => void;
};

export const useDiagramEventListener = ({ createDiagram, removeDiagram }: UseDiagramEventListenerProps) => {
    const dispatch = useDispatch();
    const latestDiagramEvent = useSelector((state: AppState) => state.lastestDiagramEvent);

    const createDiagramFromEvent = useCallback(
        (diagramEvent: DiagramEvent) => {
            if (diagramEvent.eventType !== DiagramEventType.CREATE) {
                return;
            }
            if (diagramEvent.diagramType === DiagramType.VOLTAGE_LEVEL) {
                createDiagram({
                    type: DiagramType.VOLTAGE_LEVEL,
                    voltageLevelId: diagramEvent.voltageLevelId,
                });
            } else if (diagramEvent.diagramType === DiagramType.SUBSTATION) {
                createDiagram({
                    type: DiagramType.SUBSTATION,
                    substationId: diagramEvent.substationId,
                });
            } else if (diagramEvent.diagramType === DiagramType.NETWORK_AREA_DIAGRAM) {
                createDiagram({
                    type: DiagramType.NETWORK_AREA_DIAGRAM,
                    voltageLevelIds: diagramEvent.voltageLevelIds,
                    depth: 0,
                });
            } else if (diagramEvent.diagramType === DiagramType.NAD_FROM_CONFIG) {
                createDiagram({
                    type: DiagramType.NAD_FROM_CONFIG,
                    nadFromConfigUuid: diagramEvent.nadFromConfigUuid,
                });
            }
        },
        [createDiagram]
    );

    useEffect(() => {
        if (!latestDiagramEvent) {
            return;
        }
        switch (latestDiagramEvent.eventType) {
            case DiagramEventType.CREATE:
                createDiagramFromEvent(latestDiagramEvent);
                break;
            case DiagramEventType.REMOVE:
                if (!latestDiagramEvent.diagramUuid) {
                    return;
                }
                removeDiagram(latestDiagramEvent.diagramUuid);
                break;
        }
        dispatch(resetDiagramEvent());
    }, [createDiagramFromEvent, dispatch, latestDiagramEvent, removeDiagram]);
};
