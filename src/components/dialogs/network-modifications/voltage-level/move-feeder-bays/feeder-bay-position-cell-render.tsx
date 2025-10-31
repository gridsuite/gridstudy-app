/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useController, useFormContext } from 'react-hook-form';
import { IntegerInput } from '@gridsuite/commons-ui';
import { useEffect, useState } from 'react';
import { FeederBaysFormInfos } from './move-voltage-level-feeder-bays.type';
import { Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';

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
    const [isDuplicate, setIsDuplicate] = useState(false);
    useEffect(() => {
        if (value != null && watchTable?.length) {
            const count = watchTable.filter((item) => !item.isRemoved && item?.connectionPosition === value).length;
            setIsDuplicate(count > 1);
        } else {
            setIsDuplicate(false);
        }
    }, [value, watchTable]);

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
                            <FormattedMessage id="DuplicatedPositionsError" />
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
