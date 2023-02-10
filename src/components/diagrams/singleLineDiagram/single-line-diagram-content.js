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
    //computePaperAndSvgSizesIfReady,
    getEquipmentTypeFromFeederType,
    LOADING_HEIGHT,
    LOADING_WIDTH,
    MAX_HEIGHT_SUBSTATION,
    MAX_HEIGHT_VOLTAGE_LEVEL,
    MAX_WIDTH_SUBSTATION,
    MAX_WIDTH_VOLTAGE_LEVEL,
    NoSvg,
    SvgType,
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
import { fetchSvg, updateSwitchState } from '../../../utils/rest-api';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import { useIntlRef, useSnackMessage } from '@gridsuite/commons-ui';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

// let initialWidth, initialHeight;

const SingleLineDiagramContent = forwardRef((props, ref) => {
    const [svg, setSvg] = useState(NoSvg);
    const classes = useDiagramStyles();
    const theme = useTheme();
    const { loadFlowStatus } = props;
    const MenuBranch = withBranchMenu(BaseEquipmentMenu);
    const network = useSelector((state) => state.network);
    const svgRef = useRef();
    const diagramViewerRef = useRef();
    const { snackError } = useSnackMessage();
    const intlRef = useIntlRef();
    const fullScreenDiagram = useSelector((state) => state.fullScreenDiagram);
    const [forceState, updateState] = useState(false);
    const currentNode = useSelector((state) => state.currentTreeNode);
    const [modificationInProgress, setModificationInProgress] = useState(false);
    const isAnyNodeBuilding = useIsAnyNodeBuilding();
    const [loadingState, setLoadingState] = useState(false);
    const [locallySwitchedBreaker, setLocallySwitchedBreaker] = useState();
    const [errorMessage, setErrorMessage] = useState('');
    const notificationIdList = useSelector((state) => state.notificationIdList);

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

    const { openDiagramView } = useDiagram();

    const handleBreakerClick = useCallback(
        (breakerId, newSwitchState, switchElement) => {
            if (!modificationInProgress) {
                setModificationInProgress(true);
                setLoadingState(true);
                setLocallySwitchedBreaker(switchElement);

                updateSwitchState(
                    props.studyUuid,
                    currentNode?.id,
                    breakerId,
                    newSwitchState
                ).catch((error) => {
                    console.error(error.message);
                    setErrorMessage(error.message);
                });
            }
        },
        [props.studyUuid, currentNode, modificationInProgress]
    );

    const handleNextVoltageLevelClick = useCallback(
        (id) => {
            // This function is called by powsybl-diagram-viewer when clicking on a navigation arrow in a single line diagram.
            // At the moment, there is no plan to open something other than a voltage-level by using these navigation arrows.
            if (!network) {
                return;
            }
            openDiagramView(id, SvgType.VOLTAGE_LEVEL);
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
                    currentNode={currentNode}
                    studyUuid={props.studyUuid}
                    modificationInProgress={modificationInProgress}
                    setModificationInProgress={(value) =>
                        setModificationInProgress(value)
                    }
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
                />
            )
        );
    };

    // const hasDiagramSizeRemainedTheSame = (
    //     oldWidth,
    //     oldHeight,
    //     newWidth,
    //     newHeight
    // ) => {
    //     return oldWidth === newWidth && oldHeight === newHeight;
    // };

    // using many useState() calls with literal values only to
    // easily avoid recomputing stuff when updating with the same values
    // const [svgPreferredWidth, setSvgPreferredWidth] = useState();
    // const [svgPreferredHeight, setSvgPreferredHeight] = useState();
    // const [headerPreferredHeight, setHeaderPreferredHeight] = useState();
    // const [finalPaperWidth, setFinalPaperWidth] = useState();
    // const [finalPaperHeight, setFinalPaperHeight] = useState();
    // const [svgFinalWidth, setSvgFinalWidth] = useState();
    // const [svgFinalHeight, setSvgFinalHeight] = useState();

    // // Here, the goal is to update the parent's list of heights with the newly computed height of this diagram.
    // const setDisplayedDiagramHeights = props.setDisplayedDiagramHeights;
    // useEffect(() => {
    //     if (finalPaperHeight) {
    //         setDisplayedDiagramHeights((displayedDiagramHeights) => {
    //             return [
    //                 ...displayedDiagramHeights.filter(
    //                     // We remove any old diagram that matches the current diagram...
    //                     (diagram) =>
    //                         diagram.id !== props.diagramId ||
    //                         diagram.svgType !== props.svgType
    //                 ),
    //                 {
    //                     // ...and then insert the current diagram's height
    //                     id: props.diagramId,
    //                     svgType: props.svgType,
    //                     initialHeight: finalPaperHeight,
    //                 },
    //             ];
    //         });
    //     }
    // }, [
    //     finalPaperHeight,
    //     setDisplayedDiagramHeights,
    //     props.diagramId,
    //     props.svgType,
    // ]);

    // // After getting the SVG, we will calculate the diagram's ideal size
    // useLayoutEffect(() => {
    //     const sizes = computePaperAndSvgSizesIfReady(
    //         props.fullScreenActive,
    //         props.svgType,
    //         props.totalWidth,
    //         props.totalHeight,
    //         svgPreferredWidth,
    //         svgPreferredHeight,
    //         headerPreferredHeight
    //     );
    //
    //     if (sizes) {
    //         if (
    //             !props.fullScreenActive &&
    //             sizes.svgWidth * props.numberToDisplay > props.totalWidth
    //         ) {
    //             setSvgFinalWidth(props.totalWidth / props.numberToDisplay);
    //             setFinalPaperWidth(props.totalWidth / props.numberToDisplay);
    //
    //             const adjustedHeight =
    //                 sizes.svgHeight *
    //                 (props.totalWidth / props.numberToDisplay / sizes.svgWidth);
    //
    //             setSvgFinalHeight(adjustedHeight);
    //             setFinalPaperHeight(
    //                 adjustedHeight + (sizes.paperHeight - sizes.svgHeight)
    //             );
    //         } else {
    //             setSvgFinalWidth(sizes.svgWidth);
    //             setFinalPaperWidth(sizes.paperWidth);
    //             setSvgFinalHeight(sizes.svgHeight);
    //             setFinalPaperHeight(sizes.paperHeight);
    //         }
    //     }
    // }, [
    //     props.fullScreenActive,
    //     props.totalWidth,
    //     props.totalHeight,
    //     props.svgType,
    //     svgPreferredWidth,
    //     svgPreferredHeight,
    //     headerPreferredHeight,
    //     props.numberToDisplay,
    //     props.diagramId,
    // ]);

    const isNodeinNotifs = isNodeInNotificationList(
        currentNode,
        notificationIdList
    );

    useEffect(() => {
        if (props.svgUrl) {
            if (!isNodeinNotifs) {
                const isDiagramTypeSld =
                    props.svgType === SvgType.VOLTAGE_LEVEL ||
                    props.svgType === SvgType.SUBSTATION;

                setLoadingState(true);
                fetchSvg(props.svgUrl)
                    .then((data) => {
                        if (data !== null) {
                            setSvg({
                                svg: data.svg,
                                metadata: isDiagramTypeSld // TODO CHARLY clean this later
                                    ? data.metadata
                                    : null,
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
                            msg = `Voltage level ${props.diagramId} not found`; // TODO change this error message
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
                        if (isDiagramTypeSld) {
                            // TODO CHARLY clean this later
                            setLocallySwitchedBreaker(null);
                        }
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
        props.diagramId,
        props.svgType,
        isNodeinNotifs,
    ]);

    // // shouldResetPreferredSizes doesn't need to be a ref, but it makes the static checks happy
    // const shouldResetPreferredSizes = useRef();
    // shouldResetPreferredSizes.current = false;
    // useLayoutEffect(() => {
    //     shouldResetPreferredSizes.current = true;
    //     // Note: these deps must be kept in sync with the ones of the useLayoutEffect where setSvgPreferredWidth and setSvgPreferredHeight
    //     // are called. Because we want to reset them in all cases, except when only svgFinalWidth and svgFinalHeight have changed
    //     // so we use the same deps but without svgFinalWidth and svgFinalHeight
    //     // TODO is there a better way to do this??
    // }, [
    //     network,
    //     svg,
    //     currentNode,
    //     props.isComputationRunning,
    //     isAnyNodeBuilding,
    //     equipmentMenu,
    //     showEquipmentMenu,
    //     props.svgType,
    //     theme,
    //     props.diagramId,
    //     ref,
    //     props.disabled,
    // ]);

    useLayoutEffect(() => {
        if (props.disabled) return;

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

                // minWidth
                LOADING_WIDTH, // svgFinalWidth,

                // minHeight
                LOADING_HEIGHT, // svgFinalHeight,

                // maxWidth
                props.svgType === SvgType.VOLTAGE_LEVEL
                    ? MAX_WIDTH_VOLTAGE_LEVEL
                    : MAX_WIDTH_SUBSTATION,

                // maxHeight
                props.svgType === SvgType.VOLTAGE_LEVEL
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

            // if (shouldResetPreferredSizes.current) {
            //     setSvgPreferredHeight(diagramViewer.getHeight());
            //     setSvgPreferredWidth(diagramViewer.getWidth());
            // }

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

            //if original sld size has not changed (sld structure has remained the same), we keep the same zoom
            // if (
            //     diagramViewerRef.current// &&
            // hasDiagramSizeRemainedTheSame(
            //     diagramViewerRef.current.getOriginalWidth(),
            //     diagramViewerRef.current.getOriginalHeight(),
            //     diagramViewer.getOriginalWidth(),
            //     diagramViewer.getOriginalHeight()
            // )

            // If a previous SLD was loaded, we keep the user's zoom and scoll state for the current render
            if (diagramViewerRef.current) {
                diagramViewer.setViewBox(diagramViewerRef.current.getViewBox());
            }

            // on sld resizing, we need to refresh zoom to avoid exceeding max or min zoom
            // this is due to a svg.panzoom.js package's behaviour
            //diagramViewer.refreshZoom(); // TODO CHARLY seems useless ?

            diagramViewerRef.current = diagramViewer;
        }
    }, [
        network,
        props.diagramId,
        props.svgUrl,
        svg,
        currentNode,
        props.isComputationRunning,
        isAnyNodeBuilding,
        equipmentMenu,
        showEquipmentMenu,
        props.svgType,
        theme,
        ref,
        // svgFinalHeight,
        // svgFinalWidth,
        props.disabled,
        modificationInProgress,
        loadingState,
        locallySwitchedBreaker,
        handleBreakerClick,
        handleNextVoltageLevelClick,
    ]);

    // useLayoutEffect(() => {
    //     if (svgFinalWidth != null && svgFinalHeight != null) {
    //         const divElt = svgRef.current;
    //         if (divElt != null) {
    //             const svgEl = divElt.getElementsByTagName('svg')[0];
    //             if (svgEl != null) {
    //                 svgEl.setAttribute('width', svgFinalWidth);
    //                 svgEl.setAttribute(
    //                     'height',
    //                     props.computedHeight ?? svgFinalHeight
    //                 );
    //             }
    //         }
    //         setModificationInProgress(false);
    //     }
    // }, [
    //     svgFinalWidth,
    //     svgFinalHeight,
    //     //TODO, these are from the previous useLayoutEffect
    //     //how to refactor to avoid repeating them here ?
    //     svg,
    //     props.isComputationRunning,
    //     props.svgType,
    //     theme,
    //     // equipmentMenu,
    //     // showEquipmentMenu,
    //     locallySwitchedBreaker,
    //     loadingState,
    //     modificationInProgress,
    //     isAnyNodeBuilding,
    //     network,
    //     ref,
    //     fullScreenDiagram,
    //     props.computedHeight,
    // ]);

    // let sizeWidth,
    //     sizeHeight = initialHeight;
    // if (svg.error) {
    //     sizeWidth = MAX_WIDTH_VOLTAGE_LEVEL;
    // } else if (finalPaperWidth != null && finalPaperHeight != null) {
    //     sizeWidth = finalPaperWidth;
    //     sizeHeight = finalPaperHeight;
    // } else if (initialWidth !== undefined || loadingState) {
    //     sizeWidth = initialWidth;
    // } else {
    //     sizeWidth = props.totalWidth; // happens during initialization if initial width value is undefined
    // }
    //
    // if (sizeWidth !== undefined) {
    //     initialWidth = sizeWidth; // setting initial width for the next SLD.
    // }
    // if (sizeHeight !== undefined) {
    //     initialHeight = sizeHeight; // setting initial height for the next SLD.
    // }
    //
    // if (!fullScreenDiagram?.id && props.computedHeight) {
    //     sizeHeight = props.computedHeight;
    // }

    return (
        <>
            {
                <Box height={2}>
                    {(loadingState || modificationInProgress) && (
                        <LinearProgress />
                    )}
                </Box>
            }
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            <div
                ref={svgRef}
                className={clsx(
                    classes.divDiagram,
                    classes.divSingleLineDiagram,
                    {
                        [classes.divDiagramInvalid]:
                            loadFlowStatus !== RunningStatus.SUCCEED,
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
        </>
    );
});

SingleLineDiagramContent.propTypes = {
    loadFlowStatus: PropTypes.any,
    displayBranchMenu: PropTypes.func,
    displayMenu: PropTypes.func,
};

export default SingleLineDiagramContent;
