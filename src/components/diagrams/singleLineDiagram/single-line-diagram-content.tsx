/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RunningStatus } from '../../utils/running-status';
import {
    getEquipmentTypeFromFeederType,
    MAX_HEIGHT_SUBSTATION,
    MAX_HEIGHT_VOLTAGE_LEVEL,
    MAX_WIDTH_SUBSTATION,
    MAX_WIDTH_VOLTAGE_LEVEL,
    MIN_HEIGHT,
    MIN_WIDTH,
    styles,
} from '../diagram-common';
import withEquipmentMenu from '../../menus/equipment-menu';
import BaseEquipmentMenu, { MapEquipment } from '../../menus/base-equipment-menu';
import withOperatingStatusMenu from '../../menus/operating-status-menu';
import { OnBreakerCallbackType, SingleLineDiagramViewer, SLDMetadata } from '@powsybl/network-viewer';
import { isNodeReadOnly } from '../../graph/util/model-functions';
import { useIsAnyNodeBuilding } from '../../utils/is-any-node-building-hook';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import { EquipmentType, mergeSx, useSnackMessage } from '@gridsuite/commons-ui';
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
import { PARAM_DEVELOPER_MODE } from 'utils/config-params';
import { EQUIPMENT_INFOS_TYPES, EQUIPMENT_TYPES, convertToEquipmentType } from '../../utils/equipment-types';
import EquipmentDeletionDialog from '../../dialogs/network-modifications/equipment-deletion/equipment-deletion-dialog';
import { startShortCircuitAnalysis } from '../../../services/study/short-circuit-analysis';
import { fetchNetworkElementInfos } from '../../../services/study/network';
import { useOneBusShortcircuitAnalysisLoader } from '../use-one-bus-shortcircuit-analysis-loader';
import { DynamicSimulationEventDialog } from '../../dialogs/dynamicsimulation/event/dynamic-simulation-event-dialog';
import { setComputationStarting, setComputingStatus, setLogsFilter } from '../../../redux/actions';
import { AppState } from 'redux/reducer';
import { UUID } from 'crypto';
import { INVALID_LOADFLOW_OPACITY } from '../../../utils/colors';
import { useParameterState } from 'components/dialogs/parameters/use-parameters-state';
import { DiagramType } from '../diagram.type';
import { useDiagram } from '../use-diagram';

type EquipmentMenuState = {
    position: [number, number];
    equipmentId: string | null;
    equipmentType: EQUIPMENT_TYPES | null;
    svgId: string | null;
    display: boolean;
};
interface SingleLineDiagramContentProps {
    readonly showInSpreadsheet: (menu: { equipmentId: string | null; equipmentType: EquipmentType | null }) => void;
    readonly studyUuid: UUID;
    readonly svgType: DiagramType;
    readonly svg?: string;
    readonly svgMetadata?: SLDMetadata;
    readonly loadingState: boolean;
    readonly diagramSizeSetter: (id: UUID, type: DiagramType, width: number, height: number) => void;
    readonly diagramId: UUID;
    readonly visible: boolean;
}

type EquipmentToModify = {
    equipmentId: string;
    equipmentType: EQUIPMENT_TYPES;
};

const defaultMenuState: EquipmentMenuState = {
    position: [-1, -1],
    equipmentId: null,
    equipmentType: null,
    svgId: null,
    display: false,
};

type BusMenuState = {
    position: [number, number];
    busId: string | null;
    svgId: string | null;
    display: boolean;
};

const defaultBusMenuState: BusMenuState = {
    position: [-1, -1],
    busId: null,
    svgId: null,
    display: false,
};

// Function to apply invalid styles for sld
function applyInvalidStyles(svgContainer: HTMLElement) {
    // Add invalid loadflow opacity for specific classes
    const invalidElements = svgContainer.querySelectorAll(
        '.sld-active-power, .sld-reactive-power, .sld-voltage, .sld-angle'
    );
    invalidElements.forEach((element) => {
        (element as HTMLElement).style.opacity = String(INVALID_LOADFLOW_OPACITY);
    });

    // Remove animation for specific classes
    const animatedElements = svgContainer.querySelectorAll('.sld-overload, .sld-vl-overvoltage, .sld-vl-undervoltage');
    animatedElements.forEach((element) => {
        (element as HTMLElement).style.animation = 'none';
    });
}

function SingleLineDiagramContent(props: SingleLineDiagramContentProps) {
    const { diagramSizeSetter, studyUuid, visible } = props;
    const theme = useTheme();
    const dispatch = useDispatch();
    const MenuBranch = withOperatingStatusMenu(BaseEquipmentMenu);
    const svgRef = useRef<HTMLDivElement>();
    const diagramViewerRef = useRef<SingleLineDiagramViewer>();
    const { snackError } = useSnackMessage();
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

    const [modificationInProgress, setModificationInProgress] = useState(false);
    const isAnyNodeBuilding = useIsAnyNodeBuilding();
    const [locallySwitchedBreaker, setLocallySwitchedBreaker] = useState<string>();
    const [errorMessage, setErrorMessage] = useState('');
    const { openDiagramView } = useDiagram();
    const [equipmentToModify, setEquipmentToModify] = useState<EquipmentToModify>();
    const [equipmentToDelete, setEquipmentToDelete] = useState<EquipmentToModify>();
    const [shouldDisplayTooltip, setShouldDisplayTooltip] = useState(false);
    const [equipmentPopoverAnchorEl, setEquipmentPopoverAnchorEl] = useState<EventTarget | null>(null);
    const [hoveredEquipmentId, setHoveredEquipmentId] = useState('');
    const [hoveredEquipmentType, setHoveredEquipmentType] = useState('');
    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);
    const computationStarting = useSelector((state: AppState) => state.computationStarting);
    const loadFlowStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.LOAD_FLOW]);

    const [
        oneBusShortcircuitAnalysisLoaderMessage,
        isDiagramRunningOneBusShortcircuitAnalysis,
        displayOneBusShortcircuitAnalysisLoader,
        resetOneBusShortcircuitAnalysisLoader,
    ] = useOneBusShortcircuitAnalysisLoader(props.diagramId, currentNode?.id!, currentRootNetworkUuid!);

    // dynamic simulation event configuration states
    const [equipmentToConfigDynamicSimulationEvent, setEquipmentToConfigDynamicSimulationEvent] =
        useState<EquipmentToModify>();
    const [dynamicSimulationEventDialogTitle, setDynamicSimulationEventDialogTitle] = useState('');

    /**
     * DIAGRAM INTERACTIVITY
     */

    const closeEquipmentMenu = useCallback(() => {
        setEquipmentMenu({
            ...defaultMenuState,
            display: false,
        });
    }, []);

    const handleOpenModificationDialog = (equipmentId: string, equipmentType: EquipmentType | null) => {
        closeEquipmentMenu();
        const equipmentEnumType = EQUIPMENT_TYPES[equipmentType as keyof typeof EQUIPMENT_TYPES];
        setEquipmentToModify({
            equipmentId,
            equipmentType: equipmentEnumType,
        });
    };

    const handleOpenDeletionDialog = useCallback(
        (equipmentId: string, equipmentType: EQUIPMENT_TYPES) => {
            closeEquipmentMenu();
            setEquipmentToDelete({ equipmentId, equipmentType });
        },
        [closeEquipmentMenu]
    );

    const closeModificationDialog = () => {
        setEquipmentToModify(undefined);
    };

    const closeDeletionDialog = () => {
        setEquipmentToDelete(undefined);
    };
    const handleTogglePopover = useCallback(
        (shouldDisplay: boolean, currentTarget: EventTarget | null, equipmentId: string, equipmentType: string) => {
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

    const handleBreakerClick: OnBreakerCallbackType = useCallback(
        // switchElement should be SVGElement, this will be fixed once https://github.com/powsybl/powsybl-network-viewer/pull/106/ is merged
        (breakerId, newSwitchState, switchElement: any) => {
            if (!modificationInProgress) {
                setModificationInProgress(true);
                setLocallySwitchedBreaker(switchElement?.id);

                updateSwitchState(studyUuid, currentNode?.id, breakerId, newSwitchState).catch((error) => {
                    console.error(error.message);
                    setErrorMessage(error.message);
                });
            }
        },
        [studyUuid, currentNode, modificationInProgress]
    );

    const handleNextVoltageLevelClick = useCallback(
        (id: string) => {
            // This function is called by powsybl-network-viewer when clicking on a navigation arrow in a single line diagram.
            // At the moment, there is no plan to open something other than a voltage-level by using these navigation arrows.
            if (!studyUuid || !currentNode) {
                return;
            }
            openDiagramView(id, DiagramType.VOLTAGE_LEVEL);
        },
        [studyUuid, currentNode, openDiagramView]
    );

    const [equipmentMenu, setEquipmentMenu] = useState<EquipmentMenuState>(defaultMenuState);

    const [busMenu, setBusMenu] = useState<BusMenuState>(defaultBusMenuState);

    const showBusMenu = useCallback(
        (busId: string, svgId: string, x: number, y: number) => {
            handleTogglePopover(false, null, '', '');
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
        (equipmentId: string, equipmentType: string | null, svgId: string, x: number, y: number) => {
            handleTogglePopover(false, null, '', '');
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
            position: [-1, -1],
            busId: null,
            svgId: null,
            display: false,
        });
    }, []);

    const handleViewInSpreadsheet = () => {
        if (equipmentMenu.equipmentId && equipmentMenu.equipmentType) {
            props.showInSpreadsheet({
                equipmentId: equipmentMenu.equipmentId,
                equipmentType: convertToEquipmentType(equipmentMenu.equipmentType),
            });
        }
        closeEquipmentMenu();
    };

    const removeEquipment = useCallback(
        (equipmentType: string, equipmentId: string) => {
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
        (busId: string) => {
            dispatch(setComputingStatus(ComputingType.SHORT_CIRCUIT_ONE_BUS, RunningStatus.RUNNING));
            displayOneBusShortcircuitAnalysisLoader();
            dispatch(setComputationStarting(true));
            startShortCircuitAnalysis(studyUuid, currentNode?.id, currentRootNetworkUuid, busId)
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'startShortCircuitError',
                    });
                    dispatch(setComputingStatus(ComputingType.SHORT_CIRCUIT_ONE_BUS, RunningStatus.FAILED));
                    resetOneBusShortcircuitAnalysisLoader();
                })
                .finally(() => {
                    dispatch(setComputationStarting(false));
                    // we clear the computation logs filter when a new computation is started
                    dispatch(setLogsFilter(ComputingType.SHORT_CIRCUIT_ONE_BUS, []));
                });
        },
        [
            dispatch,
            displayOneBusShortcircuitAnalysisLoader,
            studyUuid,
            currentNode?.id,
            currentRootNetworkUuid,
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
                    busId={busMenu.busId ?? ''}
                    position={busMenu.position}
                    onClose={closeBusMenu}
                    setModificationInProgress={() => {}}
                />
            )
        );
    };

    const handleDeleteEquipment = useCallback(
        (equipmentType: EquipmentType | null, equipmentId: string) => {
            const equipmentEnumType = EQUIPMENT_TYPES[equipmentType as keyof typeof EQUIPMENT_TYPES];
            if (equipmentEnumType !== EQUIPMENT_TYPES.HVDC_LINE) {
                removeEquipment(equipmentEnumType, equipmentId);
            } else {
                // need a query to know the HVDC converters type (LCC vs VSC)
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNode?.id,
                    currentRootNetworkUuid,
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
                            removeEquipment(equipmentEnumType, equipmentId);
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
        [studyUuid, currentNode?.id, currentRootNetworkUuid, snackError, handleOpenDeletionDialog, removeEquipment]
    );

    const handleOpenDynamicSimulationEventDialog = useCallback(
        (equipmentId: string, equipmentType: EquipmentType | null, dialogTitle: string) => {
            setDynamicSimulationEventDialogTitle(dialogTitle);
            setEquipmentToConfigDynamicSimulationEvent({
                equipmentId,
                equipmentType: EQUIPMENT_TYPES[equipmentType as keyof typeof EQUIPMENT_TYPES],
            });
        },
        []
    );

    const handleCloseDynamicSimulationEventDialog = useCallback(() => {
        setEquipmentToConfigDynamicSimulationEvent(undefined);
    }, []);

    const displayBranchMenu = () => {
        return (
            equipmentMenu.display &&
            currentNode &&
            studyUuid &&
            equipmentMenu.equipmentId &&
            equipmentMenu.equipmentType &&
            [
                EQUIPMENT_TYPES.LINE,
                EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER,
                EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER,
                EQUIPMENT_TYPES.HVDC_LINE,
            ].includes(equipmentMenu.equipmentType) && (
                <MenuBranch
                    equipment={{ id: equipmentMenu.equipmentId } as MapEquipment}
                    equipmentType={convertToEquipmentType(equipmentMenu.equipmentType)}
                    position={equipmentMenu.position}
                    handleClose={closeEquipmentMenu}
                    handleViewInSpreadsheet={handleViewInSpreadsheet}
                    handleDeleteEquipment={handleDeleteEquipment}
                    handleOpenModificationDialog={handleOpenModificationDialog}
                    onOpenDynamicSimulationEventDialog={handleOpenDynamicSimulationEventDialog}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    studyUuid={studyUuid}
                    modificationInProgress={modificationInProgress}
                    setModificationInProgress={setModificationInProgress}
                />
            )
        );
    };

    const displayMenu = (equipmentType: EQUIPMENT_TYPES, menuId: string) => {
        const Menu = withEquipmentMenu(
            BaseEquipmentMenu,
            EquipmentType[equipmentType as keyof typeof EquipmentType],
            menuId
        );
        return (
            equipmentMenu.display &&
            equipmentMenu.equipmentId &&
            equipmentMenu.equipmentType === equipmentType && (
                <Menu
                    equipment={{ id: equipmentMenu.equipmentId } as MapEquipment}
                    equipmentType={convertToEquipmentType(equipmentMenu.equipmentType)}
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
        switch (equipmentToModify?.equipmentType) {
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
                currentRootNetworkUuid={currentRootNetworkUuid}
                defaultIdValue={equipmentToModify?.equipmentId}
                isUpdate={true}
                onClose={() => closeModificationDialog()}
                editData={undefined}
                editDataFetchStatus={undefined}
            />
        );
    };

    const displayDeletionDialog = () => {
        switch (equipmentToDelete?.equipmentType) {
            case EQUIPMENT_TYPES.HVDC_LINE:
                return (
                    <EquipmentDeletionDialog
                        open={true}
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                        defaultIdValue={equipmentToDelete?.equipmentId}
                        isUpdate={true}
                        onClose={() => closeDeletionDialog()}
                        editData={undefined}
                        editDataFetchStatus={undefined}
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
        if (props.svg && svgRef.current) {
            const isReadyForInteraction =
                !computationStarting && !isAnyNodeBuilding && !modificationInProgress && !props.loadingState;

            const diagramViewer = new SingleLineDiagramViewer(
                svgRef.current, //container
                props.svg, //svgContent
                props.svgMetadata ?? null, //svg metadata
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
            if (locallySwitchedBreaker) {
                const breakerToSwitchDom: HTMLElement | null = document.getElementById(locallySwitchedBreaker);
                if (breakerToSwitchDom?.classList.value.includes('sld-closed')) {
                    breakerToSwitchDom.classList.replace('sld-closed', 'sld-open');
                } else if (breakerToSwitchDom?.classList.value.includes('sld-open')) {
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
                const viewBox = diagramViewerRef.current.getViewBox();
                if (viewBox) {
                    diagramViewer.setViewBox(viewBox);
                }
            }

            diagramViewerRef.current = diagramViewer;

            // Reapply invalid styles directly on the SVG
            if (loadFlowStatus !== RunningStatus.SUCCEED && svgRef.current) {
                applyInvalidStyles(svgRef.current);
            }
        }
    }, [
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
        loadFlowStatus,
    ]);

    // When the loading is finished, we always reset these two states
    useLayoutEffect(() => {
        if (!props.loadingState) {
            setModificationInProgress(false);
            setLocallySwitchedBreaker(undefined);
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
            <Box ref={svgRef} sx={mergeSx(styles.divDiagram, styles.divSingleLineDiagram)} style={{ height: '100%' }} />
            {visible && shouldDisplayTooltip && displayTooltip()}
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
                    equipmentId={equipmentToConfigDynamicSimulationEvent.equipmentId}
                    equipmentType={equipmentToConfigDynamicSimulationEvent.equipmentType}
                    onClose={() => handleCloseDynamicSimulationEventDialog()}
                    title={dynamicSimulationEventDialogTitle}
                />
            )}
        </>
    );
}

export default SingleLineDiagramContent;
