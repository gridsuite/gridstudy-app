/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, FormHelperText, Stack, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { APPLICABILITY } from '../../network/constants';
import { LimitsPropertiesStack } from './limits-properties-stack';
import { grey, red } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { useFormState } from 'react-hook-form';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { LIMITS, OLG_IS_DUPLICATE, OPERATIONAL_LIMITS_GROUPS } from '../../utils/field-constants';
import { LimitsFormSchema, OperationalLimitsGroupFormSchema } from './operational-limits-groups-types';

interface OperationalLimitsGroupTabLabelProps {
    operationalLimitsGroup: OperationalLimitsGroupFormSchema;
    showIconButton: boolean;
    editable: boolean;
    limitsPropertiesName: string;
    handleOpenMenu: (event: React.MouseEvent<HTMLButtonElement>, index: number) => void;
    index: number;
}

export function OperationalLimitsGroupTabLabel({
    operationalLimitsGroup,
    showIconButton,
    editable,
    limitsPropertiesName,
    handleOpenMenu,
    index,
}: Readonly<OperationalLimitsGroupTabLabelProps>) {
    const { errors } = useFormState<LimitsFormSchema>({ name: `${LIMITS}.${OPERATIONAL_LIMITS_GROUPS}` });

    const hasError =
        errors?.limits?.operationalLimitsGroups?.[index]?.currentLimits?.permanentLimit?.message ||
        errors?.limits?.operationalLimitsGroups?.[index]?.[OLG_IS_DUPLICATE]?.message;

    return (
        <Box
            sx={{ display: 'inline-flex', alignItems: 'center', boxSizing: 'inherit', justifyContent: 'space-between' }}
        >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Stack spacing={0}>
                    <Typography color={hasError ? red[500] : undefined}>{operationalLimitsGroup.name}</Typography>
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
                {hasError && (
                    <FormHelperText error>
                        <ErrorOutlineOutlinedIcon />
                    </FormHelperText>
                )}
                <LimitsPropertiesStack name={limitsPropertiesName} />
            </Stack>

            {showIconButton && (
                <IconButton
                    size="small"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleOpenMenu(e, index)}
                    disabled={editable}
                >
                    <MenuIcon fontSize="small" />
                </IconButton>
            )}
        </Box>
    );
}
