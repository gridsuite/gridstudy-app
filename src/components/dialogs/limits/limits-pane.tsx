/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { CURRENT_LIMITS_1, CURRENT_LIMITS_2, LIMITS } from 'components/utils/field-constants';
import { LimitsSidePane } from './limits-side-pane';
import { CurrentLimits } from '../../../services/network-modification-types';
import { tabStyles } from 'components/utils/tab-utils';
import { CurrentTreeNode } from '../../graph/tree-node.type';

export interface LimitsPaneProps {
    id?: string;
    currentNode?: CurrentTreeNode;
    equipmentToModify?: any;
    clearableFields?: boolean;
}

export function LimitsPane({
    id = LIMITS,
    currentNode,
    equipmentToModify,
    clearableFields,
}: Readonly<LimitsPaneProps>) {
    const renderSidePane = (id: string, formName: string, previousCurrentLimits: CurrentLimits | null) => {
        return (
            <LimitsSidePane
                key={id}
                limitsGroupFormName={formName}
                clearableFields={clearableFields}
                permanentCurrentLimitPreviousValue={previousCurrentLimits?.permanentLimit}
                temporaryLimitsPreviousValues={previousCurrentLimits?.temporaryLimits ?? []}
                currentNode={currentNode}
                onlySelectedLimitsGroup={true}
            />
        );
    };

    const getCurrentLimits1 = (equipmentToModify: any): CurrentLimits | null => {
        if (equipmentToModify?.currentLimits1) {
            return equipmentToModify.currentLimits1.find(
                (currentLimit: CurrentLimits) => currentLimit.id === equipmentToModify.selectedOperationalLimitsGroup1
            );
        }
        return null;
    };
    const getCurrentLimits2 = (equipmentToModify: any): CurrentLimits | null => {
        if (equipmentToModify?.currentLimits2) {
            return equipmentToModify.currentLimits2.find(
                (currentLimit: CurrentLimits) => currentLimit.id === equipmentToModify.selectedOperationalLimitsGroup2
            );
        }
        return null;
    };

    return (
        <Grid container spacing={2}>
            {/* limits */}
            <Grid container item xs={12} columns={8}>
                <Grid item xs={4} sx={tabStyles.parametersBox}>
                    {renderSidePane('leftPanel', `${id}.${CURRENT_LIMITS_1}`, getCurrentLimits1(equipmentToModify))}
                </Grid>
                <Grid item xs={4} sx={tabStyles.parametersBox}>
                    {renderSidePane('rightPanel', `${id}.${CURRENT_LIMITS_2}`, getCurrentLimits2(equipmentToModify))}
                </Grid>
            </Grid>
        </Grid>
    );
}
