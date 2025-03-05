/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { LineFlowColorMode, LineFlowMode } from '@powsybl/network-viewer';
import { MAP_BASEMAP_CARTO, MAP_BASEMAP_CARTO_NOLABEL, MAP_BASEMAP_MAPBOX } from '../../../../utils/config-params';

import { SubstationLayout } from '../../../diagrams/diagram.type';

export enum TabValue {
    MAP = 'mapParameters',
    SINGLE_LINE_DIAGRAM = 'singleLineDiagramParameters',
    NETWORK_AREA_DIAGRAM = 'networkAreaDiagramParameters',
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
