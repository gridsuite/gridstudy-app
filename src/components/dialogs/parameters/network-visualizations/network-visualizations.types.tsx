/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';

type MapParameters = {
    lineFullPath: boolean;
    lineParallelPath: boolean;
    lineFlowMode: string;
    lineFlowColorMode: string;
    lineFlowAlertThreshold: number;
    mapManualRefresh: boolean;
    mapBaseMap: string;
};

type SingleLineDiagramParameters = {
    diagonalLabel: boolean;
    centerLabel: boolean;
    substationLayout: string;
    componentLibrary?: string;
};

type NetworkAreaDiagramParameters = {
    initNadWithGeoData: boolean;
};

export type NetworkVisualizationParameters = {
    id: UUID;
    mapParameters: MapParameters;
    singleLineDiagramParameters: SingleLineDiagramParameters;
    networkAreaDiagramParameters: NetworkAreaDiagramParameters;
};
