/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import InputAdornment from '@mui/material/InputAdornment';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { CircularProgress, InputLabel, TextField, Tooltip, Button, Grid } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import FolderIcon from '@mui/icons-material/Folder';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';

import { styles } from '../../dialogs/dialog-utils';
import { useSnackMessage, OverflowableText, useDebounce, FieldLabel } from '@gridsuite/commons-ui';
import { TOOLTIP_DELAY } from '../../../utils/UIconstants';
import Chip from '@mui/material/Chip';
import { DirectoryItemSelector } from '@gridsuite/commons-ui';
import { useCSVReader } from 'react-papaparse';
import { isNodeExists } from '../../../services/study';
import { mergeSx } from '../functions';

export const useButtonWithTooltip = ({ handleClick, label, icon }) => {
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

const useSimpleTextValue = ({ defaultValue, adornment, error, triggerReset }) => {
    const [value, setValue] = useState(defaultValue);

    const handleChangeValue = useCallback((event) => {
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

    return [value, field];
};

const inputAdornment = (content) => {
    return {
        endAdornment: <InputAdornment position="end">{content}</InputAdornment>,
    };
};

export const useValidNodeName = ({ studyUuid, defaultValue, triggerReset }) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();
    const [isValidName, setIsValidName] = useState(false);
    const [error, setError] = useState();
    const [checking, setChecking] = useState(undefined);
    const [adornment, setAdornment] = useState();
    const [name, field] = useSimpleTextValue({
        defaultValue,
        adornment,
        error,
        triggerReset,
    });

    const validName = useCallback(
        (name) => {
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
            setAdornment(null);
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

    return [error, field, isValidName, name];
};

export const useCSVPicker = ({ label, header, resetTrigger, maxTapNumber, disabled = false }) => {
    const intl = useIntl();

    const { CSVReader } = useCSVReader();
    const [_acceptedFile, setAcceptedFile] = useState();
    const [fileError, setFileError] = useState();

    const equals = (a, b) => b.every((item) => a.includes(item));
    useEffect(() => {
        setAcceptedFile();
    }, [resetTrigger]);

    const field = useMemo(() => {
        return (
            <>
                <CSVReader
                    onUploadAccepted={(results, acceptedFile) => {
                        setAcceptedFile(acceptedFile);
                        if (results?.data.length > 0 && equals(header, results.data[0])) {
                            setFileError();
                        } else {
                            setFileError(
                                intl.formatMessage({
                                    id: 'InvalidRuleHeader',
                                })
                            );
                        }

                        if (results.data.length > maxTapNumber) {
                            setFileError(intl.formatMessage({ id: 'TapPositionValueError' }, { value: maxTapNumber }));
                        }
                    }}
                >
                    {({ getRootProps }) => (
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
    }, [_acceptedFile, disabled, header, intl, label, maxTapNumber]);

    return [_acceptedFile, field, fileError];
};
