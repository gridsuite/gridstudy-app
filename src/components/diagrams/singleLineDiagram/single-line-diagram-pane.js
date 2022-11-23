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
import { getNameOrId, useSingleLineDiagram, ViewState } from './utils';
import { isNodeBuilt } from '../../graph/util/model-functions';
import { AutoSizer } from 'react-virtualized';

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
                if (!substation) return;
                let name =
                    useName && substation.name ? substation.name : substationId;
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

    const viewsRef = useRef();
    viewsRef.current = views;

    const [
        closeView,
        openVoltageLevel,
        openSubstation,
        togglePinSld,
        minimizeSld,
    ] = useSingleLineDiagram();

    const currentNodeRef = useRef();
    currentNodeRef.current = currentNode;

    const updateSld = useCallback((id) => {
        if (id) {
            viewsRef.current
                .find((sld) => sld.id === id)
                ?.ref?.current?.reloadSvg();
        } else
            viewsRef.current.forEach((sld) => {
                if (sld.svgUrl.indexOf(currentNodeRef.current?.id) !== -1) {
                    sld.ref?.current?.reloadSvg();
                }
            });
    }, []);

    const classes = useStyles();

    const handleUpdateSwitchState = useCallback(
        (breakerId, open, switchElement) => {
            updateSwitchState(studyUuid, currentNode?.id, breakerId, open).then(
                (response) => {
                    if (!response.ok) {
                        console.error(response);
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
            const viewsFromSldState = [];
            sldState.forEach((currentState) => {
                let currentView = createView(currentState);
                // if current view cannot be found, it return undefined
                // in this case, we remove it from SLD state
                if (currentView) viewsFromSldState.push(currentView);
                else {
                    closeView(currentState.id);
                }
            });
            setViews(viewsFromSldState);
        }
    }, [sldState, visible, disabled, closeView, createView, dispatch]);

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
        if (studyUpdatedForce.eventData.headers && viewsRef.current) {
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
                    const vlToClose = viewsRef.current.filter(
                        (vl) =>
                            vl.substationId === deletedId || vl.id === deletedId
                    );
                    if (vlToClose.length > 0)
                        closeView([...vlToClose, deletedId]);

                    const substationsIds =
                        studyUpdatedForce.eventData.headers['substationsIds'];
                    viewsRef.current.forEach((v) => {
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
    }, [studyUpdatedForce, dispatch, studyUuid, updateSld, closeView, network]);

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
        <AutoSizer>
            {({ width, height }) => (
                <div style={{ flexDirection: 'row', display: 'inline-flex' }}>
                    {displayedSLD.map((sld) => (
                        <SingleLineDiagram
                            key={sld.id}
                            onClose={handleCloseSLD}
                            onNextVoltageLevelClick={handleOpenView}
                            onBreakerClick={handleUpdateSwitchState}
                            diagramTitle={getNameOrId(sld)}
                            svgUrl={sld.svgUrl}
                            sldId={sld.id}
                            ref={sld.ref}
                            svgType={sld.type}
                            updateSwitchMsg={updateSwitchMsg}
                            isComputationRunning={isComputationRunning}
                            showInSpreadsheet={showInSpreadsheet}
                            loadFlowStatus={loadFlowStatus}
                            numberToDisplay={displayedSLD.length}
                            onTogglePin={togglePinSld}
                            onMinimize={minimizeSld}
                            pinned={sld.state === ViewState.PINNED}
                            disabled={disabled}
                            totalWidth={width}
                            totalHeight={height}
                        />
                    ))}
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1}
                        className={classes.minimizedSLD}
                        style={{
                            display: !fullScreenSldId ? '' : 'none',
                        }}
                    >
                        {minimized.map((view) => (
                            <Chip
                                key={view.id}
                                icon={<ArrowUpwardIcon />}
                                label={getNameOrId(view)}
                                onClick={() =>
                                    handleOpenView(view.id, view.type)
                                }
                                onDelete={() => handleCloseSLD(view.id)}
                            />
                        ))}
                    </Stack>
                </div>
            )}
        </AutoSizer>
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
