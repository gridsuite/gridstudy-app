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
} from 'components/utils/field-constants';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { DndColumn, DndColumnType, parseIntData } from '@gridsuite/commons-ui';
import { CurrentTreeNode } from 'components/graph/tree-node.type';
import TapChangerSteps from '../tap-changer-steps';
import { RATIO_TAP, TapChangerMapInfos } from '../../two-windings-transformer.types';

export interface RatioTapChangerPaneStepsProps {
    disabled?: boolean;
    previousValues?: TapChangerMapInfos;
    editData?: Record<string, unknown>;
    currentNode: CurrentTreeNode;
    isModification?: boolean;
}

const RatioTapChangerPaneSteps = ({
    disabled,
    previousValues,
    editData,
    currentNode,
    isModification = false,
}: RatioTapChangerPaneStepsProps) => {
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
            resetButtonMessageId="ResetRegulationRule"
            handleImportRow={handleImportRow}
            disabled={disabled}
            previousValues={previousValues}
            editData={editData?.[RATIO_TAP_CHANGER] as Record<string, unknown> | undefined}
            currentNode={currentNode}
            isModification={isModification}
        />
    );
};

export default RatioTapChangerPaneSteps;
