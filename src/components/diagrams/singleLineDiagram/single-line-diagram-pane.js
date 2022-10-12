/*
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
} from '../../../utils/config-params';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    getSubstationSingleLineDiagram,
    getVoltageLevelSingleLineDiagram,
    updateSwitchState,
} from '../../../utils/rest-api';
import SingleLineDiagram, { SvgType } from './single-line-diagram';
import PropTypes from 'prop-types';
import { Chip, Stack } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import makeStyles from '@mui/styles/makeStyles';
import { useSingleLineDiagram, ViewState } from './utils';
import { isNodeBuilt } from '../../graph/util/model-functions';

const useDisplayView = (network, studyUuid, currentNode) => {
    const useName = useSelector((state) => state[PARAM_USE_NAME]);
    const centerName = useSelector((state) => state[PARAM_CENTER_LABEL]);
    const diagonalName = useSelector((state) => state[PARAM_DIAGONAL_LABEL]);
    const substationLayout = useSelector(
        (state) => state[PARAM_SUBSTATION_LAYOUT]
    );

    const componentLibrary = useSelector(
        (state) => state[PARAM_COMPONENT_LIBRARY]
    );

    const getVoltageLevelSingleLineDiagramUrl = useCallback(
        (voltageLevelId) =>
            isNodeBuilt(currentNode)
                ? getVoltageLevelSingleLineDiagram(
                      studyUuid,
                      currentNode?.id,
                      voltageLevelId,
                      useName,
                      centerName,
                      diagonalName,
                      componentLibrary
                  )
                : null,
        [
            currentNode,
            studyUuid,
            useName,
            centerName,
            diagonalName,
            componentLibrary,
        ]
    );

    const getSubstationSingleLineDiagramUrl = useCallback(
        (voltageLevelId) =>
            isNodeBuilt(currentNode)
                ? getSubstationSingleLineDiagram(
                      studyUuid,
                      currentNode?.id,
                      voltageLevelId,
                      useName,
                      centerName,
                      diagonalName,
                      substationLayout,
                      componentLibrary
                  )
                : null,
        [
            centerName,
            componentLibrary,
            diagonalName,
            studyUuid,
            substationLayout,
            useName,
            currentNode,
        ]
    );

    return useCallback(
        (view) => {
            function createSubstationSLD(substationId, state) {
                const substation = network.getSubstation(substationId);
                let name = useName ? substation.name : substationId;
                const countryName = substation?.countryName;
                if (countryName) {
                    name += ' \u002D ' + countryName;
                }
                const svgUrl = getSubstationSingleLineDiagramUrl(substationId);

                return {
                    id: substationId,
                    ref: React.createRef(),
                    state,
                    name,
                    type: SvgType.SUBSTATION,
                    svgUrl,
                };
            }

            function createVoltageLevelSLD(vlId, state) {
                const vl = network.getVoltageLevel(vlId);
                if (!vl) return;
                let name = useName ? vl.name : vlId;

                const substation = network.getSubstation(vlId);
                const countryName = substation?.countryName;
                if (countryName) {
                    name += ' \u002D ' + countryName;
                }
                const svgUrl = getVoltageLevelSingleLineDiagramUrl(vlId);

                return {
                    id: vlId,
                    ref: React.createRef(),
                    state,
                    name,
                    svgUrl,
                    type: SvgType.VOLTAGE_LEVEL,
                    substationId: substation?.id,
                };
            }

            if (!network) return;
            if (view.type === SvgType.VOLTAGE_LEVEL)
                return createVoltageLevelSLD(view.id, view.state);
            else if (view.type === SvgType.SUBSTATION)
                return createSubstationSLD(view.id, view.state);
        },
        [
            network,
            useName,
            getSubstationSingleLineDiagramUrl,
            getVoltageLevelSingleLineDiagramUrl,
        ]
    );
};

const useStyles = makeStyles(() => ({
    minimizedSLD: {
        bottom: '60px',
        position: 'absolute',
    },
}));

export function SingleLineDiagramPane({
    studyUuid,
    network,
    isComputationRunning,
    showInSpreadsheet,
    loadFlowStatus,
    currentNode,
    disabled,
    visible,
}) {
    const studyUpdatedForce = useSelector((state) => state.studyUpdated);

    const [updateSwitchMsg, setUpdateSwitchMsg] = useState('');

    const [views, setViews] = useState([]);
    const fullScreenSldId = useSelector((state) => state.fullScreenSldId);

    const [displayedSLD, setDisplayedSld] = useState([]);

    const createView = useDisplayView(network, studyUuid, currentNode);

    const dispatch = useDispatch();

    const sldState = useSelector((state) => state.sldState);

    const [
        closeView,
        openVoltageLevel,
        openSubstation,
        togglePinSld,
        minimizeSld,
    ] = useSingleLineDiagram();

    const currentNodeRef = useRef();
    currentNodeRef.current = currentNode;

    useEffect(() => {
        setViews(sldState.map(createView));
    }, [sldState, createView, disabled, visible]);

    const updateSld = useCallback(
        (id) => {
            if (id) {
                views.find((sld) => sld.id === id)?.ref?.current?.reloadSvg();
            } else
                views.forEach((sld) => {
                    if (sld.svgUrl.indexOf(currentNode?.id) !== -1) {
                        sld?.ref?.current?.reloadSvg();
                    }
                });
        },
        [currentNode?.id, views]
    );

    const classes = useStyles();

    const handleUpdateSwitchState = useCallback(
        (breakerId, open, switchElement) => {
            if (open) {
                switchElement.classList.replace('sld-closed', 'sld-open');
            } else {
                switchElement.classList.replace('sld-open', 'sld-closed');
            }

            updateSwitchState(studyUuid, currentNode?.id, breakerId, open).then(
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
        [studyUuid, currentNode]
    );

    useEffect(() => {
        // We use isNodeBuilt here instead of the "disabled" props to avoid
        // triggering this effect when changing current node
        if (isNodeBuilt(currentNodeRef.current) && visible) {
            setViews(sldState.map(createView));
        }
    }, [sldState, visible, createView]);

    const toggleState = useCallback(
        (id, type, state) => {
            if (state === ViewState.MINIMIZED) {
                minimizeSld(id);
            }
            if (state === ViewState.PINNED) {
                togglePinSld(id);
            }
        },
        [minimizeSld, togglePinSld]
    );

    const handleCloseSLD = useCallback(
        (id) => {
            closeView(id);
        },
        [closeView]
    );

    const handleOpenView = useCallback(
        (id, type = SvgType.VOLTAGE_LEVEL) => {
            if (type === SvgType.VOLTAGE_LEVEL) openVoltageLevel(id);
            else if (type === SvgType.SUBSTATION) openSubstation(id);
        },
        [openSubstation, openVoltageLevel]
    );

    useEffect(() => {
        if (studyUpdatedForce.eventData.headers && views) {
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
                    const vlToClose = views.filter(
                        (vl) =>
                            vl.substationId === deletedId || vl.id === deletedId
                    );
                    if (vlToClose.length > 0)
                        closeView([...vlToClose, deletedId]);

                    const substationsIds =
                        studyUpdatedForce.eventData.headers['substationsIds'];
                    views.forEach((v) => {
                        const vl = network.getVoltageLevel(v.id);
                        if (vl && substationsIds.includes(vl.substationId)) {
                            updateSld(vl.id);
                        }
                    });
                } else {
                    updateSld();
                }
            } else if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                'buildCompleted'
            ) {
                if (
                    studyUpdatedForce.eventData.headers['node'] ===
                    currentNodeRef.current?.id
                ) {
                    updateSld();
                }
            }
        }
        // Note: studyUuid, and loadNetwork don't change
    }, [
        studyUpdatedForce,
        views,
        dispatch,
        studyUuid,
        updateSld,
        closeView,
        network,
    ]);

    useEffect(() => {
        setDisplayedSld(
            views.filter((view) =>
                [ViewState.OPENED, ViewState.PINNED].includes(view.state)
            )
        );
    }, [views]);

    const displayedIds = new Set(displayedSLD.map(({ id }) => id));
    const minimized = views.filter(({ id }) => !displayedIds.has(id));
    return (
        <>
            {displayedSLD.map((sld) => (
                <div
                    style={{
                        flexGrow: 1,
                        flexShrink: 1,
                        position: 'relative',
                        display:
                            !fullScreenSldId || sld.id === fullScreenSldId
                                ? 'inline-flex'
                                : 'none',
                        pointerEvents: 'none',
                        flexDirection: 'column',
                    }}
                    key={sld.id}
                >
                    <SingleLineDiagram
                        onClose={handleCloseSLD}
                        onNextVoltageLevelClick={handleOpenView}
                        onBreakerClick={handleUpdateSwitchState}
                        diagramTitle={sld.name}
                        svgUrl={sld.svgUrl}
                        sldId={sld.id}
                        ref={sld.ref}
                        svgType={sld.type}
                        updateSwitchMsg={updateSwitchMsg}
                        isComputationRunning={isComputationRunning}
                        showInSpreadsheet={showInSpreadsheet}
                        loadFlowStatus={loadFlowStatus}
                        numberToDisplay={displayedSLD.length}
                        toggleState={toggleState}
                        pinned={sld.state === ViewState.PINNED}
                        disabled={disabled}
                    />
                </div>
            ))}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                className={classes.minimizedSLD}
            >
                {minimized.map((view) => (
                    <Chip
                        key={view.id}
                        icon={<ArrowUpwardIcon />}
                        label={view.name}
                        onClick={() => handleOpenView(view.id, view.type)}
                        onDelete={() => handleCloseSLD(view.id)}
                    />
                ))}
            </Stack>
        </>
    );
}

SingleLineDiagramPane.propTypes = {
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    network: PropTypes.object,
    showInSpreadsheet: PropTypes.func,
    isComputationRunning: PropTypes.bool,
    loadFlowStatus: PropTypes.any,
    onClose: PropTypes.func,
    onNextVoltageLevelClick: PropTypes.func,
    disabled: PropTypes.bool,
    visible: PropTypes.bool,
};
