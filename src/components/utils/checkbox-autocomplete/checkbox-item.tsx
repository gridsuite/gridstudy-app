/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HTMLAttributes } from 'react';
import { Checkbox, Typography } from '@mui/material';
import { OverflowableText } from '@gridsuite/commons-ui';

// component CheckboxItem is extracted and customized from renderRow in the MUI example
// in order to reuse also in Autocomplete without virtualization
// https://mui.com/material-ui/react-autocomplete/#virtualization

const styles = {
    checkbox: {
        marginRight: 8,
    },
};

interface CheckboxItemProps<Value> extends HTMLAttributes<HTMLElement> {
    option: Value;
    selected: boolean;
    getOptionLabel: (option: Value) => string;
}

const CheckboxItem = <Value,>({ option, selected, getOptionLabel, ...otherProps }: CheckboxItemProps<Value>) => {
    return (
        <Typography component="li" {...otherProps} noWrap>
            <Checkbox style={styles.checkbox} checked={selected} />
            <OverflowableText text={getOptionLabel(option)} />
        </Typography>
    );
};

export default CheckboxItem;
