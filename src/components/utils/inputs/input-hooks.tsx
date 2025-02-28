/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import InputAdornment from '@mui/material/InputAdornment';
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { CircularProgress, TextField, Tooltip, Button, Grid, TextFieldProps } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import IconButton from '@mui/material/IconButton';

import { styles } from '../../dialogs/dialog-utils';
import { useSnackMessage, useDebounce } from '@gridsuite/commons-ui';
import { TOOLTIP_DELAY } from '../../../utils/UIconstants';
import { useCSVReader } from 'react-papaparse';
import { isNodeExists } from '../../../services/study';
import { UUID } from 'crypto';

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

const inputAdornment = (content: ReactNode) => {
    return {
        endAdornment: <InputAdornment position="end">{content}</InputAdornment>,
    };
};

interface UseValidNodeName {
    studyUuid: UUID | null;
    defaultValue: string;
    triggerReset: boolean;
}

export const useValidNodeName = ({ studyUuid, defaultValue, triggerReset }: UseValidNodeName) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();
    const [isValidName, setIsValidName] = useState(false);
    const [error, setError] = useState<string>();
    const [checking, setChecking] = useState<boolean | undefined>(undefined);
    const [adornment, setAdornment] = useState<TextFieldProps['InputProps']>();
    const [name, field] = useSimpleTextValue({
        defaultValue,
        adornment,
        error: !!error,
        triggerReset,
    });

    const validName = useCallback(
        (name: string) => {
            if (!studyUuid) {
                return;
            }
            if (name !== defaultValue) {
                isNodeExists(studyUuid, name)
                    .then((response) => {
                        if (response.status === 200) {
                            setError(
                                intl.formatMessage({
                                    id: 'nodeNameAlreadyUsed',
                                })
                            );
                            setIsValidName(false);
                        } else {
                            setIsValidName(true);
                        }
                        setChecking(false);
                    })
                    .catch((error) => {
                        snackError({
                            messageTxt: error.message,
                            headerId: 'NodeUpdateError',
                        });
                    });
            } else {
                setChecking(undefined);
            }
        },
        [studyUuid, intl, defaultValue, snackError]
    );
    const debouncedValidName = useDebounce(validName, 700);

    useEffect(() => {
        if (checking === undefined) {
            setAdornment(undefined);
        }
        if (checking) {
            setAdornment(inputAdornment(<CircularProgress size="1rem" />));
        } else if (!isValidName) {
            setAdornment(undefined);
        } else {
            setAdornment(inputAdornment(<CheckIcon style={{ color: 'green' }} />));
        }
    }, [checking, isValidName]);

    useEffect(() => {
        if (name === '') {
            return;
        } // initial render

        setIsValidName(false);
        setAdornment(undefined);
        setChecking(true);
        setError(undefined);
        debouncedValidName(name);
    }, [studyUuid, name, debouncedValidName, triggerReset]);

    return [error, field, isValidName, name] as const;
};

interface UseCSVPickerProps {
    label: string;
    header: string[];
    resetTrigger: boolean;
    maxTapNumber?: number;
    disabled?: boolean;
}

export const useCSVPicker = ({ label, header, resetTrigger, maxTapNumber, disabled = false }: UseCSVPickerProps) => {
    const intl = useIntl();

    const { CSVReader } = useCSVReader();
    const [_acceptedFile, setAcceptedFile] = useState<File | undefined>();
    const [fileError, setFileError] = useState<string | undefined>();

    const equals = (a: string[], b: string[]) => b.every((item) => a.includes(item));
    useEffect(() => {
        setAcceptedFile(undefined);
    }, [resetTrigger]);

    const field = useMemo(() => {
        return (
            <>
                <CSVReader
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
    }, [_acceptedFile, disabled, header, intl, label, maxTapNumber, CSVReader]);

    return [_acceptedFile, field, fileError] as const;
};
