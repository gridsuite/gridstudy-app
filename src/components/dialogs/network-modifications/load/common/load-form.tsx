/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import LoadDialogTabs from './load-dialog-tabs';
import LoadDialogTabsContent, { LoadDialogTabsContentProps } from './load-dialog-tabs-content';
import { useEffect, useState } from 'react';
import { LoadDialogTab } from './load-utils';
import { useFormState } from 'react-hook-form';
import { ACTIVE_POWER_SETPOINT, CONNECTIVITY, REACTIVE_POWER_SET_POINT } from '../../../../utils/field-constants';
import { FieldConstants } from '@gridsuite/commons-ui';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';
import LoadDialogHeader, { LoadDialogHeaderProps } from './load-dialog-header';
import Grid from '@mui/material/Grid';

export interface LoadFormProps
    extends LoadDialogHeaderProps,
        Omit<LoadDialogTabsContentProps, 'tabIndex' | 'voltageLevelOptions' | 'isModification' | 'loadToModify'> {}

export function LoadForm({
    loadToModify,
    equipmentId,
    isModification,
    currentNode,
    studyUuid,
    currentRootNetworkUuid,
}: Readonly<LoadFormProps>) {
    const [tabIndexesWithError, setTabIndexesWithError] = useState<number[]>([]);
    const [tabIndex, setTabIndex] = useState<number>(LoadDialogTab.CONNECTIVITY_TAB);
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode?.id, currentRootNetworkUuid);

    const { errors } = useFormState();

    useEffect(() => {
        let tabsInError: number[] = [];
        if (errors?.[CONNECTIVITY] !== undefined) {
            tabsInError.push(LoadDialogTab.CONNECTIVITY_TAB);
        }
        if (
            errors?.[ACTIVE_POWER_SETPOINT] !== undefined ||
            errors?.[REACTIVE_POWER_SET_POINT] !== undefined ||
            errors?.[FieldConstants.ADDITIONAL_PROPERTIES] !== undefined
        ) {
            tabsInError.push(LoadDialogTab.CHARACTERISTICS_TAB);
        }
        if (tabsInError.length > 0) {
            setTabIndex((currentTabIndex) => {
                return tabsInError.includes(currentTabIndex) ? currentTabIndex : tabsInError[0];
            });
        }
        setTabIndexesWithError(tabsInError);
    }, [errors]);

    return (
        <Grid container direction="column" spacing={2}>
            <Grid item>
                <LoadDialogHeader
                    loadToModify={loadToModify}
                    equipmentId={equipmentId}
                    isModification={isModification}
                />
            </Grid>
            <Grid item>
                <LoadDialogTabs
                    tabIndex={tabIndex}
                    tabIndexesWithError={tabIndexesWithError}
                    setTabIndex={setTabIndex}
                    isModification={isModification}
                />
            </Grid>
            <Grid item>
                <LoadDialogTabsContent
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    tabIndex={tabIndex}
                    voltageLevelOptions={voltageLevelOptions}
                    loadToModify={loadToModify}
                    isModification={isModification}
                />
            </Grid>
        </Grid>
    );
}
