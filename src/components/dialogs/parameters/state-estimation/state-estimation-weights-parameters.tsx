/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FunctionComponent, useMemo } from 'react';
import { VOLTAGE_LEVEL, WEIGHTS_PARAMETERS } from '../../../utils/field-constants';
import { TabValue, weightsParametersFields } from './state-estimation-parameters-utils';
import { IColumnsDef } from '../common/limitreductions/columns-definitions';
import { useIntl } from 'react-intl';
import CustomVoltageLevelTable from '../common/voltage-level-table/custom-voltage-level-table';

export const StateEstimationWeightsParameters: FunctionComponent = () => {
    const intl = useIntl();

    const columnsDefinition = useMemo<IColumnsDef[]>(() => {
        const definition = [
            {
                dataKey: VOLTAGE_LEVEL,
                label: intl.formatMessage({ id: 'voltageRange' }),
                tooltip: intl.formatMessage({ id: 'voltageRange' }),
            },
        ];
        definition.push(
            ...weightsParametersFields.map((parameter) => {
                return {
                    dataKey: parameter,
                    label: intl.formatMessage({ id: parameter }),
                    tooltip: intl.formatMessage({ id: parameter }),
                };
            })
        );
        return definition;
    }, [intl]);

    return (
        <CustomVoltageLevelTable
            formName={`${TabValue.WEIGHTS}.${WEIGHTS_PARAMETERS}`}
            columnsDefinition={columnsDefinition}
            tableHeight={450}
        />
    );
};
