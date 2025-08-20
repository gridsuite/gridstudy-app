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
    equipmentsWithPopover,
    getEquipmentTypeFromFeederType,
    MAX_HEIGHT_SUBSTATION,
    MAX_HEIGHT_VOLTAGE_LEVEL,
    MAX_WIDTH_SUBSTATION,
    MAX_WIDTH_VOLTAGE_LEVEL,
    MIN_HEIGHT,
    MIN_WIDTH,
    styles,
} from '../diagram-common';
import { MapEquipment } from '../../menus/base-equipment-menu';
import { OnBreakerCallbackType, SingleLineDiagramViewer, SLDMetadata } from '@powsybl/network-viewer';
import { isNodeReadOnly } from '../../graph/util/model-functions';
import { useIsAnyNodeBuilding } from '../../utils/is-any-node-building-hook';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import { ComputingType, EquipmentType, mergeSx, useSnackMessage } from '@gridsuite/commons-ui';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import EquipmentPopover from '../../tooltips/equipment-popover';
import { updateSwitchState } from '../../../services/study/network-modifications';
import { BusMenu } from 'components/menus/bus-menu';
import { PARAM_DEVELOPER_MODE } from 'utils/config-params';
import { startShortCircuitAnalysis } from '../../../services/study/short-circuit-analysis';
import { useOneBusShortcircuitAnalysisLoader } from '../use-one-bus-shortcircuit-analysis-loader';
import { setComputationStarting, setComputingStatus, setLogsFilter } from '../../../redux/actions';
import { AppState } from 'redux/reducer';
import { UUID } from 'crypto';
import { useParameterState } from 'components/dialogs/parameters/use-parameters-state';
import { DiagramType } from '../diagram.type';
import { useEquipmentMenu } from '../../../hooks/use-equipment-menu';
import useEquipmentDialogs from 'hooks/use-equipment-dialogs';

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
    readonly onNextVoltageLevelClick: (voltageLevelId: string) => void;
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
    const { diagramSizeSetter, studyUuid, visible, onNextVoltageLevelClick } = props;
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
    const [errorMessage, setErrorMessage] = useState('');
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
    ] = useOneBusShortcircuitAnalysisLoader(props.diagramId, currentNode?.id!, currentRootNetworkUuid!);

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
            props.showInSpreadsheet({
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
                isReadyForInteraction ? onNextVoltageLevelClick : null,

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
        }
    }, [
        props.svg,
        props.svgMetadata,
        currentNode,
        isAnyNodeBuilding,
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
        onNextVoltageLevelClick,
        diagramSizeSetter,
        handleTogglePopover,
        computationStarting,
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
            <Box
                ref={svgRef}
                sx={mergeSx(
                    styles.divDiagram,
                    styles.divSingleLineDiagram,
                    loadFlowStatus !== RunningStatus.SUCCEED ? styles.divDiagramInvalid : undefined
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
