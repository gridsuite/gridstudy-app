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
} from 'components/utils/field-constants';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import TapChangerSteps from '../tap-changer-steps';
import { parseIntData } from '../../../../dialog-utils';
import { DndColumn, DndColumnType } from '@gridsuite/commons-ui';
import { CurrentTreeNode } from 'components/graph/tree-node.type';
import { PHASE_TAP, TapChangerMapInfos } from '../../two-windings-transformer.types';
import { TwoWindingsTransformerModificationInfo } from 'services/network-modification-types';

export interface PhaseTapChangerPaneStepsProps {
    disabled?: boolean;
    previousValues?: TapChangerMapInfos;
    editData?: TwoWindingsTransformerModificationInfo;
    currentNode: CurrentTreeNode;
    isModification?: boolean;
}

const PhaseTapChangerPaneSteps = ({
    disabled,
    previousValues,
    editData,
    currentNode,
    isModification = false,
}: PhaseTapChangerPaneStepsProps) => {
    const intl = useIntl();

    const COLUMNS_DEFINITIONS = useMemo<DndColumn[]>(() => {
        return [
            {
                label: 'Tap',
                dataKey: STEPS_TAP,
                type: DndColumnType.TEXT as const,
            },
            {
                label: 'DeltaResistance',
                dataKey: STEPS_RESISTANCE,
                initialValue: 0,
                editable: true,
                type: DndColumnType.NUMERIC as const,
                clearable: false,
            },
            {
                label: 'DeltaReactance',
                dataKey: STEPS_REACTANCE,
                initialValue: 0,
                editable: true,
                type: DndColumnType.NUMERIC as const,
                clearable: false,
            },
            {
                label: 'DeltaConductance',
                dataKey: STEPS_CONDUCTANCE,
                initialValue: 0,
                editable: true,
                type: DndColumnType.NUMERIC as const,
                clearable: false,
            },
            {
                label: 'DeltaSusceptance',
                dataKey: STEPS_SUSCEPTANCE,
                initialValue: 0,
                editable: true,
                type: DndColumnType.NUMERIC as const,
                clearable: false,
            },
            {
                label: 'Ratio',
                dataKey: STEPS_RATIO,
                initialValue: 1,
                editable: true,
                type: DndColumnType.NUMERIC as const,
                clearable: false,
            },
            {
                label: 'Alpha',
                dataKey: STEPS_ALPHA,
                initialValue: 0,
                editable: true,
                type: DndColumnType.NUMERIC as const,
                clearable: false,
            },
        ].map((column) => ({
            ...column,
            label: intl
                .formatMessage({ id: column.label })
                .toLowerCase()
                .replace(/^\w/, (c) => c.toUpperCase()),
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

    const handleImportRow = (val: Record<string, string>): Record<string, string | number> => {
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
            previousValues={previousValues}
            editData={editData?.[PHASE_TAP_CHANGER] as Record<string, unknown> | undefined}
            currentNode={currentNode}
            isModification={isModification}
        />
    );
};

export default PhaseTapChangerPaneSteps;
