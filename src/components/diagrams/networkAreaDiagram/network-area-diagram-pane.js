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
    workingNode,
    loadFlowStatus,
    onClose,
}) {
    const [depth, setDepth] = useState(0);

    const openNetworkAreaDiagram = useSelector(
        (state) => state.openNetworkAreaDiagram
    );

    const displayedVoltageLevelId = openNetworkAreaDiagram?.voltageLevelId;

    const displayedVoltageLevelIdRef = useRef();
    displayedVoltageLevelIdRef.current = displayedVoltageLevelId;

    let displayedVoltageLevel;
    if (network) {
        if (displayedVoltageLevelId) {
            displayedVoltageLevel = network.getVoltageLevel(
                displayedVoltageLevelId
            );
        }
    }

    let nadTitle = '';
    let svgUrl = '';
    if (displayedVoltageLevel) {
        nadTitle = displayedVoltageLevel.name;

        svgUrl = getNetworkAreaDiagramUrl(
            studyUuid,
            workingNode?.id,
            [displayedVoltageLevelId],
            depth
        );
    }

    return (
        <>
            {displayedVoltageLevelId && (
                <div
                    style={{
                        flexGrow: 1,
                        position: 'relative',
                        display: 'flex',
                        pointerEvents: 'none',
                        flexDirection: 'column',
                    }}
                >
                    <NetworkAreaDiagram
                        onClose={onClose}
                        diagramTitle={nadTitle}
                        svgUrl={svgUrl}
                        nadId={displayedVoltageLevel?.id}
                        ref={displayedVoltageLevelIdRef}
                        workingNode={workingNode}
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
    workingNode: PropTypes.object,
    onClose: PropTypes.func,
};
