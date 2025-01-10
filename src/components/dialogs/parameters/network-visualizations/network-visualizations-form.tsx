/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
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
import yup from '../../../utils/yup-config';
import { TabValue } from './network-visualizations-utils';

export const initialNetworkVisualizationParametersForm: NetworkVisualizationParametersForm = {
    [TabValue.MAP]: {
        [PARAM_LINE_FULL_PATH]: false,
        [PARAM_LINE_PARALLEL_PATH]: false,
        [PARAM_LINE_FLOW_MODE]: '',
        [PARAM_LINE_FLOW_COLOR_MODE]: '',
        [PARAM_LINE_FLOW_ALERT_THRESHOLD]: 0,
        [PARAM_MAP_MANUAL_REFRESH]: false,
        [PARAM_MAP_BASEMAP]: '',
    },
    [TabValue.SINGLE_LINE_DIAGRAM]: {
        [PARAM_DIAGONAL_LABEL]: false,
        [PARAM_CENTER_LABEL]: false,
        [PARAM_SUBSTATION_LAYOUT]: '',
        [PARAM_COMPONENT_LIBRARY]: '',
    },
    [TabValue.NETWORK_AREA_DIAGRAM]: {
        [PARAM_INIT_NAD_WITH_GEO_DATA]: false,
    },
};

export const networkVisualizationParametersSchema = yup.object().shape({
    [TabValue.MAP]: yup.object().shape({
        [PARAM_LINE_FULL_PATH]: yup.boolean(),
        [PARAM_LINE_PARALLEL_PATH]: yup.boolean(),
        [PARAM_LINE_FLOW_MODE]: yup.string(),
        [PARAM_LINE_FLOW_COLOR_MODE]: yup.string(),
        [PARAM_LINE_FLOW_ALERT_THRESHOLD]: yup.number().positive().max(100),
        [PARAM_MAP_MANUAL_REFRESH]: yup.boolean(),
        [PARAM_MAP_BASEMAP]: yup.string(),
    }),
    [TabValue.SINGLE_LINE_DIAGRAM]: yup.object().shape({
        [PARAM_DIAGONAL_LABEL]: yup.boolean(),
        [PARAM_CENTER_LABEL]: yup.boolean(),
        [PARAM_SUBSTATION_LAYOUT]: yup.string(),
        [PARAM_COMPONENT_LIBRARY]: yup.string(),
    }),
    [TabValue.NETWORK_AREA_DIAGRAM]: yup.object().shape({
        [PARAM_INIT_NAD_WITH_GEO_DATA]: yup.boolean(),
    }),
});

export type NetworkVisualizationParametersForm = yup.InferType<typeof networkVisualizationParametersSchema>;
