/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useHistory, useLocation } from 'react-router-dom';

import { parse, stringify } from 'qs';
import { makeStyles } from '@material-ui/core/styles';
import SingleLineDiagram, { SvgType } from './single-line-diagram';
import {
    getSubstationSingleLineDiagram,
    getVoltageLevelSingleLineDiagram,
    updateSwitchState,
} from '../utils/rest-api';
import {
    filteredNominalVoltagesUpdated,
    selectItemNetwork,
} from '../redux/actions';
import { equipments } from './network/network-equipments';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import OverloadedLinesView from './network/overloaded-lines-view';
import NetworkTable from './network/network-table';
import clsx from 'clsx';
import {
    PARAM_CENTER_LABEL,
    PARAM_COMPONENT_LIBRARY,
    PARAM_DIAGONAL_LABEL,
    PARAM_DISPLAY_OVERLOAD_TABLE,
    PARAM_LINE_FLOW_ALERT_THRESHOLD,
    PARAM_LINE_FLOW_COLOR_MODE,
    PARAM_LINE_FLOW_MODE,
    PARAM_LINE_FULL_PATH,
    PARAM_LINE_PARALLEL_PATH,
    PARAM_SUBSTATION_LAYOUT,
    PARAM_USE_NAME,
} from '../utils/config-params';
import { getLineLoadingZone, LineLoadingZone } from './network/line-layer';
import { NetworkMapContainer } from './network-map-container';
import { StudyLateralToolBar } from './study-lateral-tool-bar';
import { RunButtonContainer } from './run-button-container';
import { ReportViewerController } from '../controller/report-viewer-controller';
import { ResultViewController } from '../controller/result-view-controller';
import { getLoadFlowRunningStatus } from './util/running-status';

const useStyles = makeStyles((theme) => ({
    map: {
        display: 'flex',
        flexDirection: 'row',
    },
    error: {
        padding: theme.spacing(2),
    },
    rotate: {
        animation: 'spin 1000ms infinite',
    },
    '@global': {
        '@keyframes spin': {
            '0%': {
                transform: 'rotate(0deg)',
            },
            '100%': {
                transform: 'rotate(-360deg)',
            },
        },
    },
    mapCtrlBottomLeft: {
        '& .mapboxgl-ctrl-bottom-left': {
            transition: theme.transitions.create('left', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
        },
    },
    divOverloadedLineView: {
        right: 45,
        top: 10,
        minWidth: '500px',
        position: 'absolute',
        height: '70%',
        opacity: '1',
        flex: 1,
        pointerEvents: 'none',
    },
    divRunButton: {
        position: 'absolute',
        right: 100,
        bottom: 30,
        marginLeft: 8,
        marginRight: 8,
        marginTop: 8,
    },
    table: {
        display: 'flex',
        flexDirection: 'column',
    },
}));

export const StudyView = {
    MAP: 'Map',
    SPREADSHEET: 'Spreadsheet',
    RESULTS: 'Results',
    LOGS: 'Logs',
};

const StudyPane = ({
    studyUuid,
    network,
    selectedNodeUuid,
    updatedLines,
    loadFlowInfos,
    securityAnalysisStatus,
    runnable,
    sldRef,
    setUpdateSwitchMsg,
    updateSwitchMsg,
    ...props
}) => {
    const useName = useSelector((state) => state[PARAM_USE_NAME]);

    const centerName = useSelector((state) => state[PARAM_CENTER_LABEL]);

    const diagonalName = useSelector((state) => state[PARAM_DIAGONAL_LABEL]);

    const lineFullPath = useSelector((state) => state[PARAM_LINE_FULL_PATH]);

    const lineParallelPath = useSelector(
        (state) => state[PARAM_LINE_PARALLEL_PATH]
    );

    const lineFlowMode = useSelector((state) => state[PARAM_LINE_FLOW_MODE]);

    const lineFlowColorMode = useSelector(
        (state) => state[PARAM_LINE_FLOW_COLOR_MODE]
    );

    const lineFlowAlertThreshold = useSelector((state) =>
        Number(state[PARAM_LINE_FLOW_ALERT_THRESHOLD])
    );

    const substationLayout = useSelector(
        (state) => state[PARAM_SUBSTATION_LAYOUT]
    );

    const displayOverloadTable = useSelector(
        (state) => state[PARAM_DISPLAY_OVERLOAD_TABLE]
    );

    const componentLibrary = useSelector(
        (state) => state[PARAM_COMPONENT_LIBRARY]
    );

    const [displayedVoltageLevelId, setDisplayedVoltageLevelId] =
        useState(null);

    const filteredNominalVoltages = useSelector(
        (state) => state.filteredNominalVoltages
    );

    const [displayedSubstationId, setDisplayedSubstationId] = useState(null);

    const [isComputationRunning, setIsComputationRunning] = useState(false);

    const [visibleSubstation, setVisibleSubstation] = useState(null);

    const [tableEquipment, setTableEquipment] = useState({
        id: null,
        type: null,
        changed: false,
    });

    const [centerOnSubstation, setCenterOnSubstation] = useState();

    const dispatch = useDispatch();

    const classes = useStyles();

    const location = useLocation();

    const history = useHistory();

    const [drawerShift, setDrawerShift] = useState();

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
    }, [location.search]);

    useEffect(() => {
        if (
            network &&
            network.substations.length > 0 &&
            !filteredNominalVoltages
        ) {
            dispatch(
                filteredNominalVoltagesUpdated(network.getNominalVoltages())
            );
        }
    }, [network, filteredNominalVoltages, dispatch]);

    const showVoltageLevelDiagram = useCallback(
        (voltageLevelId) => {
            setUpdateSwitchMsg('');
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
        [setUpdateSwitchMsg, history, studyUuid]
    );

    const showSubstationDiagram = useCallback(
        (substationId) => {
            dispatch(selectItemNetwork(substationId));
            setUpdateSwitchMsg('');
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
        [dispatch, setUpdateSwitchMsg, history, studyUuid]
    );

    function closeVoltageLevelDiagram() {
        history.replace('/studies/' + encodeURIComponent(studyUuid));
    }

    const handleUpdateSwitchState = useCallback(
        (breakerId, open, switchElement) => {
            if (open) {
                switchElement.classList.replace('sld-closed', 'sld-open');
            } else {
                switchElement.classList.replace('sld-open', 'sld-closed');
            }

            updateSwitchState(
                studyUuid,
                selectedNodeUuid,
                breakerId,
                open
            ).then((response) => {
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
            });
        },
        [studyUuid, selectedNodeUuid, setUpdateSwitchMsg]
    );

    function openVoltageLevelDiagram(vlId, substationId) {
        // TODO code factorization for displaying a VL via a hook
        if (vlId) {
            setDisplayedVoltageLevelId(null);
            setDisplayedSubstationId(null);
            dispatch(selectItemNetwork(vlId));
            props.onChangeTab(0); // switch to map view
            showVoltageLevelDiagram(vlId); // show voltage level
            setVisibleSubstation(substationId);
            setDisplayedVoltageLevelId(vlId);
        }
    }

    const linesNearOverload = useCallback(() => {
        if (network) {
            return network.lines.some((l) => {
                const zone = getLineLoadingZone(l, lineFlowAlertThreshold);
                return (
                    zone === LineLoadingZone.WARNING ||
                    zone === LineLoadingZone.OVERLOAD
                );
            });
        }
        return false;
    }, [network, lineFlowAlertThreshold]);

    const openVoltageLevel = useCallback(
        (vlId) => {
            if (!network) return;
            showVoltageLevelDiagram(vlId);
            dispatch(selectItemNetwork(vlId));
        },
        [network, showVoltageLevelDiagram, dispatch]
    );

    useEffect(() => {
        if (!network) return;
        network.useEquipment(equipments.substations);
        network.useEquipment(equipments.lines);
    }, [network]);

    function showInSpreadsheet(equipment) {
        let newTableEquipment = {
            id: equipment.equipmentId,
            type: equipment.equipmentType,
            changed: !tableEquipment.changed,
        };
        setTableEquipment(newTableEquipment);
        props.onChangeTab(1); // switch to spreadsheet view
    }

    function renderMapView() {
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
                displayedSubstation = network.getSubstation(
                    displayedSubstationId
                );
            }
        }

        let sldTitle;
        let svgUrl;
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
                selectedNodeUuid,
                displayedVoltageLevelId,
                useName,
                centerName,
                diagonalName,
                componentLibrary
            );
        } else if (displayedSubstation) {
            sldTitle = useName
                ? displayedSubstation.name
                : displayedSubstation.id;
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
                selectedNodeUuid,
                displayedSubstationId,
                useName,
                centerName,
                diagonalName,
                substationLayout,
                componentLibrary
            );
        }

        return (
            <div className={clsx('relative singlestretch-child', classes.map)}>
                <div
                    className={classes.mapCtrlBottomLeft}
                    style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: drawerShift,
                        right: 0,
                    }}
                >
                    {/* TODO do not display if study does not exists or do not fetch geoData if study does not exists */}
                    <NetworkMapContainer
                        /* TODO do we move redux param to container */
                        studyUuid={studyUuid}
                        network={network}
                        visible={props.view === StudyView.MAP}
                        updatedLines={updatedLines}
                        useName={useName}
                        lineFullPath={lineFullPath}
                        lineParallelPath={lineParallelPath}
                        lineFlowMode={lineFlowMode}
                        lineFlowColorMode={lineFlowColorMode}
                        lineFlowAlertThreshold={lineFlowAlertThreshold}
                        loadFlowStatus={getLoadFlowRunningStatus(loadFlowInfos)}
                        filteredNominalVoltages={filteredNominalVoltages}
                        openVoltageLevel={openVoltageLevel}
                        centerOnSubstation={centerOnSubstation}
                        /* TODO verif tableEquipment*/
                        selectedNodeUuid={selectedNodeUuid}
                        onChangeTab={props.onChangeTab}
                        showInSpreadsheet={showInSpreadsheet}
                    />
                    {displayOverloadTable && linesNearOverload() && (
                        <div className={classes.divOverloadedLineView}>
                            <OverloadedLinesView
                                lines={network.lines}
                                lineFlowAlertThreshold={lineFlowAlertThreshold}
                                network={network}
                            />
                        </div>
                    )}
                    <div className={classes.divRunButton}>
                        <RunButtonContainer
                            studyUuid={studyUuid}
                            selectedNodeUuid={selectedNodeUuid}
                            loadFlowStatus={getLoadFlowRunningStatus(
                                loadFlowInfos
                            )}
                            securityAnalysisStatus={securityAnalysisStatus}
                            setIsComputationRunning={setIsComputationRunning}
                            runnable={runnable}
                        />
                    </div>
                </div>
                <StudyLateralToolBar
                    network={network}
                    onVoltageLevelDisplayClick={showVoltageLevelDiagram}
                    onSubstationDisplayClick={showSubstationDiagram}
                    onSubstationFocus={setCenterOnSubstation}
                    visibleSubstation={visibleSubstation}
                    isMap={props.view === StudyView.MAP}
                    setLateralShift={setDrawerShift}
                    studyUuid={studyUuid}
                />

                {/*
                Rendering single line diagram only in map view and if
                displayed voltage level or substation id has been set
                */}
                {props.view === StudyView.MAP &&
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
                                onClose={() => closeVoltageLevelDiagram()}
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
                                loadFlowStatus={getLoadFlowRunningStatus(
                                    loadFlowInfos
                                )}
                                selectedNodeUuid={selectedNodeUuid}
                            />
                        </div>
                    )}
            </div>
        );
    }

    function renderTableView() {
        return (
            <Paper className={clsx('singlestretch-child', classes.table)}>
                <NetworkTable
                    network={network}
                    studyUuid={studyUuid}
                    selectedNodeUuid={selectedNodeUuid}
                    equipmentId={tableEquipment.id}
                    equipmentType={tableEquipment.type}
                    equipmentChanged={tableEquipment.changed}
                />
            </Paper>
        );
    }

    return (
        <>
            {/*Rendering the map is slow, do it once and keep it display:none*/}
            <div
                className="singlestretch-parent singlestretch-child"
                style={{
                    display: props.view === StudyView.MAP ? null : 'none',
                }}
            >
                {renderMapView()}
            </div>
            <div
                className="singlestretch-parent singlestretch-child"
                style={{
                    display:
                        props.view === StudyView.SPREADSHEET ? null : 'none',
                }}
            >
                {renderTableView()}
            </div>
            <div
                className="singlestretch-parent singlestretch-child"
                style={{
                    display: props.view === StudyView.RESULTS ? null : 'none',
                }}
            >
                <ResultViewController
                    studyUuid={studyUuid}
                    selectedNodeUuid={selectedNodeUuid}
                    loadFlowInfos={loadFlowInfos}
                    network={network}
                    openVoltageLevelDiagram={openVoltageLevelDiagram}
                />
            </div>
            <div
                className="singlestretch-parent singlestretch-child"
                style={{
                    display: props.view === StudyView.LOGS ? null : 'none',
                }}
            >
                <ReportViewerController
                    reportId={studyUuid}
                    visible={props.view === StudyView.LOGS}
                />
            </div>
        </>
    );
};

StudyPane.defaultProps = {
    view: StudyView.MAP,
    lineFlowAlertThreshold: 100,
};

StudyPane.propTypes = {
    view: PropTypes.oneOf(Object.values(StudyView)).isRequired,
    lineFlowAlertThreshold: PropTypes.number.isRequired,
    onChangeTab: PropTypes.func,
};

export default StudyPane;
