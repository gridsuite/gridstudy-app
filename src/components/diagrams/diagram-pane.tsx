/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Fragment, useCallback, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Chip, Stack, Theme } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import TimelineIcon from '@mui/icons-material/Timeline';
import {
    DEFAULT_HEIGHT_NETWORK_AREA_DIAGRAM,
    DEFAULT_HEIGHT_SUBSTATION,
    DEFAULT_HEIGHT_VOLTAGE_LEVEL,
    DEFAULT_WIDTH_NETWORK_AREA_DIAGRAM,
    DEFAULT_WIDTH_SUBSTATION,
    DEFAULT_WIDTH_VOLTAGE_LEVEL,
    DIAGRAM_MAP_RATIO_MIN_PERCENTAGE,
    MAP_BOTTOM_OFFSET,
    VoltageLevel,
} from './diagram-common';
import { isNodeBuilt } from '../graph/util/model-functions';
import AutoSizer from 'react-virtualized-auto-sizer';
import Diagram from './diagram';
import SingleLineDiagramContent from './singleLineDiagram/single-line-diagram-content';
import NetworkAreaDiagramContent from './networkAreaDiagram/network-area-diagram-content';
import { EquipmentType, mergeSx, OverflowableText } from '@gridsuite/commons-ui';
import { useLocalizedCountries } from 'components/utils/localized-countries-hook';
import { UUID } from 'crypto';
import { AppState } from 'redux/reducer';
import { DiagramType, isNadType, ViewState } from './diagram.type';
import { useDiagramApi } from './use-diagram-api';
import { CurrentTreeNode } from '../graph/tree-node.type';
import { DiagramView, isNadView, isSldView, useDiagrams } from './use-diagrams';

const styles = {
    minimizedDiagram: {
        bottom: '60px',
        position: 'absolute',
        marginLeft: '3em',
    },
    minimizedDiagramTitle: {
        maxWidth: '17em',
        paddingTop: '4px',
    },
    separator: {
        flexGrow: 1,
        display: 'flex',
        overflow: 'hidden',
    },
    availableDiagramSurfaceArea: (theme: Theme) => ({
        flexDirection: 'row',
        display: 'inline-flex',
        paddingRight: theme.spacing(6),
    }),
    fullscreen: {
        paddingRight: 0,
    },
};

interface DiagramPaneProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    showInSpreadsheet: (equipment: { equipmentId: string | null; equipmentType: EquipmentType | null }) => void;
    visible: boolean;
}

export function DiagramPane({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    showInSpreadsheet,
    visible,
}: DiagramPaneProps) {
    const [displayedDiagrams, minimizedDiagrams] = useDiagrams();
    const fullScreenDiagram = useSelector((state: AppState) => state.fullScreenDiagram);

    const { translate } = useLocalizedCountries();

    const [diagramContentSizes, setDiagramContentSizes] = useState(new Map()); // When a diagram content gets its size from the backend, it will update this map of sizes.

    const { openDiagramView, closeDiagramView } = useDiagramApi();
    const currentNodeRef = useRef<CurrentTreeNode>();
    currentNodeRef.current = currentNode;
    const currentRootNetworkUuidRef = useRef<UUID>();
    currentRootNetworkUuidRef.current = currentRootNetworkUuid;
    // const viewsRef = useRef<DiagramView[]>([]);
    // viewsRef.current = views;

    /**
     * DIAGRAM SIZE CALCULATION
     */

    // This function is called by the diagram's contents, when they get their sizes from the backend.
    const setDiagramSize = useCallback((diagramId: UUID, diagramType: DiagramType, width: number, height: number) => {
        setDiagramContentSizes((oldContentSizes) => {
            return new Map(oldContentSizes).set(diagramType + diagramId, {
                width: width,
                height: height,
            });
        });
    }, []);

    const getDefaultHeightByDiagramType = (diagramType: DiagramType) => {
        switch (diagramType) {
            case DiagramType.SUBSTATION:
                return DEFAULT_HEIGHT_SUBSTATION;
            case DiagramType.VOLTAGE_LEVEL:
                return DEFAULT_HEIGHT_VOLTAGE_LEVEL;
            case DiagramType.NETWORK_AREA_DIAGRAM:
                return DEFAULT_HEIGHT_NETWORK_AREA_DIAGRAM;
            default:
                console.warn('Unknown diagram type !');
                return 1;
        }
    };

    const getDefaultWidthByDiagramType = (diagramType: DiagramType) => {
        switch (diagramType) {
            case DiagramType.SUBSTATION:
                return DEFAULT_WIDTH_SUBSTATION;
            case DiagramType.VOLTAGE_LEVEL:
                return DEFAULT_WIDTH_VOLTAGE_LEVEL;
            case DiagramType.NETWORK_AREA_DIAGRAM:
                return DEFAULT_WIDTH_NETWORK_AREA_DIAGRAM;
            default:
                console.warn('Unknown diagram type !');
                return 1;
        }
    };

    const getDiagramOrDefaultHeight = useCallback(
        (diagramId: UUID, diagramType: DiagramType) => {
            return (
                diagramContentSizes.get(diagramType + diagramId)?.height ?? getDefaultHeightByDiagramType(diagramType)
            );
        },
        [diagramContentSizes]
    );

    const getDiagramOrDefaultWidth = useCallback(
        (diagramId: UUID, diagramType: DiagramType) => {
            return diagramContentSizes.get(diagramType + diagramId)?.width ?? getDefaultWidthByDiagramType(diagramType);
        },
        [diagramContentSizes]
    );

    const getRatioWidthByHeight = (width: number, height: number) => {
        if (Number(height) > 0) {
            return Number(width) / Number(height);
        }
        return 1.0;
    };

    /*
     * Finds the maximum height among the displayed diagrams for a specific svgType.
     * Voltage levels and substations will share their heights, whereas a network area
     * diagram will have its own height.
     */
    const getMaxHeightFromDisplayedDiagrams = useCallback(
        (svgType: DiagramType) => {
            // First, we check which diagrams are displayed in the pane with a compatible svgType
            // and for which we stored a height in diagramContentSizes.
            const matchingDiagrams = displayedDiagrams
                .filter(
                    (diagram) =>
                        svgType === diagram.svgType ||
                        (svgType !== DiagramType.NETWORK_AREA_DIAGRAM &&
                            diagram.svgType !== DiagramType.NETWORK_AREA_DIAGRAM)
                )
                .filter((diagram) => diagramContentSizes.has(diagram.svgType + diagram.id));

            // Then, we find the maximum height from these diagrams
            if (matchingDiagrams.length > 0) {
                return matchingDiagrams.reduce(
                    (maxFoundHeight: number, currentDiagram) =>
                        (maxFoundHeight || 1) >
                        diagramContentSizes.get(currentDiagram.svgType + currentDiagram.id).height
                            ? maxFoundHeight
                            : diagramContentSizes.get(currentDiagram.svgType + currentDiagram.id).height,
                    1
                );
            }
            // If we found no matching diagram, we return the default value for this svgType.
            return getDefaultHeightByDiagramType(svgType);
        },
        [displayedDiagrams, diagramContentSizes]
    );

    /*
     * Calculate a diagram's ideal width, based on its original width/height ratio and the shared
     * heights of other diagrams with corresponding svgType (voltage levels and substations will
     * share their heights, whereas a network area diagram will have its own height).
     */
    const getWidthForPaneDisplay = useCallback(
        (diagramId: UUID, diagramType: DiagramType) => {
            const diagramWidth = getDiagramOrDefaultWidth(diagramId, diagramType);

            const diagramHeight = getDiagramOrDefaultHeight(diagramId, diagramType);

            return getRatioWidthByHeight(diagramWidth, diagramHeight) * getMaxHeightFromDisplayedDiagrams(diagramType);
        },
        [getMaxHeightFromDisplayedDiagrams, getDiagramOrDefaultWidth, getDiagramOrDefaultHeight]
    );

    /*
     * Calculate a diagram's ideal height, based on its natural height, the available space in
     * the pane, and the other diagrams' sizes.
     */
    const getHeightForPaneDisplay = useCallback(
        (diagramType: DiagramType, availableWidth: number, availableHeight: number) => {
            let result;

            const maxHeightFromDisplayedDiagrams = getMaxHeightFromDisplayedDiagrams(diagramType);

            // let's check if the total width of the displayed diagrams is greater than the
            // available space in the pane.
            // If it is, it means the diagram's content are compressed and their heights
            // should be shortened to keep their ratio correct.
            const totalWidthOfDiagrams = displayedDiagrams.reduce(
                (sum, currentDiagram) =>
                    sum +
                    (diagramContentSizes.get(currentDiagram.svgType + currentDiagram.id)?.width ??
                        getDefaultWidthByDiagramType(diagramType)),
                1
            );
            if (totalWidthOfDiagrams > availableWidth) {
                result = maxHeightFromDisplayedDiagrams * (availableWidth / totalWidthOfDiagrams);
            } else {
                result = maxHeightFromDisplayedDiagrams;
            }

            // Edge cases :

            // When opening a lot of diagrams, the total width of the displayed diagrams grows
            // with each new opened diagram and therefor their heights are shortened more and
            // more.
            // To prevent the diagrams from becoming too small, we stop shortening their height
            // under a threshold : a percentage of the pane's total height.
            if (result < availableHeight * DIAGRAM_MAP_RATIO_MIN_PERCENTAGE) {
                return availableHeight * DIAGRAM_MAP_RATIO_MIN_PERCENTAGE;
            }

            // If a diagram is too big, it could overlap the minimized diagrams on the bottom
            // of the pane and the map's other controls.
            // To prevent this, we restrict the diagrams' height to the total height of the pane
            // minus a fixed amount of pixels which are reserved for these controls and elements.
            if (result > availableHeight - MAP_BOTTOM_OFFSET) {
                return availableHeight - MAP_BOTTOM_OFFSET;
            }
            return result;
        },
        [displayedDiagrams, diagramContentSizes, getMaxHeightFromDisplayedDiagrams]
    );

    const getDiagramTitle = (diagramView: DiagramView) => {
        if (isNadView(diagramView)) {
            return diagramView.name;
        } else if (isSldView(diagramView)) {
            return (
                diagramView.name +
                ' - ' +
                (diagramView.additionalMetadata?.country ? translate(diagramView.additionalMetadata.country) : '')
            );
        }
        return diagramView.name;
    };

    /**
     * RENDER
     */

    const handleWarningToDisplay = useCallback(
        (diagramView: DiagramView) => {
            if (!isNodeBuilt(currentNode)) {
                return 'InvalidNode';
            }
            if (isSldView(diagramView) || isNadView(diagramView)) {
                return diagramView.error!;
            }
            return undefined;
        },
        [currentNode]
    );
    return (
        // see : https://github.com/bvaughn/react-virtualized-auto-sizer/blob/master/src/AutoSizer.ts#L111
        // AutoSizer "Avoid rendering children before the initial measurements have been collected."
        // Then when width or height equals 0.
        // This unmount diagrams each time diagramPane is not visible
        // We set doNotBailOutOnEmptyChildren to force keeping components mounted
        <AutoSizer doNotBailOutOnEmptyChildren>
            {({ width, height }) => (
                <Box
                    sx={mergeSx(
                        styles.availableDiagramSurfaceArea,
                        fullScreenDiagram?.id ? styles.fullscreen : undefined
                    )}
                    style={{
                        width: width + 'px',
                        height: height + 'px',
                        display: visible ? 'inline-flex' : 'none',
                    }}
                >
                    {displayedDiagrams.map((diagramView, index, array) => (
                        <Fragment key={diagramView.svgType + diagramView.id}>
                            {
                                // We put a space (a separator) before the first right aligned diagram.
                                // This space takes all the remaining space on screen and "pushes" the right aligned
                                // diagrams to the right of the screen.
                                array[index]?.align === 'right' &&
                                    (index === 0 || array[index - 1]?.align === 'left') && (
                                        <Box sx={styles.separator}></Box>
                                    )
                            }
                            <Diagram
                                align={diagramView.align}
                                diagramId={diagramView.id}
                                diagramTitle={getDiagramTitle(diagramView)}
                                warningToDisplay={handleWarningToDisplay(diagramView)}
                                pinned={diagramView.state === ViewState.PINNED}
                                svgType={diagramView.svgType}
                                width={getWidthForPaneDisplay(diagramView.id, diagramView.svgType)}
                                height={getHeightForPaneDisplay(diagramView.svgType, width, height)}
                                fullscreenWidth={width}
                                fullscreenHeight={height}
                                loadingState={diagramView.loadingState}
                            >
                                {isSldView(diagramView) && (
                                    <SingleLineDiagramContent
                                        showInSpreadsheet={showInSpreadsheet}
                                        studyUuid={studyUuid}
                                        diagramId={diagramView.id}
                                        svg={diagramView.svg}
                                        svgType={diagramView.svgType}
                                        svgMetadata={diagramView.metadata}
                                        loadingState={diagramView.loadingState}
                                        diagramSizeSetter={setDiagramSize}
                                        visible={visible}
                                    />
                                )}
                                {isNadView(diagramView) && (
                                    <NetworkAreaDiagramContent
                                        diagramId={diagramView.id}
                                        svg={diagramView.svg}
                                        svgType={diagramView.svgType}
                                        svgMetadata={diagramView.metadata}
                                        svgScalingFactor={diagramView.additionalMetadata?.scalingFactor}
                                        svgVoltageLevels={diagramView.additionalMetadata?.voltageLevels?.map(
                                            (n: VoltageLevel) => n.id
                                        )}
                                        loadingState={diagramView.loadingState}
                                        diagramSizeSetter={setDiagramSize}
                                        visible={visible}
                                    />
                                )}
                            </Diagram>
                        </Fragment>
                    ))}
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1}
                        sx={styles.minimizedDiagram}
                        style={{
                            display: !fullScreenDiagram?.id ? '' : 'none', // We hide this stack if a diagram is in fullscreen
                        }}
                    >
                        {minimizedDiagrams.map((diagramView) => (
                            <Chip
                                key={diagramView.svgType + diagramView.id}
                                icon={
                                    isNadType(diagramView.svgType) ? (
                                        <>
                                            <ArrowUpwardIcon />
                                            <TimelineIcon />
                                        </>
                                    ) : (
                                        <ArrowUpwardIcon />
                                    )
                                }
                                label={
                                    <OverflowableText
                                        sx={styles.minimizedDiagramTitle}
                                        text={getDiagramTitle(diagramView)}
                                    />
                                }
                                onClick={() => openDiagramView(diagramView.id, diagramView.svgType)}
                                onDelete={() => closeDiagramView(diagramView.id, diagramView.svgType)}
                            />
                        ))}
                    </Stack>
                </Box>
            )}
        </AutoSizer>
    );
}
