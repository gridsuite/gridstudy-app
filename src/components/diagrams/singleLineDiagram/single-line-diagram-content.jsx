/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { RunningStatus } from '../../utils/running-status';
import {
    DiagramType,
    getEquipmentTypeFromFeederType,
    MAX_HEIGHT_SUBSTATION,
    MAX_HEIGHT_VOLTAGE_LEVEL,
    MAX_WIDTH_SUBSTATION,
    MAX_WIDTH_VOLTAGE_LEVEL,
    MIN_HEIGHT,
    MIN_WIDTH,
    styles,
    useDiagram,
} from '../diagram-common';
import withEquipmentMenu from '../../menus/equipment-menu';
import BaseEquipmentMenu from '../../menus/base-equipment-menu';
import withOperatingStatusMenu from '../../menus/operating-status-menu';
import { SingleLineDiagramViewer } from '@powsybl/diagram-viewer';
import { isNodeReadOnly } from '../../graph/util/model-functions';
import { useIsAnyNodeBuilding } from '../../utils/is-any-node-building-hook';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import { useSnackMessage } from '@gridsuite/commons-ui';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import GeneratorModificationDialog from 'components/dialogs/network-modifications/generator/modification/generator-modification-dialog';
import LoadModificationDialog from 'components/dialogs/network-modifications/load/modification/load-modification-dialog';
import BatteryModificationDialog from '../../dialogs/network-modifications/battery/modification/battery-modification-dialog';
import EquipmentPopover from '../../tooltips/equipment-popover';
import TwoWindingsTransformerModificationDialog from 'components/dialogs/network-modifications/two-windings-transformer/modification/two-windings-transformer-modification-dialog';
import LineModificationDialog from 'components/dialogs/network-modifications/line/modification/line-modification-dialog';
import ShuntCompensatorModificationDialog from 'components/dialogs/network-modifications/shunt-compensator/modification/shunt-compensator-modification-dialog';
import { deleteEquipment, updateSwitchState } from '../../../services/study/network-modifications';
import { BusMenu } from 'components/menus/bus-menu';
import { ComputingType } from 'components/computing-status/computing-type';
import { useParameterState } from 'components/dialogs/parameters/parameters';
import { PARAM_DEVELOPER_MODE } from 'utils/config-params';
import { EQUIPMENT_INFOS_TYPES, EQUIPMENT_TYPES } from '../../utils/equipment-types';
import EquipmentDeletionDialog from '../../dialogs/network-modifications/equipment-deletion/equipment-deletion-dialog';
import { startShortCircuitAnalysis } from '../../../services/study/short-circuit-analysis';
import { fetchNetworkElementInfos } from '../../../services/study/network';
import { mergeSx } from '../../utils/functions';
import { useOneBusShortcircuitAnalysisLoader } from '../use-one-bus-shortcircuit-analysis-loader';
import { DynamicSimulationEventDialog } from '../../dialogs/dynamicsimulation/event/dynamic-simulation-event-dialog';
import { setComputationStarting, setComputingStatus } from '../../../redux/actions';

function SingleLineDiagramContent(props) {
    const { diagramSizeSetter, studyUuid } = props;
    const theme = useTheme();
    const dispatch = useDispatch();
    const MenuBranch = withOperatingStatusMenu(BaseEquipmentMenu);
    const svgRef = useRef();
    const diagramViewerRef = useRef();
    const { snackError } = useSnackMessage();
    const currentNode = useSelector((state) => state.currentTreeNode);
    const [modificationInProgress, setModificationInProgress] = useState(false);
    const isAnyNodeBuilding = useIsAnyNodeBuilding();
    const [locallySwitchedBreaker, setLocallySwitchedBreaker] = useState();
    const [errorMessage, setErrorMessage] = useState('');
    const { openDiagramView } = useDiagram();
    const [equipmentToModify, setEquipmentToModify] = useState();
    const [equipmentToDelete, setEquipmentToDelete] = useState();
    const [shouldDisplayTooltip, setShouldDisplayTooltip] = useState(false);
    const [equipmentPopoverAnchorEl, setEquipmentPopoverAnchorEl] = useState(null);
    const [hoveredEquipmentId, setHoveredEquipmentId] = useState('');
    const [hoveredEquipmentType, setHoveredEquipmentType] = useState('');
    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);
    const computationStarting = useSelector((state) => state.computationStarting);
    const loadFlowStatus = useSelector((state) => state.computingStatus[ComputingType.LOAD_FLOW]);

    const [
        oneBusShortcircuitAnalysisLoaderMessage,
        isDiagramRunningOneBusShortcircuitAnalysis,
        displayOneBusShortcircuitAnalysisLoader,
        resetOneBusShortcircuitAnalysisLoader,
    ] = useOneBusShortcircuitAnalysisLoader(props.diagramId, currentNode.id);

    // dynamic simulation event configuration states
    const [equipmentToConfigDynamicSimulationEvent, setEquipmentToConfigDynamicSimulationEvent] = useState();
    const [dynamicSimulationEventDialogTitle, setDynamicSimulationEventDialogTitle] = useState('');

    /**
     * DIAGRAM INTERACTIVITY
     */

    const closeEquipmentMenu = useCallback(() => {
        setEquipmentMenu({
            display: false,
        });
    }, []);

    const handleOpenModificationDialog = (equipmentId, equipmentType) => {
        closeEquipmentMenu();
        setEquipmentToModify({ equipmentId, equipmentType });
    };

    const handleOpenDeletionDialog = useCallback(
        (equipmentId, equipmentType) => {
            closeEquipmentMenu();
            setEquipmentToDelete({ equipmentId, equipmentType });
        },
        [closeEquipmentMenu]
    );

    const closeModificationDialog = () => {
        setEquipmentToModify();
    };

    const closeDeletionDialog = () => {
        setEquipmentToDelete();
    };

    const handleTogglePopover = useCallback(
        (shouldDisplay, currentTarget, equipmentId, equipmentType) => {
            setShouldDisplayTooltip(shouldDisplay);
            if (shouldDisplay) {
                setHoveredEquipmentId(equipmentId);
                setEquipmentPopoverAnchorEl(currentTarget);
                setHoveredEquipmentType(equipmentType);
            } else {
                setHoveredEquipmentId('');
                setEquipmentPopoverAnchorEl(null);
                setHoveredEquipmentType('');
            }
        },
        [setShouldDisplayTooltip]
    );

    const handleBreakerClick = useCallback(
        (breakerId, newSwitchState, switchElement) => {
            if (!modificationInProgress) {
                setModificationInProgress(true);
                setLocallySwitchedBreaker(switchElement);

                updateSwitchState(studyUuid, currentNode?.id, breakerId, newSwitchState).catch((error) => {
                    console.error(error.message);
                    setErrorMessage(error.message);
                });
            }
        },
        [studyUuid, currentNode, modificationInProgress]
    );

    const handleNextVoltageLevelClick = useCallback(
        (id) => {
            // This function is called by powsybl-diagram-viewer when clicking on a navigation arrow in a single line diagram.
            // At the moment, there is no plan to open something other than a voltage-level by using these navigation arrows.
            if (!studyUuid || !currentNode) {
                return;
            }
            openDiagramView(id, DiagramType.VOLTAGE_LEVEL);
        },
        [studyUuid, currentNode, openDiagramView]
    );

    const [equipmentMenu, setEquipmentMenu] = useState({
        position: [-1, -1],
        equipmentId: null,
        equipmentType: null,
        svgId: null,
        display: null,
    });

    const [busMenu, setBusMenu] = useState({
        position: [-1, -1],
        busId: null,
        svgId: null,
        display: null,
    });

    const showBusMenu = useCallback(
        (busId, svgId, x, y) => {
            handleTogglePopover(false, null, null);
            setBusMenu({
                position: [x, y],
                busId: busId,
                svgId: svgId,
                display: true,
            });
        },
        [setBusMenu, handleTogglePopover]
    );

    const showEquipmentMenu = useCallback(
        (equipmentId, equipmentType, svgId, x, y) => {
            handleTogglePopover(false, null, null);
            setEquipmentMenu({
                position: [x, y],
                equipmentId: equipmentId,
                equipmentType: getEquipmentTypeFromFeederType(equipmentType),
                svgId: svgId,
                display: true,
            });
        },
        [handleTogglePopover]
    );

    const closeBusMenu = useCallback(() => {
        setBusMenu({
            display: false,
        });
    }, []);

    const handleViewInSpreadsheet = () => {
        props.showInSpreadsheet(equipmentMenu);
        closeEquipmentMenu();
    };

    const removeEquipment = useCallback(
        (equipmentType, equipmentId) => {
            deleteEquipment(studyUuid, currentNode?.id, equipmentType, equipmentId, undefined).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'UnableToDeleteEquipment',
                });
            });
            closeEquipmentMenu();
        },
        [studyUuid, currentNode?.id, closeEquipmentMenu, snackError]
    );

    const handleRunShortcircuitAnalysis = useCallback(
        (busId) => {
            dispatch(setComputingStatus(ComputingType.SHORT_CIRCUIT_ONE_BUS, RunningStatus.RUNNING));
            displayOneBusShortcircuitAnalysisLoader();
            dispatch(setComputationStarting(true));
            startShortCircuitAnalysis(studyUuid, currentNode?.id, busId)
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'startShortCircuitError',
                    });
                    dispatch(setComputingStatus(ComputingType.SHORT_CIRCUIT_ONE_BUS, RunningStatus.FAILED));
                    resetOneBusShortcircuitAnalysisLoader();
                })
                .finally(() => dispatch(setComputationStarting(false)));
        },
        [
            dispatch,
            displayOneBusShortcircuitAnalysisLoader,
            studyUuid,
            currentNode?.id,
            snackError,
            resetOneBusShortcircuitAnalysisLoader,
        ]
    );

    const displayBusMenu = () => {
        return (
            busMenu.display && (
                <BusMenu
                    handleRunShortcircuitAnalysis={handleRunShortcircuitAnalysis}
                    onOpenDynamicSimulationEventDialog={handleOpenDynamicSimulationEventDialog}
                    busId={busMenu.busId}
                    position={busMenu.position}
                    onClose={closeBusMenu}
                />
            )
        );
    };

    const handleDeleteEquipment = useCallback(
        (equipmentType, equipmentId) => {
            if (equipmentType !== EQUIPMENT_TYPES.HVDC_LINE) {
                removeEquipment(equipmentType, equipmentId);
            } else {
                // need a query to know the HVDC converters type (LCC vs VSC)
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNode?.id,
                    EQUIPMENT_TYPES.HVDC_LINE,
                    EQUIPMENT_INFOS_TYPES.MAP.type,
                    equipmentId,
                    false
                )
                    .then((hvdcInfos) => {
                        if (hvdcInfos?.hvdcType === 'LCC') {
                            // only hvdc line with LCC requires a Dialog (to select MCS)
                            handleOpenDeletionDialog(equipmentId, EQUIPMENT_TYPES.HVDC_LINE);
                        } else {
                            removeEquipment(equipmentType, equipmentId);
                        }
                    })
                    .catch(() => {
                        snackError({
                            messageId: 'NetworkEquipmentNotFound',
                            messageValues: { equipmentId: equipmentId },
                        });
                    });
            }
        },
        [studyUuid, currentNode?.id, snackError, handleOpenDeletionDialog, removeEquipment]
    );

    const handleOpenDynamicSimulationEventDialog = useCallback((equipmentId, equipmentType, dialogTitle) => {
        setDynamicSimulationEventDialogTitle(dialogTitle);
        setEquipmentToConfigDynamicSimulationEvent({
            equipmentId,
            equipmentType,
        });
    }, []);

    const handleCloseDynamicSimulationEventDialog = useCallback(() => {
        setEquipmentToConfigDynamicSimulationEvent(undefined);
    }, []);

    const displayBranchMenu = () => {
        return (
            equipmentMenu.display &&
            [
                EQUIPMENT_TYPES.LINE,
                EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER,
                EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER,
                EQUIPMENT_TYPES.HVDC_LINE,
            ].includes(equipmentMenu.equipmentType) && (
                <MenuBranch
                    equipment={{ id: equipmentMenu.equipmentId }}
                    equipmentType={equipmentMenu.equipmentType}
                    position={equipmentMenu.position}
                    handleClose={closeEquipmentMenu}
                    handleViewInSpreadsheet={handleViewInSpreadsheet}
                    handleDeleteEquipment={handleDeleteEquipment}
                    handleOpenModificationDialog={handleOpenModificationDialog}
                    onOpenDynamicSimulationEventDialog={handleOpenDynamicSimulationEventDialog}
                    currentNode={currentNode}
                    studyUuid={studyUuid}
                    modificationInProgress={modificationInProgress}
                    setModificationInProgress={setModificationInProgress}
                />
            )
        );
    };

    const displayMenu = (equipmentType, menuId) => {
        const Menu = withEquipmentMenu(BaseEquipmentMenu, menuId, equipmentType);
        return (
            equipmentMenu.display &&
            equipmentMenu.equipmentType === equipmentType && (
                <Menu
                    equipment={{ id: equipmentMenu.equipmentId }}
                    position={equipmentMenu.position}
                    handleClose={closeEquipmentMenu}
                    handleViewInSpreadsheet={handleViewInSpreadsheet}
                    handleOpenModificationDialog={handleOpenModificationDialog}
                    handleDeleteEquipment={handleDeleteEquipment}
                    onOpenDynamicSimulationEventDialog={handleOpenDynamicSimulationEventDialog}
                />
            )
        );
    };

    const displayTooltip = () => {
        return (
            <EquipmentPopover
                studyUuid={studyUuid}
                anchorEl={equipmentPopoverAnchorEl}
                equipmentType={hoveredEquipmentType}
                equipmentId={hoveredEquipmentId}
                loadFlowStatus={loadFlowStatus}
            />
        );
    };

    const displayModificationDialog = () => {
        let CurrentModificationDialog;
        switch (equipmentToModify.equipmentType) {
            case EQUIPMENT_TYPES.BATTERY:
                CurrentModificationDialog = BatteryModificationDialog;
                break;
            case EQUIPMENT_TYPES.GENERATOR:
                CurrentModificationDialog = GeneratorModificationDialog;
                break;
            case EQUIPMENT_TYPES.LOAD:
                CurrentModificationDialog = LoadModificationDialog;
                break;
            case EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER:
                CurrentModificationDialog = TwoWindingsTransformerModificationDialog;
                break;
            case EQUIPMENT_TYPES.LINE:
                CurrentModificationDialog = LineModificationDialog;
                break;
            case EQUIPMENT_TYPES.SHUNT_COMPENSATOR:
                CurrentModificationDialog = ShuntCompensatorModificationDialog;
                break;
            default:
                return <></>;
        }
        return (
            <CurrentModificationDialog
                open={true}
                studyUuid={studyUuid}
                currentNode={currentNode}
                defaultIdValue={equipmentToModify?.equipmentId}
                isUpdate={true}
                onClose={() => closeModificationDialog()}
            />
        );
    };

    const displayDeletionDialog = () => {
        switch (equipmentToDelete.equipmentType) {
            case EQUIPMENT_TYPES.HVDC_LINE:
                return (
                    <EquipmentDeletionDialog
                        open={true}
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        defaultIdValue={equipmentToDelete?.equipmentId}
                        isUpdate={true}
                        onClose={() => closeDeletionDialog()}
                    />
                );
            default:
                return <></>;
        }
    };

    /**
     * DIAGRAM CONTENT BUILDING
     */

    useLayoutEffect(() => {
        if (props.svg) {
            const isReadyForInteraction =
                !computationStarting && !isAnyNodeBuilding && !modificationInProgress && !props.loadingState;

            const diagramViewer = new SingleLineDiagramViewer(
                svgRef.current, //container
                props.svg, //svgContent
                props.svgMetadata, //svg metadata
                props.svgType, //svg type
                MIN_WIDTH, // minWidth
                MIN_HEIGHT, // minHeight

                // maxWidth
                props.svgType === DiagramType.VOLTAGE_LEVEL ? MAX_WIDTH_VOLTAGE_LEVEL : MAX_WIDTH_SUBSTATION,

                // maxHeight
                props.svgType === DiagramType.VOLTAGE_LEVEL ? MAX_HEIGHT_VOLTAGE_LEVEL : MAX_HEIGHT_SUBSTATION,

                // callback on the next voltage arrows
                isReadyForInteraction ? handleNextVoltageLevelClick : null,

                // callback on the breakers
                isReadyForInteraction && !isNodeReadOnly(currentNode) ? handleBreakerClick : null,

                // callback on the feeders
                isReadyForInteraction ? showEquipmentMenu : null,

                // callback on the buses
                isReadyForInteraction ? showBusMenu : null,

                // arrows color
                theme.palette.background.paper,

                // Toggle popover
                handleTogglePopover
            );

            // Update the diagram-pane's list of sizes with the width and height from the backend
            diagramSizeSetter(props.diagramId, props.svgType, diagramViewer.getWidth(), diagramViewer.getHeight());

            // Rotate clicked switch while waiting for updated sld data
            if (locallySwitchedBreaker?.id) {
                const breakerToSwitchDom = document.getElementById(locallySwitchedBreaker.id);
                if (breakerToSwitchDom.classList.value.includes('sld-closed')) {
                    breakerToSwitchDom.classList.replace('sld-closed', 'sld-open');
                } else if (breakerToSwitchDom.classList.value.includes('sld-open')) {
                    breakerToSwitchDom.classList.replace('sld-open', 'sld-closed');
                }
            }

            // If a previous diagram was loaded and the diagram's size remained the same, we keep
            // the user's zoom and scoll state for the current render.
            if (
                diagramViewerRef.current &&
                diagramViewer.getWidth() === diagramViewerRef.current.getWidth() &&
                diagramViewer.getHeight() === diagramViewerRef.current.getHeight()
            ) {
                diagramViewer.setViewBox(diagramViewerRef.current.getViewBox());
            }

            diagramViewerRef.current = diagramViewer;
        }
    }, [
        props.svgUrl,
        props.svg,
        props.svgMetadata,
        currentNode,
        isAnyNodeBuilding,
        equipmentMenu,
        showEquipmentMenu,
        showBusMenu,
        enableDeveloperMode,
        props.diagramId,
        props.svgType,
        theme,
        modificationInProgress,
        props.loadingState,
        locallySwitchedBreaker,
        handleBreakerClick,
        handleNextVoltageLevelClick,
        diagramSizeSetter,
        handleTogglePopover,
        computationStarting,
    ]);

    // When the loading is finished, we always reset these two states
    useLayoutEffect(() => {
        if (!props.loadingState) {
            setModificationInProgress(false);
            setLocallySwitchedBreaker(null);
        }
    }, [
        props.loadingState, // the only one changing
        setModificationInProgress,
        setLocallySwitchedBreaker,
    ]);

    /**
     * RENDER
     */

    return (
        <>
            <Box height={2}>
                {(props.loadingState || modificationInProgress || isDiagramRunningOneBusShortcircuitAnalysis) && (
                    <LinearProgress />
                )}
                {oneBusShortcircuitAnalysisLoaderMessage}
            </Box>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            <Box
                ref={svgRef}
                sx={mergeSx(
                    styles.divDiagram,
                    styles.divSingleLineDiagram,
                    loadFlowStatus !== RunningStatus.SUCCEED && styles.divDiagramInvalid
                )}
                style={{ height: '100%' }}
            />
            {shouldDisplayTooltip && displayTooltip()}
            {displayBranchMenu()}
            {displayBusMenu()}
            {displayMenu(EQUIPMENT_TYPES.LOAD, 'load-menus')}
            {displayMenu(EQUIPMENT_TYPES.BATTERY, 'battery-menus')}
            {displayMenu(EQUIPMENT_TYPES.DANGLING_LINE, 'dangling-line-menus')}
            {displayMenu(EQUIPMENT_TYPES.GENERATOR, 'generator-menus')}
            {displayMenu(EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR, 'static-var-compensator-menus')}
            {displayMenu(EQUIPMENT_TYPES.SHUNT_COMPENSATOR, 'shunt-compensator-menus')}
            {displayMenu(EQUIPMENT_TYPES.LCC_CONVERTER_STATION, 'lcc-converter-station-menus')}
            {displayMenu(EQUIPMENT_TYPES.VSC_CONVERTER_STATION, 'vsc-converter-station-menus')}
            {equipmentToModify && displayModificationDialog()}
            {equipmentToDelete && displayDeletionDialog()}
            {equipmentToConfigDynamicSimulationEvent && (
                <DynamicSimulationEventDialog
                    studyUuid={studyUuid}
                    currentNodeId={currentNode?.id}
                    equipmentId={equipmentToConfigDynamicSimulationEvent.equipmentId}
                    equipmentType={equipmentToConfigDynamicSimulationEvent.equipmentType}
                    onClose={() => handleCloseDynamicSimulationEventDialog()}
                    title={dynamicSimulationEventDialogTitle}
                />
            )}
        </>
    );
}

SingleLineDiagramContent.propTypes = {
    showInSpreadsheet: PropTypes.func,
    studyUuid: PropTypes.string,
    svgType: PropTypes.string,
    svg: PropTypes.string,
    svgMetadata: PropTypes.object,
    loadingState: PropTypes.bool,
    diagramSizeSetter: PropTypes.func,
    diagramId: PropTypes.string,
};

export default SingleLineDiagramContent;
