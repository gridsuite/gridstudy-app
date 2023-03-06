/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, {
    forwardRef,
    useImperativeHandle,
    useCallback,
    useState,
    useLayoutEffect,
    useRef,
    useEffect,
} from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { RunningStatus } from '../../util/running-status';
import { equipments } from '../../network/network-equipments';
import {
    getEquipmentTypeFromFeederType,
    MIN_HEIGHT,
    MIN_WIDTH,
    MAX_HEIGHT_SUBSTATION,
    MAX_HEIGHT_VOLTAGE_LEVEL,
    MAX_WIDTH_SUBSTATION,
    MAX_WIDTH_VOLTAGE_LEVEL,
    NoSvg,
    DiagramType,
    useDiagram,
    useDiagramStyles,
} from '../diagram-common';
import withEquipmentMenu from '../../menus/equipment-menu';
import BaseEquipmentMenu from '../../menus/base-equipment-menu';
import withBranchMenu from '../../menus/branch-menu';
import { SingleLineDiagramViewer } from '@powsybl/diagram-viewer';
import {
    isNodeInNotificationList,
    isNodeReadOnly,
} from '../../graph/util/model-functions';
import { useIsAnyNodeBuilding } from '../../util/is-any-node-building-hook';
import {
    deleteEquipment,
    fetchSvg,
    updateSwitchState,
} from '../../../utils/rest-api';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import { useIntlRef, useSnackMessage } from '@gridsuite/commons-ui';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import LoadModificationDialog from '../../dialogs/load-modification-dialog';
import { withVLsIdsAndTopology } from '../../graph/menus/network-modification-node-editor';
import GeneratorModificationDialog from 'components/refactor/dialogs/generator-modification/generator-modification-dialog';

const SingleLineDiagramContent = forwardRef((props, ref) => {
    const { studyUuid } = props;
    const [svg, setSvg] = useState(NoSvg);
    const classes = useDiagramStyles();
    const { diagramSizeSetter } = props;
    const theme = useTheme();
    const MenuBranch = withBranchMenu(BaseEquipmentMenu);
    const network = useSelector((state) => state.network);
    const svgRef = useRef();
    const diagramViewerRef = useRef();
    const { snackError } = useSnackMessage();
    const intlRef = useIntlRef();
    const [forceState, updateState] = useState(false);
    const currentNode = useSelector((state) => state.currentTreeNode);
    const [modificationInProgress, setModificationInProgress] = useState(false);
    const isAnyNodeBuilding = useIsAnyNodeBuilding();
    const [loadingState, setLoadingState] = useState(false);
    const [locallySwitchedBreaker, setLocallySwitchedBreaker] = useState();
    const [errorMessage, setErrorMessage] = useState('');
    const notificationIdList = useSelector((state) => state.notificationIdList);
    const { openDiagramView } = useDiagram();
    const [equipmentToModify, setEquipmentToModify] = useState();

    /**
     * MANUAL UPDATE SYSTEM
     */

    const forceUpdate = useCallback(() => {
        updateState((s) => !s);
    }, []);

    useImperativeHandle(
        ref,
        () => ({
            reloadSvg: forceUpdate,
        }),
        // Note: forceUpdate doesn't change
        [forceUpdate]
    );

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
                setLoadingState(true);
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
                        voltageLevelsIdsAndTopologyPromise={withVLsIdsAndTopology(
                            studyUuid,
                            currentNode?.id
                        )}
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

    const isNodeinNotifs = isNodeInNotificationList(
        currentNode,
        notificationIdList
    );

    useLayoutEffect(() => {
        if (svg.svg) {
            const isReadyForInteraction =
                !props.isComputationRunning &&
                !isAnyNodeBuilding &&
                !modificationInProgress &&
                !loadingState;

            const diagramViewer = new SingleLineDiagramViewer(
                svgRef.current, //container
                svg.svg, //svgContent
                svg.metadata, //svg metadata
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
        svg,
        currentNode,
        props.isComputationRunning,
        isAnyNodeBuilding,
        equipmentMenu,
        showEquipmentMenu,
        props.diagramId,
        props.svgType,
        theme,
        ref,
        modificationInProgress,
        loadingState,
        locallySwitchedBreaker,
        handleBreakerClick,
        handleNextVoltageLevelClick,
        diagramSizeSetter,
    ]);

    useEffect(() => {
        if (props.svgUrl) {
            if (!isNodeinNotifs) {
                setLoadingState(true);
                fetchSvg(props.svgUrl)
                    .then((data) => {
                        if (data !== null) {
                            setSvg({
                                svg: data.svg,
                                metadata: data.metadata,
                                error: null,
                                svgUrl: props.svgUrl,
                            });
                        } else {
                            setSvg(NoSvg);
                        }
                    })
                    .catch((error) => {
                        console.error(error.message);
                        setSvg({
                            svg: null,
                            metadata: null,
                            error: error.message,
                            svgUrl: props.svgUrl,
                        });
                        let msg;
                        if (error.status === 404) {
                            msg = `Voltage level not found`;
                        } else {
                            msg = error.message;
                        }
                        snackError({
                            messageTxt: msg,
                        });
                    })
                    .finally(() => {
                        setLoadingState(false);
                        setModificationInProgress(false);
                        setLocallySwitchedBreaker(null);
                    });
            }
        } else {
            setSvg(NoSvg);
        }
    }, [
        props.svgUrl,
        forceState,
        snackError,
        intlRef,
        props.svgType,
        isNodeinNotifs,
    ]);

    /**
     * RENDER
     */

    return (
        <>
            <Box height={2}>
                {(loadingState || modificationInProgress) && <LinearProgress />}
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
});

SingleLineDiagramContent.propTypes = {
    loadFlowStatus: PropTypes.any,
    isComputationRunning: PropTypes.bool,
    showInSpreadsheet: PropTypes.func,
    studyUuid: PropTypes.string,
    svgType: PropTypes.string,
    svgUrl: PropTypes.string,
    diagramSizeSetter: PropTypes.func,
    diagramId: PropTypes.string,
};

export default SingleLineDiagramContent;
