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
import SingleLineDiagram, { SvgType } from './single-line-diagram';
import PropTypes from 'prop-types';
import { parse } from 'qs';
import { Chip, Stack } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import makeStyles from '@mui/styles/makeStyles';
import {
    getArray,
    getNameOrId,
    useSingleLineDiagram,
    ViewState,
} from './utils';
import { isNodeBuilt } from '../../graph/util/model-functions';
import { AutoSizer } from 'react-virtualized';

function removeFromMap(oldMap, ids) {
    let removed = false;
    const newMap = new Map(oldMap);
    (Array.isArray(ids) ? ids : [ids]).forEach(
        (id) => (removed |= newMap.delete(id))
    );
    return removed ? newMap : oldMap;
}

const mergeDisplayed = (oldValue, sldToDisplay, createSLD) => {
    const toAdd = new Map(sldToDisplay.map((o) => [o.id, o]));
    const toRemove = new Set();
    const lastOpen = sldToDisplay.find((view) => view.lastOpen)?.id;
    oldValue.forEach((sld) => {
        if (sld !== undefined) {
            // delete already present element
            if (!toAdd.delete(sld?.id)) {
                toRemove.add(sld); // if element is absent, then we have to remove it from the map
            }
        }
    });

    // Is there something to add or remove ?
    if (toAdd.size === 0 && toRemove.size === 0) {
        // Did the lastOpen SLD changed ?
        const oldLastOpen = oldValue.find((view) => view.lastOpen)?.id;
        const newLastOpen = sldToDisplay.find((view) => view.lastOpen)?.id;
        if (oldLastOpen === newLastOpen) {
            // Nothing needs to be done.
            return oldValue;
        }
    }

    const newValue =
        toRemove.size === 0
            ? [...oldValue]
            : oldValue.filter((sld) => !toRemove.has(sld));
    toAdd.forEach((value) => {
        newValue.push(createSLD(value));
    });
    newValue.forEach((view) => {
        if (view !== undefined) {
            view.lastOpen = view.id === lastOpen;
        }
    });
    return newValue.filter((n) => n);
};

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
            function createSubstationSLD(substationId, lastOpen) {
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
                    lastOpen,
                    name,
                    type: SvgType.SUBSTATION,
                    svgUrl,
                };
            }

            function createVoltageLevelSLD(vlId, lastOpen) {
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
                    lastOpen,
                    name,
                    svgUrl,
                    type: SvgType.VOLTAGE_LEVEL,
                    substationId: substation?.id,
                };
            }

            if (!network) return;
            if (view.type === SvgType.VOLTAGE_LEVEL)
                return createVoltageLevelSLD(view.id, view.lastOpen);
            else if (view.type === SvgType.SUBSTATION)
                return createSubstationSLD(view.id, view.lastOpen);
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

    const [viewState, setViewState] = useState(new Map());

    const [displayedSLD, setDisplayedSld] = useState([]);

    const createView = useDisplayView(network, studyUuid, currentNode);

    const dispatch = useDispatch();

    const [closeView, openVoltageLevel, openSubstation] =
        useSingleLineDiagram();

    const location = useLocation();
    const viewsRef = useRef();
    viewsRef.current = views;

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
                    sld?.ref?.current?.reloadSvg();
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
            setViews((oldVal) => oldVal.map(createView));
        }
    }, [visible, createView]);

    // set single line diagram voltage level id, contained in url query parameters
    useEffect(() => {
        // parse query parameter
        const queryParams = parse(location.search, {
            parseArrays: true,
            ignoreQueryPrefix: true,
            arrayFormat: 'indices',
        });
        let newVoltageLevelIds = getArray(queryParams['views']);
        setViews((oldValue) =>
            mergeDisplayed(oldValue, newVoltageLevelIds, createView)
        );

        setUpdateSwitchMsg('');
    }, [createView, location, disabled, visible]);

    const toggleState = useCallback(
        (id, type, state) => {
            setViewState((oldValue) => {
                const newVal = new Map(oldValue);
                const oldState = oldValue.get(id);
                if (oldState === state) newVal.delete(id);
                else newVal.set(id, state);
                if (state !== ViewState.MINIMIZED) {
                    if (type === SvgType.VOLTAGE_LEVEL) openVoltageLevel(id);
                    else if (type === SvgType.SUBSTATION) openSubstation(id);
                }
                return newVal;
            });
        },
        [openSubstation, openVoltageLevel]
    );

    const handleCloseSLD = useCallback(
        (id) => {
            setViewState((oldVal) => removeFromMap(oldVal, id));
            closeView(id);
        },
        [closeView]
    );

    const handleOpenView = useCallback(
        (id, type = SvgType.VOLTAGE_LEVEL) => {
            setViewState((oldMap) => {
                if (oldMap.has(id) && oldMap.get(id) !== ViewState.PINNED) {
                    const newMap = new Map(oldMap);
                    newMap.delete(id);
                    return newMap;
                }
                return oldMap;
            });
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
        setDisplayedSld((oldSld) => {
            const configuredViewsIds = new Set(views.map((view) => view.id));
            // remove view no longer present, keep order
            let newDisplayed = oldSld
                .filter(
                    (view) =>
                        configuredViewsIds.has(view.id) &&
                        viewState.get(view.id) === ViewState.PINNED
                )
                .map((old) => views.find((v) => v.id === old.id));
            // there is place for one more
            let more = views.find(
                ({ id, lastOpen }) =>
                    lastOpen && viewState.get(id) === undefined
            );
            if (more) {
                newDisplayed.push(more);
            }
            return newDisplayed;
        });
    }, [views, viewState]);

    const displayedIds = new Set(displayedSLD.map(({ id }) => id));
    const minimized = views.filter(({ id }) => !displayedIds.has(id));

    return (
        <AutoSizer>
            {({ width, height }) => (
                <div style={{ flexDirection: 'row', display: 'inline-flex' }}>
                    {displayedSLD.map((sld) => (
                        <SingleLineDiagram
                            key={sld.svgUrl}
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
                            toggleState={toggleState}
                            pinned={viewState.get(sld.id) === ViewState.PINNED}
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
