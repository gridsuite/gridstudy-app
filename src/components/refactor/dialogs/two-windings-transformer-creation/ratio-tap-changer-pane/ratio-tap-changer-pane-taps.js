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
} from 'components/refactor/utils/field-constants';
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import TapChangerPaneTable from '../tap-changer-pane-table/tap-changer-pane-table';
import { RATIO_TAP } from '../two-windings-transformer-creation-dialog';

const RatioTapChangerPaneTaps = ({ disabled }) => {
    const intl = useIntl();

    const COLUMNS_DEFINITIONS = useMemo(() => {
        return [
            {
                label: intl.formatMessage({ id: 'Tap' }).toUpperCase(),
                dataKey: STEPS_TAP,
            },
            {
                label: intl
                    .formatMessage({ id: 'DeltaResistance' })
                    .toUpperCase(),
                dataKey: STEPS_RESISTANCE,
                initialValue: 0,
                editable: true,
            },
            {
                label: intl
                    .formatMessage({ id: 'DeltaReactance' })
                    .toUpperCase(),
                dataKey: STEPS_REACTANCE,
                initialValue: 0,
                editable: true,
            },
            {
                label: intl
                    .formatMessage({ id: 'DeltaConductance' })
                    .toUpperCase(),
                dataKey: STEPS_CONDUCTANCE,
                initialValue: 0,
                editable: true,
            },
            {
                label: intl
                    .formatMessage({ id: 'DeltaSusceptance' })
                    .toUpperCase(),
                dataKey: STEPS_SUSCEPTANCE,
                initialValue: 0,
                editable: true,
            },
            {
                label: intl.formatMessage({ id: 'Ratio' }).toUpperCase(),
                dataKey: STEPS_RATIO,
                initialValue: 1,
                editable: true,
            },
        ];
    }, [intl]);

    const csvColumns = useMemo(() => {
        return [
            intl.formatMessage({ id: 'Tap' }),
            intl.formatMessage({ id: 'ImportFileResistance' }),
            intl.formatMessage({ id: 'ImportFileReactance' }),
            intl.formatMessage({ id: 'ImportFileConductance' }),
            intl.formatMessage({ id: 'ImportFileSusceptance' }),
            intl.formatMessage({ id: 'Ratio' }),
        ];
    }, [intl]);

    const parseIntData = (data, defaultValue) => {
        const intValue = parseInt(data);
        return isNaN(intValue) ? defaultValue : intValue;
    };

    const handleImportRow = (val) => {
        return {
            [STEPS_TAP]: val[intl.formatMessage({ id: 'Tap' })],
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
        <TapChangerPaneTable
            tapChanger={RATIO_TAP_CHANGER}
            ruleType={RATIO_TAP}
            createTapRuleColumn={STEPS_RATIO}
            columnsDefinition={COLUMNS_DEFINITIONS}
            csvColumns={csvColumns}
            createRuleMessageId="CreateRegulationRule"
            importRuleMessageId="ImportRegulationRule"
            handleImportRow={handleImportRow}
            disabled={disabled}
        />
    );
};

export default RatioTapChangerPaneTaps;
