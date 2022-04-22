/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSelector } from 'react-redux';
import React, { useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { getNetworkAreaDiagramUrl } from '../utils/rest-api';
import { SvgType } from './single-line-diagram';
import PropTypes from 'prop-types';
import NetworkAreaDiagram from './network-area-diagram';

export function NetworkAreaDiagramPane({
    studyUuid,
    network,
    workingNode,
    onClose,
}) {
    const nadRef = useRef();

    const history = useHistory();
    const historyRef = useRef();
    historyRef.current = history;

    const networkRef = useRef();
    networkRef.current = network;

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
            displayedVoltageLevelId,
            3
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
                        diagramTitle={nadTitle}
                        svgUrl={svgUrl}
                        ref={nadRef}
                        svgType={
                            displayedVoltageLevelId
                                ? SvgType.VOLTAGE_LEVEL
                                : SvgType.SUBSTATION
                        }
                        workingNode={workingNode}
                        onClose={onClose}
                    />
                </div>
            )}
        </>
    );
}

NetworkAreaDiagramPane.propTypes = {
    studyUuid: PropTypes.string,
    workingNode: PropTypes.object,
    network: PropTypes.object,
    onClose: PropTypes.func,
};
