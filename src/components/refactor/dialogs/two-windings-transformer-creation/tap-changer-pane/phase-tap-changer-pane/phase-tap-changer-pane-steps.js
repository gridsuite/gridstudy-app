/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    PHASE_TAP_CHANGER,
    STEPS_ALPHA,
    STEPS_CONDUCTANCE,
    STEPS_RATIO,
    STEPS_REACTANCE,
    STEPS_RESISTANCE,
    STEPS_SUSCEPTANCE,
    STEPS_TAP,
} from 'components/refactor/utils/field-constants';
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import TapChangerSteps from '../tap-changer-steps';
import { parseIntData } from '../../../../../dialogs/dialogUtils';
import { PHASE_TAP } from '../../two-windings-transformer-creation-dialog';

const PhaseTapChangerPaneSteps = ({ disabled }) => {
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
            {
                label: 'Alpha',
                dataKey: STEPS_ALPHA,
                initialValue: 0,
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
            intl.formatMessage({ id: 'ImportFileAlpha' }),
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
            [STEPS_ALPHA]: isNaN(
                parseFloat(
                    val[
                        intl.formatMessage({
                            id: 'ImportFileAlpha',
                        })
                    ]
                )
            )
                ? 1
                : parseFloat(
                      val[
                          intl.formatMessage({
                              id: 'ImportFileAlpha',
                          })
                      ]
                  ),
        };
    };

    return (
        <TapChangerSteps
            tapChanger={PHASE_TAP_CHANGER}
            ruleType={PHASE_TAP}
            createTapRuleColumn={STEPS_ALPHA}
            columnsDefinition={COLUMNS_DEFINITIONS}
            csvColumns={csvColumns}
            createRuleMessageId="CreateDephasingRule"
            importRuleMessageId="ImportDephasingRule"
            handleImportRow={handleImportRow}
            disabled={disabled}
        />
    );
};

export default PhaseTapChangerPaneSteps;
