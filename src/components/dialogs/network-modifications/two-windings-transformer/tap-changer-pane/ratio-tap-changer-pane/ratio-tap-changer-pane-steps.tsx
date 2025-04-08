/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { RATIO_TAP_CHANGER, STEPS_RATIO } from 'components/utils/field-constants';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import TapChangerSteps from '../tap-changer-steps';
import { RATIO_TAP } from '../../creation/two-windings-transformer-creation-dialog';
import { CurrentTreeNode } from '../../../../../graph/tree-node.type';
import { RatioTapChangerStepData } from './ratio-tap-changer.type';
import { useColumnDefinitions } from '../use-column-definitions';
import { getBaseCsvColumns, getBaseImportRowData } from '../tap-changer-pane-utils';

export type RatioTapChangerPaneStepsProps = {
    disabled: boolean;
    previousValuesSteps?: RatioTapChangerStepData[];
    previousValuesLowTapPosition?: number;
    previousValuesHighTapPosition?: number;
    previousValuesTapPosition?: number;
    editData?: RatioTapChangerStepData[];
    currentNode: CurrentTreeNode;
    isModification: boolean;
};

export default function RatioTapChangerPaneSteps({
    disabled,
    previousValuesSteps,
    previousValuesLowTapPosition,
    previousValuesHighTapPosition,
    previousValuesTapPosition,
    editData,
    currentNode,
    isModification = false,
}: Readonly<RatioTapChangerPaneStepsProps>) {
    const intl = useIntl();

    const COLUMNS_DEFINITIONS = useColumnDefinitions();

    const csvColumns = useMemo(() => {
        return getBaseCsvColumns(intl);
    }, [intl]);

    const handleImportRow = (val: any) => {
        return getBaseImportRowData(val, intl);
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
