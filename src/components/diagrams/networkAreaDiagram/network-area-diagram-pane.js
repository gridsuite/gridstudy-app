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
// import { sayHello, BigDiv } from 'hello-goodbye2';

export function NetworkAreaDiagramPane({
    studyUuid,
    network,
    workingNode,
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

    // const bigDiv = new BigDiv();
    // bigDiv.init();

    // customElements.define('my-element', BigDiv, { extends: 'div' });
    //
    // const myElement = document.createElement('div', { is: 'my-element' });

    // console.info('myElement', myElement)

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
                    <div is={"my-element"}></div>
                    <NetworkAreaDiagram
                        onClose={onClose}
                        diagramTitle={nadTitle}
                        svgUrl={svgUrl}
                        nadId={displayedVoltageLevel?.id}
                        ref={displayedVoltageLevelIdRef}
                        workingNode={workingNode}
                        depth={depth}
                        setDepth={setDepth}
                    />
                </div>
            )}
        </>
    );
}

NetworkAreaDiagramPane.propTypes = {
    studyUuid: PropTypes.string,
    network: PropTypes.object,
    workingNode: PropTypes.object,
    onClose: PropTypes.func,
};
