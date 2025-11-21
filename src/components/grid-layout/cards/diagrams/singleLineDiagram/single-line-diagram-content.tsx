/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RunningStatus } from '../../../../utils/running-status';
import {
    equipmentsWithPopover,
    getEquipmentTypeFromFeederType,
    MAX_HEIGHT_SUBSTATION,
    MAX_HEIGHT_VOLTAGE_LEVEL,
    MAX_WIDTH_SUBSTATION,
    MAX_WIDTH_VOLTAGE_LEVEL,
    MIN_HEIGHT,
    MIN_WIDTH,
} from '../diagram-utils';
import { styles } from '../diagram-styles';
import { MapEquipment } from '../../../../menus/base-equipment-menu';
import {
    type OnBreakerCallbackType,
    type OnNextVoltageCallbackType,
    SingleLineDiagramViewer,
    SLDMetadata,
} from '@powsybl/network-viewer';
import { isNodeReadOnly } from '../../../../graph/util/model-functions';
import { useIsAnyNodeBuilding } from '../../../../utils/is-any-node-building-hook';
import { useTheme } from '@mui/material/styles';
import { ComputingType, EquipmentType, mergeSx, useSnackMessage } from '@gridsuite/commons-ui';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import EquipmentPopover from '../../../../tooltips/equipment-popover';
import { updateSwitchState } from '../../../../../services/study/network-modifications';
import { BusMenu } from 'components/menus/bus-menu';
import { PARAM_DEVELOPER_MODE } from 'utils/config-params';
import { startShortCircuitAnalysis } from '../../../../../services/study/short-circuit-analysis';
import { useOneBusShortcircuitAnalysisLoader } from './hooks/use-one-bus-shortcircuit-analysis-loader';
import { setComputationStarting, setComputingStatus, setLogsFilter } from '../../../../../redux/actions';
import { AppState } from 'redux/reducer';
import type { UUID } from 'node:crypto';
import { useParameterState } from 'components/dialogs/parameters/use-parameters-state';
import { DiagramType, type SubstationDiagramParams, type VoltageLevelDiagramParams } from '../diagram.type';
import { useEquipmentMenu } from '../../../../../hooks/use-equipment-menu';
import useEquipmentDialogs from 'hooks/use-equipment-dialogs';
import useComputationDebug from '../../../../../hooks/use-computation-debug';

interface SingleLineDiagramContentProps {
    readonly showInSpreadsheet: (menu: { equipmentId: string | null; equipmentType: EquipmentType | null }) => void;
    readonly studyUuid: UUID;
    readonly svg?: string;
    readonly svgMetadata?: SLDMetadata;
    readonly loadingState: boolean;
    readonly visible: boolean;
    readonly diagramParams: VoltageLevelDiagramParams | SubstationDiagramParams;
    readonly onNextVoltageLevelDiagram?: (diagramParams: VoltageLevelDiagramParams) => void;
    readonly onNewVoltageLevelDiagram?: (diagramParams: VoltageLevelDiagramParams) => void;
}

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

function SingleLineDiagramContent(props: SingleLineDiagramContentProps) {
    const {
        studyUuid,
        visible,
        diagramParams,
        onNextVoltageLevelDiagram,
        onNewVoltageLevelDiagram,
        showInSpreadsheet,
        loadingState,
        svg,
        svgMetadata,
    } = props;
    const theme = useTheme();
    const dispatch = useDispatch();
    const svgRef = useRef<HTMLDivElement>();
    const diagramViewerRef = useRef<SingleLineDiagramViewer>();
    const { snackError } = useSnackMessage();
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

    const [modificationInProgress, setModificationInProgress] = useState(false);
    const isAnyNodeBuilding = useIsAnyNodeBuilding();
    const [locallySwitchedBreaker, setLocallySwitchedBreaker] = useState<string>();
    const [shouldDisplayTooltip, setShouldDisplayTooltip] = useState(false);
    const [equipmentPopoverAnchorEl, setEquipmentPopoverAnchorEl] = useState<EventTarget | null>(null);
    const [hoveredEquipmentId, setHoveredEquipmentId] = useState('');
    const [hoveredEquipmentType, setHoveredEquipmentType] = useState<string>('');
    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);
    const computationStarting = useSelector((state: AppState) => state.computationStarting);
    const loadFlowStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.LOAD_FLOW]);

    const [
        oneBusShortcircuitAnalysisLoaderMessage,
        isDiagramRunningOneBusShortcircuitAnalysis,
        displayOneBusShortcircuitAnalysisLoader,
        resetOneBusShortcircuitAnalysisLoader,
    ] = useOneBusShortcircuitAnalysisLoader(studyUuid);

    /**
     * DIAGRAM INTERACTIVITY
     */
    const handleTogglePopover = useCallback(
        (shouldDisplay: boolean, currentTarget: EventTarget | null, equipmentId: string, equipmentType: string) => {
            const isEquipmentHoverable = equipmentsWithPopover.includes(equipmentType);
            setShouldDisplayTooltip(shouldDisplay && isEquipmentHoverable);

            if (shouldDisplay && isEquipmentHoverable) {
                const convertedEquipmentType = getEquipmentTypeFromFeederType(equipmentType);
                setHoveredEquipmentId(equipmentId);
                setEquipmentPopoverAnchorEl(currentTarget);
                setHoveredEquipmentType(convertedEquipmentType?.equipmentType || '');
            } else {
                setHoveredEquipmentId('');
                setEquipmentPopoverAnchorEl(null);
                setHoveredEquipmentType('');
            }
        },
        [setShouldDisplayTooltip]
    );

    const toggleBreakerDomClasses = useCallback((elementId?: string | null) => {
        const breakerToSwitchDom: HTMLElement | null = document.getElementById(elementId ?? '');
        if (breakerToSwitchDom?.classList.value.includes('sld-closed')) {
            breakerToSwitchDom.classList.replace('sld-closed', 'sld-open');
        } else if (breakerToSwitchDom?.classList.value.includes('sld-open')) {
            breakerToSwitchDom.classList.replace('sld-open', 'sld-closed');
        }
    }, []);

    const handleBreakerClick: OnBreakerCallbackType = useCallback(
        (breakerId, newSwitchState, switchElement) => {
            if (!modificationInProgress) {
                setModificationInProgress(true);
                setLocallySwitchedBreaker(switchElement?.id);

                updateSwitchState(studyUuid, currentNode?.id, breakerId, newSwitchState).catch((error) => {
                    const diagramId =
                        diagramParams.type === DiagramType.VOLTAGE_LEVEL
                            ? diagramParams.voltageLevelId
                            : (diagramParams as SubstationDiagramParams).substationId;
                    snackError({
                        headerId: 'updateSwitchStateError',
                        headerValues: { diagramTitle: diagramId },
                        messageTxt: error.message,
                    });
                    setLocallySwitchedBreaker(undefined);
                    // revert the DOM visual state of the breaker
                    toggleBreakerDomClasses(switchElement?.id);
                    setModificationInProgress(false);
                });
            }
        },
        [modificationInProgress, studyUuid, currentNode?.id, snackError, toggleBreakerDomClasses, diagramParams]
    );

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

    const closeBusMenu = useCallback(() => {
        setBusMenu({
            position: [-1, -1],
            busId: null,
            svgId: null,
            display: false,
        });
    }, []);

    const handleNextVoltageLevelClick: OnNextVoltageCallbackType = useCallback(
        (vlId, event) => {
            if (event.ctrlKey) {
                onNewVoltageLevelDiagram?.({
                    type: DiagramType.VOLTAGE_LEVEL,
                    voltageLevelId: vlId,
                });
            } else {
                onNextVoltageLevelDiagram?.({
                    type: DiagramType.VOLTAGE_LEVEL,
                    voltageLevelId: vlId,
                });
            }
        },
        [onNewVoltageLevelDiagram, onNextVoltageLevelDiagram]
    );

    // --- for running in debug mode --- //
    const subscribeDebug = useComputationDebug({
        studyUuid: studyUuid,
        nodeUuid: currentNode?.id!,
        rootNetworkUuid: currentRootNetworkUuid!,
    });

    const handleRunShortcircuitAnalysis = useCallback(
        (busId: string, debug: boolean) => {
            dispatch(setComputingStatus(ComputingType.SHORT_CIRCUIT_ONE_BUS, RunningStatus.RUNNING));
            displayOneBusShortcircuitAnalysisLoader();
            dispatch(setComputationStarting(true));
            startShortCircuitAnalysis(studyUuid, currentNode?.id, currentRootNetworkUuid, busId, debug)
                .then(() => {
                    debug && subscribeDebug(ComputingType.SHORT_CIRCUIT_ONE_BUS);
                })
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
            subscribeDebug,
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

    const {
        handleOpenModificationDialog,
        handleDeleteEquipment,
        handleOpenDynamicSimulationEventDialog,
        renderDeletionDialog,
        renderDynamicSimulationEventDialog,
        renderModificationDialog,
    } = useEquipmentDialogs({
        studyUuid: studyUuid,
        currentNode: currentNode!,
        currentRootNetworkUuid: currentRootNetworkUuid!,
    });

    const { openEquipmentMenu, renderEquipmentMenu } = useEquipmentMenu({
        currentNode: currentNode!,
        currentRootNetworkUuid: currentRootNetworkUuid!,
        studyUuid,
        disabled: false,
        onViewInSpreadsheet: (equipmentType: EquipmentType, equipmentId: string) => {
            showInSpreadsheet({
                equipmentId: equipmentId,
                equipmentType: equipmentType,
            });
        },
        onDeleteEquipment: handleDeleteEquipment,
        onOpenModificationDialog: handleOpenModificationDialog,
        onOpenDynamicSimulationEventDialog: handleOpenDynamicSimulationEventDialog,
        modificationInProgress,
        setModificationInProgress,
    });

    const showEquipmentMenu = useCallback(
        (equipmentId: string, equipmentType: string | null, svgId: string, x: number, y: number) => {
            handleTogglePopover(false, null, '', '');

            const convertedType = getEquipmentTypeFromFeederType(equipmentType);
            if (convertedType?.equipmentType) {
                // Create a minimal equipment object
                const equipment = { id: equipmentId };
                openEquipmentMenu(
                    equipment as MapEquipment,
                    x,
                    y,
                    convertedType.equipmentType,
                    convertedType.equipmentSubtype ?? null
                );
            }
        },
        [handleTogglePopover, openEquipmentMenu]
    );

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

    /**
     * DIAGRAM CONTENT BUILDING
     */

    useLayoutEffect(() => {
        if (svg && svgRef.current) {
            const isReadyForInteraction =
                !computationStarting && !isAnyNodeBuilding && !modificationInProgress && !loadingState;

            const diagramViewer = new SingleLineDiagramViewer(
                svgRef.current, //container
                svg, //svgContent
                svgMetadata ?? null, //svg metadata
                diagramParams.type, //svg type
                MIN_WIDTH, // minWidth
                MIN_HEIGHT, // minHeight

                // maxWidth
                diagramParams.type === DiagramType.VOLTAGE_LEVEL ? MAX_WIDTH_VOLTAGE_LEVEL : MAX_WIDTH_SUBSTATION,

                // maxHeight
                diagramParams.type === DiagramType.VOLTAGE_LEVEL ? MAX_HEIGHT_VOLTAGE_LEVEL : MAX_HEIGHT_SUBSTATION,

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

            // Rotate clicked switch while waiting for updated sld data
            if (locallySwitchedBreaker) {
                toggleBreakerDomClasses(locallySwitchedBreaker);
            }

            // If a previous diagram was loaded and the diagram's size remained the same, we keep
            // the user's zoom and scroll state for the current render.
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
        }
    }, [
        svg,
        svgMetadata,
        currentNode,
        isAnyNodeBuilding,
        showEquipmentMenu,
        showBusMenu,
        enableDeveloperMode,
        diagramParams.type,
        theme,
        modificationInProgress,
        loadingState,
        locallySwitchedBreaker,
        handleBreakerClick,
        handleTogglePopover,
        computationStarting,
        handleNextVoltageLevelClick,
        toggleBreakerDomClasses,
    ]);

    // When the loading is finished, we always reset these two states
    useLayoutEffect(() => {
        if (!loadingState) {
            setModificationInProgress(false);
            setLocallySwitchedBreaker(undefined);
        }
    }, [
        loadingState, // the only one changing
        setModificationInProgress,
        setLocallySwitchedBreaker,
    ]);

    /**
     * RENDER
     */

    return (
        <>
            <Box height={2}>
                {(loadingState || modificationInProgress || isDiagramRunningOneBusShortcircuitAnalysis) && (
                    <LinearProgress />
                )}
                {oneBusShortcircuitAnalysisLoaderMessage}
            </Box>
            <Box
                ref={svgRef}
                sx={mergeSx(
                    styles.divDiagram,
                    styles.divSingleLineDiagram,
                    loadFlowStatus !== RunningStatus.SUCCEED ? styles.divDiagramInvalid : undefined,
                    // TODO - lock and strip are hidden on single line diagram temporarly
                    !enableDeveloperMode ? styles.divSingleLineDiagramHideLockAndBolt : undefined
                )}
                style={{ height: '100%' }}
            />
            {visible && shouldDisplayTooltip && displayTooltip()}
            {renderEquipmentMenu()}
            {displayBusMenu()}
            {renderModificationDialog()}
            {renderDeletionDialog()}
            {renderDynamicSimulationEventDialog()}
        </>
    );
}

export default SingleLineDiagramContent;
