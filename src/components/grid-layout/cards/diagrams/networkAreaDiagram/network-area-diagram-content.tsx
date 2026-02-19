/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useLayoutEffect, useRef, useCallback, useState, useEffect, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
    equipmentsWithContextualMenu,
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
import type { UUID } from 'node:crypto';
import { Point } from '@svgdotjs/svg.js';
import {
    ComputingType,
    ElementType,
    EquipmentType,
    ExtendedEquipmentType,
    HvdcType,
    IElementCreationDialog,
    IElementUpdateDialog,
    mergeSx,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import DiagramControls from './diagram-controls';
import { createDiagramConfig, updateDiagramConfig, type DiagramConfigPosition } from 'services/explore';
import NodeContextMenu from './node-context-menu';
import useEquipmentMenu from 'hooks/use-equipment-menu';
import { MapEquipment } from 'components/menus/base-equipment-menu';
import useEquipmentDialogs from 'hooks/use-equipment-dialogs';
import { styles } from '../diagram-styles';
import { fetchNetworkElementInfos } from 'services/study/network';
import { EQUIPMENT_INFOS_TYPES } from 'components/utils/equipment-types';
import GenericEquipmentPopover from 'components/tooltips/generic-equipment-popover';
import { GenericEquipmentInfos } from 'components/tooltips/equipment-popover-type';
import { GenericPopoverContent } from 'components/tooltips/generic-popover-content';
import { StoreNadViewBox } from 'redux/actions';
import { DiagramAdditionalMetadata } from '../diagram.type';

type NetworkAreaDiagramContentProps = {
    readonly nadPanelId: UUID;
    readonly voltageLevelIds: string[];
    readonly voltageLevelToExpandIds: string[];
    readonly voltageLevelToOmitIds: string[];
    readonly positions: DiagramConfigPosition[];
    readonly showInSpreadsheet: (menu: { equipmentId: string | null; equipmentType: EquipmentType | null }) => void;
    readonly svg?: string;
    readonly svgMetadata?: DiagramMetadata;
    readonly additionalMetadata?: DiagramAdditionalMetadata;
    readonly svgVoltageLevels?: string[];
    readonly loadingState: boolean;
    readonly isNadCreationFromFilter: boolean;
    readonly visible: boolean;
    readonly onVoltageLevelClick: (voltageLevelId: string) => void;
    readonly onUpdateVoltageLevels: (params: {
        voltageLevelIds: string[];
        voltageLevelToExpandIds: string[];
        voltageLevelToOmitIds: string[];
    }) => void;
    readonly onUpdateVoltageLevelsFromFilter: (filterUuid: UUID) => void;
    readonly onUpdatePositions: (positions: DiagramConfigPosition[]) => void;
    readonly onReplaceNad: (name: string, nadConfigUuid?: UUID, filterUuid?: UUID) => void;
    readonly onSaveNad?: () => void;
};

const NetworkAreaDiagramContent = memo(function NetworkAreaDiagramContent(props: NetworkAreaDiagramContentProps) {
    const {
        visible,
        voltageLevelIds,
        voltageLevelToExpandIds,
        voltageLevelToOmitIds,
        positions,
        onVoltageLevelClick,
        onUpdateVoltageLevels,
        onUpdateVoltageLevelsFromFilter,
        onUpdatePositions,
        onReplaceNad,
        nadPanelId,
        svg,
        svgMetadata,
        additionalMetadata,
        svgVoltageLevels,
        loadingState,
        isNadCreationFromFilter,
        showInSpreadsheet,
        onSaveNad,
    } = props;
    const svgRef = useRef(null);
    const { snackError, snackInfo } = useSnackMessage();
    const diagramViewerRef = useRef<NetworkAreaDiagramViewer | null>(null);
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
    const nadViewBox = useSelector((state: AppState) => state.nadViewBox);
    const dispatch = useDispatch();

    // refs to keep useLayoutEffect and callbacks stable
    const isEditNadModeRef = useRef(isEditNadMode);
    const positionsRef = useRef(positions);
    isEditNadModeRef.current = isEditNadMode;
    positionsRef.current = positions;
    // Update drag interaction without full viewer reinitialization
    if (diagramViewerRef.current) {
        diagramViewerRef.current.enableDragInteraction = isEditNadMode;
    }

    // save nad when exiting edit mode
    const handleSetIsEditNadMode = useCallback(
        (newMode: boolean) => {
            if (isEditNadMode && !newMode) {
                onSaveNad?.();
            }
            setIsEditNadMode(newMode);
        },
        [isEditNadMode, onSaveNad]
    );

    const handleToggleShowLabels = useCallback(() => {
        setShowLabels((oldShowLabels) => !oldShowLabels);
    }, []);

    const handleToggleHover: OnToggleNadHoverCallbackType = useCallback(
        (shouldDisplay: boolean, mousePosition: Point | null, equipmentId: string, equipmentType: string) => {
            // Do not show the hover in edit mode
            if (isEditNadModeRef.current) {
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
        []
    );

    const handleNodeLeftClick: OnSelectNodeCallbackType = useCallback(
        (equipmentId, nodeId, mousePosition) => {
            if (mousePosition && !loadingState) {
                if (isEditNadModeRef.current) {
                    setSelectedVoltageLevelId(equipmentId);
                    setShouldDisplayMenu(true);
                    setMenuAnchorPosition(mousePosition ? { mouseX: mousePosition.x, mouseY: mousePosition.y } : null);
                } else {
                    onVoltageLevelClick(equipmentId);
                }
            }
        },
        [onVoltageLevelClick, loadingState]
    );

    const handleSaveNadConfig = (directoryData: IElementCreationDialog) => {
        createDiagramConfig(
            {
                scalingFactor: additionalMetadata?.scalingFactor,
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
            .catch((error) => snackWithFallback(snackError, error, { headerId: 'diagramConfigCreationError' }));
    };

    const handleUpdateNadConfig = (data: IElementUpdateDialog) => {
        updateDiagramConfig(
            data.id,
            {
                scalingFactor: additionalMetadata?.scalingFactor,
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
            .catch((error) => snackWithFallback(snackError, error, { headerId: 'diagramConfigUpdateError' }));
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
            if (isEditNadModeRef.current || !equipmentsWithContextualMenu.includes(equipmentType)) {
                return;
            }

            const openMenu = (equipmentType: EquipmentType, equipmentSubtype: ExtendedEquipmentType | null = null) => {
                const equipment: Partial<MapEquipment> = { id: equipmentId };
                if (equipmentType === EquipmentType.VOLTAGE_LEVEL) {
                    const vlSubstationId = additionalMetadata?.voltageLevels.find(
                        (vl) => vl.id === equipmentId
                    )?.substationId;
                    if (vlSubstationId) {
                        equipment.substationId = vlSubstationId;
                    }
                }
                openEquipmentMenu(
                    equipment as MapEquipment, //TODO, improve typing, this is NOT really MapEquipment
                    mousePosition.x,
                    mousePosition.y,
                    equipmentType,
                    equipmentSubtype
                );
            };
            setShouldDisplayTooltip(false);

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
                            hvdcInfos?.hvdcType === HvdcType.LCC
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
        [additionalMetadata, openEquipmentMenu, currentNode?.id, currentRootNetworkUuid, studyUuid, snackError]
    );

    const handleAddVoltageLevel = useCallback(
        (voltageLevelIdToAdd: string) => {
            if (voltageLevelIds.includes(voltageLevelIdToAdd)) {
                return;
            }
            onUpdateVoltageLevels({
                voltageLevelIds: [...voltageLevelIds, voltageLevelIdToAdd],
                voltageLevelToExpandIds,
                voltageLevelToOmitIds: voltageLevelToOmitIds.filter((id) => id !== voltageLevelIdToAdd),
            });
        },
        [voltageLevelIds, voltageLevelToExpandIds, voltageLevelToOmitIds, onUpdateVoltageLevels]
    );

    const handleAddVoltageLevelsFromFilter = useCallback(
        (filterUuid: UUID) => {
            onUpdateVoltageLevelsFromFilter(filterUuid);
        },
        [onUpdateVoltageLevelsFromFilter]
    );

    const handleExpandVoltageLevelId = useCallback(
        (voltageLevelIdToExpand: string) => {
            onUpdateVoltageLevels({
                voltageLevelIds: voltageLevelIds.filter((id) => id !== voltageLevelIdToExpand),
                voltageLevelToExpandIds: [...voltageLevelToExpandIds, voltageLevelIdToExpand],
                voltageLevelToOmitIds,
            });
        },
        [voltageLevelIds, voltageLevelToExpandIds, voltageLevelToOmitIds, onUpdateVoltageLevels]
    );

    const handleExpandAllVoltageLevels = useCallback(() => {
        onUpdateVoltageLevels({
            voltageLevelIds: [],
            voltageLevelToExpandIds: [...voltageLevelIds],
            voltageLevelToOmitIds,
        });
    }, [voltageLevelIds, voltageLevelToOmitIds, onUpdateVoltageLevels]);

    const handleHideVoltageLevelId = useCallback(
        (voltageLevelIdToOmit: string) => {
            onUpdateVoltageLevels({
                voltageLevelIds: voltageLevelIds.filter((id) => id !== voltageLevelIdToOmit),
                voltageLevelToExpandIds,
                voltageLevelToOmitIds: [...voltageLevelToOmitIds, voltageLevelIdToOmit],
            });
        },
        [voltageLevelIds, voltageLevelToExpandIds, voltageLevelToOmitIds, onUpdateVoltageLevels]
    );

    const handleMoveNode = useCallback(
        (equipmentId: string, nodeId: string, x: number, y: number) => {
            const updatedPositions = positionsRef.current.map((position) =>
                position.voltageLevelId === equipmentId ? { ...position, xPosition: x, yPosition: y } : position
            );
            onUpdatePositions(updatedPositions);
        },
        [onUpdatePositions]
    );

    const handleMoveTextnode = useCallback(
        (equipmentId: string, vlNodeId: string, textNodeId: string, shiftX: number, shiftY: number) => {
            const updatedPositions = positionsRef.current.map((position) =>
                position.voltageLevelId === equipmentId
                    ? { ...position, xLabelPosition: shiftX, yLabelPosition: shiftY }
                    : position
            );
            onUpdatePositions(updatedPositions);
        },
        [onUpdatePositions]
    );

    const handleReplaceNadConfig = useCallback(
        (elementUuid: UUID, elementType: ElementType, elementName: string) => {
            // Since we want to replace the NAD with a new one, we ditch the previous diagram
            // viewer reference because we do not want to use an obsolete viewbox on the new NAD.
            diagramViewerRef.current = null;
            onReplaceNad(
                elementName,
                elementType === ElementType.DIAGRAM_CONFIG ? elementUuid : undefined,
                elementType === ElementType.FILTER ? elementUuid : undefined
            );
        },
        [onReplaceNad]
    );

    const handleFocusVoltageLevel = useCallback(
        (voltageLevelId: string) => {
            if (!diagramViewerRef.current || !svgMetadata) {
                return;
            }

            const node = svgMetadata.nodes.find((n) => n.equipmentId === voltageLevelId);
            if (!node) {
                return;
            }

            const focusSize = 500;

            const newViewBox = {
                x: node.x - focusSize / 2,
                y: node.y - focusSize / 2,
                width: focusSize,
                height: focusSize,
            };

            diagramViewerRef.current.setViewBox(newViewBox);
        },
        [svgMetadata]
    );

    useEffect(() => {
        const handleSwitchWorkspace = () => {
            if (!diagramViewerRef?.current) return;
            const viewBox = diagramViewerRef.current.getViewBox() ?? null;
            dispatch(StoreNadViewBox(nadPanelId, viewBox));
        };
        globalThis.addEventListener('workspace:switchWorkspace', handleSwitchWorkspace);
        return () => globalThis.removeEventListener('workspace:switchWorkspace', handleSwitchWorkspace);
    }, [nadPanelId, diagramViewerRef, dispatch]);

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
                enableDragInteraction: isEditNadModeRef.current,
                enableLevelOfDetail: true,
                zoomLevels: NAD_ZOOM_LEVELS,
                addButtons: false,
                onMoveNodeCallback: handleMoveNode,
                onMoveTextNodeCallback: handleMoveTextnode,
                onSelectNodeCallback: handleNodeLeftClick,
                onToggleHoverCallback: handleToggleHover,
                onRightClickCallback: showEquipmentMenu,
                initialViewBox: nadViewBox[nadPanelId] ?? diagramViewerRef?.current?.getViewBox(),
                enableAdaptiveTextZoom: true,
                adaptiveTextZoomThreshold: 3500,
            };
            const diagramViewer = new NetworkAreaDiagramViewer(
                svgRef.current,
                svg,
                svgMetadata ?? null,
                nadViewerParameters
            );

            // Repositioning the nodes with specified positions
            if (positionsRef.current.length > 0) {
                for (const position of positionsRef.current) {
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
        svg,
        svgMetadata,
        nadViewBox,
        nadPanelId,
        loadingState,
        handleMoveNode,
        handleMoveTextnode,
        handleNodeLeftClick,
        handleToggleHover,
        showEquipmentMenu,
    ]);

    const closeMenu = () => {
        setMenuAnchorPosition(null);
        setShouldDisplayMenu(false);
    };

    /**
     * RENDER
     */

    const displayTooltip = () => {
        return (
            <GenericEquipmentPopover
                studyUuid={studyUuid}
                anchorPosition={anchorPosition}
                anchorEl={null}
                equipmentId={hoveredEquipmentId}
                equipmentType={hoveredEquipmentType as EquipmentType}
                loadFlowStatus={loadFlowStatus}
            >
                {(equipmentInfos: GenericEquipmentInfos) => (
                    <GenericPopoverContent
                        equipmentInfos={equipmentInfos}
                        loadFlowStatus={loadFlowStatus}
                        equipmentType={hoveredEquipmentType}
                    />
                )}
            </GenericEquipmentPopover>
        );
    };
    return (
        <>
            <Box height={2}>{loadingState && <LinearProgress />}</Box>
            {visible && shouldDisplayTooltip && displayTooltip()}
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
                    loadFlowStatus !== RunningStatus.SUCCEED ? styles.divDiagramLoadflowInvalid : undefined,
                    isEditNadMode && !showLabels ? styles.hideLabels : undefined,
                    isEditNadMode ? styles.nadEditModeCursors : undefined
                )}
            />
            <DiagramControls
                onSave={handleSaveNadConfig}
                onUpdate={handleUpdateNadConfig}
                onLoad={handleReplaceNadConfig}
                isEditNadMode={isEditNadMode}
                onToggleEditNadMode={handleSetIsEditNadMode}
                onExpandAllVoltageLevels={handleExpandAllVoltageLevels}
                onAddVoltageLevel={handleAddVoltageLevel}
                onAddVoltageLevelsFromFilter={handleAddVoltageLevelsFromFilter}
                onToggleShowLabels={handleToggleShowLabels}
                isShowLabels={showLabels}
                isDiagramLoading={loadingState}
                isNadCreationFromFilter={isNadCreationFromFilter}
                svgVoltageLevels={svgVoltageLevels}
                onFocusVoltageLevel={handleFocusVoltageLevel}
            />
            {renderEquipmentMenu()}
            {renderModificationDialog()}
            {renderDeletionDialog()}
            {renderDynamicSimulationEventDialog()}
        </>
    );
});

export default NetworkAreaDiagramContent;
