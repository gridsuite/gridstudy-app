/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useFormContext, useWatch } from 'react-hook-form';
import React, { ChangeEvent, useCallback } from 'react';
import { ParameterSwitch } from '../widget/parameter-switch';
import {
    GENERAL,
    GENERAL_APPLY_MODIFICATIONS,
} from './voltage-init-parameters-form';
import Alert from '@mui/material/Alert';
import { styles } from '../parameters';
import { FormattedMessage } from 'react-intl';

export const GeneralParameters = () => {
    const { setValue } = useFormContext();

    const applyModificationsWatched = useWatch({
        name: `${GENERAL}.${GENERAL_APPLY_MODIFICATIONS}`,
    });

    const setApplyModificationsValue = useCallback(
        (_: ChangeEvent, checked: boolean) => {
            setValue(`${GENERAL}.${GENERAL_APPLY_MODIFICATIONS}`, checked, {
                shouldDirty: true,
            });
        },
        [setValue]
    );

    return (
        <>
            <Alert
                sx={styles.adjustExistingLimitsInfo}
                severity="info"
                variant="outlined"
            >
                <FormattedMessage id="VoltageInitParametersGeneralSaveInfo" />
            </Alert>
            <ParameterSwitch
                value={applyModificationsWatched}
                label={'VoltageInitParametersGeneralApplyModificationsLabel'}
                onChange={setApplyModificationsValue}
            />
        </>
    );
};
