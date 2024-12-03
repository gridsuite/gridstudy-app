/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { LineFlowColorMode, LineFlowMode } from '@powsybl/network-viewer';
import {
    MAP_BASEMAP_CARTO,
    MAP_BASEMAP_CARTO_NOLABEL,
    MAP_BASEMAP_MAPBOX,
    PARAM_CENTER_LABEL,
    PARAM_COMPONENT_LIBRARY,
    PARAM_DIAGONAL_LABEL,
    PARAM_INIT_NAD_WITH_GEO_DATA,
    PARAM_LINE_FLOW_ALERT_THRESHOLD,
    PARAM_LINE_FLOW_COLOR_MODE,
    PARAM_LINE_FLOW_MODE,
    PARAM_LINE_FULL_PATH,
    PARAM_LINE_PARALLEL_PATH,
    PARAM_MAP_BASEMAP,
    PARAM_MAP_MANUAL_REFRESH,
    PARAM_SUBSTATION_LAYOUT,
} from '../../../../utils/config-params';
import { SubstationLayout } from '../../../diagrams/diagram-common';
import { NetworkVisualizationParametersForm } from './network-visualizations-form';

export enum TabValue {
    MAP = 'Map',
    SINGLE_LINE_DIAGRAM = 'SingleLineDiagram',
    NETWORK_AREA_DIAGRAM = 'NetworkAreaDiagram',
}
export const MAP_MANUAL_REFRESH = 'MapManualRefresh';
export const ALERT_THRESHOLD_LABEL = 'AlertThresholdLabel';
export const LINE_FLOW_COLOR_MODE = 'LineFlowColorMode';
export const LINE_FLOW_MODE = 'LineFlowMode';
export const MAP_BASE_MAP = 'MapBaseMap';

export const DIAGONAL_LABEL = 'diagonalLabel';
export const CENTER_LABEL = 'centerLabel';
export const SUBSTATION_LAYOUT = 'SubstationLayout';
export const COMPONENT_LIBRARY = 'ComponentLibrary';
export const INIT_NAD_WITH_GEO_DATA = 'initNadWithGeoData';

export interface NetworkVisualizationsParams {
    lineFullPath: boolean;
    lineParallelPath: boolean;
    lineFlowMode: LineFlowMode;
    lineFlowColorMode: LineFlowColorMode;
    lineFlowAlertThreshold: number;
    mapManualRefresh: boolean;
    mapBaseMap: string;
    diagonalLabel: boolean;
    centerLabel: boolean;
    substationLayout: string;
    componentLibrary: unknown;
    initNadWithGeoData: boolean;
}
export interface NestedObject {
    [key: string]: NestedObject | string | number | boolean;
}

export const INTL_LINE_FLOW_MODE_OPTIONS = [
    {
        id: LineFlowMode.STATIC_ARROWS,
        label: 'StaticArrows',
    },
    {
        id: LineFlowMode.ANIMATED_ARROWS,
        label: 'AnimatedArrows',
    },
    {
        id: LineFlowMode.FEEDERS,
        label: 'Feeders',
    },
];

export const INTL_LINE_FLOW_COLOR_MODE_OPTIONS = [
    {
        id: LineFlowColorMode.NOMINAL_VOLTAGE,
        label: 'NominalVoltage',
    },
    {
        id: LineFlowColorMode.OVERLOADS,
        label: 'Overloads',
    },
];
export const INTL_MAP_BASE_MAP_OPTIONS = [
    {
        id: MAP_BASEMAP_MAPBOX,
        label: 'Mapbox',
    },
    {
        id: MAP_BASEMAP_CARTO,
        label: 'Carto',
    },
    {
        id: MAP_BASEMAP_CARTO_NOLABEL,
        label: 'CartoNoLabel',
    },
];

export const fromNetworkVisualizationsParamsDataToFormValues = (parameters: NetworkVisualizationsParams) => {
    return {
        [TabValue.MAP]: {
            [PARAM_LINE_FULL_PATH]: parameters.lineFullPath,
            [PARAM_LINE_PARALLEL_PATH]: parameters.lineParallelPath,
            [PARAM_LINE_FLOW_MODE]: parameters.lineFlowMode,
            [PARAM_LINE_FLOW_COLOR_MODE]: parameters.lineFlowColorMode,
            [PARAM_LINE_FLOW_ALERT_THRESHOLD]: parameters.lineFlowAlertThreshold,
            [PARAM_MAP_MANUAL_REFRESH]: parameters.mapManualRefresh,
            [PARAM_MAP_BASEMAP]: parameters.mapBaseMap,
        },
        [TabValue.SINGLE_LINE_DIAGRAM]: {
            [PARAM_DIAGONAL_LABEL]: parameters.diagonalLabel,
            [PARAM_CENTER_LABEL]: parameters.centerLabel,
            [PARAM_SUBSTATION_LAYOUT]: parameters.substationLayout,
            [PARAM_COMPONENT_LIBRARY]: parameters.componentLibrary,
        },
        [TabValue.NETWORK_AREA_DIAGRAM]: {
            [PARAM_INIT_NAD_WITH_GEO_DATA]: parameters.initNadWithGeoData,
        },
    };
};

export const INTL_SUBSTATION_LAYOUT_OPTIONS = [
    {
        id: SubstationLayout.HORIZONTAL,
        label: 'HorizontalSubstationLayout',
    },
    {
        id: SubstationLayout.VERTICAL,
        label: 'VerticalSubstationLayout',
    },
];

export const formatParametersToSend = (
    parameters: NetworkVisualizationParametersForm,
    changedParameters: Partial<NetworkVisualizationParametersForm>
) => {
    const getFlattenedObject = (nestedObject: NestedObject) =>
        Object.values(nestedObject)
            .flatMap((obj) => Object.entries(obj))
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    const flattenedParameters = getFlattenedObject(parameters);
    const flattenedChangedParameters = getFlattenedObject(changedParameters);

    return Object.keys(flattenedChangedParameters).reduce((acc, field) => {
        (acc as any)[field] = (flattenedParameters as any)[field];
        return acc;
    }, {});
};
