/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Stack, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { APPLICABILITY } from '../../network/constants';
import { OperationalLimitsGroupFormInfos } from '../network-modifications/line/modification/line-modification-type';
import { LimitsPropertiesStack } from './limits-properties-stack';
import { grey } from '@mui/material/colors';

interface OperationalLimitsGroupTabLabelProps {
    operationalLimitsGroup: OperationalLimitsGroupFormInfos;
    limitsPropertiesName: string;
}

export function OperationalLimitsGroupTabLabel({
    operationalLimitsGroup,
    limitsPropertiesName,
}: Readonly<OperationalLimitsGroupTabLabelProps>) {
    return (
        <Box
            sx={{ display: 'inline-flex', alignItems: 'center', boxSizing: 'inherit', justifyContent: 'space-between' }}
        >
            <Stack direction="row" spacing={1}>
                <Stack spacing={0}>
                    {operationalLimitsGroup.name}
                    {operationalLimitsGroup?.applicability ? (
                        <Typography noWrap align="left" color={grey[500]}>
                            <FormattedMessage
                                id={
                                    Object.values(APPLICABILITY).find(
                                        (item) => item.id === operationalLimitsGroup.applicability
                                    )?.label
                                }
                            />
                        </Typography>
                    ) : (
                        ''
                    )}
                </Stack>
                <LimitsPropertiesStack name={limitsPropertiesName} />
            </Stack>
        </Box>
    );
}
