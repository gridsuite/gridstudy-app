/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PARAM_LANGUAGE, PARAM_USE_NAME } from '../../utils/config-params';
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
    DiagramAdditionalMetadata,
    DiagramSvg,
    MAP_BOTTOM_OFFSET,
    NETWORK_AREA_DIAGRAM_NB_MAX_VOLTAGE_LEVELS,
    NoSvg,
    SldSvg,
    Svg,
} from './diagram-common';
import { getEstimatedNbVoltageLevels, makeDiagramSorter } from './diagram-utils';
import { isNodeBuilt, isNodeInNotificationList } from '../graph/util/model-functions';
import AutoSizer from 'react-virtualized-auto-sizer';
import Diagram from './diagram';
import { SLD_DISPLAY_MODE } from '../network/constants';
import { useNameOrId } from '../utils/equipmentInfosHandler';
import { syncDiagramStateWithSessionStorage } from '../../redux/session-storage/diagram-state';
import SingleLineDiagramContent from './singleLineDiagram/single-line-diagram-content';
import NetworkAreaDiagramContent from './networkAreaDiagram/network-area-diagram-content';
import { EquipmentType, mergeSx, OverflowableText, useDebounce, useSnackMessage } from '@gridsuite/commons-ui';
import { setNetworkAreaDiagramNbVoltageLevels } from '../../redux/actions';
import { useIntl } from 'react-intl';
import { getSubstationSingleLineDiagram, getVoltageLevelSingleLineDiagram } from '../../services/study/network';
import { fetchSvg, getNetworkAreaDiagramUrl } from '../../services/study';
import { useLocalizedCountries } from 'components/utils/localized-countries-hook';
import { UUID } from 'crypto';
import { AppState, CurrentTreeNode, DiagramState } from 'redux/reducer';
import { SLDMetadata, DiagramMetadata } from '@powsybl/network-viewer';
import { DiagramType, ViewState } from './diagram.type';
import { useDiagram } from './use-diagram';

// Returns a callback that returns a promise
const useDisplayView = (studyUuid: UUID, currentNode: CurrentTreeNode, currentRootNetworkUuid: UUID) => {
    const { snackError } = useSnackMessage();
    const paramUseName = useSelector((state: AppState) => state[PARAM_USE_NAME]);
    const { getNameOrId } = useNameOrId();
    const language = useSelector((state: AppState) => state[PARAM_LANGUAGE]);
    const networkVisuParams = useSelector((state: AppState) => state.networkVisualizationsParameters);

    const checkAndGetVoltageLevelSingleLineDiagramUrl = useCallback(
        (voltageLevelId: UUID) =>
            isNodeBuilt(currentNode)
                ? getVoltageLevelSingleLineDiagram({
                      studyUuid: studyUuid,
                      currentNodeUuid: currentNode?.id,
                      currentRootNetworkUuid: currentRootNetworkUuid,
                      voltageLevelId: voltageLevelId,
                      useName: paramUseName,
                      centerLabel: networkVisuParams.singleLineDiagramParameters.centerLabel,
                      diagonalLabel: networkVisuParams.singleLineDiagramParameters.diagonalLabel,
                      componentLibrary: networkVisuParams.singleLineDiagramParameters.componentLibrary,
                      sldDisplayMode: SLD_DISPLAY_MODE.STATE_VARIABLE,
                      language: language,
                  })
                : null,
        [
            currentNode,
            studyUuid,
            currentRootNetworkUuid,
            paramUseName,
            networkVisuParams.singleLineDiagramParameters.centerLabel,
            networkVisuParams.singleLineDiagramParameters.diagonalLabel,
            networkVisuParams.singleLineDiagramParameters.componentLibrary,
            language,
        ]
    );

    const checkAndGetSubstationSingleLineDiagramUrl = useCallback(
        (voltageLevelId: UUID) =>
            isNodeBuilt(currentNode)
                ? getSubstationSingleLineDiagram({
                      studyUuid: studyUuid,
                      currentNodeUuid: currentNode?.id,
                      currentRootNetworkUuid: currentRootNetworkUuid,
                      substationId: voltageLevelId,
                      useName: paramUseName,
                      centerLabel: networkVisuParams.singleLineDiagramParameters.centerLabel,
                      diagonalLabel: networkVisuParams.singleLineDiagramParameters.diagonalLabel,
                      substationLayout: networkVisuParams.singleLineDiagramParameters.substationLayout,
                      componentLibrary: networkVisuParams.singleLineDiagramParameters.componentLibrary,
                      language: language,
                  })
                : null,
        [
            networkVisuParams.singleLineDiagramParameters.centerLabel,
            networkVisuParams.singleLineDiagramParameters.componentLibrary,
            networkVisuParams.singleLineDiagramParameters.diagonalLabel,
            studyUuid,
            networkVisuParams.singleLineDiagramParameters.substationLayout,
            paramUseName,
            currentNode,
            currentRootNetworkUuid,
            language,
        ]
    );
    const checkAndGetNetworkAreaDiagramUrl = useCallback(
        (depth: number) =>
            isNodeBuilt(currentNode)
                ? getNetworkAreaDiagramUrl(
                      studyUuid,
                      currentNode?.id,
                      currentRootNetworkUuid,
                      depth,
                      networkVisuParams.networkAreaDiagramParameters.initNadWithGeoData
                  )
                : null,
        [
            studyUuid,
            currentNode,
            currentRootNetworkUuid,
            networkVisuParams.networkAreaDiagramParameters.initNadWithGeoData,
        ]
    );

    type FetchSvgDataFn = {
        (svgUrl: string | null, svgType: DiagramType.SUBSTATION | DiagramType.VOLTAGE_LEVEL): Promise<SldSvg>;
        (
            svgUrl: string | null,
            svgType: DiagramType.NETWORK_AREA_DIAGRAM,
            fetchOptions: RequestInit
        ): Promise<DiagramSvg>;
    };
    // this callback returns a promise
    const fetchSvgData = useCallback<FetchSvgDataFn>(
        (svgUrl, svgType, fetchOptions?: RequestInit): any => {
            if (svgUrl) {
                return fetchSvg(svgUrl, fetchOptions)
                    .then((data: Svg | null) => {
                        if (data !== null) {
                            return {
                                ...data,
                                error: undefined,
                            };
                        } else {
                            return NoSvg;
                        }
                    })
                    .catch((error) => {
                        console.error('Error while fetching SVG', error.message);
                        let errorMessage;
                        if (error.status === 404) {
                            if (svgType === DiagramType.SUBSTATION) {
                                errorMessage = 'SubstationNotFound';
                            }
                            // if VL (SLD or NAD)
                            else {
                                errorMessage = 'VoltageLevelNotFound';
                            }
                        } else {
                            snackError({
                                headerId: 'svgLoadingFail',
                            });
                        }
                        return {
                            svg: null,
                            metadata: null,
                            additionalMetadata: null,
                            error: errorMessage,
                        };
                    });
            } else {
                return Promise.resolve(NoSvg);
            }
        },
        [snackError]
    );

    // this callback returns a promise
    return useCallback(
        (diagramState: Partial<DiagramView>) => {
            if (!studyUuid || !currentNode) {
                return Promise.reject(new Error('useDisplayView error: currentNode not build or studyUuid undefined'));
            }

            function createSubstationDiagramView(id: UUID, state: ViewState | undefined) {
                const svgUrl = checkAndGetSubstationSingleLineDiagramUrl(id);
                return fetchSvgData(svgUrl, DiagramType.SUBSTATION).then((svg) => {
                    let label = getNameOrId(svg.additionalMetadata) ?? id;
                    return {
                        id: id,
                        nodeId: currentNode.id,
                        state: state,
                        name: label,
                        country: svg.additionalMetadata?.country,
                        fetchSvg: () => fetchSvgData(svgUrl, DiagramType.SUBSTATION),
                        svgType: DiagramType.SUBSTATION,
                        ...svg,
                    };
                });
            }

            function createVoltageLevelDiagramView(id: UUID, state: ViewState | undefined) {
                const svgUrl = checkAndGetVoltageLevelSingleLineDiagramUrl(id);
                return fetchSvgData(svgUrl, DiagramType.VOLTAGE_LEVEL).then((svg) => {
                    let label = getNameOrId(svg.additionalMetadata);
                    let substationId = svg.additionalMetadata?.substationId;
                    return {
                        id: id,
                        nodeId: currentNode.id,
                        state: state,
                        name: label,
                        country: svg.additionalMetadata?.country,
                        fetchSvg: () => fetchSvgData(svgUrl, DiagramType.VOLTAGE_LEVEL),
                        svgType: DiagramType.VOLTAGE_LEVEL,
                        substationId: substationId,
                        ...svg,
                    };
                });
            }

            function createNetworkAreaDiagramView(ids: UUID[] | undefined, state: ViewState | undefined, depth = 0) {
                console.log('debug', 'createNetworkAreaDiagramView', state);
                if (ids?.length) {
                    const svgUrl = checkAndGetNetworkAreaDiagramUrl(depth);
                    const fetchOptions = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(ids),
                    };
                    return fetchSvgData(svgUrl, DiagramType.NETWORK_AREA_DIAGRAM, fetchOptions).then((svg) => {
                        let nadTitle = '';
                        let substationsIds: UUID[] = [];
                        svg.additionalMetadata?.voltageLevels
                            .map((vl) => ({
                                name: getNameOrId({ name: vl.name, id: vl.substationId }),
                                substationId: vl.substationId,
                            }))
                            .sort(
                                (vlA, vlB) => vlA.name?.toLowerCase().localeCompare(vlB.name?.toLowerCase() ?? '') || 0
                            )
                            .forEach((voltageLevel) => {
                                const name = voltageLevel.name;
                                if (name !== null) {
                                    nadTitle += (nadTitle !== '' ? ', ' : '') + name;
                                }
                                substationsIds.push(voltageLevel.substationId);
                            });
                        if (nadTitle === '') {
                            nadTitle = ids.toString();
                        }
                        return {
                            id: ids[0],
                            ids: ids,
                            nodeId: currentNode.id,
                            state: state,
                            name: nadTitle,
                            fetchSvg: () => createNetworkAreaDiagramView(ids, state, depth), // here 'name' and 'substationsIds' can change so we can't use fetchSvgData
                            svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                            depth: depth,
                            substationIds: substationsIds,
                            nadMetadata: svg.metadata,
                            scalingFactor: svg.additionalMetadata?.scalingFactor,
                            ...svg,
                        };
                    });
                }
            }

            if (diagramState.svgType === DiagramType.VOLTAGE_LEVEL) {
                return createVoltageLevelDiagramView(diagramState.id!, diagramState.state);
            } else if (diagramState.svgType === DiagramType.SUBSTATION) {
                return createSubstationDiagramView(diagramState.id!, diagramState.state);
            } else if (diagramState.svgType === DiagramType.NETWORK_AREA_DIAGRAM) {
                return createNetworkAreaDiagramView(diagramState.ids, diagramState.state, diagramState.depth);
            }
        },
        [
            checkAndGetSubstationSingleLineDiagramUrl,
            checkAndGetVoltageLevelSingleLineDiagramUrl,
            checkAndGetNetworkAreaDiagramUrl,
            getNameOrId,
            studyUuid,
            currentNode,
            fetchSvgData,
        ]
    );
};

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

type DiagramView = {
    id: UUID;
    ids?: UUID[];
    svgType: DiagramType;
    state: ViewState;
    name: string;
    align: 'left' | 'right' | 'center';
    loadingState: boolean;
    metadata?: SLDMetadata;
    nadMetadata?: DiagramMetadata;
    svg?: string;
    country?: string;
    depth?: number;
    error?: string;
    nodeId?: UUID;
    rootNetworkUuid?: UUID; // is it used ?
    additionalMetadata?: any;
    fetchSvg?: () => Promise<Partial<DiagramView>>;
};

export function DiagramPane({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    showInSpreadsheet,
    visible,
}: DiagramPaneProps) {
    const { snackError } = useSnackMessage();
    const dispatch = useDispatch();
    const intl = useIntl();
    const studyUpdatedForce = useSelector((state: AppState) => state.studyUpdated);
    const [views, setViews] = useState<DiagramView[]>([]);
    const fullScreenDiagram = useSelector((state: AppState) => state.fullScreenDiagram);
    const createView = useDisplayView(studyUuid, currentNode, currentRootNetworkUuid);
    const diagramStates = useSelector((state: AppState) => state.diagramStates);
    const networkAreaDiagramDepth = useSelector((state: AppState) => state.networkAreaDiagramDepth);
    const previousNetworkAreaDiagramDepth = useRef(networkAreaDiagramDepth);

    const networkAreaDiagramNbVoltageLevels = useSelector((state: AppState) => state.networkAreaDiagramNbVoltageLevels);
    const networkVisuParams = useSelector((state: AppState) => state.networkVisualizationsParameters);
    const initNadWithGeoDataRef = useRef(networkVisuParams.networkAreaDiagramParameters.initNadWithGeoData);

    const { translate } = useLocalizedCountries();

    const notificationIdList = useSelector((state: AppState) => state.notificationIdList);
    const [diagramContentSizes, setDiagramContentSizes] = useState(new Map()); // When a diagram content gets its size from the backend, it will update this map of sizes.

    useEffect(() => {
        syncDiagramStateWithSessionStorage(diagramStates, studyUuid);
    }, [diagramStates, studyUuid]);

    const { openDiagramView, closeDiagramView, closeDiagramViews } = useDiagram();
    const currentNodeRef = useRef<CurrentTreeNode>();
    currentNodeRef.current = currentNode;
    const currentRootNetworkUuidRef = useRef<UUID>();
    currentRootNetworkUuidRef.current = currentRootNetworkUuid;
    const viewsRef = useRef<DiagramView[]>([]);
    viewsRef.current = views;
    /**
     * BUILDS THE DIAGRAMS LIST
     *
     * Here, the goal is to build a list of views, each view corresponding to a diagram.
     * We get the diagrams from the redux store.
     * In the case of SLD, each SLD corresponds to one view, but in the case of NAD,
     * each opened NAD is merged into one view.
     */

    // Check if we need to add new SLDs in the 'views' and add them if necessary
    const addMissingSLDs = useCallback(
        (diagramStates: DiagramState[]) => {
            // We check if we need to add new diagrams
            const diagramsToAdd: {
                id: UUID;
                svgType: DiagramType;
                state: ViewState;
                loadingState: boolean;
                align: 'left' | 'right' | 'center';
                name: string;
            }[] = [];
            diagramStates.forEach((diagramState) => {
                if (diagramState.svgType !== DiagramType.NETWORK_AREA_DIAGRAM) {
                    const diagramAlreadyPresentInViews = viewsRef.current.find(
                        (diagramView: DiagramState) =>
                            diagramView.svgType !== DiagramType.NETWORK_AREA_DIAGRAM &&
                            diagramView.id === diagramState.id
                    );
                    if (!diagramAlreadyPresentInViews) {
                        diagramsToAdd.push({
                            ...diagramState,
                            name: intl.formatMessage({ id: 'LoadingOf' }, { value: diagramState.id }),
                            align: 'left',
                            loadingState: true,
                        });
                    }
                }
            });

            // If we found diagrams to add, we add them
            if (diagramsToAdd?.length) {
                // First we add the empty diagrams in the views
                setViews((views) => {
                    const updatedViews = views.concat(diagramsToAdd);
                    return updatedViews;
                });

                // Then we add the data when the fetch is finished
                diagramsToAdd.forEach((diagramState) => {
                    createView(diagramState)
                        ?.then((singleLineDiagramView) => {
                            setViews((views) => {
                                const diagramViewId = views.findIndex(
                                    (view) =>
                                        view.svgType !== DiagramType.NETWORK_AREA_DIAGRAM && view.id === diagramState.id
                                );
                                const updatedViews = views.slice();
                                // we update the SLD with the fetched data
                                updatedViews[diagramViewId] = {
                                    ...updatedViews[diagramViewId],
                                    ...singleLineDiagramView,
                                    loadingState: false,
                                } as unknown as DiagramView;
                                return updatedViews;
                            });
                        })
                        .catch((error) => {
                            snackError({
                                messageTxt: error.message,
                            });
                        });
                });
            }
        },
        [createView, intl, snackError]
    );

    // Check if we need to remove old SLDs from the 'views' and remove them if necessary
    const removeObsoleteSLDs = useCallback((diagramStates: DiagramState[]) => {
        // We check if we need to remove old diagrams
        const diagramIdsToRemove: UUID[] = [];
        viewsRef.current.forEach((diagramView) => {
            if (diagramView.svgType !== DiagramType.NETWORK_AREA_DIAGRAM) {
                const diagramStillPresentInRedux = diagramStates.find(
                    (diagramState: DiagramState) =>
                        diagramState.svgType !== DiagramType.NETWORK_AREA_DIAGRAM && diagramState.id === diagramView.id
                );
                if (!diagramStillPresentInRedux) {
                    diagramIdsToRemove.push(diagramView.id);
                }
            }
        });

        // If we found diagrams to remove, we remove them
        if (diagramIdsToRemove?.length) {
            setViews((views) => {
                const updatedViews = views.filter(
                    (view) => view.svgType === DiagramType.NETWORK_AREA_DIAGRAM || !diagramIdsToRemove.includes(view.id)
                );
                return updatedViews;
            });
        }
    }, []);

    // Check if we need to remove or add SLDs
    const updateSLDs = useCallback(
        (diagramStates: DiagramState[]) => {
            removeObsoleteSLDs(diagramStates);
            addMissingSLDs(diagramStates);
        },
        [removeObsoleteSLDs, addMissingSLDs]
    );

    // Add a new NAD in the 'views' (if a NAD is already present, we replace it)
    const addOrReplaceNAD = useCallback(
        (networkAreaIds: UUID[], networkAreaViewState: ViewState, networkAreaDiagramDepth: number) => {
            // First we add the empty diagram in the views
            setViews((views) => {
                const newDiagram: DiagramView = {
                    id: networkAreaIds[0],
                    ids: networkAreaIds,
                    name: intl.formatMessage({ id: 'LoadingOf' }, { value: networkAreaIds.toString() }),
                    state: networkAreaViewState,
                    svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                    align: 'right',
                    loadingState: true,
                };
                const updatedViews = views.slice();
                // if we already have a NAD, we replace it but keep the same object to avoid resizing
                const nadViewId = views.findIndex((view) => view.svgType === DiagramType.NETWORK_AREA_DIAGRAM);
                if (nadViewId >= 0) {
                    updatedViews[nadViewId] = {
                        ...updatedViews[nadViewId], // trick to avoid resizing
                        ...newDiagram,
                    };
                }
                // otherwise we just add a new one
                else {
                    updatedViews.push(newDiagram);
                }
                return updatedViews;
            });

            // Then we add the data when the fetch is finished
            createView({
                ids: networkAreaIds,
                state: networkAreaViewState,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                depth: networkAreaDiagramDepth,
            })
                ?.then((networkAreaDiagramView) => {
                    setViews((views) => {
                        const updatedViews = views.slice();
                        const nadViewId = views.findIndex((view) => view.svgType === DiagramType.NETWORK_AREA_DIAGRAM);
                        updatedViews[nadViewId] = {
                            ...updatedViews[nadViewId],
                            ...networkAreaDiagramView,
                            loadingState: false,
                        } as unknown as DiagramView;
                        dispatch(
                            setNetworkAreaDiagramNbVoltageLevels(
                                (networkAreaDiagramView.additionalMetadata as DiagramAdditionalMetadata)
                                    ?.nbVoltageLevels ?? 0
                            )
                        );
                        return updatedViews;
                    });
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                    });
                });
        },
        [createView, intl, dispatch, snackError]
    );

    const removeNAD = useCallback(() => {
        setViews((views) => {
            const updatedViews = views.filter((view) => view.svgType !== DiagramType.NETWORK_AREA_DIAGRAM);
            return updatedViews;
        });
    }, []);

    const updateNAD = useCallback(
        (diagramStates: DiagramState[]) => {
            const initNadWithGeoDataParamHasChanged =
                initNadWithGeoDataRef.current !== networkVisuParams.networkAreaDiagramParameters.initNadWithGeoData;
            initNadWithGeoDataRef.current = networkVisuParams.networkAreaDiagramParameters.initNadWithGeoData;

            const networkAreaIds: UUID[] = [];
            let networkAreaViewState = ViewState.OPENED;
            diagramStates.forEach((diagramState) => {
                if (diagramState.svgType === DiagramType.NETWORK_AREA_DIAGRAM) {
                    networkAreaIds.push(diagramState.id);
                    networkAreaViewState = diagramState.state; // They should all be the same value
                }
            });
            if (networkAreaIds.length > 0) {
                const isSameNadAlreadyPresentInViews = viewsRef.current.find(
                    (diagramView) =>
                        diagramView.svgType === DiagramType.NETWORK_AREA_DIAGRAM &&
                        diagramView.ids?.toString() === networkAreaIds.toString() &&
                        // Do not compare with depth in view here because it is set asynchronously
                        previousNetworkAreaDiagramDepth.current === networkAreaDiagramDepth
                );
                if (!isSameNadAlreadyPresentInViews || initNadWithGeoDataParamHasChanged) {
                    // set the previous depth to the current one to avoid other close in time calls to updateNAD
                    previousNetworkAreaDiagramDepth.current = networkAreaDiagramDepth;
                    addOrReplaceNAD(networkAreaIds, networkAreaViewState, networkAreaDiagramDepth);
                }
            } else if (
                viewsRef.current.find((diagramView) => diagramView.svgType === DiagramType.NETWORK_AREA_DIAGRAM)
            ) {
                // no more NAD, remove it from the views
                removeNAD();
            }
        },
        [
            networkAreaDiagramDepth,
            networkVisuParams.networkAreaDiagramParameters.initNadWithGeoData,
            addOrReplaceNAD,
            removeNAD,
        ]
    );

    // Update the state of the diagrams (opened, minimized, etc) in the 'views'
    const updateDiagramStates = useCallback((diagramStates: DiagramState[]) => {
        // We check if we need to update some diagrams
        let diagramsToUpdate: { index: number; state: ViewState }[] = [];
        diagramStates.forEach((diagramState: DiagramState) => {
            // if SLD
            if (diagramState.svgType !== DiagramType.NETWORK_AREA_DIAGRAM) {
                const diagramIndex = viewsRef.current.findIndex(
                    (diagramView: DiagramView) =>
                        diagramView.svgType !== DiagramType.NETWORK_AREA_DIAGRAM &&
                        diagramView.id === diagramState.id &&
                        diagramView.state !== diagramState.state
                );
                // if we found a diagram with a new state (ex : minimized)
                if (diagramIndex > -1) {
                    diagramsToUpdate.push({
                        index: diagramIndex,
                        state: diagramState.state,
                    });
                }
            }
            // if NAD
            else {
                // no need to check the ID because we have only one NAD in the views
                // diagramIndex can only be -1 (if no match) or viewsRef.current.length - 1 (if match)
                const diagramIndex = viewsRef.current.findIndex(
                    (diagramView: DiagramView) =>
                        diagramView.svgType === DiagramType.NETWORK_AREA_DIAGRAM &&
                        diagramView.state !== diagramState.state
                );
                // if the NAD has a new state (all NAD are supposed to have the same state)
                if (
                    diagramIndex > -1 &&
                    // we don't want to add it twice
                    !diagramsToUpdate.find((diagram) => diagram.index === diagramIndex)
                ) {
                    diagramsToUpdate.push({
                        index: diagramIndex,
                        state: diagramState.state,
                    });
                }
            }
        });

        // If we found diagrams to update, we update them
        if (diagramsToUpdate?.length) {
            setViews((views) => {
                let updatedViews = views.slice();
                diagramsToUpdate.forEach((diagramInfo) => {
                    updatedViews[diagramInfo.index] = {
                        ...updatedViews[diagramInfo.index],
                        state: diagramInfo.state,
                    };
                });
                return updatedViews;
            });
        }
    }, []);
    // We debounce the updateNAD function to avoid generating unnecessary NADs
    const debounceUpdateNAD = useDebounce(updateNAD, 300);

    // To allow a small number of fast clicks
    // and then stop before we get too close to
    // NETWORK_AREA_DIAGRAM_NB_MAX_VOLTAGE_LEVELS
    const shouldDebounceUpdateNAD = useCallback(
        (networkAreaDiagramDepth: number) => {
            const estimatedNbVoltageLevels = getEstimatedNbVoltageLevels(
                previousNetworkAreaDiagramDepth.current,
                networkAreaDiagramDepth,
                networkAreaDiagramNbVoltageLevels
            );
            return (
                estimatedNbVoltageLevels < NETWORK_AREA_DIAGRAM_NB_MAX_VOLTAGE_LEVELS ||
                previousNetworkAreaDiagramDepth.current > networkAreaDiagramDepth
            );
        },
        [networkAreaDiagramNbVoltageLevels]
    );

    // UPDATE DIAGRAM VIEWS
    useEffect(() => {
        if (!visible || !currentNode || isNodeInNotificationList(currentNode, notificationIdList)) {
            return;
        }
        // UPDATING DIAGRAM STATES (before removing or adding new diagrams, for both SLDs and NAD)
        updateDiagramStates(diagramStates);
        // SLD MANAGEMENT (adding or removing SLDs)
        updateSLDs(diagramStates);
        // NAD MANAGEMENT (adding, removing or updating the NAD)
        // Here we call either the debounced or the non-debounced function
        // to force a server fetch after a few clicks to get the actual number of voltage levels.
        // it's ok to do this and doesn't cause two fetches at the end
        // beacause the debounced function is recreated after each networkAreaDiagramDepth
        // change so the debounce hook clears the debounce timer
        if (shouldDebounceUpdateNAD(networkAreaDiagramDepth)) {
            debounceUpdateNAD(diagramStates);
        } else {
            updateNAD(diagramStates);
        }
    }, [
        diagramStates,
        visible,
        currentNode,
        notificationIdList,
        updateDiagramStates,
        updateSLDs,
        updateNAD,
        debounceUpdateNAD,
        networkAreaDiagramDepth,
        shouldDebounceUpdateNAD,
    ]);

    const displayedDiagrams = views
        .filter((view) => [ViewState.OPENED, ViewState.PINNED].includes(view.state))
        .sort(makeDiagramSorter(diagramStates));
    const minimizedDiagrams = views.filter((view) => [ViewState.MINIMIZED].includes(view.state));
    /**
     * MINIMIZED DIAGRAMS' CONTROLS
     */

    const handleCloseDiagramView = useCallback(
        (id: UUID, type: DiagramType) => {
            closeDiagramView(id, type);
        },
        [closeDiagramView]
    );

    const handleOpenDiagramView = useCallback(
        (id: UUID, type: DiagramType) => {
            if (!studyUuid || !currentNode) {
                return;
            }
            openDiagramView(id, type);
        },
        [studyUuid, currentNode, openDiagramView]
    );

    /**
     * FORCED UPDATE MECHANISM
     */

    // Updates particular diagrams from their IDs
    const updateDiagramsByIds = useCallback(
        (ids: UUID[], fromScratch: boolean) => {
            if (ids?.length) {
                // we remove duplicates (because of NAD)
                let uniqueIds = ids.filter((id, index) => ids.indexOf(id) === index);
                // Before we get the results, we set loadingState = true
                setViews((views) => {
                    const updatedViews = views.slice();
                    for (let i = 0; i < views.length; i++) {
                        const currentView = views[i];
                        if (uniqueIds.includes(currentView.id)) {
                            updatedViews[i] = {
                                ...updatedViews[i],
                                loadingState: true,
                            };
                        }
                    }
                    return updatedViews;
                });
                // Then we add the data once we have it
                for (let i = 0; i < viewsRef.current.length; i++) {
                    const currentView = viewsRef.current[i];
                    if (uniqueIds.includes(currentView.id)) {
                        let updatedDiagramPromise;
                        if (fromScratch) {
                            updatedDiagramPromise = createView(currentView);
                        } else {
                            updatedDiagramPromise = currentView.fetchSvg?.();
                        }
                        updatedDiagramPromise
                            ?.then((svg) => {
                                setViews((views) => {
                                    const updatedViews = views.slice();
                                    const data: DiagramView = {
                                        ...updatedViews[i],
                                        ...svg,
                                        loadingState: false,
                                    } as unknown as DiagramView;
                                    updatedViews[i] = data;
                                    if (fromScratch && svg.svgType === DiagramType.NETWORK_AREA_DIAGRAM) {
                                        dispatch(
                                            setNetworkAreaDiagramNbVoltageLevels(
                                                svg.additionalMetadata?.nbVoltageLevels
                                            )
                                        );
                                    }
                                    return updatedViews;
                                });
                            })
                            .catch((error) => {
                                snackError({
                                    messageTxt: error.message,
                                });
                            });
                    }
                }
            }
        },
        [createView, dispatch, snackError]
    );

    // Updates particular diagrams from the current node
    const updateDiagramsByCurrentNode = useCallback(() => {
        // We search the diagrams based on the current node's ID to determine if the diagram should be updated
        let idsToUpdate = viewsRef.current
            .filter(
                (diagramView) =>
                    !diagramView.loadingState && // no need to reload if it's already loading
                    diagramView.nodeId === currentNodeRef.current?.id
            )
            .map((diagramView) => diagramView.id);
        if (idsToUpdate?.length) {
            updateDiagramsByIds(idsToUpdate, false);
        }
    }, [updateDiagramsByIds]);

    // When the current node change, we reset all the diagrams
    useEffect(() => {
        let allDiagramIds = viewsRef.current
            .filter((view) => !view.loadingState) // no need to reload if it's already loading
            .map((view) => view.id);
        updateDiagramsByIds(allDiagramIds, true);
    }, [currentNode, updateDiagramsByIds]);

    // This effect will trigger the diagrams' forced update
    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            if (studyUpdatedForce.eventData.headers['rootNetwork'] !== currentRootNetworkUuidRef.current) {
                return;
            }
            if (studyUpdatedForce.eventData.headers['updateType'] === 'loadflowResult') {
                //TODO reload data more intelligently
                updateDiagramsByCurrentNode();
            } else if (studyUpdatedForce.eventData.headers['updateType'] === 'study') {
                // FM if we want to reload data more precisely, we need more information from notifications
                updateDiagramsByCurrentNode();
            } else if (studyUpdatedForce.eventData.headers['updateType'] === 'buildCompleted') {
                if (studyUpdatedForce.eventData.headers['node'] === currentNodeRef.current?.id) {
                    updateDiagramsByCurrentNode();
                }
            }
        }
    }, [studyUpdatedForce, studyUuid, updateDiagramsByCurrentNode, updateDiagramsByIds, closeDiagramViews]);

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
        return diagramView.svgType !== DiagramType.NETWORK_AREA_DIAGRAM
            ? diagramView.name + ' - ' + (diagramView.country ? translate(diagramView.country) : '')
            : diagramView.name;
    };

    /**
     * RENDER
     */

    const handleWarningToDisplay = useCallback(
        (diagramView: DiagramView) => {
            if (!isNodeBuilt(currentNode)) {
                return 'InvalidNode';
            }
            if (diagramView?.error) {
                return diagramView.error;
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
                                /*
                                We put a space (a separator) before the first right aligned diagram.
                                This space takes all the remaining space on screen and "pushes" the right aligned
                                diagrams to the right of the screen.
                                */
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
                                {(diagramView.svgType === DiagramType.VOLTAGE_LEVEL ||
                                    diagramView.svgType === DiagramType.SUBSTATION) && (
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
                                {diagramView.svgType === DiagramType.NETWORK_AREA_DIAGRAM && (
                                    <NetworkAreaDiagramContent
                                        diagramId={diagramView.id}
                                        svg={diagramView.svg}
                                        svgType={diagramView.svgType}
                                        svgMetadata={diagramView.nadMetadata}
                                        svgScalingFactor={diagramView.additionalMetadata?.scalingFactor}
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
                                    diagramView.svgType === DiagramType.NETWORK_AREA_DIAGRAM ? (
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
                                onClick={() => handleOpenDiagramView(diagramView.id, diagramView.svgType)}
                                onDelete={() => handleCloseDiagramView(diagramView.id, diagramView.svgType)}
                            />
                        ))}
                    </Stack>
                </Box>
            )}
        </AutoSizer>
    );
}
