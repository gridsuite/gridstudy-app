/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { IntlShape } from 'react-intl';
import React, { useMemo } from 'react';
import { STATUS } from '../../../utils/constants';
import { Lens } from '@mui/icons-material';

export const useIntlPredefinedParametersOptions = (intl: IntlShape) => {
    return useMemo(() => {
        return [
            {
                id: 'NOMINAL',
                label: intl.formatMessage({
                    id: 'nominalPredefinedParams',
                }),
            },
            {
                id: 'CONFIGURED',
                label: intl.formatMessage({
                    id: 'configuredPredefinedParams',
                }),
            },
        ];
    }, [intl]);
};
export const useIntlInitialVoltageProfileMode = (intl: IntlShape) => {
    return useMemo(() => {
        return {
            NOMINAL: {
                id: 'NOMINAL',
                label: intl.formatMessage({
                    id: 'nominalInitialVoltageProfileMode',
                }),
            },
            CONFIGURED: {
                id: 'CONFIGURED',
                label: intl.formatMessage({
                    id: 'configuredInitialVoltageProfileMode',
                }),
            },
        };
    }, [intl]);
};

export const useStatus = (status: STATUS, styles: any) => {
    return useMemo(() => {
        const color = status === STATUS.SUCCESS ? styles.succeed : styles.fail;
        return <Lens fontSize={'medium'} sx={color} />;
    }, [styles, status]);
};
