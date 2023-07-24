/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState, useLayoutEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { RunningStatus } from '../../utils/running-status';
import { equipments } from '../../network/network-equipments';
import {
    getEquipmentTypeFromFeederType,
    MIN_HEIGHT,
    MIN_WIDTH,
    MAX_HEIGHT_SUBSTATION,
    MAX_HEIGHT_VOLTAGE_LEVEL,
    MAX_WIDTH_SUBSTATION,
    MAX_WIDTH_VOLTAGE_LEVEL,
    DiagramType,
    useDiagram,
    useDiagramStyles,
} from '../diagram-common';
import withEquipmentMenu from '../../menus/equipment-menu';
import BaseEquipmentMenu from '../../menus/base-equipment-menu';
import withBranchMenu from '../../menus/branch-menu';
import { SingleLineDiagramViewer } from '@powsybl/diagram-viewer';
import { isNodeReadOnly } from '../../graph/util/model-functions';
import { useIsAnyNodeBuilding } from '../../utils/is-any-node-building-hook';
import {
    deleteEquipment,
    startShortCircuitAnalysis,
    fetchNetworkElementInfos,
    updateSwitchState,
} from '../../../utils/rest-api';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import { useSnackMessage } from '@gridsuite/commons-ui';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import GeneratorModificationDialog from 'components/dialogs/network-modifications/generator/modification/generator-modification-dialog';
import LoadModificationDialog from 'components/dialogs/network-modifications/load/modification/load-modification-dialog';
import EquipmentPopover from '../../tooltips/equipment-popover';
import TwoWindingsTransformerModificationDialog from 'components/dialogs/network-modifications/two-windings-transformer/modification/two-windings-transformer-modification-dialog';
import LineModificationDialog from 'components/dialogs/network-modifications/line/modification/line-modification-dialog';
import { BusMenu } from 'components/menus/bus-menu';
import { setComputingStatus } from 'redux/actions';
import { ComputingType } from 'components/computing-status/computing-type';
import { useDispatch } from 'react-redux';
import { useParameterState } from 'components/dialogs/parameters/parameters';
import { PARAM_DEVELOPER_MODE } from 'utils/config-params';
import {
    EQUIPMENT_INFOS_TYPES,
    EQUIPMENT_TYPES,
} from '../../utils/equipment-types';
import EquipmentDeletionDialog from '../../dialogs/network-modifications/equipment-deletion/equipment-deletion-dialog';

function SingleLineDiagramContent(props) {
    const { studyUuid } = props;
    const classes = useDiagramStyles();
    const { diagramSizeSetter, showOneBusShortcircuitResults } = props;
    const theme = useTheme();
    const dispatch = useDispatch();
    const MenuBranch = withBranchMenu(BaseEquipmentMenu);
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
    const [equipmentPopoverAnchorEl, setEquipmentPopoverAnchorEl] =
        useState(null);
    const [hoveredEquipmentId, setHoveredEquipmentId] = useState('');
    const [hoveredEquipmentType, setHoveredEquipmentType] = useState('');
    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

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

                updateSwitchState(
                    studyUuid,
                    currentNode?.id,
                    breakerId,
                    newSwitchState
                ).catch((error) => {
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
            deleteEquipment(
                studyUuid,
                currentNode?.id,
                equipmentType,
                equipmentId,
                undefined
            ).catch((error) => {
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
            dispatch(
                setComputingStatus(
                    ComputingType.ONE_BUS_SHORTCIRCUIT_ANALYSIS,
                    RunningStatus.RUNNING
                )
            );
            startShortCircuitAnalysis(studyUuid, currentNode?.id, busId)
                .then(() => showOneBusShortcircuitResults())
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'startShortCircuitError',
                    });
                    dispatch(
                        setComputingStatus(
                            ComputingType.ONE_BUS_SHORTCIRCUIT_ANALYSIS,
                            RunningStatus.FAILED
                        )
                    );
                })
                .finally(closeBusMenu());
        },
        [
            closeBusMenu,
            currentNode?.id,
            studyUuid,
            showOneBusShortcircuitResults,
            snackError,
            dispatch,
        ]
    );

    const displayBusMenu = () => {
        return (
            busMenu.display && (
                <BusMenu
                    handleRunShortcircuitAnalysis={
                        handleRunShortcircuitAnalysis
                    }
                    busId={busMenu.busId}
                    position={busMenu.position}
                    closeBusMenu={closeBusMenu}
                />
            )
        );
    };

    const handleDeleteEquipment = useCallback(
        (equipmentType, equipmentId) => {
            if (equipmentType !== EQUIPMENT_TYPES.HVDC_LINE.type) {
                removeEquipment(equipmentType, equipmentId);
            } else {
                // need a query to know the HVDC converters type (LCC vs VSC)
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNode?.id,
                    EQUIPMENT_TYPES.HVDC_LINE.type,
                    EQUIPMENT_INFOS_TYPES.MAP.type,
                    equipmentId,
                    false
                )
                    .then((hvdcInfos) => {
                        if (hvdcInfos?.hvdcType === 'LCC') {
                            // only hvdc line with LCC requires a Dialog (to select MCS)
                            handleOpenDeletionDialog(
                                equipmentId,
                                equipments.hvdcLines
                            );
                        } else {
                            removeEquipment(equipmentType, equipmentId);
                        }
                    })
                    .catch(() => {
                        snackError({
                            messageId: 'NetworkElementNotFound',
                            messageValues: { elementId: equipmentId },
                        });
                    });
            }
        },
        [
            studyUuid,
            currentNode?.id,
            snackError,
            handleOpenDeletionDialog,
            removeEquipment,
        ]
    );

    const displayBranchMenu = () => {
        return (
            equipmentMenu.display &&
            (equipmentMenu.equipmentType === equipments.lines ||
                equipmentMenu.equipmentType ===
                    equipments.twoWindingsTransformers) && (
                <MenuBranch
                    equipment={{ id: equipmentMenu.equipmentId }}
                    equipmentType={equipmentMenu.equipmentType}
                    position={equipmentMenu.position}
                    handleClose={closeEquipmentMenu}
                    handleViewInSpreadsheet={handleViewInSpreadsheet}
                    handleDeleteEquipment={handleDeleteEquipment}
                    handleOpenModificationDialog={handleOpenModificationDialog}
                    currentNode={currentNode}
                    studyUuid={studyUuid}
                    modificationInProgress={modificationInProgress}
                    setModificationInProgress={setModificationInProgress}
                />
            )
        );
    };

    const displayMenu = (equipmentType, menuId) => {
        const Menu = withEquipmentMenu(
            BaseEquipmentMenu,
            menuId,
            equipmentType
        );
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
                loadFlowStatus={props.loadFlowStatus}
            />
        );
    };

    const displayModificationDialog = () => {
        switch (equipmentToModify.equipmentType) {
            case equipments.generators:
                return (
                    <GeneratorModificationDialog
                        open={true}
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        onClose={() => closeModificationDialog()}
                        defaultIdValue={equipmentToModify.equipmentId}
                    />
                );
            case equipments.loads:
                return (
                    <LoadModificationDialog
                        open={true}
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        onClose={() => closeModificationDialog()}
                        defaultIdValue={equipmentToModify.equipmentId}
                    />
                );
            case equipments.twoWindingsTransformers:
                return (
                    <TwoWindingsTransformerModificationDialog
                        open={true}
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        defaultIdValue={equipmentToModify.equipmentId}
                        isUpdate={true}
                        onClose={() => closeModificationDialog()}
                    />
                );
            case equipments.lines:
                return (
                    <LineModificationDialog
                        open={true}
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        defaultIdValue={equipmentToModify.equipmentId}
                        isUpdate={true}
                        onClose={() => closeModificationDialog()}
                    />
                );
            default:
                return <></>;
        }
    };

    const displayDeletionDialog = () => {
        switch (equipmentToDelete.equipmentType) {
            case equipments.hvdcLines:
                return (
                    <EquipmentDeletionDialog
                        open={true}
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        defaultIdValue={equipmentToDelete.equipmentId}
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
                !props.isComputationRunning &&
                !isAnyNodeBuilding &&
                !modificationInProgress &&
                !props.loadingState;

            const diagramViewer = new SingleLineDiagramViewer(
                svgRef.current, //container
                props.svg, //svgContent
                props.svgMetadata, //svg metadata
                props.svgType, //svg type
                MIN_WIDTH, // minWidth
                MIN_HEIGHT, // minHeight

                // maxWidth
                props.svgType === DiagramType.VOLTAGE_LEVEL
                    ? MAX_WIDTH_VOLTAGE_LEVEL
                    : MAX_WIDTH_SUBSTATION,

                // maxHeight
                props.svgType === DiagramType.VOLTAGE_LEVEL
                    ? MAX_HEIGHT_VOLTAGE_LEVEL
                    : MAX_HEIGHT_SUBSTATION,

                // callback on the next voltage arrows
                isReadyForInteraction ? handleNextVoltageLevelClick : null,

                // callback on the breakers
                isReadyForInteraction && !isNodeReadOnly(currentNode)
                    ? handleBreakerClick
                    : null,

                // callback on the feeders
                isReadyForInteraction ? showEquipmentMenu : null,

                // callback on the buses
                isReadyForInteraction && enableDeveloperMode
                    ? showBusMenu
                    : null,

                // arrows color
                theme.palette.background.paper,

                // Toggle popover
                handleTogglePopover
            );

            // Update the diagram-pane's list of sizes with the width and height from the backend
            diagramSizeSetter(
                props.diagramId,
                props.svgType,
                diagramViewer.getWidth(),
                diagramViewer.getHeight()
            );

            // Rotate clicked switch while waiting for updated sld data
            if (locallySwitchedBreaker?.id) {
                const breakerToSwitchDom = document.getElementById(
                    locallySwitchedBreaker.id
                );
                if (breakerToSwitchDom.classList.value.includes('sld-closed')) {
                    breakerToSwitchDom.classList.replace(
                        'sld-closed',
                        'sld-open'
                    );
                } else if (
                    breakerToSwitchDom.classList.value.includes('sld-open')
                ) {
                    breakerToSwitchDom.classList.replace(
                        'sld-open',
                        'sld-closed'
                    );
                }
            }

            // If a previous diagram was loaded and the diagram's size remained the same, we keep
            // the user's zoom and scoll state for the current render.
            if (
                diagramViewerRef.current &&
                diagramViewer.getWidth() ===
                    diagramViewerRef.current.getWidth() &&
                diagramViewer.getHeight() ===
                    diagramViewerRef.current.getHeight()
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
        props.isComputationRunning,
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
                {(props.loadingState || modificationInProgress) && (
                    <LinearProgress />
                )}
            </Box>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            <div
                ref={svgRef}
                className={clsx(
                    classes.divDiagram,
                    classes.divSingleLineDiagram,
                    {
                        [classes.divDiagramInvalid]:
                            props.loadFlowStatus !== RunningStatus.SUCCEED,
                    }
                )}
                style={{ height: '100%' }}
            />
            {shouldDisplayTooltip && displayTooltip()}
            {displayBranchMenu()}
            {displayBusMenu()}
            {displayMenu(equipments.loads, 'load-menus')}
            {displayMenu(equipments.batteries, 'battery-menus')}
            {displayMenu(equipments.danglingLines, 'dangling-line-menus')}
            {displayMenu(equipments.generators, 'generator-menus')}
            {displayMenu(
                equipments.staticVarCompensators,
                'static-var-compensator-menus'
            )}
            {displayMenu(
                equipments.shuntCompensators,
                'shunt-compensator-menus'
            )}
            {displayMenu(
                equipments.threeWindingsTransformers,
                'three-windings-transformer-menus'
            )}
            {displayMenu(equipments.hvdcLines, 'hvdc-line-menus')}
            {displayMenu(
                equipments.lccConverterStations,
                'lcc-converter-station-menus'
            )}
            {displayMenu(
                equipments.vscConverterStations,
                'vsc-converter-station-menus'
            )}
            {equipmentToModify && displayModificationDialog()}
            {equipmentToDelete && displayDeletionDialog()}
        </>
    );
}

SingleLineDiagramContent.propTypes = {
    loadFlowStatus: PropTypes.any,
    isComputationRunning: PropTypes.bool,
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
