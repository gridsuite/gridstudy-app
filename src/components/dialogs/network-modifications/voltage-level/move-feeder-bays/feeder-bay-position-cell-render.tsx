/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useController, useFormContext, useWatch } from 'react-hook-form';
import { IntegerInput } from '@gridsuite/commons-ui';
import { useMemo } from 'react';
import { FeederBaysFormInfos } from './move-voltage-level-feeder-bays.type';
import { Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE } from '../../../../utils/field-constants';

type FeederBayPositionCellRendererProps = {
    name: string;
    disabled: boolean;
    watchTable: FeederBaysFormInfos[];
};

export default function FeederBayPositionCellRenderer({
    name,
    disabled,
    watchTable,
}: Readonly<FeederBayPositionCellRendererProps>) {
    const { control } = useFormContext();
    const {
        field: { value },
    } = useController({ name, control });

    const allPositions = useWatch({
        control,
        name: MOVE_VOLTAGE_LEVEL_FEEDER_BAYS_TABLE,
    });

    const isDuplicate = useMemo(() => {
        if (value == null || !allPositions?.length) return false;
        const count = allPositions.filter(
            (item: FeederBaysFormInfos) => !item.isRemoved && item.connectionPosition === value
        ).length;
        return count > 1;
    }, [value, allPositions]);

    return (
        <div style={{ position: 'relative' }}>
            <IntegerInput
                name={name}
                formProps={{
                    disabled: disabled,
                    size: 'small',
                    variant: 'outlined',
                    helperText: isDuplicate && (
                        <Typography variant="caption">
                            <FormattedMessage id="DuplicatedPositionsWarning" />
                        </Typography>
                    ),
                    FormHelperTextProps: {
                        sx: {
                            ml: 'auto',
                            color: (theme) => (isDuplicate ? theme.palette.warning.main : theme.palette.text.secondary),
                        },
                    },
                    sx: {
                        padding: '1rem',
                        '& input': { textAlign: 'center' },
                    },
                }}
            />
        </div>
    );
}
