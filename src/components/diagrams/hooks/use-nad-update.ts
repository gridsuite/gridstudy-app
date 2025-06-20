/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useDebounce } from '@gridsuite/commons-ui';
import { Diagram, DiagramParams, DiagramType, NetworkAreaDiagram } from '../diagram.type';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getEstimatedNbVoltageLevels } from '../diagram-utils';
import { DiagramAdditionalMetadata, NETWORK_AREA_DIAGRAM_NB_MAX_VOLTAGE_LEVELS } from '../diagram-common';
import { UUID } from 'crypto';

type useNadUpdateProps = {
    diagrams: Record<UUID, Diagram>;
    updateDiagram: (diagramParams: DiagramParams) => void;
};

export const useNadUpdate = ({ diagrams, updateDiagram }: useNadUpdateProps) => {
    const previousNetworkAreaDiagramDepth = useRef(0);
    const [localNadDepth, setLocalNadDepth] = useState<Record<UUID, number>>({});

    const changeDepth = useCallback(
        (diagram: NetworkAreaDiagram, newDepth: number) => {
            updateDiagram({
                diagramUuid: diagram.diagramUuid,
                type: DiagramType.NETWORK_AREA_DIAGRAM,
                voltageLevelIds: diagram.voltageLevelIds,
                depth: newDepth,
            });
            previousNetworkAreaDiagramDepth.current = newDepth;
        },
        [updateDiagram]
    );

    const debouncedChangeDepth = useDebounce(changeDepth, 1300);

    // To allow a small number of fast clicks
    // and then stop before we get too close to
    // NETWORK_AREA_DIAGRAM_NB_MAX_VOLTAGE_LEVELS
    const shouldDebounceUpdateNAD = useCallback((diagram: NetworkAreaDiagram, networkAreaDiagramDepth: number) => {
        console.log(
            'SBO shouldDebounceUpdateNAD next, previous',
            networkAreaDiagramDepth,
            previousNetworkAreaDiagramDepth.current
        );
        const estimatedNbVoltageLevels = getEstimatedNbVoltageLevels(
            previousNetworkAreaDiagramDepth.current,
            networkAreaDiagramDepth,
            (diagram.svg?.additionalMetadata as DiagramAdditionalMetadata).nbVoltageLevels || 0
        );
        return (
            estimatedNbVoltageLevels < NETWORK_AREA_DIAGRAM_NB_MAX_VOLTAGE_LEVELS ||
            previousNetworkAreaDiagramDepth.current > networkAreaDiagramDepth
        );
    }, []);

    const onChangeDepth = useCallback(
        (diagram: Diagram, newDepth: number) => {
            const nextDepth = Math.max(newDepth, 0); // Ensure depth is non-negative
            if (diagram && diagram.type === DiagramType.NETWORK_AREA_DIAGRAM) {
                setLocalNadDepth((prevDepth) => ({
                    ...prevDepth,
                    [diagram.diagramUuid]: nextDepth,
                }));
                if (shouldDebounceUpdateNAD(diagram, nextDepth)) {
                    debouncedChangeDepth(diagram, nextDepth);
                } else {
                    changeDepth(diagram, nextDepth);
                }
            }
        },
        [shouldDebounceUpdateNAD, debouncedChangeDepth, changeDepth]
    );

    useEffect(() => {
        // Initialize localNadDepth with existing diagrams
        const initialDepths: Record<UUID, number> = {};
        Object.values(diagrams).forEach((diagram) => {
            if (diagram.type === DiagramType.NETWORK_AREA_DIAGRAM) {
                initialDepths[diagram.diagramUuid] = diagram.depth;
            }
        });
        setLocalNadDepth(initialDepths);
    }, [diagrams]);

    return { onChangeDepth, localNadDepth };
};
