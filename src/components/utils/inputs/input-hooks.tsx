/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { TextField, Tooltip, Button, Grid, TextFieldProps } from '@mui/material';
import IconButton from '@mui/material/IconButton';

import { styles } from '../../dialogs/dialog-utils';
import { useCSVReader } from 'react-papaparse';
import { LANG_FRENCH, TOOLTIP_DELAY } from '@gridsuite/commons-ui';

interface UseButtonWithTooltipProps {
    handleClick: React.MouseEventHandler<HTMLButtonElement>;
    label: string;
    icon: ReactNode;
}

export const useButtonWithTooltip = ({ handleClick, label, icon }: UseButtonWithTooltipProps) => {
    return useMemo(() => {
        return (
            <Tooltip
                title={<FormattedMessage id={label} />}
                placement="top"
                arrow
                enterDelay={TOOLTIP_DELAY}
                enterNextDelay={TOOLTIP_DELAY}
                slotProps={{
                    popper: {
                        sx: {
                            '& .MuiTooltip-tooltip': styles.tooltip,
                        },
                    },
                }}
            >
                <IconButton style={{ padding: '2px' }} onClick={handleClick}>
                    {icon}
                </IconButton>
            </Tooltip>
        );
    }, [label, handleClick, icon]);
};

interface UseSimpleTextValueProps {
    defaultValue: string;
    adornment: TextFieldProps['InputProps'];
    error: boolean;
    triggerReset: boolean;
}

export const useSimpleTextValue = ({ defaultValue, adornment, error, triggerReset }: UseSimpleTextValueProps) => {
    const [value, setValue] = useState(defaultValue);

    const handleChangeValue = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValue(event.target.value);
    }, []);

    const field = useMemo(() => {
        return (
            <TextField
                value={value}
                onChange={handleChangeValue}
                {...(adornment && { InputProps: adornment })}
                error={error !== undefined}
                autoFocus={true}
                fullWidth={true}
            />
        );
    }, [value, handleChangeValue, adornment, error]);

    useEffect(() => setValue(defaultValue), [defaultValue, triggerReset]);

    return [value, field] as const;
};

interface UseCSVPickerProps {
    label: string;
    header: string[];
    resetTrigger: boolean;
    maxTapNumber?: number;
    disabled?: boolean;
    language: string;
}

export const useCSVPicker = ({
    label,
    header,
    resetTrigger,
    maxTapNumber,
    disabled = false,
    language,
}: UseCSVPickerProps) => {
    const intl = useIntl();

    const { CSVReader } = useCSVReader();
    const [_acceptedFile, setAcceptedFile] = useState<File | undefined>();
    const [fileError, setFileError] = useState<string | undefined>();

    const equals = (a: string[], b: string[]) => b.every((item) => a.includes(item));

    useEffect(() => {
        setAcceptedFile(undefined);
        setFileError(undefined);
    }, [resetTrigger]);

    // Expose a reset function to allow clearing the file manually
    const resetFile = useCallback(() => {
        setAcceptedFile(undefined);
        setFileError(undefined);
    }, []);

    const field = useMemo(() => {
        return (
            <>
                <CSVReader
                    config={{
                        delimiter: language === LANG_FRENCH ? ';' : ',',
                    }}
                    onUploadAccepted={(results: { data: string[][] }, acceptedFile: File) => {
                        setAcceptedFile(acceptedFile);
                        if (results?.data.length > 0 && equals(header, results.data[0])) {
                            setFileError(undefined);
                        } else {
                            setFileError(
                                intl.formatMessage({
                                    id: 'InvalidRuleHeader',
                                })
                            );
                        }

                        if (maxTapNumber && results.data.length > maxTapNumber) {
                            setFileError(intl.formatMessage({ id: 'TapPositionValueError' }, { value: maxTapNumber }));
                        }
                    }}
                >
                    {({ getRootProps }: { getRootProps: () => any }) => (
                        <Grid item>
                            <Button {...getRootProps()} variant={'contained'} disabled={disabled}>
                                <FormattedMessage id={label} />
                            </Button>
                            <span
                                style={{
                                    marginLeft: '10px',
                                    fontWeight: 'bold',
                                }}
                            >
                                {_acceptedFile
                                    ? _acceptedFile.name
                                    : intl.formatMessage({
                                          id: 'uploadMessage',
                                      })}
                            </span>
                        </Grid>
                    )}
                </CSVReader>
            </>
        );
    }, [_acceptedFile, disabled, header, intl, label, maxTapNumber, CSVReader, language]);

    return [_acceptedFile, field, fileError, setAcceptedFile, resetFile] as const;
};
