/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';
import { useDiagramEventListener } from './use-diagram-event-listener';
import {
    Diagram,
    DiagramParams,
    DiagramType,
    NetworkAreaDiagram,
    NetworkAreaDiagramFromConfig,
    SubstationDiagram,
    VoltageLevelDiagram,
} from '../diagram.type';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchSvg, getNetworkAreaDiagramUrl, getNetworkAreaDiagramUrlFromConfig } from 'services/study';
import { useDiagramNotificationsListener } from './use-diagram-notifications-listener';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { getSubstationSingleLineDiagram, getVoltageLevelSingleLineDiagram } from 'services/study/network';
import { isNodeBuilt, isStatusBuilt } from 'components/graph/util/model-functions';
import { PARAM_LANGUAGE, PARAM_USE_NAME } from 'utils/config-params';
import { BUILD_STATUS, SLD_DISPLAY_MODE } from 'components/network/constants';
import { useDiagramSessionStorage } from './use-diagram-session-storage';
import { useIntl } from 'react-intl';
import { NodeType } from 'components/graph/tree-node.type';
import { useSnackMessage } from '@gridsuite/commons-ui';

const makeDiagramName = (diagram: Diagram): string => {
    if (diagram.type === DiagramType.VOLTAGE_LEVEL) {
        return `${diagram.voltageLevelId}`;
    } else if (diagram.type === DiagramType.SUBSTATION) {
        return `${diagram.substationId}`;
    } else if (diagram.type === DiagramType.NETWORK_AREA_DIAGRAM) {
        return `${diagram.voltageLevelIds.join(', ')}`;
    } else if (diagram.type === DiagramType.NAD_FROM_CONFIG) {
        return `${diagram.nadFromConfigUuid}`;
    }
    return `diagram type unknown`;
};

type UseDiagramModelProps = {
    diagramTypes: DiagramType[];
    onAddDiagram: (diagram: Diagram) => void;
};

export const useDiagramModel = ({ diagramTypes, onAddDiagram }: UseDiagramModelProps) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();
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

    const [diagrams, setDiagrams] = useState<Record<UUID, Diagram>>({});
    const [loadingDiagrams, setLoadingDiagrams] = useState<UUID[]>([]);
    const [diagramErrors, setDiagramErrors] = useState<Record<UUID, string>>({});
    const [globalError, setGlobalError] = useState<string | null>(null);

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

    const diagramAlreadyExists = useCallback(
        (diagramParams: DiagramParams) => {
            if (diagramParams.type === DiagramType.VOLTAGE_LEVEL) {
                return Object.values(diagrams)
                    .filter((diagram) => diagram.type === DiagramType.VOLTAGE_LEVEL)
                    .some((d) => d.voltageLevelId === diagramParams.voltageLevelId);
            } else if (diagramParams.type === DiagramType.SUBSTATION) {
                return Object.values(diagrams)
                    .filter((diagram) => diagram.type === DiagramType.SUBSTATION)
                    .some((d) => d.substationId === diagramParams.substationId);
            } else if (diagramParams.type === DiagramType.NETWORK_AREA_DIAGRAM) {
                return Object.values(diagrams)
                    .filter((diagram) => diagram.type === DiagramType.NETWORK_AREA_DIAGRAM)
                    .some((d) => diagramParams.voltageLevelIds.every((vlId) => d.voltageLevelIds.includes(vlId)));
            } else if (diagramParams.type === DiagramType.NAD_FROM_CONFIG) {
                return Object.values(diagrams)
                    .filter((diagram) => diagram.type === DiagramType.NAD_FROM_CONFIG)
                    .some((d) => d.nadFromConfigUuid === diagramParams.nadFromConfigUuid);
            }
            return false;
        },
        [diagrams]
    );

    const createPendingDiagram = useCallback(
        (diagramParams: DiagramParams) => {
            const pendingDiagram: Diagram = {
                ...diagramParams,
                name: intl.formatMessage({ id: 'LoadingOf' }, { value: diagramParams.type }),
                svg: null,
            };
            setDiagrams((diagrams) => {
                const newDiagrams = { ...diagrams };
                newDiagrams[pendingDiagram.diagramUuid] = pendingDiagram;
                return newDiagrams;
            });
            onAddDiagram(pendingDiagram);
            return pendingDiagram;
        },
        [intl, onAddDiagram]
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
    const checkAndGetNetworkAreaDiagramUrl = useCallback(
        (diagram: NetworkAreaDiagram) => {
            if (studyUuid === null || currentNode === null || currentRootNetworkUuid === null) {
                return null;
            }

            return getNetworkAreaDiagramUrl(
                studyUuid,
                currentNode?.id,
                currentRootNetworkUuid,
                diagram.depth,
                networkVisuParams.networkAreaDiagramParameters.initNadWithGeoData
            );
        },
        [
            studyUuid,
            currentNode,
            currentRootNetworkUuid,
            networkVisuParams.networkAreaDiagramParameters.initNadWithGeoData,
        ]
    );
    const checkAndGetNetworkAreaDiagramFromConfigUrl = useCallback(
        (diagram: NetworkAreaDiagramFromConfig) => {
            if (studyUuid === null || currentNode === null || currentRootNetworkUuid === null) {
                return null;
            }

            return getNetworkAreaDiagramUrlFromConfig(
                studyUuid,
                currentNode?.id,
                currentRootNetworkUuid,
                diagram.nadFromConfigUuid
            );
        },
        [studyUuid, currentNode, currentRootNetworkUuid]
    );

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
                return checkAndGetNetworkAreaDiagramUrl(diagram);
            } else if (diagram.type === DiagramType.NAD_FROM_CONFIG) {
                return checkAndGetNetworkAreaDiagramFromConfigUrl(diagram);
            }
            return null;
        },
        [
            checkAndGetNetworkAreaDiagramFromConfigUrl,
            checkAndGetNetworkAreaDiagramUrl,
            checkAndGetSubstationSingleLineDiagramUrl,
            checkAndGetVoltageLevelSingleLineDiagramUrl,
            currentNode,
            currentRootNetworkUuid,
            studyUuid,
        ]
    );

    const fetchDiagramSvg = useCallback(
        (diagram: Diagram) => {
            // make url from type
            const url = getUrl(diagram);
            let fetchOptions: RequestInit = { method: 'GET' };
            if (diagram.type === DiagramType.NETWORK_AREA_DIAGRAM) {
                fetchOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(diagram.voltageLevelIds),
                };
            }

            if (url) {
                setLoadingDiagrams((loadingDiagrams) => {
                    if (loadingDiagrams.includes(diagram.diagramUuid)) {
                        console.warn(`Diagram ${diagram.diagramUuid} is already being loaded`);
                        return loadingDiagrams;
                    }
                    return [...loadingDiagrams, diagram.diagramUuid];
                });
                // fetch the svg
                fetchSvg(url, fetchOptions)
                    .then((data) => {
                        if (data !== null) {
                            setDiagrams((diagrams) => {
                                if (!diagrams[diagram.diagramUuid]) {
                                    console.warn(`Diagram ${diagram.diagramUuid} not found in state`);
                                    return diagrams;
                                }
                                const newDiagrams = { ...diagrams };

                                newDiagrams[diagram.diagramUuid] = {
                                    ...diagrams[diagram.diagramUuid],
                                    svg: data,
                                    name: makeDiagramName(diagram),
                                };
                                return newDiagrams;
                            });
                        }
                    })
                    .catch((error) => {
                        console.error('Error while fetching SVG', error.message);
                        setDiagrams((diagrams) => {
                            if (!diagrams[diagram.diagramUuid]) {
                                console.warn(`Diagram ${diagram.diagramUuid} not found in state`);
                                return diagrams;
                            }
                            const newDiagrams = { ...diagrams };

                            newDiagrams[diagram.diagramUuid] = {
                                ...diagrams[diagram.diagramUuid],
                                name: intl.formatMessage(
                                    {
                                        id: 'diagramLoadingFail',
                                    },
                                    { diagramName: makeDiagramName(diagram) }
                                ),
                            };
                            return newDiagrams;
                        });
                        let errorMessage: string;
                        if (error.status === 404) {
                            errorMessage =
                                diagram.type === DiagramType.SUBSTATION ? 'SubstationNotFound' : 'VoltageLevelNotFound';
                        } else {
                            snackError({
                                headerId: 'svgLoadingFail',
                            });
                        }
                        setDiagramErrors((diagramErrors) => {
                            return {
                                ...diagramErrors,
                                [diagram.diagramUuid]: errorMessage,
                            };
                        });
                    })
                    .finally(() => {
                        setLoadingDiagrams((loadingDiagrams) => {
                            return loadingDiagrams.filter((id) => id !== diagram.diagramUuid);
                        });
                    });
            }
        },
        [getUrl, intl, snackError]
    );

    const createDiagram = useCallback(
        (diagramParams: DiagramParams) => {
            if (filterDiagramParams([diagramParams]).length === 0) {
                // this hook instance don't manage this type of diagram
                return;
            }
            if (diagramAlreadyExists(diagramParams)) {
                // blink the diagram
                return;
            }
            const diagram = createPendingDiagram(diagramParams);
            fetchDiagramSvg(diagram);
        },
        [createPendingDiagram, diagramAlreadyExists, fetchDiagramSvg, filterDiagramParams]
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

    useDiagramSessionStorage({ diagrams, onLoadFromSessionStorage: createDiagram });

    const updateAllDiagrams = useCallback(() => {
        if (studyUuid === null || currentNode === null || currentRootNetworkUuid === null) {
            return null;
        }
        setDiagramErrors({});
        setGlobalError(null);
        setDiagrams((oldDiagrams) => {
            Object.values(oldDiagrams).forEach((diagram) => {
                diagram.svg = null; // reset svg
            });
            return oldDiagrams;
        });
        Object.values(diagrams).forEach((diagram) => {
            fetchDiagramSvg(diagram);
        });
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

    return { diagrams, loadingDiagrams, diagramErrors, globalError, removeDiagram, createDiagram };
};
