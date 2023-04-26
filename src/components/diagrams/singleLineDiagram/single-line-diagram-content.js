/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useState, useLayoutEffect, useRef } from 'react';
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
import { deleteEquipment, updateSwitchState } from '../../../utils/rest-api';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import { useSnackMessage } from '@gridsuite/commons-ui';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import GeneratorModificationDialog from 'components/dialogs/generator/modification/generator-modification-dialog';
import LoadModificationDialog from '../../dialogs/load/modification/load-modification-dialog';

function SingleLineDiagramContent(props) {
    const { studyUuid } = props;
    const classes = useDiagramStyles();
    const { diagramSizeSetter } = props;
    const theme = useTheme();
    const MenuBranch = withBranchMenu(BaseEquipmentMenu);
    const network = useSelector((state) => state.network);
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

    /**
     * DIAGRAM INTERACTIVITY
     */

    const handleOpenModificationDialog = (equipmentId, equipmentType) => {
        closeEquipmentMenu();
        setEquipmentToModify({ equipmentId, equipmentType });
    };

    const closeModificationDialog = () => {
        setEquipmentToModify();
    };

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
            if (!network) {
                return;
            }
            openDiagramView(id, DiagramType.VOLTAGE_LEVEL);
        },
        [network, openDiagramView]
    );

    const [equipmentMenu, setEquipmentMenu] = useState({
        position: [-1, -1],
        equipmentId: null,
        equipmentType: null,
        svgId: null,
        display: null,
    });

    const showEquipmentMenu = useCallback(
        (equipmentId, equipmentType, svgId, x, y) => {
            setEquipmentMenu({
                position: [x, y],
                equipmentId: equipmentId,
                equipmentType: getEquipmentTypeFromFeederType(equipmentType),
                svgId: svgId,
                display: true,
            });
        },
        []
    );

    const closeEquipmentMenu = useCallback(() => {
        setEquipmentMenu({
            display: false,
        });
    }, []);

    const handleViewInSpreadsheet = () => {
        props.showInSpreadsheet(equipmentMenu);
        closeEquipmentMenu();
    };

    const handleDeleteEquipment = useCallback(
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

    const displayBranchMenu = () => {
        return (
            equipmentMenu.display &&
            (equipmentMenu.equipmentType === equipments.lines ||
                equipmentMenu.equipmentType ===
                    equipments.twoWindingsTransformers) && (
                <MenuBranch
                    id={equipmentMenu.equipmentId}
                    equipmentType={equipmentMenu.equipmentType}
                    position={equipmentMenu.position}
                    handleClose={closeEquipmentMenu}
                    handleViewInSpreadsheet={handleViewInSpreadsheet}
                    handleDeleteEquipment={handleDeleteEquipment}
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
                    id={equipmentMenu.equipmentId}
                    position={equipmentMenu.position}
                    handleClose={closeEquipmentMenu}
                    handleViewInSpreadsheet={handleViewInSpreadsheet}
                    handleOpenModificationDialog={handleOpenModificationDialog}
                    handleDeleteEquipment={handleDeleteEquipment}
                />
            )
        );
    };

    const displayModificationDialog = (equipmentType) => {
        switch (equipmentType) {
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

                // arrows color
                theme.palette.background.paper
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
        network,
        props.svgUrl,
        props.svg,
        props.svgMetadata,
        currentNode,
        props.isComputationRunning,
        isAnyNodeBuilding,
        equipmentMenu,
        showEquipmentMenu,
        props.diagramId,
        props.svgType,
        theme,
        modificationInProgress,
        props.loadingState,
        locallySwitchedBreaker,
        handleBreakerClick,
        handleNextVoltageLevelClick,
        diagramSizeSetter,
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
            {displayBranchMenu()}
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
            {equipmentToModify &&
                displayModificationDialog(equipmentToModify.equipmentType)}
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
