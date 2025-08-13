/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useLayoutEffect, useRef, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { RunningStatus } from '../../utils/running-status';
import {
    MIN_HEIGHT,
    MIN_WIDTH,
    MAX_HEIGHT_NETWORK_AREA_DIAGRAM,
    MAX_WIDTH_NETWORK_AREA_DIAGRAM,
    styles,
    NAD_ZOOM_LEVELS,
    getEquipmentTypeFromFeederType,
    equipmentsWithPopover,
} from '../diagram-common';
import {
    NetworkAreaDiagramViewer,
    DiagramMetadata,
    OnToggleNadHoverCallbackType,
    OnSelectNodeCallbackType,
} from '@powsybl/network-viewer';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import { AppState } from 'redux/reducer';
import { buildPositionsFromNadMetadata } from '../diagram-utils';
import EquipmentPopover from 'components/tooltips/equipment-popover';
import { UUID } from 'crypto';
import { Point } from '@svgdotjs/svg.js';
import {
    ComputingType,
    ElementType,
    EquipmentType,
    IElementCreationDialog,
    IElementUpdateDialog,
    mergeSx,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import DiagramControls from '../diagram-controls';
import { createDiagramConfig, updateDiagramConfig, DiagramConfigPosition } from '../../../services/explore';
import { DiagramType } from '../diagram.type';
import NodeContextMenu from './node-context-menu';
import useEquipmentMenu from 'hooks/use-equipment-menu';
import { MapEquipment } from 'components/menus/base-equipment-menu';
import useEquipmentDialogs from 'hooks/use-equipment-dialogs';

type NetworkAreaDiagramContentProps = {
    readonly showInSpreadsheet: (menu: { equipmentId: string | null; equipmentType: EquipmentType | null }) => void;
    readonly svgType: DiagramType;
    readonly svg?: string;
    readonly svgMetadata?: DiagramMetadata;
    readonly svgScalingFactor?: number;
    readonly svgVoltageLevels?: string[];
    readonly loadingState: boolean;
    readonly diagramSizeSetter: (id: UUID, type: DiagramType, width: number, height: number) => void;
    readonly diagramId: UUID;
    visible: boolean;
    isEditNadMode: boolean;
    onToggleEditNadMode?: (isEditMode: boolean) => void;
    readonly onLoadNad: (elementUuid: UUID, elementType: ElementType, elementName: string) => void;
    readonly onExpandVoltageLevel: (vlId: string) => void;
    readonly onExpandAllVoltageLevels: () => void;
    readonly onAddVoltageLevel: (vlId: string) => void;
    readonly onHideVoltageLevel: (vlId: string) => void;
    readonly onMoveNode: (vlId: string, x: number, y: number) => void;
    readonly customPositions: DiagramConfigPosition[];
    readonly onVoltageLevelClick: (vlId: string) => void;
};

function NetworkAreaDiagramContent(props: NetworkAreaDiagramContentProps) {
    const {
        diagramSizeSetter,
        visible,
        isEditNadMode,
        onToggleEditNadMode,
        onLoadNad,
        diagramId,
        onExpandVoltageLevel,
        onExpandAllVoltageLevels,
        onAddVoltageLevel,
        onHideVoltageLevel,
        onVoltageLevelClick,
        onMoveNode,
    } = props;
    const svgRef = useRef();
    const { snackError, snackInfo } = useSnackMessage();
    const diagramViewerRef = useRef<NetworkAreaDiagramViewer>();
    const loadFlowStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.LOAD_FLOW]);
    const [shouldDisplayTooltip, setShouldDisplayTooltip] = useState(false);
    const [anchorPosition, setAnchorPosition] = useState({ top: 0, left: 0 });
    const [hoveredEquipmentId, setHoveredEquipmentId] = useState('');
    const [hoveredEquipmentType, setHoveredEquipmentType] = useState('');
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const [menuAnchorPosition, setMenuAnchorPosition] = useState<{ mouseX: number; mouseY: number } | null>(null);
    const [selectedVoltageLevelId, setSelectedVoltageLevelId] = useState<string>();
    const [shouldDisplayMenu, setShouldDisplayMenu] = useState(false);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

    const onMoveNodeCallback = useCallback(
        (equipmentId: string, nodeId: string, x: number, y: number, xOrig: number, yOrig: number) => {
            if (onMoveNode) {
                onMoveNode(equipmentId, x, y);
            }
        },
        [onMoveNode]
    );

    const onMoveTextNodeCallback = useCallback(
        (
            equipmentId: string,
            vlNodeId: string,
            textNodeId: string,
            shiftX: number,
            shiftY: number,
            shiftXOrig: number,
            shiftYOrig: number,
            connectionShiftX: number,
            connectionShiftY: number,
            connectionShiftXOrig: number,
            connectionShiftYOrig: number
        ) => {
            // TODO Not implemented yet
        },
        []
    );

    const OnToggleHoverCallback: OnToggleNadHoverCallbackType = useCallback(
        (shouldDisplay: boolean, mousePosition: Point | null, equipmentId: string, equipmentType: string) => {
            if (mousePosition) {
                const anchorPosition = {
                    top: mousePosition.y + 10,
                    left: mousePosition.x + 10,
                };

                // Only show tooltip if the equipment type is in the hoverable list
                const isEquipmentHoverable = equipmentsWithPopover.includes(equipmentType);
                const convertedEquipmentType = getEquipmentTypeFromFeederType(equipmentType);

                setAnchorPosition(anchorPosition);
                setHoveredEquipmentId(equipmentId);
                setHoveredEquipmentType(convertedEquipmentType?.equipmentType || '');

                setShouldDisplayTooltip(shouldDisplay && isEquipmentHoverable); // Show or hide based on shouldDisplay
            } else {
                setShouldDisplayTooltip(false);
            }
        },

        [setShouldDisplayTooltip, setAnchorPosition]
    );

    const OnLeftClickCallback: OnSelectNodeCallbackType = useCallback(
        (equipmentId, nodeId, mousePosition) => {
            if (mousePosition && !props.loadingState) {
                if (isEditNadMode) {
                    setSelectedVoltageLevelId(equipmentId);
                    setShouldDisplayMenu(true);
                    setMenuAnchorPosition(mousePosition ? { mouseX: mousePosition.x, mouseY: mousePosition.y } : null);
                } else {
                    onVoltageLevelClick(equipmentId);
                }
            }
        },
        [isEditNadMode, onVoltageLevelClick, props.loadingState]
    );

    const handleSaveNadConfig = (directoryData: IElementCreationDialog) => {
        createDiagramConfig(
            {
                scalingFactor: props.svgScalingFactor,
                voltageLevelIds: props.svgVoltageLevels ?? [],
                positions: props.svgMetadata ? buildPositionsFromNadMetadata(props.svgMetadata) : [],
            },
            directoryData.name,
            directoryData.description,
            directoryData.folderId
        )
            .then(() => {
                snackInfo({
                    headerId: 'diagramConfigCreationMsg',
                    headerValues: {
                        directory: directoryData.folderName,
                    },
                });
            })
            .catch((error) =>
                snackError({
                    messageTxt: error.message,
                    headerId: 'diagramConfigCreationError',
                })
            );
    };

    const handleUpdateNadConfig = (data: IElementUpdateDialog) => {
        updateDiagramConfig(
            data.id,
            {
                scalingFactor: props.svgScalingFactor,
                voltageLevelIds: props.svgVoltageLevels ?? [],
                positions: props.svgMetadata ? buildPositionsFromNadMetadata(props.svgMetadata) : [],
            },
            data.name,
            data.description
        )
            .then(() => {
                snackInfo({
                    headerId: 'diagramConfigUpdateMsg',
                    headerValues: {
                        item: data.name,
                    },
                });
            })
            .catch((error) =>
                snackError({
                    messageTxt: error.message,
                    headerId: 'diagramConfigUpdateError',
                })
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
        studyUuid: studyUuid!,
        currentNode: currentNode!,
        currentRootNetworkUuid: currentRootNetworkUuid!,
    });

    const { openEquipmentMenu, renderEquipmentMenu } = useEquipmentMenu({
        currentNode: currentNode!,
        currentRootNetworkUuid: currentRootNetworkUuid!,
        studyUuid: studyUuid!,
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
    });

    const showEquipmentMenu = useCallback(
        (svgId: string, equipmentId: string, equipmentType: string, mousePosition: Point) => {
            // don't display the equipment menu in edit mode.
            if (!isEditNadMode) {
                const convertedType = getEquipmentTypeFromFeederType(equipmentType);

                if (convertedType?.equipmentType) {
                    // Create a minimal equipment object
                    const equipment = { id: equipmentId };
                    openEquipmentMenu(
                        equipment as MapEquipment,
                        mousePosition.x,
                        mousePosition.y,
                        convertedType.equipmentType,
                        convertedType.equipmentSubtype ?? null
                    );
                }
            }
        },
        [isEditNadMode, openEquipmentMenu]
    );

    /**
     * DIAGRAM CONTENT BUILDING
     */

    useLayoutEffect(() => {
        if (props.svg && svgRef.current) {
            const diagramViewer = new NetworkAreaDiagramViewer(
                svgRef.current,
                props.svg,
                props.svgMetadata ?? null,
                MIN_WIDTH,
                MIN_HEIGHT,
                MAX_WIDTH_NETWORK_AREA_DIAGRAM,
                MAX_HEIGHT_NETWORK_AREA_DIAGRAM,
                onMoveNodeCallback,
                onMoveTextNodeCallback,
                OnLeftClickCallback,
                isEditNadMode,
                true,
                NAD_ZOOM_LEVELS,
                isEditNadMode ? null : OnToggleHoverCallback,
                showEquipmentMenu,
                false
            );

            // Update the diagram-pane's list of sizes with the width and height from the backend
            diagramSizeSetter(diagramId, props.svgType, diagramViewer.getWidth(), diagramViewer.getHeight());

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

            // Repositioning the nodes with specified positions
            if (props.customPositions.length > 0) {
                props.customPositions.forEach((position) => {
                    if (position.xPosition !== undefined && position.yPosition !== undefined) {
                        diagramViewer.moveNodeToCoordinates(
                            position.voltageLevelId,
                            position.xPosition,
                            position.yPosition
                        );
                    }
                });
            }
            diagramViewerRef.current = diagramViewer;
        }
    }, [
        props.svgType,
        props.svg,
        props.svgMetadata,
        props.customPositions,
        diagramSizeSetter,
        onMoveNodeCallback,
        OnToggleHoverCallback,
        onMoveTextNodeCallback,
        isEditNadMode,
        diagramId,
        OnLeftClickCallback,
        showEquipmentMenu,
    ]);
    const closeMenu = () => {
        setMenuAnchorPosition(null);
        setShouldDisplayMenu(false);
    };
    /**
     * RENDER
     */

    return (
        <>
            <Box height={2}>{props.loadingState && <LinearProgress />}</Box>
            {visible && shouldDisplayTooltip && (
                <EquipmentPopover
                    studyUuid={studyUuid}
                    anchorPosition={anchorPosition}
                    anchorEl={null}
                    equipmentType={hoveredEquipmentType}
                    equipmentId={hoveredEquipmentId}
                    loadFlowStatus={loadFlowStatus}
                />
            )}
            {shouldDisplayMenu && (
                <NodeContextMenu
                    open={!!menuAnchorPosition}
                    anchorPosition={menuAnchorPosition}
                    onClose={closeMenu}
                    onExpandItem={onExpandVoltageLevel}
                    onHideItem={onHideVoltageLevel}
                    selectedItemId={selectedVoltageLevelId}
                />
            )}
            <Box
                ref={svgRef}
                sx={mergeSx(
                    styles.divDiagram,
                    styles.divNetworkAreaDiagram,
                    loadFlowStatus !== RunningStatus.SUCCEED ? styles.divDiagramInvalid : undefined
                )}
            />
            <DiagramControls
                onSave={handleSaveNadConfig}
                onUpdate={handleUpdateNadConfig}
                onLoad={onLoadNad}
                isEditNadMode={isEditNadMode}
                onToggleEditNadMode={onToggleEditNadMode}
                onExpandAllVoltageLevels={onExpandAllVoltageLevels}
                onAddVoltageLevel={onAddVoltageLevel}
                isDiagramLoading={props.loadingState}
            />
            {renderEquipmentMenu()}
            {renderModificationDialog()}
            {renderDeletionDialog()}
            {renderDynamicSimulationEventDialog()}
        </>
    );
}

export default NetworkAreaDiagramContent;
