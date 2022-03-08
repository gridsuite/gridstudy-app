/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useDispatch, useSelector } from 'react-redux';
import {
    PARAM_CENTER_LABEL,
    PARAM_COMPONENT_LIBRARY,
    PARAM_DIAGONAL_LABEL,
    PARAM_SUBSTATION_LAYOUT,
    PARAM_USE_NAME,
} from '../utils/config-params';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
    getSubstationSingleLineDiagram,
    getVoltageLevelSingleLineDiagram,
    updateSwitchState,
} from '../utils/rest-api';
import SingleLineDiagram, { SvgType } from './single-line-diagram';
import PropTypes from 'prop-types';
import { parse, stringify } from 'qs';
import { selectItemNetwork } from '../redux/actions';

export const useSingleLineDiagram = (studyUuid) => {
    const history = useHistory();
    const dispatch = useDispatch();

    const showVoltageLevelDiagram = useCallback(
        (voltageLevelId) => {
            dispatch(selectItemNetwork(voltageLevelId));
            history.replace(
                '/studies/' +
                    encodeURIComponent(studyUuid) +
                    stringify(
                        { voltageLevelId: voltageLevelId },
                        { addQueryPrefix: true }
                    )
            );
        },
        // Note: studyUuid and history don't change
        [history, studyUuid, dispatch]
    );

    const showSubstationDiagram = useCallback(
        (substationId) => {
            dispatch(selectItemNetwork(substationId));
            history.replace(
                '/studies/' +
                    encodeURIComponent(studyUuid) +
                    stringify(
                        { substationId: substationId },
                        { addQueryPrefix: true }
                    )
            );
        },
        // Note: studyUuid and history don't change
        [dispatch, history, studyUuid]
    );

    const closeVoltageLevelDiagram = useCallback(() => {
        history.replace('/studies/' + encodeURIComponent(studyUuid));
    }, [history, studyUuid]);

    return [
        closeVoltageLevelDiagram,
        showVoltageLevelDiagram,
        showSubstationDiagram,
    ];
};

export function SingleLineDiagramPane({
    studyUuid,
    network,
    openVoltageLevel,
    isComputationRunning,
    showInSpreadsheet,
    loadFlowStatus,
    workingNode,
}) {
    const useName = useSelector((state) => state[PARAM_USE_NAME]);
    const centerName = useSelector((state) => state[PARAM_CENTER_LABEL]);
    const diagonalName = useSelector((state) => state[PARAM_DIAGONAL_LABEL]);
    const componentLibrary = useSelector(
        (state) => state[PARAM_COMPONENT_LIBRARY]
    );
    const substationLayout = useSelector(
        (state) => state[PARAM_SUBSTATION_LAYOUT]
    );

    const studyUpdatedForce = useSelector((state) => state.studyUpdated);

    const [updateSwitchMsg, setUpdateSwitchMsg] = useState('');

    const sldRef = useRef();

    const dispatch = useDispatch();

    const history = useHistory();
    const historyRef = useRef();
    historyRef.current = history;

    const networkRef = useRef();
    networkRef.current = network;

    const [displayedVoltageLevelId, setDisplayedVoltageLevelId] =
        useState(null);

    const [displayedSubstationId, setDisplayedSubstationId] = useState(null);

    const displayedSubstationIdRef = useRef();
    displayedSubstationIdRef.current = displayedSubstationId;

    const displayedVoltageLevelIdRef = useRef();
    displayedVoltageLevelIdRef.current = displayedVoltageLevelId;

    const [closeSingleLineDiagram] = useSingleLineDiagram(studyUuid);
    const updateSld = () => {
        if (sldRef.current) {
            setUpdateSwitchMsg('');
            sldRef.current.reloadSvg();
        }
    };

    const location = useLocation();

    const handleUpdateSwitchState = useCallback(
        (breakerId, open, switchElement) => {
            if (open) {
                switchElement.classList.replace('sld-closed', 'sld-open');
            } else {
                switchElement.classList.replace('sld-open', 'sld-closed');
            }

            updateSwitchState(studyUuid, workingNode?.id, breakerId, open).then(
                (response) => {
                    if (!response.ok) {
                        console.error(response);
                        // revert switch position change
                        if (open) {
                            switchElement.classList.replace(
                                'sld-open',
                                'sld-closed'
                            );
                        } else {
                            switchElement.classList.replace(
                                'sld-closed',
                                'sld-open'
                            );
                        }
                        setUpdateSwitchMsg(
                            response.status + ' : ' + response.statusText
                        );
                    }
                }
            );
        },
        [studyUuid, workingNode, setUpdateSwitchMsg]
    );

    // set single line diagram voltage level id, contained in url query parameters
    useEffect(() => {
        // parse query parameter
        const queryParams = parse(location.search, { ignoreQueryPrefix: true });
        const newVoltageLevelId = queryParams['voltageLevelId'];
        setDisplayedVoltageLevelId(
            newVoltageLevelId ? newVoltageLevelId : null
        );
        const newSubstationId = queryParams['substationId'];
        setDisplayedSubstationId(newSubstationId ? newSubstationId : null);
        setUpdateSwitchMsg('');
    }, [location.search]);

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
                if (
                    displayedSubstationIdRef.current &&
                    displayedSubstationIdRef.current ===
                        studyUpdatedForce.eventData.headers[
                            'deletedEquipmentId'
                        ]
                ) {
                    historyRef.current.replace(
                        '/studies/' + encodeURIComponent(studyUuid)
                    );
                    setDisplayedSubstationId(null);
                } else if (
                    //If the SLD of the deleted voltage level or the SLD of its substation is open, we close it
                    displayedVoltageLevelIdRef.current &&
                    (displayedVoltageLevelIdRef.current ===
                        studyUpdatedForce.eventData.headers[
                            'deletedEquipmentId'
                        ] ||
                        networkRef.current.voltageLevelsById.get(
                            displayedVoltageLevelIdRef.current
                        ).substationId ===
                            studyUpdatedForce.eventData.headers[
                                'deletedEquipmentId'
                            ])
                ) {
                    historyRef.current.replace(
                        '/studies/' + encodeURIComponent(studyUuid)
                    );
                    setDisplayedVoltageLevelId(null);
                } else {
                    updateSld();
                }
            }
        }
        // Note: studyUuid, and loadNetwork don't change
    }, [studyUpdatedForce, dispatch, studyUuid]);

    let displayedVoltageLevel;
    if (network) {
        if (displayedVoltageLevelId) {
            displayedVoltageLevel = network.getVoltageLevel(
                displayedVoltageLevelId
            );
        }
    }

    let displayedSubstation;
    if (network) {
        if (displayedSubstationId) {
            displayedSubstation = network.getSubstation(displayedSubstationId);
        }
    }

    let sldTitle = '';
    let svgUrl = '';
    if (displayedVoltageLevel) {
        sldTitle = useName
            ? displayedVoltageLevel.name
            : displayedVoltageLevel.id;
        if (
            network.getSubstation(displayedVoltageLevel.substationId)
                .countryName !== undefined
        ) {
            sldTitle +=
                ' \u002D ' +
                network.getSubstation(displayedVoltageLevel.substationId)
                    .countryName;
        }

        svgUrl = getVoltageLevelSingleLineDiagram(
            studyUuid,
            workingNode?.id,
            displayedVoltageLevelId,
            useName,
            centerName,
            diagonalName,
            componentLibrary
        );
    } else if (displayedSubstation) {
        sldTitle = useName ? displayedSubstation.name : displayedSubstation.id;
        if (
            network.getSubstation(displayedSubstation.id).countryName !==
            undefined
        ) {
            sldTitle +=
                ' \u002D ' +
                network.getSubstation(displayedSubstation.id).countryName;
        }

        svgUrl = getSubstationSingleLineDiagram(
            studyUuid,
            workingNode?.id,
            displayedSubstationId,
            useName,
            centerName,
            diagonalName,
            substationLayout,
            componentLibrary
        );
    }

    return (
        (displayedVoltageLevelId || displayedSubstationId) && (
            <div
                style={{
                    flexGrow: 1,
                    position: 'relative',
                    display: 'flex',
                    pointerEvents: 'none',
                    flexDirection: 'column',
                }}
            >
                <SingleLineDiagram
                    onClose={closeSingleLineDiagram}
                    onNextVoltageLevelClick={openVoltageLevel}
                    onBreakerClick={handleUpdateSwitchState}
                    diagramTitle={sldTitle}
                    svgUrl={svgUrl}
                    ref={sldRef}
                    updateSwitchMsg={updateSwitchMsg}
                    isComputationRunning={isComputationRunning}
                    svgType={
                        displayedVoltageLevelId
                            ? SvgType.VOLTAGE_LEVEL
                            : SvgType.SUBSTATION
                    }
                    showInSpreadsheet={showInSpreadsheet}
                    loadFlowStatus={loadFlowStatus}
                    selectedNodeUuid={workingNode?.id}
                />
            </div>
        )
    );
}

SingleLineDiagramPane.propTypes = {
    studyUuid: PropTypes.string,
    workingNode: PropTypes.object,
    network: PropTypes.object,
    showInSpreadsheet: PropTypes.func,
    isComputationRunning: PropTypes.bool,
    loadFlowStatus: PropTypes.any,

    onClose: PropTypes.func,
    onNextVoltageLevelClick: PropTypes.func,
};
