/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSelector } from 'react-redux';
import React, { useRef, useState } from 'react';
import { getNetworkAreaDiagramUrl } from '../../../utils/rest-api';
import NetworkAreaDiagram from './network-area-diagram';
import PropTypes from 'prop-types';

export function NetworkAreaDiagramPane({
    studyUuid,
    network,
    currentNode,
    loadFlowStatus,
    onClose,
    align,
}) {
    const [depth, setDepth] = useState(0);

    const voltageLevelsIds = useSelector(
        (state) => state.voltageLevelsIdsForNad
    );

    const fullScreenNadId = useSelector((state) => state.fullScreenNadId);

    const fullScreenSldId = useSelector((state) => state.fullScreenSldId);

    const displayedVoltageLevelIdRef = useRef();
    displayedVoltageLevelIdRef.current = voltageLevelsIds[0];

    let displayedVoltageLevels = [];
    if (network) {
        if (voltageLevelsIds) {
            voltageLevelsIds.forEach((id) =>
                displayedVoltageLevels.push(network.getVoltageLevel(id))
            );
        }
    }

    let nadTitle = '';
    let svgUrl = '';
    if (displayedVoltageLevels) {
        displayedVoltageLevels.forEach(
            (vl) =>
                (nadTitle = nadTitle + (nadTitle !== '' ? ' + ' : '') + vl.name)
        );

        svgUrl = getNetworkAreaDiagramUrl(
            studyUuid,
            currentNode?.id,
            voltageLevelsIds,
            depth
        );
    }

    return (
        <>
            {voltageLevelsIds?.length && (
                <div
                    style={{
                        flexGrow: 1,
                        position: 'relative',
                        display: fullScreenSldId ? 'none' : 'flex',
                        pointerEvents: 'none',
                        flexDirection: 'column',
                        direction: align === 'right' ? 'rtl' : undefined,
                        width: fullScreenNadId ? '100%' : '',
                    }}
                >
                    <NetworkAreaDiagram
                        onClose={onClose}
                        diagramTitle={nadTitle}
                        svgUrl={svgUrl}
                        nadId={voltageLevelsIds[0]}
                        currentNode={currentNode}
                        depth={depth}
                        setDepth={setDepth}
                        studyUuid={studyUuid}
                        loadFlowStatus={loadFlowStatus}
                    />
                </div>
            )}
        </>
    );
}

NetworkAreaDiagramPane.propTypes = {
    studyUuid: PropTypes.string,
    loadFlowStatus: PropTypes.any,
    network: PropTypes.object,
    currentNode: PropTypes.object,
    onClose: PropTypes.func,
    align: PropTypes.string,
};
