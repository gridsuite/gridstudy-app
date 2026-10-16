/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo, useCallback, useEffect, useEffectEvent, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    buildPositionsFromNadMetadata,
    equipmentsWithContextualMenu,
    equipmentsWithPopover,
    getEquipmentTypeFromFeederType,
    MAX_HEIGHT_NETWORK_AREA_DIAGRAM,
    MAX_WIDTH_NETWORK_AREA_DIAGRAM,
    MIN_HEIGHT,
    MIN_WIDTH,
    NAD_ZOOM_LEVELS,
} from '../diagram-utils';
import {
    DiagramMetadata,
    NadViewerParametersOptions,
    NetworkAreaDiagramViewer,
    OnSelectNodeCallbackType,
    OnToggleNadHoverCallbackType,
} from '@powsybl/network-viewer';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import { AppState } from 'redux/reducer.type';
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
    RunningStatus,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import DiagramControls from './diagram-controls';
import { createDiagramConfig, type DiagramConfigPosition, updateDiagramConfig } from 'services/explore';
import NodeContextMenu from './node-context-menu';
import useEquipmentMenu from 'hooks/use-equipment-menu';
import { MapEquipment } from 'components/menus/base-equipment-menu';
import AlertCustomMessageNode from 'components/utils/alert-custom-message-node';
import useEquipmentDialogs from 'hooks/use-equipment-dialogs';
import { styles } from '../diagram-styles';
import GenericEquipmentPopover from 'components/tooltips/generic-equipment-popover';
import { GenericEquipmentInfos } from 'components/tooltips/equipment-popover-type';
import { GenericPopoverContent } from 'components/tooltips/generic-popover-content';
import { selectActiveWorkspaceId, selectPanel, selectPanelEditMode } from 'redux/slices/workspace-selectors';
import { type RootState, store } from 'redux/store';
import { useWorkspacePanelActions } from 'components/workspace/hooks/use-workspace-panel-actions';
import { getNadPanelLocalState, saveNadPanelLocalState } from 'redux/session-storage/workspace-local-storage';
import { DiagramAdditionalMetadata } from '../diagram.type';
import { type NadEdit, NadEditType, type NadHistory } from 'components/workspace/diagrams/nad/nad-edit-history';

type NetworkAreaDiagramContentProps = {
    readonly nadPanelId: UUID;
    readonly showInSpreadsheet: (menu: { equipmentId: string | null; equipmentType: EquipmentType | null }) => void;
    readonly svg?: string;
    readonly svgMetadata?: DiagramMetadata;
    readonly additionalMetadata?: DiagramAdditionalMetadata;
    readonly svgVoltageLevels?: string[];
    readonly hiddenVoltageBands?: string[];
    readonly hiddenInfoSelectors?: string[];
    readonly areVoltageLevelNamesHidden?: boolean;
    readonly loadingState: boolean;
    readonly filterUuid?: UUID;
    readonly filterName?: string;
    readonly isFilterDeleted: boolean;
    readonly hasHiddenVoltageLevels: boolean;
    readonly visible: boolean;
    readonly onVoltageLevelClick: (voltageLevelId: string) => void;
    readonly onEdit: (edit: NadEdit) => void;
    readonly onReplaceNad: (name: string, nadConfigUuid?: UUID, filterUuid?: UUID) => void;
    readonly editHistory: NadHistory;
    readonly onRestoreHistoryState: (target: number) => DiagramConfigPosition[];
};

const NetworkAreaDiagramContent = memo(function NetworkAreaDiagramContent(props: NetworkAreaDiagramContentProps) {
    const {
        visible,
        onVoltageLevelClick,
        onEdit,
        onReplaceNad,
        editHistory,
        onRestoreHistoryState,
        nadPanelId,
        svg,
        svgMetadata,
        additionalMetadata,
        svgVoltageLevels,
        hiddenVoltageBands,
        hiddenInfoSelectors,
        areVoltageLevelNamesHidden,
        loadingState,
        filterUuid,
        filterName,
        isFilterDeleted,
        hasHiddenVoltageLevels,
        showInSpreadsheet,
    } = props;
    const svgRef = useRef<HTMLDivElement>(null);
    const { snackError, snackInfo } = useSnackMessage();
    const diagramViewerRef = useRef<NetworkAreaDiagramViewer | null>(null);
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
    const isEditNadMode = useSelector((state: RootState) => selectPanelEditMode(state, nadPanelId));
    const { setPanelEditMode } = useWorkspacePanelActions();
    const workspaceId = useSelector(selectActiveWorkspaceId);

    // Workaround for https://github.com/react/react/issues/35187 and https://github.com/react/react/issues/35034:
    // useEffectEvent retains the first render value when is used inside a component wrapped in memo()
    // => Read values through this ref (updated every render) instead to avoid stale values in useEffectEvent
    // => This workaround should be removed once the issue is fixed
    const latestValues = {
        isEditNadMode,
        loadingState,
        onVoltageLevelClick,
        additionalMetadata,
        studyUuid,
        currentNode,
        currentRootNetworkUuid,
        onEdit,
    };
    const latestRef = useRef(latestValues);
    latestRef.current = latestValues;

    const initialLocalStorageViewBox = useRef(
        getNadPanelLocalState(studyUuid, workspaceId, nadPanelId)?.viewBox ?? null
    );
    // Update drag interaction without full viewer reinitialization
    if (diagramViewerRef.current) {
        diagramViewerRef.current.enableDragInteraction = isEditNadMode && !loadingState;
    }

    const handleToggleEditNadMode = useCallback(
        (editMode: boolean) => setPanelEditMode({ panelId: nadPanelId, editMode }),
        [nadPanelId, setPanelEditMode]
    );

    const handleToggleHover: OnToggleNadHoverCallbackType = useEffectEvent(
        (shouldDisplay: boolean, mousePosition: Point | null, equipmentId: string, equipmentType: string) => {
            // Do not show the hover in edit mode
            if (latestRef.current.isEditNadMode) {
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
        }
    );

    const handleNodeLeftClick: OnSelectNodeCallbackType = useEffectEvent((equipmentId, nodeId, mousePosition) => {
        if (mousePosition && !latestRef.current.loadingState) {
            if (latestRef.current.isEditNadMode) {
                setSelectedVoltageLevelId(equipmentId);
                setShouldDisplayMenu(true);
                setMenuAnchorPosition(mousePosition ? { mouseX: mousePosition.x, mouseY: mousePosition.y } : null);
            } else {
                latestRef.current.onVoltageLevelClick(equipmentId);
            }
        }
    });

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

    const showEquipmentMenu = useEffectEvent(
        (svgId: string, equipmentId: string, equipmentType: string, mousePosition: Point) => {
            if (latestRef.current.isEditNadMode || !equipmentsWithContextualMenu.includes(equipmentType)) {
                return;
            }

            const openMenu = (equipmentType: EquipmentType, equipmentSubtype: ExtendedEquipmentType | null = null) => {
                const equipment: Partial<MapEquipment> = { id: equipmentId };
                if (equipmentType === EquipmentType.VOLTAGE_LEVEL) {
                    const vlSubstationId = latestRef.current.additionalMetadata?.voltageLevels.find(
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

            const convertedType = getEquipmentTypeFromFeederType(equipmentType);
            if (convertedType?.equipmentType) {
                openMenu(convertedType.equipmentType, convertedType.equipmentSubtype ?? null);
            }
        }
    );

    const handleExpandVoltageLevelId = useCallback(
        (voltageLevelId: string) => onEdit({ type: NadEditType.EXPAND, voltageLevelId }),
        [onEdit]
    );

    const handleHideVoltageLevelId = useCallback(
        (voltageLevelId: string) => onEdit({ type: NadEditType.HIDE, voltageLevelId }),
        [onEdit]
    );

    const handleMoveNode = useEffectEvent((equipmentId: string, nodeId: string, x: number, y: number) => {
        latestRef.current.onEdit({
            type: NadEditType.MOVE_NODE,
            voltageLevelId: equipmentId,
            position: { xPosition: x, yPosition: y },
        });
    });

    const handleMoveTextnode = useEffectEvent(
        (equipmentId: string, vlNodeId: string, textNodeId: string, shiftX: number, shiftY: number) => {
            latestRef.current.onEdit({
                type: NadEditType.MOVE_LABEL,
                voltageLevelId: equipmentId,
                position: { xLabelPosition: shiftX, yLabelPosition: shiftY },
            });
        }
    );

    // When only nodes or labels moved, they are moved back without drawing/fetching again
    const handleRestoreHistoryState = useCallback(
        (target: number) => {
            const diagramViewer = diagramViewerRef.current;
            onRestoreHistoryState(target).forEach(
                ({ voltageLevelId, xPosition, yPosition, xLabelPosition, yLabelPosition }) => {
                    if (xPosition !== undefined && yPosition !== undefined) {
                        diagramViewer?.moveNodeToCoordinates(voltageLevelId, xPosition, yPosition);
                    }
                    if (xLabelPosition !== undefined && yLabelPosition !== undefined) {
                        diagramViewer?.moveTextNodeToCoordinates(voltageLevelId, xLabelPosition, yLabelPosition, 0, 0);
                    }
                }
            );
        },
        [onRestoreHistoryState]
    );

    const handleReplaceNadConfig = useCallback(
        (elementUuid: UUID, elementType: ElementType, elementName: string) => {
            // Since we want to replace the NAD with a new one, we ditch the previous diagram
            // viewer reference and viewbox because we do not want to use an obsolete viewbox on the new NAD.
            diagramViewerRef.current = null;
            initialLocalStorageViewBox.current = null;
            saveNadPanelLocalState(studyUuid, workspaceId, nadPanelId, { viewBox: undefined });
            onReplaceNad(
                elementName,
                elementType === ElementType.DIAGRAM_CONFIG ? elementUuid : undefined,
                elementType === ElementType.FILTER ? elementUuid : undefined
            );
        },
        [onReplaceNad, studyUuid, workspaceId, nadPanelId]
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

    const saveViewBoxToLocalStorage = useCallback(() => {
        if (!diagramViewerRef.current) {
            return;
        }
        const viewBox = diagramViewerRef.current.getViewBox() ?? undefined;
        saveNadPanelLocalState(studyUuid, workspaceId, nadPanelId, { viewBox });
    }, [nadPanelId, studyUuid, workspaceId]);

    useEffect(() => {
        // Save viewbox on workspace switch
        globalThis.addEventListener('workspace:switchWorkspace', saveViewBoxToLocalStorage);
        // Save viewbox on page close/refresh
        globalThis.addEventListener('beforeunload', saveViewBoxToLocalStorage);
        return () => {
            globalThis.removeEventListener('workspace:switchWorkspace', saveViewBoxToLocalStorage);
            globalThis.removeEventListener('beforeunload', saveViewBoxToLocalStorage);
            // Save viewbox on unmount (node not built, fetch error...), unless the panel was closed
            if (selectPanel(store.getState(), nadPanelId)) {
                saveViewBoxToLocalStorage();
            }
        };
    }, [saveViewBoxToLocalStorage, nadPanelId]);
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
                enableDragInteraction: latestRef.current.isEditNadMode,
                enableLevelOfDetail: true,
                zoomLevels: NAD_ZOOM_LEVELS,
                addButtons: false,
                onMoveNodeCallback: handleMoveNode,
                onMoveTextNodeCallback: handleMoveTextnode,
                onSelectNodeCallback: handleNodeLeftClick,
                onToggleHoverCallback: handleToggleHover,
                onRightClickCallback: showEquipmentMenu,
                initialViewBox:
                    diagramViewerRef.current?.getViewBox() ?? initialLocalStorageViewBox.current ?? undefined,
                adaptiveTextZoom: {
                    enabled: true,
                    threshold: 9000,
                    edgeMiddleLabelThreshold: 3000,
                    edgeSideLabelThreshold: 2000,
                    edgeMiddleArrowThreshold: 8000,
                },
            };
            const diagramViewer = new NetworkAreaDiagramViewer(
                svgRef.current,
                svg,
                svgMetadata ?? null,
                nadViewerParameters
            );

            // We keep a reference of the diagram viewer to get its viewbox for the next render.
            diagramViewerRef.current = diagramViewer;
        } else if (!svg && svgRef.current) {
            // Empty diagram: the previous one is cleared
            svgRef.current.replaceChildren();
            diagramViewerRef.current = null;
        }
    }, [svg, svgMetadata, nadPanelId, loadingState]);

    const closeMenu = () => {
        setMenuAnchorPosition(null);
        setShouldDisplayMenu(false);
    };

    // Visually hide the voltage-level bands unchecked in the filter
    const hiddenVoltagesSx = useMemo(
        () =>
            (hiddenVoltageBands ?? []).reduce<Record<string, { display: 'none' }>>((acc, band) => {
                acc[`& .nad-${band}`] = { display: 'none' };
                return acc;
            }, {}),
        [hiddenVoltageBands]
    );

    // Visually hide the information layers turned off in the "Information" sidebar section
    const hiddenInfosSx = useMemo(
        () =>
            (hiddenInfoSelectors ?? []).reduce<Record<string, { display: 'none' }>>((acc, selector) => {
                acc[`& ${selector}`] = { display: 'none' };
                return acc;
            }, {}),
        [hiddenInfoSelectors]
    );

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
            <Box
                sx={{
                    height: 2,
                }}
            >
                {loadingState && <LinearProgress />}
            </Box>
            {visible && shouldDisplayTooltip && displayTooltip()}
            {shouldDisplayMenu && (
                <NodeContextMenu
                    open={!!menuAnchorPosition}
                    anchorPosition={menuAnchorPosition}
                    onClose={closeMenu}
                    onExpandItem={handleExpandVoltageLevelId}
                    onHideItem={handleHideVoltageLevelId}
                    selectedItemId={selectedVoltageLevelId}
                    isExpandDisabled={isFilterDeleted}
                />
            )}
            <Box
                ref={svgRef}
                sx={mergeSx(
                    styles.divDiagram,
                    styles.divNetworkAreaDiagram,
                    loadFlowStatus !== RunningStatus.SUCCEED ? styles.divDiagramLoadflowInvalid : undefined,
                    isEditNadMode ? styles.nadEditModeCursors : undefined,
                    areVoltageLevelNamesHidden ? styles.disableBusNodeHighlight : undefined,
                    hiddenVoltagesSx,
                    hiddenInfosSx
                )}
            />
            {!svg && !loadingState && (
                <Box sx={styles.emptyDiagram}>
                    {isFilterDeleted ? (
                        <AlertCustomMessageNode message={{ descriptor: { id: 'nadDeletedFilterMessage' } }} noMargin />
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            <FormattedMessage id="nadEmpty" />
                        </Typography>
                    )}
                </Box>
            )}
            <DiagramControls
                onSave={handleSaveNadConfig}
                onUpdate={handleUpdateNadConfig}
                onLoad={handleReplaceNadConfig}
                isEditNadMode={isEditNadMode}
                onToggleEditNadMode={handleToggleEditNadMode}
                onEdit={onEdit}
                isDiagramLoading={loadingState}
                filterUuid={filterUuid}
                filterName={filterName}
                isFilterDeleted={isFilterDeleted}
                hasHiddenVoltageLevels={hasHiddenVoltageLevels}
                svgVoltageLevels={svgVoltageLevels}
                onFocusVoltageLevel={handleFocusVoltageLevel}
                editHistory={editHistory}
                onRestoreHistoryState={handleRestoreHistoryState}
            />
            {renderEquipmentMenu()}
            {renderModificationDialog()}
            {renderDeletionDialog()}
            {renderDynamicSimulationEventDialog()}
        </>
    );
});

export default NetworkAreaDiagramContent;
