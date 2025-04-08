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
} from 'components/utils/field-constants';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import TapChangerSteps from '../tap-changer-steps';
import { parseIntData } from '../../../../dialog-utils';
import { PHASE_TAP } from '../../creation/two-windings-transformer-creation-dialog';
import { CurrentTreeNode } from '../../../../../graph/tree-node.type';
import { PhaseTapChangerStepData } from './phase-tap-changer.type';
import { useColumnDefinitions } from '../use-column-definitions';

export type PhaseTapChangerPaneStepsProps = {
    disabled: boolean;
    previousValuesSteps?: PhaseTapChangerStepData[];
    previousValuesLowTapPosition?: number;
    previousValuesHighTapPosition?: number;
    previousValuesTapPosition?: number;
    editData?: PhaseTapChangerStepData[];
    currentNode: CurrentTreeNode;
    isModification: boolean;
};

export default function PhaseTapChangerPaneSteps({
    disabled,
    previousValuesSteps,
    previousValuesLowTapPosition,
    previousValuesHighTapPosition,
    previousValuesTapPosition,
    editData,
    currentNode,
    isModification = false,
}: Readonly<PhaseTapChangerPaneStepsProps>) {
    const intl = useIntl();

    const COLUMNS_DEFINITIONS = useColumnDefinitions({ includeAlpha: true });
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

    const handleImportRow = (val: any) => {
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
            [STEPS_RATIO]: isNaN(parseFloat(val[intl.formatMessage({ id: 'Ratio' })]))
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
            createRuleAllowNegativeValues={true}
            importRuleMessageId="ImportDephasingRule"
            resetButtonMessageId="ResetRegulationRule"
            handleImportRow={handleImportRow}
            disabled={disabled}
            previousValuesSteps={previousValuesSteps}
            previousValuesLowTapPosition={previousValuesLowTapPosition}
            previousValuesHighTapPosition={previousValuesHighTapPosition}
            previousValuesTapPosition={previousValuesTapPosition}
            editData={editData}
            currentNode={currentNode}
            isModification={isModification}
        />
    );
}
