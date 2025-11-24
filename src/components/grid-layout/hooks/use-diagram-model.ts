/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { useDiagramEventListener } from './use-diagram-event-listener';
import {
    Diagram,
    DiagramAdditionalMetadata,
    DiagramParams,
    DiagramType,
    NetworkAreaDiagram,
    SubstationDiagram,
    VoltageLevelDiagram,
} from '../cards/diagrams/diagram.type';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchSvg, getNetworkAreaDiagramUrl } from 'services/study';
import { useDiagramNotificationsListener } from './use-diagram-notifications-listener';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { getSubstationSingleLineDiagram, getVoltageLevelSingleLineDiagram } from 'services/study/network';
import { isNodeBuilt, isStatusBuilt } from 'components/graph/util/model-functions';
import { PARAM_LANGUAGE, PARAM_USE_NAME } from 'utils/config-params';
import { BUILD_STATUS, SLD_DISPLAY_MODE } from 'components/network/constants';
import { useDiagramParamsInitialization } from './use-diagram-params-initialization';
import { useIntl } from 'react-intl';
import { useDiagramTitle } from './use-diagram-title';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { NodeType } from 'components/graph/tree-node.type';
import { isThereTooManyOpenedNadDiagrams, mergePositions } from '../cards/diagrams/diagram-utils';
import { DiagramMetadata } from '@powsybl/network-viewer';

type UseDiagramModelProps = {
    diagramTypes: DiagramType[];
    onAddDiagram: (diagram: Diagram) => void;
    onDiagramAlreadyExists?: (diagramUuid: UUID) => void;
};

export type CreateDiagramFuncType = (diagramParams: DiagramParams) => void;
export type UpdateDiagramFuncType = (diagramParams: DiagramParams, fetch?: boolean) => void;

export const useDiagramModel = ({ diagramTypes, onAddDiagram, onDiagramAlreadyExists }: UseDiagramModelProps) => {
    const intl = useIntl();
    const { snackInfo, snackError } = useSnackMessage();
    // context
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const prevCurrentNodeId = useRef<UUID | undefined>();
    const prevCurrentNodeStatus = useRef<BUILD_STATUS | undefined>();
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const prevCurrentRootNetworkUuid = useRef<UUID | null>();
    const networkVisuParams = useSelector((state: AppState) => state.networkVisualizationsParameters);
    const paramUseName = useSelector((state: AppState) => state[PARAM_USE_NAME]);
    const language = useSelector((state: AppState) => state[PARAM_LANGUAGE]);
    const getDiagramTitle = useDiagramTitle();

    const [diagrams, setDiagrams] = useState<Record<UUID, Diagram>>({});
    const [loadingDiagrams, setLoadingDiagrams] = useState<UUID[]>([]);
    const [diagramErrors, setDiagramErrors] = useState<Record<UUID, string>>({});
    const [globalError, setGlobalError] = useState<string | undefined>();

    // Note: This function is mainly used to prevent double fetch when using the PositionDiagram
    const filterDiagramParams = useCallback(
        (diagramParams: DiagramParams[]): DiagramParams[] => {
            return diagramParams.filter((diagramParam) => {
                if (diagramTypes.includes(diagramParam.type)) {
                    return true;
                }
                return false;
            });
        },
        [diagramTypes]
    );

    const createPendingDiagram = useCallback(
        (diagramParams: DiagramParams, disableOnAddCallback: boolean = false) => {
            const pendingDiagram: Diagram = {
                ...diagramParams,
                svg: null,
            };
            setDiagrams((diagrams) => {
                const newDiagrams = { ...diagrams };
                newDiagrams[pendingDiagram.diagramUuid] = pendingDiagram;
                return newDiagrams;
            });
            if (!disableOnAddCallback) {
                onAddDiagram(pendingDiagram);
            }
            return pendingDiagram;
        },
        [onAddDiagram]
    );

    const checkAndGetVoltageLevelSingleLineDiagramUrl = useCallback(
        (diagram: VoltageLevelDiagram) => {
            if (studyUuid === null || currentNode === null || currentRootNetworkUuid === null) {
                return null;
            }

            return getVoltageLevelSingleLineDiagram({
                studyUuid: studyUuid,
                currentNodeUuid: currentNode?.id,
                currentRootNetworkUuid: currentRootNetworkUuid,
                voltageLevelId: diagram.voltageLevelId,
                useName: paramUseName,
                centerLabel: networkVisuParams.singleLineDiagramParameters.centerLabel,
                diagonalLabel: networkVisuParams.singleLineDiagramParameters.diagonalLabel,
                componentLibrary: networkVisuParams.singleLineDiagramParameters.componentLibrary,
                sldDisplayMode: SLD_DISPLAY_MODE.STATE_VARIABLE,
                language: language,
            });
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
        (diagram: SubstationDiagram) => {
            if (studyUuid === null || currentNode === null || currentRootNetworkUuid === null) {
                return null;
            }

            return getSubstationSingleLineDiagram({
                studyUuid: studyUuid,
                currentNodeUuid: currentNode?.id,
                currentRootNetworkUuid: currentRootNetworkUuid,
                substationId: diagram.substationId,
                useName: paramUseName,
                centerLabel: networkVisuParams.singleLineDiagramParameters.centerLabel,
                diagonalLabel: networkVisuParams.singleLineDiagramParameters.diagonalLabel,
                substationLayout: networkVisuParams.singleLineDiagramParameters.substationLayout,
                componentLibrary: networkVisuParams.singleLineDiagramParameters.componentLibrary,
                language: language,
            });
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
    const checkAndGetNetworkAreaDiagramUrl = useCallback(() => {
        if (studyUuid === null || currentNode === null || currentRootNetworkUuid === null) {
            return null;
        }
        return getNetworkAreaDiagramUrl(studyUuid, currentNode?.id, currentRootNetworkUuid);
    }, [studyUuid, currentNode, currentRootNetworkUuid]);

    const getUrl = useCallback(
        (diagram: Diagram): string | null => {
            if (studyUuid === null || currentNode === null || currentRootNetworkUuid === null) {
                return null;
            }
            if (!isNodeBuilt(currentNode)) {
                return null;
            }
            if (diagram.type === DiagramType.VOLTAGE_LEVEL) {
                return checkAndGetVoltageLevelSingleLineDiagramUrl(diagram);
            } else if (diagram.type === DiagramType.SUBSTATION) {
                return checkAndGetSubstationSingleLineDiagramUrl(diagram);
            } else if (diagram.type === DiagramType.NETWORK_AREA_DIAGRAM) {
                return checkAndGetNetworkAreaDiagramUrl();
            }
            return null;
        },
        [
            checkAndGetNetworkAreaDiagramUrl,
            checkAndGetSubstationSingleLineDiagramUrl,
            checkAndGetVoltageLevelSingleLineDiagramUrl,
            currentNode,
            currentRootNetworkUuid,
            studyUuid,
        ]
    );

    // Helper functions to reduce nesting
    const handleFetchSuccess = useCallback(
        (diagram: Diagram, data: any) => {
            setDiagrams((diagrams) => {
                if (!diagrams[diagram.diagramUuid]) {
                    console.warn(`Diagram ${diagram.diagramUuid} not found in state`);
                    return diagrams;
                }
                const newDiagrams = { ...diagrams };
                const vlIdsFromSvg =
                    (data.additionalMetadata as DiagramAdditionalMetadata)?.voltageLevels?.map((vl: any) => vl.id) ??
                    [];

                newDiagrams[diagram.diagramUuid] = {
                    ...diagrams[diagram.diagramUuid],
                    svg: data,
                    name: getDiagramTitle(diagram, data),
                    ...(diagram.type === DiagramType.NETWORK_AREA_DIAGRAM && {
                        voltageLevelToExpandIds: [],
                        voltageLevelIds: [
                            ...new Set([
                                ...(diagrams[diagram.diagramUuid] as NetworkAreaDiagram).voltageLevelIds,
                                ...vlIdsFromSvg,
                            ]),
                        ],
                        voltageLevelToOmitIds: (
                            diagrams[diagram.diagramUuid] as NetworkAreaDiagram
                        ).voltageLevelToOmitIds.filter((vlId: string) => !vlIdsFromSvg.includes(vlId)),
                        positions: mergePositions(
                            (diagrams[diagram.diagramUuid] as NetworkAreaDiagram).positions ?? [],
                            data.metadata as DiagramMetadata
                        ),
                    }),
                };
                return newDiagrams;
            });
        },
        [getDiagramTitle]
    );

    const handleFetchError = useCallback(
        (diagram: Diagram, error: any) => {
            console.error('Error while fetching SVG', error.message);
            if (error.status === 400) {
                setDiagrams((diagrams) => {
                    const newDiagrams = { ...diagrams };
                    delete newDiagrams[diagram.diagramUuid];
                    return newDiagrams;
                });
                snackError({
                    headerId: 'nadConfiguredPositionsModeFailed',
                });
                return;
            }
            setDiagrams((diagrams) => {
                if (!diagrams[diagram.diagramUuid]) {
                    console.warn(`Diagram ${diagram.diagramUuid} not found in state`);
                    return diagrams;
                }
                const newDiagrams = { ...diagrams };

                newDiagrams[diagram.diagramUuid] = {
                    ...diagrams[diagram.diagramUuid],
                };
                return newDiagrams;
            });
            let errorMessage: string;
            if (error.status === 404) {
                errorMessage = diagram.type === DiagramType.SUBSTATION ? 'SubstationNotFound' : 'VoltageLevelNotFound';
            } else if (error.status === 403) {
                errorMessage = error.message;
                snackError({
                    headerId: errorMessage,
                });
            } else {
                errorMessage = 'svgLoadingFail';
                snackError({
                    headerId: errorMessage,
                });
            }
            setDiagramErrors((diagramErrors) => {
                return {
                    ...diagramErrors,
                    [diagram.diagramUuid]: errorMessage,
                };
            });
        },
        [snackError]
    );

    const handleFetchFinally = useCallback((diagram: Diagram) => {
        setLoadingDiagrams((loadingDiagrams) => {
            return loadingDiagrams.filter((id) => id !== diagram.diagramUuid);
        });
    }, []);

    const fetchDiagramSvg = useCallback(
        (diagram: Diagram) => {
            // make url from type
            const url = getUrl(diagram);
            if (!url) {
                return;
            }
            let fetchOptions: RequestInit = { method: 'GET' };
            if (diagram.type === DiagramType.NETWORK_AREA_DIAGRAM) {
                const nadRequestInfos = {
                    nadConfigUuid: diagram.initializationNadConfigUuid ?? diagram.nadConfigUuid,
                    filterUuid: diagram.initializationFilterUuid ?? diagram.filterUuid,
                    voltageLevelIds: diagram.voltageLevelIds,
                    voltageLevelToExpandIds: diagram.voltageLevelToExpandIds,
                    voltageLevelToOmitIds: diagram.voltageLevelToOmitIds,
                    positions: diagram.positions,
                    nadPositionsGenerationMode:
                        networkVisuParams.networkAreaDiagramParameters.nadPositionsGenerationMode,
                };
                fetchOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nadRequestInfos),
                };
            }

            setLoadingDiagrams((loadingDiagrams) => {
                if (loadingDiagrams.includes(diagram.diagramUuid)) {
                    console.warn(`Diagram ${diagram.diagramUuid} is already being loaded`);
                    return loadingDiagrams;
                }
                return [...loadingDiagrams, diagram.diagramUuid];
            });

            fetchSvg(url, fetchOptions)
                .then((data) => {
                    if (data == null) {
                        return;
                    }
                    handleFetchSuccess(diagram, data);
                })
                .catch((error) => {
                    handleFetchError(diagram, error);
                })
                .finally(() => {
                    handleFetchFinally(diagram);
                });
        },
        [
            getUrl,
            networkVisuParams.networkAreaDiagramParameters.nadPositionsGenerationMode,
            handleFetchSuccess,
            handleFetchError,
            handleFetchFinally,
        ]
    );

    const findSimilarDiagram = useCallback(
        (diagramParams: DiagramParams): Diagram | undefined => {
            switch (diagramParams.type) {
                case DiagramType.VOLTAGE_LEVEL:
                    return Object.values(diagrams).find(
                        (diagram) =>
                            diagram.type === DiagramType.VOLTAGE_LEVEL &&
                            diagram.voltageLevelId === diagramParams.voltageLevelId
                    );
                case DiagramType.SUBSTATION:
                    return Object.values(diagrams).find(
                        (diagram) =>
                            diagram.type === DiagramType.SUBSTATION &&
                            diagram.substationId === diagramParams.substationId
                    );
                case DiagramType.NETWORK_AREA_DIAGRAM: // no good criteria to get similar NAD for now
                default:
                    return undefined;
            }
        },
        [diagrams]
    );

    const isCreationRequestValid = useCallback(
        (diagramParams: DiagramParams): boolean => {
            if (diagramParams.type === DiagramType.NETWORK_AREA_DIAGRAM && isThereTooManyOpenedNadDiagrams(diagrams)) {
                snackInfo({
                    messageTxt: intl.formatMessage({ id: 'MaxNumberOfNadDiagramsReached' }),
                });
                return false;
            }

            if (filterDiagramParams([diagramParams]).length === 0) {
                // this hook instance don't manage this type of diagram
                return false;
            }
            const similarDiagram = findSimilarDiagram(diagramParams);
            if (similarDiagram) {
                onDiagramAlreadyExists?.(similarDiagram.diagramUuid);
                return false;
            }
            return true;
        },
        [diagrams, filterDiagramParams, snackInfo, intl, findSimilarDiagram, onDiagramAlreadyExists]
    );

    const initDiagram = useCallback(
        (diagramParams: DiagramParams) => {
            if (!isCreationRequestValid(diagramParams)) {
                return;
            }
            fetchDiagramSvg(createPendingDiagram(diagramParams, true));
        },
        [createPendingDiagram, fetchDiagramSvg, isCreationRequestValid]
    );

    const createDiagram: CreateDiagramFuncType = useCallback(
        (diagramParams: DiagramParams) => {
            if (!isCreationRequestValid(diagramParams)) {
                return;
            }
            fetchDiagramSvg(createPendingDiagram(diagramParams));
        },
        [isCreationRequestValid, createPendingDiagram, fetchDiagramSvg]
    );

    const updateDiagram: UpdateDiagramFuncType = useCallback(
        (diagramParams: DiagramParams, fetch: boolean = true) => {
            if (filterDiagramParams([diagramParams]).length === 0) {
                // this hook instance doesn't manage this type of diagram
                return;
            }
            const existingDiagram = diagrams[diagramParams.diagramUuid];
            if (!existingDiagram) {
                // Diagram with UUID ${diagramParams.diagramUuid} not found
                return;
            }
            const newDiagrams = { ...diagrams };
            newDiagrams[diagramParams.diagramUuid] = {
                ...newDiagrams[diagramParams.diagramUuid],
                ...diagramParams,
            };
            setDiagrams(newDiagrams);
            if (fetch) {
                fetchDiagramSvg(newDiagrams[diagramParams.diagramUuid]);
            }
        },
        [diagrams, fetchDiagramSvg, filterDiagramParams]
    );

    const removeDiagram = useCallback((id: UUID) => {
        setDiagrams((oldDiagrams) => {
            if (oldDiagrams[id]) {
                const newDiagrams = { ...oldDiagrams };
                delete newDiagrams[id];
                return newDiagrams;
            }
            return oldDiagrams;
        });
    }, []);

    useDiagramParamsInitialization({ onLoadDiagramParams: initDiagram });

    const updateAllDiagrams = useCallback(() => {
        if (studyUuid === null || currentNode === null || currentRootNetworkUuid === null) {
            return null;
        }
        setDiagramErrors({});
        setGlobalError(undefined);
        setDiagrams((oldDiagrams) => {
            for (const diagram of Object.values(oldDiagrams)) {
                diagram.svg = null; // reset svg
            }
            return oldDiagrams;
        });
        for (const diagram of Object.values(diagrams)) {
            fetchDiagramSvg(diagram);
        }
    }, [currentNode, currentRootNetworkUuid, diagrams, fetchDiagramSvg, studyUuid]);

    useDiagramEventListener({ createDiagram, removeDiagram });
    useDiagramNotificationsListener({ updateAllDiagrams });

    useEffect(() => {
        if (!currentNode?.id) {
            return;
        }
        if (currentNode.id === prevCurrentNodeId.current) {
            // if same node and status didn't change then do not update diagrams
            if (
                currentNode.data?.globalBuildStatus === prevCurrentNodeStatus.current &&
                (currentNode.type === NodeType.ROOT || isStatusBuilt(currentNode?.data?.globalBuildStatus))
            ) {
                return;
            }
        }
        prevCurrentNodeId.current = currentNode.id; // ok something relevant has changed
        prevCurrentNodeStatus.current = currentNode.data?.globalBuildStatus;
        if (currentNode?.type !== NodeType.ROOT && !isStatusBuilt(currentNode?.data?.globalBuildStatus)) {
            // if current node is not root and not built, set global error and do not update diagrams
            setGlobalError('InvalidNode');
            return;
        }
        updateAllDiagrams();
    }, [currentNode?.id, currentNode?.type, currentNode?.data?.globalBuildStatus, updateAllDiagrams]);

    useEffect(() => {
        if (currentRootNetworkUuid === prevCurrentRootNetworkUuid.current) {
            return;
        }
        // Logic to update the diagrams when the current root network changes
        prevCurrentRootNetworkUuid.current = currentRootNetworkUuid;
        updateAllDiagrams();
    }, [currentRootNetworkUuid, updateAllDiagrams]);

    return {
        diagrams,
        loadingDiagrams,
        diagramErrors,
        globalError,
        removeDiagram,
        createDiagram,
        updateDiagram,
    };
};
