/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { FunctionComponent, useState } from 'react';
import { useController } from 'react-hook-form';
import { Select, SelectChangeEvent } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import { FormattedMessage } from 'react-intl';
import { CustomDialog } from '../../../utils/custom-dialog';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

interface SelectWithConfirmationInputProps {
    name: string;
    options: string[];
    onValidate: () => void;
    label: string;
}

const SelectWithConfirmationInput: FunctionComponent<
    SelectWithConfirmationInputProps
> = ({ name, options, onValidate, label }) => {
    const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
    const [newValue, setNewValue] = useState('');
    const {
        field: { value, onChange },
    } = useController({
        name,
    });

    const handleChange = (event: SelectChangeEvent) => {
        if (value) {
            setOpenConfirmationDialog(true);
            setNewValue(event.target.value);
        } else {
            onChange(event.target.value);
        }
    };

    const handleValidate = () => {
        onValidate && onValidate();
        onChange(newValue);
    };

    return (
        <>
            <FormControl fullWidth>
                <InputLabel size={'small'}>
                    <FormattedMessage id={label} />
                </InputLabel>
                <Select
                    value={value}
                    size={'small'}
                    fullWidth
                    onChange={handleChange}
                    label={<FormattedMessage id={label} />}
                >
                    {options.map((option, index) => (
                        <MenuItem key={index} value={option}>
                            <FormattedMessage id={option} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            {openConfirmationDialog && (
                <CustomDialog
                    content={
                        <FormattedMessage
                            id={'byFormulaChangeTypeConfirmation'}
                        />
                    }
                    onValidate={handleValidate}
                    validateButtonLabel="button.changeType"
                    onClose={() => setOpenConfirmationDialog(false)}
                />
            )}
        </>
    );
};

export default SelectWithConfirmationInput;
