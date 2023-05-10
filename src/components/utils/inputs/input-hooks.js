/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import InputAdornment from '@mui/material/InputAdornment';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { validateField } from '../validation-functions';
import {
    CircularProgress,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Tooltip,
    Button,
    Grid,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import FolderIcon from '@mui/icons-material/Folder';
import TextFieldWithAdornment from '../text-field-with-adornment';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import {
    func_identity,
    toFloatValue,
    toIntValue,
    useStyles,
} from '../../dialogs/dialogUtils';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import { useSnackMessage, OverflowableText } from '@gridsuite/commons-ui';
import { isNodeExists } from '../../../utils/rest-api';
import { TOOLTIP_DELAY } from '../../../utils/UIconstants';
import {
    FieldLabel,
    genHelperError,
    genHelperPreviousValue,
} from './hooks-helpers';
import { useAutocompleteField } from './use-autocomplete-field';
import Chip from '@mui/material/Chip';
import DirectoryItemSelector from '../../directory-item-selector';
import { useCSVReader } from 'react-papaparse';
import clsx from 'clsx';
import { debounce } from '@mui/material/utils';

export const useInputForm = () => {
    const validationMap = useRef(new Map());
    const [toggleClear, setToggleClear] = useState(false);
    const [hasChanged, setHasChanged] = useState(false);
    const validate = useCallback(() => {
        // Check if error list contains an error
        return Array.from(validationMap.current.values())
            .map((e) => e())
            .every((res) => res);
    }, []);

    const addValidation = useCallback((id, validate) => {
        validationMap.current.set(id, validate);
    }, []);

    const removeValidation = useCallback((id) => {
        validationMap.current.delete(id);
    }, []);

    const clear = useCallback(() => {
        setToggleClear((oldValue) => !oldValue);
    }, []);
    const reset = useCallback((label, validate) => {
        validationMap.current = new Map();
    }, []);

    return useMemo(() => {
        return {
            toggleClear,
            clear,
            validate,
            addValidation,
            reset,
            hasChanged,
            setHasChanged,
            removeValidation,
        };
    }, [
        toggleClear,
        clear,
        validate,
        addValidation,
        reset,
        hasChanged,
        removeValidation,
    ]);
};

export const useTextValue = ({
    label,
    id,
    defaultValue = '',
    validation = {},
    adornment,
    transformValue = func_identity,
    acceptValue,
    inputForm,
    formProps,
    errorMsg,
    previousValue,
    clearable,
    customAdornment,
}) => {
    const [value, setValue] = useState(defaultValue);
    const [error, setError] = useState();

    const validationRef = useRef();
    const classes = useStyles();

    validationRef.current = validation;

    useEffect(() => {
        function validate() {
            const res = validateField(
                value,
                validationRef.current,
                formProps?.disabled
            );
            setError(res?.errorMsgId);
            return !res.error;
        }

        inputForm.addValidation(id ? id : label, validate);
    }, [label, inputForm, value, id, validation, formProps?.disabled]);

    const handleChangeValue = useCallback(
        (event) => {
            if (acceptValue === undefined || acceptValue(event.target.value)) {
                setValue(transformValue(event.target.value));
            }
            inputForm.setHasChanged(true);
        },
        [acceptValue, inputForm, transformValue]
    );

    const handleClearValue = useCallback(() => {
        setValue('');
    }, []);

    const field = useMemo(() => {
        const Field = adornment ? TextFieldWithAdornment : TextField;
        return (
            <Field
                key={id ? id : label}
                size="small"
                fullWidth
                id={id ? id : label}
                label={FieldLabel({
                    label,
                    optional:
                        validation.isFieldRequired === false &&
                        !formProps?.disabled,
                })}
                {...(adornment && {
                    adornmentPosition: adornment.position,
                    adornmentText: adornment?.text,
                })}
                value={'' + value} // handle numerical value
                onChange={handleChangeValue}
                FormHelperTextProps={{
                    className: classes.helperText,
                }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            {clearable &&
                                value !== undefined &&
                                value !== '' && (
                                    <IconButton onClick={handleClearValue}>
                                        <ClearIcon />
                                    </IconButton>
                                )}
                            {customAdornment && { ...customAdornment }}
                        </InputAdornment>
                    ),
                }}
                {...(clearable &&
                    adornment && { handleClearValue: handleClearValue })}
                {...genHelperPreviousValue(previousValue, adornment)}
                {...genHelperError(error, errorMsg)}
                {...formProps}
            />
        );
    }, [
        adornment,
        id,
        label,
        validation.isFieldRequired,
        formProps,
        value,
        handleChangeValue,
        classes.helperText,
        clearable,
        handleClearValue,
        customAdornment,
        previousValue,
        error,
        errorMsg,
    ]);

    useEffect(
        () => setValue(defaultValue),
        [defaultValue, inputForm.toggleClear]
    );
    return [value, field];
};

export const useIntegerValue = ({
    transformValue = toIntValue,
    validation,
    customAdornment,
    ...props
}) => {
    return useTextValue({
        ...props,
        transformValue: transformValue,
        validation: { ...validation, isFieldNumeric: true },
        customAdornment,
    });
};

export const isFloatNumber = (val) => {
    return /^-?[0-9]*[.,]?[0-9]*$/.test(val);
};

export const useDoubleValue = ({
    transformValue = toFloatValue,
    validation,
    ...props
}) => {
    return useTextValue({
        ...props,
        acceptValue: isFloatNumber,
        transformValue: transformValue,
        validation: { ...validation, isFieldNumeric: true },
    });
};

export const useButtonWithTooltip = ({ handleClick, label }) => {
    const classes = useStyles();

    return useMemo(() => {
        return (
            <Tooltip
                title={<FormattedMessage id={label} />}
                placement="top"
                arrow
                enterDelay={TOOLTIP_DELAY}
                enterNextDelay={TOOLTIP_DELAY}
                classes={{ tooltip: classes.tooltip }}
            >
                <IconButton style={{ padding: '2px' }} onClick={handleClick}>
                    <FindInPageIcon />
                </IconButton>
            </Tooltip>
        );
    }, [label, handleClick, classes.tooltip]);
};

export const useOptionalEnumValue = (props) => {
    const intl = useIntl();

    const getEnumTranslation = useCallback(
        (enumValue) => {
            // translate the label of enumValue
            const enumTranslation = props.enumObjects
                .filter((enumObject) => enumObject.id === enumValue)
                .map((enumObject) =>
                    intl.formatMessage({ id: enumObject.label })
                );
            return enumTranslation.length === 1
                ? enumTranslation[0]
                : enumValue;
        },
        [intl, props.enumObjects]
    );

    // because we want to have the clear icon to possibly reset the optional enum value to null,
    // we use an Autocomplete without the ability to enter some letters in the text field (readonly then).
    return useAutocompleteField({
        values: props.enumObjects.map((enumObject) => enumObject.id),
        selectedValue: props.defaultValue,
        defaultValue: props.defaultValue,
        previousValue: props.previousValue,
        getLabel: getEnumTranslation,
        readOnlyTextField: true,
        ...props,
    });
};

const getObjectId = (e) => e.id;
const getLabel = (e) => e.label;

export const useEnumValue = ({
    label,
    defaultValue,
    previousValue,
    validation = {},
    inputForm,
    formProps,
    enumValues,
    doTranslation = true,
    getId = getObjectId,
    getEnumLabel = getLabel,
}) => {
    const [value, setValue] = useState(defaultValue);
    const [error, setError] = useState();

    useEffect(() => {
        function validate() {
            const res = validateField(value, validation);
            setError(res?.errorMsgId);
            return !res.error;
        }

        inputForm.addValidation(label, validate);
    }, [label, validation, inputForm, value]);

    const handleChangeValue = useCallback(
        (event) => {
            setValue(event.target.value);
            inputForm.setHasChanged(true);
        },
        [inputForm]
    );

    const field = useMemo(() => {
        return (
            <FormControl fullWidth size="small" error={!!error}>
                {/*This InputLabel is necessary in order to display
                            the label describing the content of the Select*/}
                <InputLabel id="enum-type-label" {...formProps}>
                    <FieldLabel
                        label={label}
                        optional={validation.isFieldRequired === false}
                    />
                </InputLabel>
                <Select
                    label={label}
                    id={label}
                    value={value || ''}
                    onChange={handleChangeValue}
                    fullWidth
                    {...formProps}
                >
                    {enumValues.map((e, index) => (
                        <MenuItem value={getId(e)} key={e.id + '_' + index}>
                            <em>
                                {doTranslation && (
                                    <FormattedMessage id={getEnumLabel(e)} />
                                )}
                                {!doTranslation && getEnumLabel(e)}
                            </em>
                        </MenuItem>
                    ))}
                </Select>
                {previousValue && (
                    <FormHelperText>
                        {doTranslation ? (
                            <FormattedMessage
                                id={getEnumLabel(previousValue)}
                            />
                        ) : (
                            getEnumLabel(previousValue)
                        )}
                    </FormHelperText>
                )}
                {error && (
                    <FormHelperText>
                        <FormattedMessage id={error} />
                    </FormHelperText>
                )}
            </FormControl>
        );
    }, [
        error,
        formProps,
        label,
        validation.isFieldRequired,
        value,
        handleChangeValue,
        enumValues,
        previousValue,
        getId,
        doTranslation,
        getEnumLabel,
    ]);

    useEffect(() => {
        setValue('');
    }, [inputForm.toggleClear]);

    useEffect(() => {
        setValue(defaultValue || '');
    }, [defaultValue]);

    return [value, field];
};
export const useSimpleTextValue = ({
    defaultValue,
    adornment,
    error,
    triggerReset,
}) => {
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
    const debouncedValidName = useMemo(
        () => debounce(validName, 700),
        [validName]
    );

    useEffect(() => {
        if (checking === undefined) {
            setAdornment(null);
        }
        if (checking) {
            setAdornment(inputAdornment(<CircularProgress size="1rem" />));
        } else if (!isValidName) {
            setAdornment(undefined);
        } else {
            setAdornment(
                inputAdornment(<CheckIcon style={{ color: 'green' }} />)
            );
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
    }, [studyUuid, name, triggerReset]);

    return [error, field, isValidName, name];
};

export const useDirectoryElements = ({
    label,
    initialValues,
    elementType,
    equipmentTypes,
    titleId,
    elementClassName,
    required = false,
    itemFilter = undefined,
    errorMsg = undefined,
    inputForm = undefined,
}) => {
    const classes = useStyles();
    const [values, setValues] = useState(initialValues);
    const [directoryItemSelectorOpen, setDirectoryItemSelectorOpen] =
        useState(false);
    const intl = useIntl();
    const { snackError } = useSnackMessage();
    const refInitialValues = useRef();
    refInitialValues.current = initialValues;
    const types = useMemo(() => [elementType], [elementType]);

    useEffect(() => {
        if (refInitialValues.current) {
            setValues(refInitialValues.current);
        }
    }, []);

    const handleDelete = useCallback(
        (item, index) => {
            let arr = [...values];
            arr.splice(index, 1);
            inputForm?.setHasChanged(arr.length > 0);
            setValues(arr);
        },
        [inputForm, values]
    );

    const addElements = useCallback(
        (elements) => {
            let elementsToAdd = [];
            elements.forEach((element) => {
                const { icon, children, ...elementRest } = element;
                // check if element is already present
                if (values.find((v) => v.id === elementRest.id) !== undefined) {
                    snackError({
                        messageTxt: '',
                        headerId: 'ElementAlreadyUsed',
                    });
                } else {
                    elementsToAdd.push(elementRest);
                }
            });
            if (elementsToAdd.length > 0) {
                inputForm?.setHasChanged(true);
                setValues(values.concat(elementsToAdd));
            }

            setDirectoryItemSelectorOpen(false);
        },
        [values, snackError, inputForm]
    );

    const field = useMemo(() => {
        return (
            <>
                <FormControl
                    className={clsx(classes.formDirectoryElements1, {
                        [classes.formDirectoryElementsError]: errorMsg,
                    })}
                    error={!!errorMsg}
                    aria-errormessage={errorMsg}
                >
                    {values?.length === 0 && (
                        <Grid container>
                            <Grid item>
                                <InputLabel
                                    id="elements"
                                    className={classes.labelDirectoryElements}
                                    error={!!errorMsg}
                                >
                                    <FieldLabel
                                        label={label}
                                        optional={false}
                                    />
                                </InputLabel>
                            </Grid>
                        </Grid>
                    )}
                    {values?.length > 0 && (
                        <FormControl className={classes.formDirectoryElements2}>
                            <div>
                                {values.map((item, index) => (
                                    <Chip
                                        className={elementClassName}
                                        key={label + '_' + index}
                                        size="small"
                                        onDelete={() =>
                                            handleDelete(item, index)
                                        }
                                        label={
                                            <OverflowableText
                                                text={item.name}
                                                style={{ width: '100%' }}
                                            />
                                        }
                                    />
                                ))}
                            </div>
                        </FormControl>
                    )}
                    <Grid item xs>
                        <Grid container direction="row-reverse">
                            <IconButton
                                className={classes.addDirectoryElements}
                                size={'small'}
                                onClick={() =>
                                    setDirectoryItemSelectorOpen(true)
                                }
                            >
                                <FolderIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                </FormControl>
                <DirectoryItemSelector
                    open={directoryItemSelectorOpen}
                    onClose={addElements}
                    types={types}
                    equipmentTypes={equipmentTypes}
                    title={intl.formatMessage({ id: titleId })}
                    itemFilter={itemFilter}
                />
            </>
        );
    }, [
        classes.formDirectoryElementsError,
        classes.formDirectoryElements1,
        classes.labelDirectoryElements,
        classes.formDirectoryElements2,
        classes.addDirectoryElements,
        errorMsg,
        values,
        label,
        directoryItemSelectorOpen,
        addElements,
        equipmentTypes,
        intl,
        titleId,
        itemFilter,
        elementClassName,
        handleDelete,
        types,
    ]);
    return [values, field];
};

export const useCSVPicker = ({ label, header, resetTrigger, maxTapNumber }) => {
    const intl = useIntl();

    const { CSVReader } = useCSVReader();
    const [_acceptedFile, setAcceptedFile] = useState();
    const [fileError, setFileError] = useState();

    const equals = (a, b) =>
        a.length === b.length && a.every((v, i) => v === b[i]);

    useEffect(() => {
        setAcceptedFile();
    }, [resetTrigger]);

    const field = useMemo(() => {
        return (
            <>
                <CSVReader
                    onUploadAccepted={(results, acceptedFile) => {
                        setAcceptedFile(acceptedFile);
                        if (
                            results?.data.length > 0 &&
                            equals(header, results.data[0])
                        ) {
                            setFileError();
                        } else {
                            setFileError(
                                intl.formatMessage({
                                    id: 'InvalidRuleHeader',
                                })
                            );
                        }

                        if (results.data.length > maxTapNumber) {
                            setFileError(
                                intl.formatMessage(
                                    { id: 'TapPositionValueError' },
                                    { value: maxTapNumber }
                                )
                            );
                        }
                    }}
                >
                    {({ getRootProps, acceptedFile }) => (
                        <Grid item>
                            <Button {...getRootProps()} variant={'contained'}>
                                <FormattedMessage id={label} />
                            </Button>
                            <span
                                style={{
                                    marginLeft: '10px',
                                    fontWeight: 'bold',
                                }}
                            >
                                {acceptedFile
                                    ? acceptedFile.name
                                    : intl.formatMessage({
                                          id: 'uploadMessage',
                                      })}
                            </span>
                        </Grid>
                    )}
                </CSVReader>
            </>
        );
    }, [header, intl, label, maxTapNumber]);

    return [_acceptedFile, field, fileError];
};
