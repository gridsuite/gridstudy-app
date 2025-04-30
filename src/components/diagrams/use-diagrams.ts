/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useDebounce, useNotificationsListener, useSnackMessage } from '@gridsuite/commons-ui';
import { isNodeBuilt } from 'components/graph/util/model-functions';
import { useNameOrId } from 'components/utils/equipmentInfosHandler';
import { UUID } from 'crypto';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    AppState,
    createNadFromConfigState,
    createNadState,
    createSldState,
    DiagramState,
    isNad,
    isNadFromConfig,
    isSld,
    NadFromConfigState,
    NadState,
    SldState,
    StudyUpdatedEventData,
} from 'redux/reducer';
import { fetchSvg, getNetworkAreaDiagramUrl, getNetworkAreaDiagramUrlFromConfig } from 'services/study';
import { getSubstationSingleLineDiagram, getVoltageLevelSingleLineDiagram } from 'services/study/network';
import { PARAM_LANGUAGE, PARAM_USE_NAME } from 'utils/config-params';
import { DiagramType, ViewState } from './diagram.type';
import {
    DiagramSvg,
    NADSvg,
    NETWORK_AREA_DIAGRAM_NB_MAX_VOLTAGE_LEVELS,
    NoSvg,
    SldSvg,
    VoltageLevel,
} from './diagram-common';
import { SLD_DISPLAY_MODE } from 'components/network/constants';
import { syncDiagramStateWithSessionStorage } from 'redux/session-storage/diagram-state';
import { getEstimatedNbVoltageLevels, makeDiagramSorter } from './diagram-utils';
import { NOTIFICATIONS_URL_KEYS } from 'components/utils/notificationsProvider-utils';
import { useIntl } from 'react-intl';
import { setNetworkAreaDiagramNbVoltageLevels } from 'redux/actions';
// import { DiagramMetadata, SLDMetadata } from '@powsybl/network-viewer';

function sameArrays(array1: any[], array2: any[]) {
    if (array1 === array2) {
        return true;
    }
    if (array1.length !== array2.length) {
        return false;
    }
    return (
        array1.length === array2.length &&
        array1.every((value, index) => {
            return value === array2[index];
        })
    );
}

export type DiagramView = DiagramState & {
    align: 'left' | 'right' | 'center';
    loadingState: boolean;
};

export type SldView = DiagramView &
    SldState &
    SldSvg & {
        svgType: DiagramType.VOLTAGE_LEVEL | DiagramType.SUBSTATION;
        fetchSvg: (() => Promise<SldSvg>) | null;
    };

function createSldView(parameters: Omit<SldView, 'needsToBlink' | 'loadingState' | 'align'>): SldView {
    const { id, svgType, ...rest } = parameters;
    return {
        ...createSldState({ id, svgType }),
        loadingState: false,
        align: 'left',
        ...rest,
    };
}

function createSldViewFromState(state: SldState): SldView {
    return {
        ...state,
        loadingState: true,
        align: 'left',
        metadata: null,
        additionalMetadata: null,
        svg: null,
        fetchSvg: null,
    };
}

export function isSldView(view: unknown): view is SldView {
    return (view as DiagramView).svgType === (DiagramType.SUBSTATION || DiagramType.VOLTAGE_LEVEL);
}

export type NadView = DiagramView &
    NadState &
    NADSvg & {
        fetchSvg: (() => Promise<NADSvg>) | null;
        depth: number;
    };

function createNadView(parameters: Omit<NadView, 'svgType' | 'needsToBlink' | 'loadingState' | 'align'>): NadView {
    const { id, ids, ...rest } = parameters;
    return {
        ...createNadState({ id, ids }),
        loadingState: false,
        align: 'right',
        ...rest,
    };
}

function createNadViewFromState(state: NadState): NadView {
    return {
        ...state,
        loadingState: true,
        align: 'right',
        metadata: null,
        additionalMetadata: null,
        svg: null,
        fetchSvg: null,
        depth: 0,
    };
}

export function isNadView(view: unknown): view is NadView {
    return (view as DiagramView).svgType === (DiagramType.NAD_FROM_CONFIG || DiagramType.NETWORK_AREA_DIAGRAM);
}

type NadFromConfigView = DiagramView &
    NadFromConfigState &
    NADSvg & {
        fetchSvg: (() => Promise<NADSvg>) | null;
        depth: number;
    };

function createNadFromConfigView(
    parameters: Omit<NadFromConfigView, 'svgType' | 'needsToBlink' | 'loadingState' | 'align'>
): NadFromConfigView {
    const { id, ...rest } = parameters;
    return {
        ...createNadFromConfigState({ id, name: '' }),
        loadingState: false,
        align: 'right',
        ...rest,
    };
}

function createNadFromConfigViewFromState(state: NadFromConfigState): NadFromConfigView {
    return {
        ...state,
        loadingState: true,
        align: 'right',
        metadata: null,
        additionalMetadata: null,
        svg: null,
        fetchSvg: null,
        depth: 0,
    };
}

function createDiagramViewFromState(diagramState: DiagramState): DiagramView | undefined {
    if (isSld(diagramState)) {
        return createSldViewFromState(diagramState);
    } else if (isNad(diagramState)) {
        return createNadViewFromState(diagramState);
    } else if (isNadFromConfig(diagramState)) {
        return createNadFromConfigViewFromState(diagramState);
    }
    return undefined;
}

type FetchSvgDataFn = {
    (svgUrl: string | null, svgType: DiagramType.SUBSTATION | DiagramType.VOLTAGE_LEVEL): Promise<SldSvg>;
    (svgUrl: string | null, svgType: DiagramType.NAD_FROM_CONFIG): Promise<NADSvg>;
    (svgUrl: string | null, svgType: DiagramType.NETWORK_AREA_DIAGRAM, fetchOptions: RequestInit): Promise<NADSvg>;
};

// Returns a callback that returns a promise
export const useDiagrams = () => {
    const intl = useIntl();
    const dispatch = useDispatch();

    // context
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const paramUseName = useSelector((state: AppState) => state[PARAM_USE_NAME]);
    const language = useSelector((state: AppState) => state[PARAM_LANGUAGE]);
    const networkVisuParams = useSelector((state: AppState) => state.networkVisualizationsParameters);
    const diagramStates = useSelector((state: AppState) => state.diagramStates);
    const networkAreaDiagramDepth = useSelector((state: AppState) => state.networkAreaDiagramDepth);
    const networkAreaDiagramNbVoltageLevels = useSelector((state: AppState) => state.networkAreaDiagramNbVoltageLevels);

    // utils
    const { snackError } = useSnackMessage();
    const { getNameOrId } = useNameOrId();
    const previousNetworkAreaDiagramDepth = useRef(networkAreaDiagramDepth);
    const initNadWithGeoDataRef = useRef(networkVisuParams.networkAreaDiagramParameters.initNadWithGeoData);

    // Main state
    const [views, setViews] = useState<DiagramView[]>([]);
    const viewsRef = useRef<DiagramView[]>([]);
    viewsRef.current = views;

    const checkAndGetVoltageLevelSingleLineDiagramUrl = useCallback(
        (voltageLevelId: UUID) => {
            if (studyUuid === null || currentNode === null || currentRootNetworkUuid === null) {
                return null;
            }
            return isNodeBuilt(currentNode)
                ? getVoltageLevelSingleLineDiagram({
                      studyUuid: studyUuid,
                      currentNodeUuid: currentNode.id,
                      currentRootNetworkUuid: currentRootNetworkUuid,
                      voltageLevelId: voltageLevelId,
                      useName: paramUseName,
                      centerLabel: networkVisuParams.singleLineDiagramParameters.centerLabel,
                      diagonalLabel: networkVisuParams.singleLineDiagramParameters.diagonalLabel,
                      componentLibrary: networkVisuParams.singleLineDiagramParameters.componentLibrary,
                      sldDisplayMode: SLD_DISPLAY_MODE.STATE_VARIABLE,
                      language: language,
                  })
                : null;
        },
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
        (voltageLevelId: UUID) => {
            if (studyUuid === null || currentNode === null || currentRootNetworkUuid === null) {
                return null;
            }
            return isNodeBuilt(currentNode)
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
                : null;
        },
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
        (depth: number) => {
            if (studyUuid === null || currentNode === null || currentRootNetworkUuid === null) {
                return null;
            }

            return isNodeBuilt(currentNode)
                ? getNetworkAreaDiagramUrl(
                      studyUuid,
                      currentNode?.id,
                      currentRootNetworkUuid,
                      depth,
                      networkVisuParams.networkAreaDiagramParameters.initNadWithGeoData
                  )
                : null;
        },
        [
            studyUuid,
            currentNode,
            currentRootNetworkUuid,
            networkVisuParams.networkAreaDiagramParameters.initNadWithGeoData,
        ]
    );
    const checkAndGetNetworkAreaDiagramFromConfigUrl = useCallback(
        (nadConfigUuid: UUID) => {
            if (studyUuid === null || currentNode === null || currentRootNetworkUuid === null) {
                return null;
            }

            return isNodeBuilt(currentNode)
                ? getNetworkAreaDiagramUrlFromConfig(studyUuid, currentNode?.id, currentRootNetworkUuid, nadConfigUuid)
                : null;
        },
        [studyUuid, currentNode, currentRootNetworkUuid]
    );

    // this callback returns a promise
    const fetchSvgData = useCallback<FetchSvgDataFn>(
        (svgUrl, svgType, fetchOptions?: RequestInit): any => {
            if (svgUrl) {
                return fetchSvg(svgUrl, fetchOptions)
                    .then((data: DiagramSvg | null) => {
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
                            errorMessage =
                                svgType === DiagramType.SUBSTATION ? 'SubstationNotFound' : 'VoltageLevelNotFound';
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

    const createSubstationDiagramView = useCallback(
        (id: UUID, state: ViewState): Promise<SldView> => {
            const svgUrl = checkAndGetSubstationSingleLineDiagramUrl(id);
            return fetchSvgData(svgUrl, DiagramType.SUBSTATION).then((svg: SldSvg) => {
                if (studyUuid === null || currentNode === null || currentRootNetworkUuid === null) {
                    return Promise.reject(
                        new Error(
                            'createSubstationDiagramView error: currentNode, studyUuid or currentRootNetworkUuid are undefined'
                        )
                    );
                }
                let label = getNameOrId(svg.additionalMetadata) ?? id;
                return createSldView({
                    id: id,
                    state: state,
                    name: label,
                    fetchSvg: () => fetchSvgData(svgUrl, DiagramType.SUBSTATION),
                    svgType: DiagramType.SUBSTATION,
                    ...svg,
                });
            });
        },
        [
            checkAndGetSubstationSingleLineDiagramUrl,
            currentNode,
            currentRootNetworkUuid,
            fetchSvgData,
            getNameOrId,
            studyUuid,
        ]
    );

    const createVoltageLevelDiagramView = useCallback(
        (id: UUID, state: ViewState): Promise<SldView> => {
            const svgUrl = checkAndGetVoltageLevelSingleLineDiagramUrl(id);
            return fetchSvgData(svgUrl, DiagramType.VOLTAGE_LEVEL).then((svg: SldSvg) => {
                if (studyUuid === null || currentNode === null || currentRootNetworkUuid === null) {
                    return Promise.reject(
                        new Error(
                            'createVoltageLevelDiagramView error: currentNode, studyUuid or currentRootNetworkUuid are undefined'
                        )
                    );
                }
                let label = getNameOrId(svg.additionalMetadata);
                return createSldView({
                    id: id,
                    state: state,
                    name: label,
                    fetchSvg: () => fetchSvgData(svgUrl, DiagramType.VOLTAGE_LEVEL),
                    svgType: DiagramType.VOLTAGE_LEVEL,
                    ...svg,
                });
            });
        },
        [
            checkAndGetVoltageLevelSingleLineDiagramUrl,
            currentNode,
            currentRootNetworkUuid,
            fetchSvgData,
            getNameOrId,
            studyUuid,
        ]
    );

    const createNetworkAreaDiagramFromConfigView = useCallback(
        (id: UUID, state: ViewState, nadName: string | undefined): Promise<NadFromConfigView> => {
            const svgUrl = checkAndGetNetworkAreaDiagramFromConfigUrl(id);
            return fetchSvgData(svgUrl, DiagramType.NAD_FROM_CONFIG).then((svg: NADSvg) => {
                if (studyUuid === null || currentNode === null || currentRootNetworkUuid === null) {
                    return Promise.reject(
                        new Error(
                            'createNetworkAreaDiagramFromConfigView error: currentNode, studyUuid or currentRootNetworkUuid are undefined'
                        )
                    );
                }
                let substationsIds: UUID[] = [];
                svg.additionalMetadata?.voltageLevels.forEach((vl: VoltageLevel) => {
                    substationsIds.push(vl.substationId);
                });
                return createNadFromConfigView({
                    id: id,
                    state: state,
                    name: nadName ?? id,
                    fetchSvg: () => createNetworkAreaDiagramFromConfigView(id, state, nadName),
                    depth: 0,
                    ...svg,
                });
            });
        },
        [checkAndGetNetworkAreaDiagramFromConfigUrl, currentNode, currentRootNetworkUuid, fetchSvgData, studyUuid]
    );

    const createNetworkAreaDiagramView = useCallback(
        (id: UUID, ids: string[], state: ViewState, depth = 0): Promise<NadView> => {
            console.log('debug', 'createNetworkAreaDiagramView', state);
            const svgUrl = checkAndGetNetworkAreaDiagramUrl(depth);
            const fetchOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ids),
            };
            return fetchSvgData(svgUrl, DiagramType.NETWORK_AREA_DIAGRAM, fetchOptions)
                .then((svg: NADSvg) => {
                    if (studyUuid === null || currentNode === null || currentRootNetworkUuid === null) {
                        return Promise.reject(
                            new Error(
                                'createNetworkAreaDiagramView error: currentNode, studyUuid or currentRootNetworkUuid are undefined'
                            )
                        );
                    }
                    let nadTitle = '';
                    let substationsIds: UUID[] = [];
                    svg.additionalMetadata?.voltageLevels
                        .map((vl) => ({
                            name: getNameOrId({ name: vl.name, id: vl.id ?? vl.substationId }),
                            substationId: vl.substationId,
                        }))
                        .sort((vlA, vlB) => vlA.name?.toLowerCase().localeCompare(vlB.name?.toLowerCase() ?? '') || 0)
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
                    return createNadView({
                        id: id,
                        ids: ids,
                        state: state,
                        name: nadTitle,
                        fetchSvg: () => createNetworkAreaDiagramView(id, ids, state, depth), // here 'name' and 'substationsIds' can change so we can't use fetchSvgData
                        depth: depth,
                        ...svg,
                    });
                })
                .then((nadView) => {
                    dispatch(setNetworkAreaDiagramNbVoltageLevels(nadView.additionalMetadata?.nbVoltageLevels ?? 0));
                    return nadView;
                });
        },
        [
            checkAndGetNetworkAreaDiagramUrl,
            currentNode,
            currentRootNetworkUuid,
            dispatch,
            fetchSvgData,
            getNameOrId,
            studyUuid,
        ]
    );

    const createView = useCallback(
        (diagramState: DiagramState): Promise<DiagramView> => {
            if (studyUuid === null || currentNode === null || currentRootNetworkUuid === null) {
                return Promise.reject(
                    new Error('useDisplayView error: currentNode, studyUuid or currentRootNetworkUuid are undefined')
                );
            }

            createDiagramViewFromState(diagramState);

            if (isSld(diagramState)) {
                if (diagramState.svgType === DiagramType.VOLTAGE_LEVEL) {
                    return createVoltageLevelDiagramView(diagramState.id!, diagramState.state);
                } else if (diagramState.svgType === DiagramType.SUBSTATION) {
                    return createSubstationDiagramView(diagramState.id!, diagramState.state);
                }
            } else if (isNad(diagramState)) {
                return createNetworkAreaDiagramView(
                    diagramState.id,
                    diagramState.ids,
                    diagramState.state,
                    diagramState.depth
                );
            } else if (isNadFromConfig(diagramState)) {
                return createNetworkAreaDiagramFromConfigView(diagramState.id!, diagramState.state, diagramState.name);
            }

            return Promise.reject(new Error('useDisplayView error: unknown svgType ' + diagramState.svgType));
        },
        [
            studyUuid,
            currentNode,
            currentRootNetworkUuid,
            createVoltageLevelDiagramView,
            createSubstationDiagramView,
            createNetworkAreaDiagramFromConfigView,
            createNetworkAreaDiagramView,
        ]
    );

    /**
     * FORCED UPDATE MECHANISM
     */

    const updateDiagrams = useCallback(() => {
        // Before we get the diagrams, we set loadingState = true over all views
        setViews((views) => {
            const updatedViews = [...views];
            updatedViews.forEach((view) => {
                view.loadingState = true;
            });
            return updatedViews;
        });
        // Then we add the data once we have it
        viewsRef.current.forEach((currentView) => {
            createView(currentView)
                .then((updatedView: DiagramView) => {
                    setViews((views) => {
                        const newViews = [...views];
                        const existingView = newViews.find((view) => view.id === updatedView.id);
                        if (existingView) {
                            Object.assign(existingView, updatedView);
                        }
                        return newViews;
                    });
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                    });
                });
        });
    }, [createView, snackError]);

    const updateDiagramsCallback = useCallback(
        (event: MessageEvent) => {
            const eventData = event.data as StudyUpdatedEventData;
            if (eventData.headers.rootNetworkUuid !== currentRootNetworkUuid) {
                return;
            }
            if (eventData.headers.updateType === 'loadflowResult' || eventData.headers.updateType === 'study') {
                updateDiagrams();
            } else if (eventData.headers.updateType === 'buildCompleted') {
                if (eventData.headers.node === currentNode?.id) {
                    updateDiagrams();
                }
            }
        },
        [currentNode?.id, currentRootNetworkUuid, updateDiagrams]
    );
    useNotificationsListener(NOTIFICATIONS_URL_KEYS.STUDY, { listenerCallbackMessage: updateDiagramsCallback });

    /**
     * NETWORK_AREA_DIAGRAM type diagram management (adding, removing or updating the NETWORK_AREA_DIAGRAM)
     */
    const updateNAD = useCallback(
        (currentNad: NadView) => {
            if (currentNad) {
                createNetworkAreaDiagramView(
                    currentNad.id,
                    currentNad.ids,
                    currentNad.state,
                    networkAreaDiagramDepth
                ).then((networkAreaView) => {
                    setViews((prevViews) => {
                        // retrieve the NAD
                        const NadView = prevViews.find(
                            (diagramView) => diagramView.svgType === DiagramType.NETWORK_AREA_DIAGRAM
                        );
                        if (NadView) {
                            Object.assign(NadView, networkAreaView);
                        }
                        return prevViews;
                    });
                });
            }
        },
        [networkAreaDiagramDepth, createNetworkAreaDiagramView]
    );

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

    // here to update the views
    // UPDATE DIAGRAM VIEWS
    useEffect(() => {
        // remove instant
        const viewsCopy = viewsRef.current.filter((view) =>
            diagramStates.find((diagramState) => view.id === diagramState.id)
        );
        // update existing instant, sauf pour NAD
        // manage case ids changed in NAD must update NAD svg here as well
        diagramStates.forEach((diagramState) => {
            const existingView = viewsCopy.find((view) => view.id === diagramState.id);
            if (existingView && isNadView(existingView) && isNad(diagramState)) {
                if (!sameArrays(existingView.ids, diagramState.ids)) {
                    Object.assign(existingView, {
                        ...diagramState,
                        name: intl.formatMessage({ id: 'LoadingOf' }, { value: diagramState.ids.toString() }),
                        loadingState: true,
                    });
                    updateNAD(existingView);
                }
            } else if (existingView) {
                Object.assign(existingView, diagramState);
            }
        });
        // newViewsToAdd Add empty views right away
        const newViewsToAdd: DiagramView[] = diagramStates
            .filter((diagramState) => !viewsCopy.find((view) => view.id === diagramState.id))
            .map((diagramState) => {
                if (isNadFromConfig(diagramState)) {
                    return {
                        ...diagramState,
                        name: intl.formatMessage({ id: 'LoadingOf' }, { value: diagramState.name }),
                        align: 'right',
                        nadName: diagramState.name,
                        loadingState: true,
                    };
                } else {
                    return {
                        ...diagramState,
                        name: intl.formatMessage({ id: 'LoadingOf' }, { value: diagramState.id }),
                        align: 'left',
                        loadingState: true,
                    };
                }
            });
        viewsCopy.push(...newViewsToAdd);
        setViews(viewsCopy);

        // newViewsToAdd  async
        diagramStates
            .filter((diagramState) => !viewsCopy.find((view) => view.id === diagramState.id))
            .forEach((diagramState) => {
                createView(diagramState).then((newView) => {
                    setViews((prevViews) => {
                        const prevView = prevViews.find((view) => view.id === newView.id);
                        if (prevView) {
                            Object.assign(prevView, newView);
                        }
                        return prevViews;
                    });
                });
            });
    }, [diagramStates, createView, intl, updateNAD]);

    useEffect(() => {
        if (studyUuid === null) {
            return;
        }
        syncDiagramStateWithSessionStorage(diagramStates, studyUuid);
    }, [diagramStates, studyUuid]);

    useEffect(() => {
        // NETWORK_AREA_DIAGRAM type diagram management (adding, removing or updating the NETWORK_AREA_DIAGRAM)
        // Here we call either the debounced or the non-debounced function
        // to force a server fetch after a few clicks to get the actual number of voltage levels.
        // it's ok to do this and doesn't cause two fetches at the end
        // because the debounced function is recreated after each networkAreaDiagramDepth
        // change so the debounce hook clears the debounce timer
        if (shouldDebounceUpdateNAD(networkAreaDiagramDepth)) {
            debounceUpdateNAD();
        } else {
            updateNAD();
        }
        // if networkVisuParams.networkAreaDiagramParameters.initNadWithGeoData changed updateNAD();
        // if networkAreaDiagramDepth changed updateNAD();
        // avoid other cases because it's managed elsewhere
    }, [
        updateNAD,
        debounceUpdateNAD,
        shouldDebounceUpdateNAD,
        networkAreaDiagramDepth,
        networkVisuParams.networkAreaDiagramParameters.initNadWithGeoData,
    ]);

    const displayedDiagrams = useMemo(
        () =>
            views
                .filter((view) => [ViewState.OPENED, ViewState.PINNED].includes(view.state))
                .sort(makeDiagramSorter(views)),
        [views]
    );
    const minimizedDiagrams = useMemo(
        () => views.filter((view) => [ViewState.MINIMIZED].includes(view.state)),
        [views]
    );

    return [displayedDiagrams, minimizedDiagrams];
};
