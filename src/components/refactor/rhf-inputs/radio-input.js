/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import FormControl from '@mui/material/FormControl';
import { FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useController } from 'react-hook-form';
import { FieldLabel } from '../../dialogs/inputs/hooks-helpers';

const RadioInput = ({ name, label, id, options, formProps }) => {
    const {
        field: { onChange, value },
    } = useController({ name });

    return (
        <FormControl>
            {label && (
                <FormLabel id={id ? id : label}>
                    <FormattedMessage id={label} />
                </FormLabel>
            )}
            <RadioGroup
                row
                aria-labelledby={id ? id : label}
                value={value}
                onChange={onChange}
                {...formProps}
            >
                {options.map((value) => (
                    <FormControlLabel
                        control={<Radio />}
                        value={value.id}
                        key={value.id}
                        label={<FieldLabel label={value.label} />}
                    />
                ))}
            </RadioGroup>
        </FormControl>
    );
};

export default RadioInput;
