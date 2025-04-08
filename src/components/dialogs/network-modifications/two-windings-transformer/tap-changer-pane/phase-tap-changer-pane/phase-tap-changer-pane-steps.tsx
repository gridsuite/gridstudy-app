/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { PHASE_TAP_CHANGER, STEPS_ALPHA } from 'components/utils/field-constants';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import TapChangerSteps from '../tap-changer-steps';
import { PHASE_TAP } from '../../creation/two-windings-transformer-creation-dialog';
import { CurrentTreeNode } from '../../../../../graph/tree-node.type';
import { PhaseTapChangerStepData } from './phase-tap-changer.type';
import { useColumnDefinitions } from '../use-column-definitions';
import { getBaseCsvColumns, getBaseImportRowData } from '../tap-changer-pane-utils';
import { parseFloatData } from '../../../../dialog-utils';

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
        return [...getBaseCsvColumns(intl), intl.formatMessage({ id: 'ImportFileAlpha' })];
    }, [intl]);

    const handleImportRow = (val: any) => {
        return {
            ...getBaseImportRowData(val, intl),
            [STEPS_ALPHA]: parseFloatData(val[intl.formatMessage({ id: 'ImportFileAlpha' })], 1),
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
