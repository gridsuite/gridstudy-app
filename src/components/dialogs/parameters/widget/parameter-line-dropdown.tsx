/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Grid, MenuItem, Select } from '@mui/material';
import { SelectInputProps } from '@mui/material/Select/SelectInput';
import { FormattedMessage } from 'react-intl';
import { useMemo } from 'react';
import { UseParameterStateParamName, useParameterState } from '../use-parameters-state';
import { styles } from '../parameters-style';

type DropDownParameterLineProps = {
    readonly paramNameId: UseParameterStateParamName;
    values: Record<string, string>;
    defaultValueIfNull?: boolean;
    disabled?: boolean;
    labelTitle?: string;
    labelValue?: string;
    onPreChange?: SelectInputProps<any>['onChange'];
};
const ParameterLineDropdown = ({
    defaultValueIfNull,
    labelTitle,
    labelValue,
    onPreChange,
    paramNameId,
    values,
    disabled = false,
}: DropDownParameterLineProps) => {
    const [parameterValue, handleChangeParameterValue] = useParameterState(paramNameId);

    const currentValue = useMemo(() => {
        // To avoid warning setting a value without options in the Select
        if (Object.entries<string>(values).length === 0) {
            return '';
        }
        if (defaultValueIfNull && !parameterValue) {
            return Object.entries<string>(values)[0];
        }
        return parameterValue;
    }, [defaultValueIfNull, parameterValue, values]);

    return (
        <>
            <Grid item xs={5} sx={styles.parameterName}>
                <FormattedMessage id={labelTitle} />
            </Grid>
            <Grid item container xs={4} sx={styles.controlItem}>
                <Select
                    labelId={labelValue}
                    value={currentValue}
                    onChange={(event, child) => {
                        onPreChange?.(event, child);
                        handleChangeParameterValue(event.target.value);
                    }}
                    size="small"
                    disabled={disabled}
                >
                    {Object.entries<string>(values).map(([key, value]) => (
                        <MenuItem key={key} value={key}>
                            <FormattedMessage id={value} />
                        </MenuItem>
                    ))}
                </Select>
            </Grid>
        </>
    );
};

export default ParameterLineDropdown;
