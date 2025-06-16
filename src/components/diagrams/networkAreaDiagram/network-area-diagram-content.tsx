/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useLayoutEffect, useRef, useMemo, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RunningStatus } from '../../utils/running-status';
import {
    MIN_HEIGHT,
    MIN_WIDTH,
    MAX_HEIGHT_NETWORK_AREA_DIAGRAM,
    MAX_WIDTH_NETWORK_AREA_DIAGRAM,
    styles,
    NAD_ZOOM_LEVELS,
} from '../diagram-common';
import {
    NetworkAreaDiagramViewer,
    DiagramMetadata,
    OnToggleNadHoverCallbackType,
    OnSelectNodeCallbackType,
} from '@powsybl/network-viewer';
import AddIcon from '@mui/icons-material/ControlPoint';

import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import ComputingType from '../../computing-status/computing-type';
import { AppState, NadNodeMovement, NadTextMovement } from 'redux/reducer';
import {
    setNetworkAreaDiagramSelectedVoltageLevel,
    storeNetworkAreaDiagramNodeMovement,
    storeNetworkAreaDiagramTextNodeMovement,
} from '../../../redux/actions';
import { buildPositionsFromNadMetadata, getNadIdentifier } from '../diagram-utils';
import EquipmentPopover from 'components/tooltips/equipment-popover';
import { UUID } from 'crypto';
import { Point } from '@svgdotjs/svg.js';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { FEEDER_TYPES } from 'components/utils/feederType';
import { CustomMenuItem, ElementType, IElementCreationDialog, mergeSx, useSnackMessage } from '@gridsuite/commons-ui';
import DiagramControls from '../diagram-controls';
import { createDiagramConfig } from '../../../services/explore';
import { DiagramType } from '../diagram.type';
import { useDiagram } from '../use-diagram';
import { ListItemIcon, ListItemText, Menu, Typography } from '@mui/material';
import { useIntl } from 'react-intl';

const equipmentsWithPopover = [
    EQUIPMENT_TYPES.LINE,
    EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER,
    FEEDER_TYPES.PHASE_SHIFT_TRANSFORMER,
];

type NetworkAreaDiagramContentProps = {
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
    readonly onLoadNadFromElement?: (elementUuid: UUID, elementType: ElementType, elementName: string) => void;
};

function NetworkAreaDiagramContent(props: NetworkAreaDiagramContentProps) {
    const { diagramSizeSetter, visible, isEditNadMode, onToggleEditNadMode, onLoadNadFromElement } = props;
    const dispatch = useDispatch();
    const svgRef = useRef();
    const { snackError, snackInfo } = useSnackMessage();
    const diagramViewerRef = useRef<NetworkAreaDiagramViewer>();
    const loadFlowStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.LOAD_FLOW]);
    const nadNodeMovements = useSelector((state: AppState) => state.nadNodeMovements);
    const nadNodeMovementsRef = useRef<NadNodeMovement[]>([]);
    nadNodeMovementsRef.current = nadNodeMovements;
    const nadTextNodeMovements = useSelector((state: AppState) => state.nadTextNodeMovements);
    const nadTextNodeMovementsRef = useRef<NadTextMovement[]>([]);
    nadTextNodeMovementsRef.current = nadTextNodeMovements;
    const diagramStates = useSelector((state: AppState) => state.diagramStates);
    const networkVisuParams = useSelector((state: AppState) => state.networkVisualizationsParameters);
    const [shouldDisplayTooltip, setShouldDisplayTooltip] = useState(false);
    const [anchorPosition, setAnchorPosition] = useState({ top: 0, left: 0 });
    const [hoveredEquipmentId, setHoveredEquipmentId] = useState('');
    const [hoveredEquipmentType, setHoveredEquipmentType] = useState('');
    const [menuAnchorPosition, setMenuAnchorPosition] = useState<{ mouseX: number; mouseY: number } | null>(null);
    const [clickedEquipmentId, setClickedEquipmentId] = useState<string>();
    const [shouldDisplayMenu, setShouldDisplayMenu] = useState(false);

    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const { loadNadFromElementView } = useDiagram(); // TODO Remove this when diagram-pane is removed

    const nadIdentifier = useMemo(() => {
        if (props.svgType === DiagramType.NAD_FROM_ELEMENT) {
            return props.diagramId;
        }
        return getNadIdentifier(diagramStates, networkVisuParams.networkAreaDiagramParameters.initNadWithGeoData);
    }, [
        diagramStates,
        networkVisuParams.networkAreaDiagramParameters.initNadWithGeoData,
        props.svgType,
        props.diagramId,
    ]);

    const onMoveNodeCallback = useCallback(
        (equipmentId: string, nodeId: string, x: number, y: number, xOrig: number, yOrig: number) => {
            // It is possible to not have scalingFactors, so we only save the nodes movements if we have the needed value.
            if (!!props.svgScalingFactor) {
                dispatch(storeNetworkAreaDiagramNodeMovement(nadIdentifier, equipmentId, x, y, props.svgScalingFactor));
            }
        },
        [dispatch, nadIdentifier, props.svgScalingFactor]
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
            // Dispatch the new position of the text node
            dispatch(
                storeNetworkAreaDiagramTextNodeMovement(
                    nadIdentifier,
                    equipmentId,
                    shiftX,
                    shiftY,
                    connectionShiftX,
                    connectionShiftY
                )
            );
        },
        [dispatch, nadIdentifier]
    );

    const OnLeftClickCallback: OnSelectNodeCallbackType = useCallback((equipmentId, nodeId, mousePosition) => {
        if (mousePosition) {
            setClickedEquipmentId(equipmentId);
            setShouldDisplayMenu(true);
            setMenuAnchorPosition(mousePosition ? { mouseX: mousePosition.x, mouseY: mousePosition.y } : null);
        }
    }, []);

    const OnToggleHoverCallback: OnToggleNadHoverCallbackType = useCallback(
        (shouldDisplay: boolean, mousePosition: Point | null, equipmentId: string, equipmentType: string) => {
            if (mousePosition) {
                const anchorPosition = {
                    top: mousePosition.y + 10,
                    left: mousePosition.x + 10,
                };

                setAnchorPosition(anchorPosition);
                setHoveredEquipmentId(equipmentId);
                setHoveredEquipmentType(equipmentType);

                // Only show tooltip if the equipment type is in the hoverable list
                const isEquipmentHoverable = equipmentsWithPopover.includes(equipmentType);
                setShouldDisplayTooltip(shouldDisplay && isEquipmentHoverable); // Show or hide based on shouldDisplay
            } else {
                setShouldDisplayTooltip(false);
            }
        },

        [setShouldDisplayTooltip, setAnchorPosition]
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

    const handleLoadFromElement = useCallback(
        (elementUuid: UUID, elementType: ElementType, elementName: string) => {
            if (onLoadNadFromElement) {
                onLoadNadFromElement(elementUuid, elementType, elementName);
            } else {
                loadNadFromElementView(elementUuid, elementType, elementName);
            }
        },
        [loadNadFromElementView, onLoadNadFromElement]
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
                null,
                false
            );

            // Update the diagram-pane's list of sizes with the width and height from the backend
            diagramSizeSetter(props.diagramId, props.svgType, diagramViewer.getWidth(), diagramViewer.getHeight());

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

            // Repositioning the previously moved nodes
            const correspondingMovements = nadNodeMovementsRef.current.filter(
                (movement) => movement.nadIdentifier === nadIdentifier
            );
            if (correspondingMovements.length > 0) {
                correspondingMovements.forEach((movement) => {
                    // It is possible to not have scalingFactors, so we only move the nodes if we have the needed value.
                    if (!!movement.scalingFactor && !!props.svgScalingFactor) {
                        let adjustedX = (movement.x / movement.scalingFactor) * props.svgScalingFactor;
                        let adjustedY = (movement.y / movement.scalingFactor) * props.svgScalingFactor;
                        diagramViewer.moveNodeToCoordinates(movement.equipmentId, adjustedX, adjustedY);
                    }
                });
            }

            // Repositioning the previously moved text nodes
            const correspondingTextMovements = nadTextNodeMovementsRef.current.filter(
                (movement) => movement.nadIdentifier === nadIdentifier
            );
            if (correspondingTextMovements.length > 0) {
                correspondingTextMovements.forEach((movement) => {
                    // If the movement is due to a node move, adjust the text node relative to the node's movement
                    // In case of text node movement adjust text node position
                    diagramViewer.moveTextNodeToCoordinates(
                        movement.equipmentId,
                        movement.shiftX,
                        movement.shiftY,
                        movement.connectionShiftX,
                        movement.connectionShiftY
                    );
                });
            }

            diagramViewerRef.current = diagramViewer;
        }
    }, [
        props.diagramId,
        props.svgType,
        props.svg,
        props.svgMetadata,
        props.svgScalingFactor,
        diagramSizeSetter,
        onMoveNodeCallback,
        OnToggleHoverCallback,
        nadIdentifier,
        onMoveTextNodeCallback,
        isEditNadMode,
        OnLeftClickCallback,
    ]);

    /**
     * RENDER
     */
    const intl = useIntl();
    const closeMenu = () => {
        setMenuAnchorPosition(null);
        setShouldDisplayMenu(false);
    };
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
                <Menu
                    open={!!menuAnchorPosition}
                    onClose={closeMenu}
                    anchorReference="anchorPosition"
                    anchorPosition={
                        menuAnchorPosition !== null
                            ? { top: menuAnchorPosition.mouseY, left: menuAnchorPosition.mouseX }
                            : undefined
                    }
                    style={{
                        width: 'auto',
                        maxHeight: 'auto',
                    }}
                >
                    <CustomMenuItem
                        style={{
                            paddingTop: '1px',
                            paddingBottom: '1px',
                        }}
                        onClick={() => {
                            if (clickedEquipmentId) {
                                dispatch(setNetworkAreaDiagramSelectedVoltageLevel([clickedEquipmentId]));
                            }
                            setMenuAnchorPosition(null);
                            setShouldDisplayMenu(false);
                        }}
                    >
                        <ListItemIcon>
                            <AddIcon />
                        </ListItemIcon>

                        <ListItemText primary={<Typography noWrap>{intl.formatMessage({ id: 'add' })}</Typography>} />
                    </CustomMenuItem>
                </Menu>
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
                onLoad={handleLoadFromElement}
                isEditNadMode={isEditNadMode}
                onToggleEditNadMode={onToggleEditNadMode}
            />
        </>
    );
}

export default NetworkAreaDiagramContent;
