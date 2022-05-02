/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useDispatch, useSelector } from 'react-redux';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    getNetworkAreaDiagramUrl,
} from '../../../utils/rest-api';
import NetworkAreaDiagram, { SvgType } from './network-area-diagram';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';

const useDisplayView = (network, studyUuid, workingNode) => {

    return useCallback(
        (view) => {
            function createVoltageLevelNAD(vlId) {
                const vl = network.getVoltageLevel(vlId);
                if (!vl) return;
                let name = vl.name;

                const svgUrl = getNetworkAreaDiagramUrl(
                    studyUuid,
                    workingNode?.id,
                    [vl.id],
                    1
                );

                return {
                    id: vlId,
                    ref: React.createRef(),
                    name,
                    svgUrl,
                    type: SvgType.VOLTAGE_LEVEL,
                };
            }

            if (!network) return;
            if (view.type === SvgType.VOLTAGE_LEVEL)
                return createVoltageLevelNAD(view.id);
        },
        [
            network,
            getNetworkAreaDiagramUrl,
        ]
    );
};

const useStyles = makeStyles(() => ({
    minimizedSLD: {
        bottom: '60px',
        position: 'absolute',
    },
}));

export function NetworkAreaDiagramPane({
    studyUuid,
    network,
    isComputationRunning,
    showInSpreadsheet,
    loadFlowStatus,
    workingNode,
    onClose,
}) {
    const studyUpdatedForce = useSelector((state) => state.studyUpdated);

    const [views, setViews] = useState([]);

    const [viewState, setViewState] = useState(new Map());

    const createView = useDisplayView(network, studyUuid, workingNode);

    const dispatch = useDispatch();


    const updateSld = useCallback(
        (id) => {
            if (id) views.find((sld) => sld.id === id)?.ref.current.reloadSvg();
            else views.forEach((sld) => sld.ref.current.reloadSvg());
        },
        [views]
    );

    const classes = useStyles();

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
            2
        );
    }

    useEffect(() => {
        setViews((oldVal) => oldVal.map(createView));
    }, [createView]);

    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            if (
                studyUpdatedForce.eventData.headers['updateType'] === 'loadflow'
            ) {
                //TODO reload data more intelligently
                updateSld();
            } else if (
                studyUpdatedForce.eventData.headers['updateType'] === 'study'
            ) {
                //If the SLD of the deleted substation is open, we close it
                if (studyUpdatedForce.eventData.headers['deletedEquipmentId']) {
                    const deletedId =
                        studyUpdatedForce.eventData.headers[
                            'deletedEquipmentId'
                        ];
                } else {
                    updateSld();
                }
            }
        }
        // Note: studyUuid, and loadNetwork don't change
    }, [
        studyUpdatedForce,
        dispatch,
        studyUuid,
        updateSld,
        views,
    ]);

    const viewStateRef = useRef();
    viewStateRef.current = viewState;

    return (
        <>
            {displayedVoltageLevelId && (
                <div
                    style={{
                        flexGrow: 1,
                        position: 'relative',
                        display: 'flex',
                        pointerEvents: 'none',
                        // flexDirection: 'column',
                    }}
                >
                    <NetworkAreaDiagram
                        onClose={onClose}
                        diagramTitle={nadTitle}
                        svgUrl={svgUrl}
                        sldId={displayedVoltageLevel?.id}
                        ref={displayedVoltageLevelIdRef}
                        svgType={SvgType.VOLTAGE_LEVEL}
                        isComputationRunning={isComputationRunning}
                        showInSpreadsheet={showInSpreadsheet}
                        loadFlowStatus={loadFlowStatus}
                        workingNode={workingNode}
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
    showInSpreadsheet: PropTypes.func,
    isComputationRunning: PropTypes.bool,
    loadFlowStatus: PropTypes.any,
    onClose: PropTypes.func,
    onNextVoltageLevelClick: PropTypes.func,
};
