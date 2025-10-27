/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useLayoutEffect, useRef, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import RunningStatus from 'components/utils/running-status';
import {
    buildPositionsFromNadMetadata,
    MIN_HEIGHT,
    MIN_WIDTH,
    MAX_HEIGHT_NETWORK_AREA_DIAGRAM,
    MAX_WIDTH_NETWORK_AREA_DIAGRAM,
    NAD_ZOOM_LEVELS,
    getEquipmentTypeFromFeederType,
    equipmentsWithPopover,
} from '../diagram-utils';
import {
    NetworkAreaDiagramViewer,
    DiagramMetadata,
    OnToggleNadHoverCallbackType,
    OnSelectNodeCallbackType,
    NadViewerParametersOptions,
    EQUIPMENT_TYPES,
} from '@powsybl/network-viewer';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import { AppState } from 'redux/reducer';
import EquipmentPopover from 'components/tooltips/equipment-popover';
import type { UUID } from 'node:crypto';
import { Point } from '@svgdotjs/svg.js';
import {
    ComputingType,
    ElementType,
    EquipmentType,
    ExtendedEquipmentType,
    IElementCreationDialog,
    IElementUpdateDialog,
    mergeSx,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import DiagramControls from './diagram-controls';
import { createDiagramConfig, updateDiagramConfig } from 'services/explore';
import { DiagramType, type NetworkAreaDiagramParams, type VoltageLevelDiagramParams } from '../diagram.type';
import NodeContextMenu from './node-context-menu';
import useEquipmentMenu from 'hooks/use-equipment-menu';
import { MapEquipment } from 'components/menus/base-equipment-menu';
import useEquipmentDialogs from 'hooks/use-equipment-dialogs';
import { styles } from '../diagram-styles';
import { fetchNetworkElementInfos } from 'services/study/network';
import { EQUIPMENT_INFOS_TYPES } from 'components/utils/equipment-types';
import { v4 } from 'uuid';

type NetworkAreaDiagramContentProps = {
    readonly diagramParams: NetworkAreaDiagramParams;
    readonly showInSpreadsheet: (menu: { equipmentId: string | null; equipmentType: EquipmentType | null }) => void;
    readonly svg?: string;
    readonly svgMetadata?: DiagramMetadata;
    readonly svgScalingFactor?: number;
    readonly svgVoltageLevels?: string[];
    readonly loadingState: boolean;
    readonly diagramSizeSetter: (id: UUID, type: DiagramType, width: number, height: number) => void;
    readonly visible: boolean;
    readonly onVoltageLevelClick: (diagramParams: VoltageLevelDiagramParams) => void;
    readonly onNadChange: (nadParams: NetworkAreaDiagramParams, fetch?: boolean) => void;
};

function NetworkAreaDiagramContent(props: NetworkAreaDiagramContentProps) {
    const {
        diagramSizeSetter,
        visible,
        diagramParams,
        onVoltageLevelClick,
        onNadChange,
        svg,
        svgMetadata,
        svgScalingFactor,
        svgVoltageLevels,
        loadingState,
        showInSpreadsheet,
    } = props;
    const svgRef = useRef();
    const { snackError, snackInfo } = useSnackMessage();
    const diagramViewerRef = useRef<NetworkAreaDiagramViewer | null>();
    const loadFlowStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.LOAD_FLOW]);
    const [shouldDisplayTooltip, setShouldDisplayTooltip] = useState(false);
    const [showLabels, setShowLabels] = useState(true);
    const [anchorPosition, setAnchorPosition] = useState({ top: 0, left: 0 });
    const [hoveredEquipmentId, setHoveredEquipmentId] = useState('');
    const [hoveredEquipmentType, setHoveredEquipmentType] = useState('');
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const [menuAnchorPosition, setMenuAnchorPosition] = useState<{ mouseX: number; mouseY: number } | null>(null);
    const [selectedVoltageLevelId, setSelectedVoltageLevelId] = useState<string>();
    const [shouldDisplayMenu, setShouldDisplayMenu] = useState(false);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const [isEditNadMode, setIsEditNadMode] = useState<boolean>(false);

    const handleToggleShowLabels = useCallback(() => {
        setShowLabels((oldShowLabels) => !oldShowLabels);
    }, []);

    const handleToggleHover: OnToggleNadHoverCallbackType = useCallback(
        (shouldDisplay: boolean, mousePosition: Point | null, equipmentId: string, equipmentType: string) => {
            // Do not show the hover in edit mode
            if (isEditNadMode) {
                return;
            }
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

        [setShouldDisplayTooltip, setAnchorPosition, isEditNadMode]
    );

    const handleNodeLeftClick: OnSelectNodeCallbackType = useCallback(
        (equipmentId, nodeId, mousePosition) => {
            if (mousePosition && !loadingState) {
                if (isEditNadMode) {
                    setSelectedVoltageLevelId(equipmentId);
                    setShouldDisplayMenu(true);
                    setMenuAnchorPosition(mousePosition ? { mouseX: mousePosition.x, mouseY: mousePosition.y } : null);
                } else {
                    onVoltageLevelClick({
                        diagramUuid: v4() as UUID,
                        type: DiagramType.VOLTAGE_LEVEL,
                        voltageLevelId: equipmentId,
                        name: '',
                    });
                }
            }
        },
        [isEditNadMode, onVoltageLevelClick, loadingState]
    );

    const handleSaveNadConfig = (directoryData: IElementCreationDialog) => {
        createDiagramConfig(
            {
                scalingFactor: svgScalingFactor,
                voltageLevelIds: svgVoltageLevels ?? [],
                positions: svgMetadata ? buildPositionsFromNadMetadata(svgMetadata) : [],
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
                scalingFactor: svgScalingFactor,
                voltageLevelIds: svgVoltageLevels ?? [],
                positions: svgMetadata ? buildPositionsFromNadMetadata(svgMetadata) : [],
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
            showInSpreadsheet({
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
            if (isEditNadMode) {
                return;
            }

            const openMenu = (equipmentType: EquipmentType, equipmentSubtype: ExtendedEquipmentType | null = null) => {
                const equipment = { id: equipmentId };
                openEquipmentMenu(
                    equipment as MapEquipment,
                    mousePosition.x,
                    mousePosition.y,
                    equipmentType,
                    equipmentSubtype
                );
            };

            if (equipmentType === EquipmentType.HVDC_LINE) {
                // need a query to know the HVDC converters type (LCC vs VSC)
                // this section should be removed when the NAD will provide this information in the SVG metadata
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
                        const equipmentSubtype =
                            hvdcInfos?.hvdcType === 'LCC'
                                ? ExtendedEquipmentType.HVDC_LINE_LCC
                                : ExtendedEquipmentType.HVDC_LINE_VSC;

                        openMenu(EquipmentType.HVDC_LINE, equipmentSubtype);
                    })
                    .catch(() => {
                        snackError({
                            messageId: 'NetworkEquipmentNotFound',
                            messageValues: { equipmentId: equipmentId },
                        });
                    });
            } else {
                const convertedType = getEquipmentTypeFromFeederType(equipmentType);

                if (convertedType?.equipmentType) {
                    openMenu(convertedType.equipmentType, convertedType.equipmentSubtype ?? null);
                }
            }
        },
        [isEditNadMode, openEquipmentMenu, currentNode?.id, currentRootNetworkUuid, studyUuid, snackError]
    );

    const handleAddVoltageLevel = useCallback(
        (voltageLevelIdToAdd: string) => {
            if (diagramParams.voltageLevelIds.includes(voltageLevelIdToAdd)) {
                return;
            }
            onNadChange({
                ...diagramParams,
                voltageLevelIds: [...diagramParams.voltageLevelIds, voltageLevelIdToAdd],
                voltageLevelToOmitIds: diagramParams.voltageLevelToOmitIds.filter((id) => id !== voltageLevelIdToAdd),
            });
        },
        [diagramParams, onNadChange]
    );

    const handleExpandVoltageLevelId = useCallback(
        (voltageLevelIdToExpand: string) => {
            onNadChange({
                ...diagramParams,
                voltageLevelIds: diagramParams.voltageLevelIds.filter((id) => id !== voltageLevelIdToExpand),
                voltageLevelToExpandIds: [...diagramParams.voltageLevelToExpandIds, voltageLevelIdToExpand],
            });
        },
        [diagramParams, onNadChange]
    );

    const handleExpandAllVoltageLevels = useCallback(() => {
        onNadChange({
            ...diagramParams,
            voltageLevelIds: [],
            voltageLevelToExpandIds: [...diagramParams.voltageLevelIds],
        });
    }, [diagramParams, onNadChange]);

    const handleHideVoltageLevelId = useCallback(
        (voltageLevelIdToOmit: string) => {
            onNadChange({
                ...diagramParams,
                voltageLevelIds: diagramParams.voltageLevelIds.filter((id) => id !== voltageLevelIdToOmit),
                voltageLevelToOmitIds: [...diagramParams.voltageLevelToOmitIds, voltageLevelIdToOmit],
            });
        },
        [diagramParams, onNadChange]
    );

    const handleMoveNode = useCallback(
        (equipmentId: string, nodeId: string, x: number, y: number) => {
            const updatedPositions = diagramParams.positions.map((position) =>
                position.voltageLevelId === equipmentId ? { ...position, xPosition: x, yPosition: y } : position
            );

            onNadChange(
                {
                    ...diagramParams,
                    positions: updatedPositions,
                },
                false
            );
        },
        [diagramParams, onNadChange]
    );

    const handleMoveTextnode = useCallback(
        (equipmentId: string, vlNodeId: string, textNodeId: string, shiftX: number, shiftY: number) => {
            const updatedPositions = diagramParams.positions.map((position) =>
                position.voltageLevelId === equipmentId
                    ? { ...position, xLabelPosition: shiftX, yLabelPosition: shiftY }
                    : position
            );

            onNadChange(
                {
                    ...diagramParams,
                    positions: updatedPositions,
                },
                false
            );
        },
        [diagramParams, onNadChange]
    );

    const handleReplaceNad = useCallback(
        (elementUuid: UUID, elementType: ElementType, elementName: string) => {
            // Since we want to replace the NAD with a new one, we ditch the previous diagram
            // viewer reference because we do not want to use an obsolete viewbox on the new NAD.
            diagramViewerRef.current = null;
            onNadChange({
                ...diagramParams,
                name: elementName,
                nadConfigUuid: elementType === ElementType.DIAGRAM_CONFIG ? elementUuid : undefined,
                filterUuid: elementType === ElementType.FILTER ? elementUuid : undefined,
                initializationNadConfigUuid: undefined,
                voltageLevelIds: [],
                voltageLevelToExpandIds: [],
                voltageLevelToOmitIds: [],
                positions: [],
            });
        },
        [diagramParams, onNadChange]
    );

    /**
     * DIAGRAM CONTENT BUILDING
     */

    useLayoutEffect(() => {
        if (svg && svgRef.current && !loadingState) {
            const nadViewerParameters: NadViewerParametersOptions = {
                minWidth: MIN_WIDTH,
                minHeight: MIN_HEIGHT,
                maxWidth: MAX_WIDTH_NETWORK_AREA_DIAGRAM,
                maxHeight: MAX_HEIGHT_NETWORK_AREA_DIAGRAM,
                enableDragInteraction: isEditNadMode,
                enableLevelOfDetail: true,
                zoomLevels: NAD_ZOOM_LEVELS,
                addButtons: false,
                onMoveNodeCallback: handleMoveNode,
                onMoveTextNodeCallback: handleMoveTextnode,
                onSelectNodeCallback: handleNodeLeftClick,
                onToggleHoverCallback: handleToggleHover,
                onRightClickCallback: showEquipmentMenu,
                initialViewBox: diagramViewerRef?.current?.getViewBox(),
                enableHoverHelper: true,
            };
            const diagramViewer = new NetworkAreaDiagramViewer(
                svgRef.current,
                svg,
                svgMetadata ?? null,
                nadViewerParameters
            );

            // Update the diagram-pane's list of sizes with the width and height from the backend
            diagramSizeSetter(
                diagramParams.diagramUuid,
                diagramParams.type,
                diagramViewer.getWidth(),
                diagramViewer.getHeight()
            );

            // Repositioning the nodes with specified positions
            if (diagramParams.positions.length > 0) {
                for (const position of diagramParams.positions) {
                    if (position.xPosition !== undefined && position.yPosition !== undefined) {
                        diagramViewer.moveNodeToCoordinates(
                            position.voltageLevelId,
                            position.xPosition,
                            position.yPosition
                        );
                    }
                }
            }
            // We keep a reference of the diagram viewer to get its viewbox for the next render.
            diagramViewerRef.current = diagramViewer;
        }
    }, [
        diagramParams.type,
        svg,
        svgMetadata,
        diagramParams.positions,
        diagramSizeSetter,
        isEditNadMode,
        diagramParams.diagramUuid,
        showEquipmentMenu,
        handleMoveNode,
        handleMoveTextnode,
        handleNodeLeftClick,
        handleToggleHover,
        loadingState,
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
            <Box height={2}>{loadingState && <LinearProgress />}</Box>
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
                    onExpandItem={handleExpandVoltageLevelId}
                    onHideItem={handleHideVoltageLevelId}
                    selectedItemId={selectedVoltageLevelId}
                />
            )}
            <Box
                ref={svgRef}
                sx={mergeSx(
                    styles.divDiagram,
                    styles.divNetworkAreaDiagram,
                    loadFlowStatus !== RunningStatus.SUCCEED ? styles.divDiagramInvalid : undefined,
                    isEditNadMode && !showLabels ? styles.hideLabels : undefined,
                    isEditNadMode ? styles.nadEditModeCursors : undefined
                )}
            />
            <DiagramControls
                onSave={handleSaveNadConfig}
                onUpdate={handleUpdateNadConfig}
                onLoad={handleReplaceNad}
                isEditNadMode={isEditNadMode}
                onToggleEditNadMode={setIsEditNadMode}
                onExpandAllVoltageLevels={handleExpandAllVoltageLevels}
                onAddVoltageLevel={handleAddVoltageLevel}
                onToggleShowLabels={handleToggleShowLabels}
                isShowLabels={showLabels}
                isDiagramLoading={loadingState}
            />
            {renderEquipmentMenu()}
            {renderModificationDialog()}
            {renderDeletionDialog()}
            {renderDynamicSimulationEventDialog()}
        </>
    );
}

export default NetworkAreaDiagramContent;
