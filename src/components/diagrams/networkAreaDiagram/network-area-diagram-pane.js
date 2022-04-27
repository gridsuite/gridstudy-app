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
import { useLocation } from 'react-router-dom';
import {
    getSubstationSingleLineDiagram,
    getVoltageLevelSingleLineDiagram,
    updateSwitchState,
} from '../../../utils/rest-api';
import NetworkAreaDiagram, { SvgType } from './network-area-diagram';
import PropTypes from 'prop-types';
import { parse } from 'qs';
import { Chip, Stack } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import makeStyles from '@mui/styles/makeStyles';
import { getArray, useSingleLineDiagram, ViewState } from './utils';

function removeFromMap(oldMap, ids) {
    let removed = false;
    const newMap = new Map(oldMap);
    (Array.isArray(ids) ? ids : [ids]).forEach(
        (id) => (removed |= newMap.delete(id))
    );
    return removed ? newMap : oldMap;
}

const mergeDisplayed = (oldValue, sldToDisplay, createSLD) => {
    const toAdd = new Set(sldToDisplay);
    const toRemove = new Set();
    oldValue.forEach((sld) => {
        // delete already present element
        if (!toAdd.delete(sld?.id)) {
            toRemove.add(sld); // if element is absent we (delete returned false we have to remove it
        }
    });
    if (toAdd.size === 0 && toRemove.size === 0)
        // nothing to be done
        return oldValue;
    const newValue =
        toRemove.size === 0
            ? [...oldValue]
            : oldValue.filter((sld) => !toRemove.has(sld));
    toAdd.forEach((id) => {
        newValue.push(createSLD(id));
    });
    return newValue.filter((n) => n);
};

const useDisplayView = (network, studyUuid, workingNode) => {
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
            getVoltageLevelSingleLineDiagram(
                studyUuid,
                workingNode?.id,
                voltageLevelId,
                useName,
                centerName,
                diagonalName,
                componentLibrary
            ),
        [
            centerName,
            componentLibrary,
            diagonalName,
            studyUuid,
            useName,
            workingNode?.id,
        ]
    );

    const getSubstationSingleLineDiagramUrl = useCallback(
        (voltageLevelId) =>
            getSubstationSingleLineDiagram(
                studyUuid,
                workingNode?.id,
                voltageLevelId,
                useName,
                centerName,
                diagonalName,
                substationLayout,
                componentLibrary
            ),
        [
            centerName,
            componentLibrary,
            diagonalName,
            studyUuid,
            substationLayout,
            useName,
            workingNode?.id,
        ]
    );

    return useCallback(
        (view) => {
            function createSubstationSLD(substationId) {
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
                    name,
                    type: SvgType.SUBSTATION,
                    svgUrl,
                };
            }

            function createVoltageLevelSLD(vlId) {
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
                    name,
                    svgUrl,
                    type: SvgType.VOLTAGE_LEVEL,
                    substationId: substation?.id,
                };
            }

            if (!network) return;
            if (view.type === SvgType.VOLTAGE_LEVEL)
                return createVoltageLevelSLD(view.id);
            else if (view.type === SvgType.SUBSTATION)
                return createSubstationSLD(view.id);
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

export function NetworkAreaDiagramPane({
    studyUuid,
    network,
    isComputationRunning,
    showInSpreadsheet,
    loadFlowStatus,
    workingNode,
}) {
    const studyUpdatedForce = useSelector((state) => state.studyUpdated);

    const [updateSwitchMsg, setUpdateSwitchMsg] = useState('');

    const [views, setViews] = useState([]);
    const fullScreen = useSelector((state) => state.fullScreen);

    const [viewState, setViewState] = useState(new Map());

    const [displayedSLD, setDisplayedSld] = useState([]);

    const createView = useDisplayView(network, studyUuid, workingNode);

    const dispatch = useDispatch();

    const [closeSingleLineDiagram, openVoltageLevel, openSubstation] =
        useSingleLineDiagram();

    const location = useLocation();

    const updateSld = useCallback(
        (id) => {
            if (id) views.find((sld) => sld.id === id)?.ref.current.reloadSvg();
            else views.forEach((sld) => sld.ref.current.reloadSvg());
        },
        [views]
    );

    const classes = useStyles();

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
        [studyUuid, workingNode]
    );

    useEffect(() => {
        setViews((oldVal) => oldVal.map(createView));
    }, [createView]);

    // set single line diagram voltage level id, contained in url query parameters
    useEffect(() => {
        // parse query parameter
        const queryParams = parse(location.search, {
            parseArrays: true,
            ignoreQueryPrefix: true,
        });
        let newVoltageLevelIds = getArray(queryParams['views']);

        setViews((oldValue) =>
            mergeDisplayed(oldValue, newVoltageLevelIds, createView)
        );
        // setMinimizedSLD( (oldValue) => );

        setUpdateSwitchMsg('');
    }, [createView, location.search]);

    const toggleState = useCallback((id, state) => {
        setViewState((oldValue) => {
            const newVal = new Map(oldValue);
            const oldState = oldValue.get(id);
            if (oldState === state) newVal.delete(id);
            else newVal.set(id, state);
            return newVal;
        });
    }, []);

    const handleCloseSLD = useCallback(
        (id) => {
            setViewState((oldVal) => removeFromMap(oldVal, id));
            closeSingleLineDiagram(id);
        },
        [closeSingleLineDiagram]
    );

    const handleOpenView = useCallback(
        (id, type = SvgType.VOLTAGE_LEVEL) => {
            if (type === SvgType.VOLTAGE_LEVEL) openVoltageLevel(id);
            else if (type === SvgType.SUBSTATION) openSubstation(id);
            setViewState((oldState) => {
                if (oldState.get(id) === ViewState.MINIMIZED) {
                    const newMap = new Map(oldState);
                    newMap.delete(id);
                    return newMap;
                }
                return oldState;
            });
        },
        [openSubstation, openVoltageLevel]
    );

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
                    const vlToClose = views.filter(
                        (vl) =>
                            vl.substationId === deletedId || vl.id === deletedId
                    );
                    closeSingleLineDiagram([...vlToClose, deletedId]);
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
        closeSingleLineDiagram,
    ]);

    const viewStateRef = useRef();
    viewStateRef.current = viewState;

    useEffect(() => {
        let toDisplay = views.filter(
            ({ id }) => viewState.get(id) === ViewState.PINNED
        );
        const more = views.find(({ id }) => !viewState.get(id));
        if (more) {
            toDisplay.push(more);
        }
        const displayedIds = new Set(toDisplay.map(({ id }) => id));
        setDisplayedSld(toDisplay);
        const newViewState = new Map(viewState);
        views.forEach(({ id }) => {
            if (!displayedIds.has(id))
                newViewState.set(id, ViewState.MINIMIZED);
        });
        if (newViewState.size !== viewState.size) setViewState(newViewState);
    }, [views, viewState]);

    return (
        <>
            {displayedSLD.map((sld) => (
                <div
                    style={{
                        flexGrow: 1,
                        position: 'relative',
                        display:
                            !fullScreen || sld.id === fullScreen
                                ? 'flex'
                                : 'none',
                        pointerEvents: 'none',
                        flexDirection: 'column',
                    }}
                    key={sld.svgUrl}
                >
                    <NetworkAreaDiagram
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
                        workingNode={workingNode}
                        numberToDisplay={displayedSLD.length}
                        toggleState={toggleState}
                        pinned={viewState.get(sld.id) === ViewState.PINNED}
                    />
                </div>
            ))}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                className={classes.minimizedSLD}
            >
                {views
                    .filter(
                        ({ id }) => viewState.get(id) === ViewState.MINIMIZED
                    )
                    .map((view) => (
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
