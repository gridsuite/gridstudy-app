/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { IS_SHARED, SELECTED_MODIFICATIONS } from '../../utils/field-constants';
import { Box, FormHelperText, TextField, Typography } from '@mui/material';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { JSX } from 'react';

interface InsertNameCellProps {
    rowIndex: number;
}

const InsertNameCell = ({ rowIndex }: Readonly<InsertNameCellProps>): JSX.Element => {
    const { control } = useFormContext();
    const originalName: string = useWatch({
        name: `${SELECTED_MODIFICATIONS}.${rowIndex}.originalName`,
    });
    const isShared: boolean = useWatch({
        name: `${SELECTED_MODIFICATIONS}.${rowIndex}.${IS_SHARED}`,
    });

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {isShared ? (
                <Typography m={1} component="span" variant="body1">
                    {originalName}
                </Typography>
            ) : (
                <>
                    <Controller
                        name={`${SELECTED_MODIFICATIONS}.${rowIndex}.name`}
                        control={control}
                        render={({ field, fieldState }) => (
                            <TextField {...field} size="small" fullWidth error={!!fieldState.error} />
                        )}
                    />
                    <FormHelperText sx={{ px: 1, mt: 0.25 }}> {originalName}</FormHelperText>
                </>
            )}
        </Box>
    );
};

export default InsertNameCell;
