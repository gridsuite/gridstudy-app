/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    RATIO_TAP_CHANGER,
    STEPS_CONDUCTANCE,
    STEPS_RATIO,
    STEPS_REACTANCE,
    STEPS_RESISTANCE,
    STEPS_SUSCEPTANCE,
    STEPS_TAP,
} from 'components/util/field-constants';
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import TapChangerSteps from '../tap-changer-steps';
import { parseIntData } from '../../../dialogUtils';
import { RATIO_TAP } from '../../two-windings-transformer-creation-dialog';

const RatioTapChangerPaneSteps = ({ disabled }) => {
    const intl = useIntl();

    const COLUMNS_DEFINITIONS = useMemo(() => {
        return [
            {
                label: 'Tap',
                dataKey: STEPS_TAP,
            },
            {
                label: 'DeltaResistance',
                dataKey: STEPS_RESISTANCE,
                initialValue: 0,
                editable: true,
            },
            {
                label: 'DeltaReactance',
                dataKey: STEPS_REACTANCE,
                initialValue: 0,
                editable: true,
            },
            {
                label: 'DeltaConductance',
                dataKey: STEPS_CONDUCTANCE,
                initialValue: 0,
                editable: true,
            },
            {
                label: 'DeltaSusceptance',
                dataKey: STEPS_SUSCEPTANCE,
                initialValue: 0,
                editable: true,
            },
            {
                label: 'Ratio',
                dataKey: STEPS_RATIO,
                initialValue: 1,
                editable: true,
            },
        ].map((column) => ({
            ...column,
            label: intl.formatMessage({ id: column.label }).toUpperCase(),
        }));
    }, [intl]);

    const csvColumns = useMemo(() => {
        return [
            intl.formatMessage({ id: 'ImportFileResistance' }),
            intl.formatMessage({ id: 'ImportFileReactance' }),
            intl.formatMessage({ id: 'ImportFileConductance' }),
            intl.formatMessage({ id: 'ImportFileSusceptance' }),
            intl.formatMessage({ id: 'Ratio' }),
        ];
    }, [intl]);

    const handleImportRow = (val) => {
        return {
            [STEPS_RESISTANCE]: parseIntData(
                val[
                    intl.formatMessage({
                        id: 'ImportFileResistance',
                    })
                ],
                0
            ),
            [STEPS_REACTANCE]: parseIntData(
                val[
                    intl.formatMessage({
                        id: 'ImportFileReactance',
                    })
                ],
                0
            ),
            [STEPS_CONDUCTANCE]: parseIntData(
                val[
                    intl.formatMessage({
                        id: 'ImportFileConductance',
                    })
                ],
                0
            ),
            [STEPS_SUSCEPTANCE]: parseIntData(
                val[
                    intl.formatMessage({
                        id: 'ImportFileSusceptance',
                    })
                ],
                0
            ),
            [STEPS_RATIO]: isNaN(
                parseFloat(val[intl.formatMessage({ id: 'Ratio' })])
            )
                ? 1
                : parseFloat(val[intl.formatMessage({ id: 'Ratio' })]),
        };
    };

    return (
        <TapChangerSteps
            tapChanger={RATIO_TAP_CHANGER}
            ruleType={RATIO_TAP}
            createTapRuleColumn={STEPS_RATIO}
            columnsDefinition={COLUMNS_DEFINITIONS}
            csvColumns={csvColumns}
            createRuleMessageId="CreateRegulationRule"
            createRuleAllowNegativeValues={false}
            importRuleMessageId="ImportRegulationRule"
            handleImportRow={handleImportRow}
            disabled={disabled}
        />
    );
};

export default RatioTapChangerPaneSteps;
