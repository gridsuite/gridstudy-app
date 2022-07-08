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
import { validateField } from '../util/validation-functions';
import {
    Autocomplete,
    CircularProgress,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Tooltip,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import TextFieldWithAdornment from '../util/text-field-with-adornment';
import ConnectivityEdition, {
    makeRefreshBusOrBusbarSectionsCallback,
} from './connectivity-edition';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import { createFilterOptions } from '@mui/material/useAutocomplete';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/ControlPoint';
import {
    func_identity,
    toFloatValue,
    toIntValue,
    useStyles,
} from './dialogUtils';
import { getComputedLanguage } from '../../utils/language';
import { useParameterState } from '../parameters';
import { PARAM_LANGUAGE } from '../../utils/config-params';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import { useSelector } from 'react-redux';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';
import { useSnackbar } from 'notistack';
import { isNodeExists } from '../../utils/rest-api';
import { TOOLTIP_DELAY } from '../../utils/UIconstants';
export const useInputForm = () => {
    const validationMap = useRef(new Map());
    const [toggleClear, setToggleClear] = useState(false);
    const validate = useCallback(() => {
        // Check if error list contains an error
        return Array.from(validationMap.current.values())
            .map((e) => e())
            .every((res) => res);
    }, []);
    const addValidation = useCallback((id, validate) => {
        validationMap.current.set(id, validate);
    }, []);

    const clear = useCallback(() => {
        setToggleClear((oldValue) => !oldValue);
    }, []);
    const reset = useCallback((label, validate) => {
        validationMap.current = new Map();
    }, []);
    return {
        toggleClear,
        clear,
        validate,
        addValidation,
        reset,
    };
};
function genHelperPreviousValue(previousValue, adornment) {
    return {
        ...((previousValue || previousValue === 0) && {
            error: false,
            helperText:
                previousValue + (adornment ? ' ' + adornment?.text : ''),
        }),
    };
}

function genHelperError(...errors) {
    const inError = errors.find((e) => e);
    if (inError)
        return {
            error: true,
            helperText: <FormattedMessage id={inError} />,
        };
    return {};
}

const FieldLabel = ({ label, optional }) => {
    return (
        <>
            <FormattedMessage id={label} />
            {optional && <FormattedMessage id="Optional" />}
        </>
    );
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
}) => {
    const [value, setValue] = useState(defaultValue);
    const [error, setError] = useState();

    const validationRef = useRef();
    const classes = useStyles();

    validationRef.current = validation;

    useEffect(() => {
        function validate() {
            const res = validateField(value, validationRef.current);
            setError(res?.errorMsgId);
            return !res.error;
        }
        inputForm.addValidation(id ? id : label, validate);
    }, [label, inputForm, value, id, validation]);

    const handleChangeValue = useCallback(
        (event) => {
            if (acceptValue === undefined || acceptValue(event.target.value))
                setValue(transformValue(event.target.value));
        },
        [acceptValue, transformValue]
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
                InputProps={
                    clearable && value
                        ? {
                              endAdornment: (
                                  <InputAdornment position="end">
                                      <IconButton onClick={handleClearValue}>
                                          <ClearIcon />
                                      </IconButton>
                                  </InputAdornment>
                              ),
                          }
                        : {}
                }
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
        value,
        previousValue,
        handleChangeValue,
        classes.helperText,
        error,
        errorMsg,
        formProps,
        clearable,
        handleClearValue,
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
    ...props
}) => {
    return useTextValue({
        ...props,
        transformValue: transformValue,
        validation: { ...validation, isFieldNumeric: true },
    });
};

function isFloatNumber(val) {
    return /^-?[0-9]*[.,]?[0-9]*$/.test(val);
}

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

export const useConnectivityValue = ({
    label,
    id,
    validation = {
        isFieldRequired: true,
    },
    disabled = false,
    inputForm,
    voltageLevelOptions,
    currentNodeUuid,
    direction = 'row',
    voltageLevelIdDefaultValue,
    voltageLevelPreviousValue,
    busOrBusbarSectionIdDefaultValue,
    busOrBusbarSectionPreviousValue,
}) => {
    const [connectivity, setConnectivity] = useState({
        voltageLevel: null,
        busOrBusbarSection: null,
    });
    const [errorVoltageLevel, setErrorVoltageLevel] = useState();
    const [errorBusBarSection, setErrorBusBarSection] = useState();
    const intl = useIntl();
    const studyUuid = useSelector((state) => state.studyUuid);

    useEffect(() => {
        setConnectivity({
            voltageLevel: null,
            busOrBusbarSection: null,
        });
    }, [inputForm.toggleClear]);

    useEffect(() => {
        setConnectivity({
            voltageLevel: voltageLevelIdDefaultValue
                ? voltageLevelOptions.find(
                      (value) => value.id === voltageLevelIdDefaultValue
                  )
                : null,
            busOrBusbarSection: busOrBusbarSectionIdDefaultValue
                ? {
                      id: busOrBusbarSectionIdDefaultValue,
                  }
                : null,
        });
    }, [
        voltageLevelOptions,
        busOrBusbarSectionIdDefaultValue,
        voltageLevelIdDefaultValue,
    ]);

    useEffect(() => {
        function validate() {
            const resVL = validateField(connectivity.voltageLevel, validation);
            setErrorVoltageLevel(resVL?.errorMsgId);
            const resBBS = validateField(
                connectivity.busOrBusbarSection,
                validation
            );
            setErrorBusBarSection(resBBS?.errorMsgId);
            return !resVL.error && !resBBS.error;
        }
        inputForm.addValidation(id ? id : label, validate);
    }, [connectivity, label, validation, inputForm, id]);

    const setVoltageLevel = useCallback((newVal) => {
        setConnectivity((oldVal) => {
            return { ...oldVal, voltageLevel: newVal };
        });
    }, []);

    const setBusOrBusbarSection = useCallback((newVal) => {
        setConnectivity((oldVal) => {
            return { ...oldVal, busOrBusbarSection: newVal };
        });
    }, []);

    const render = useMemo(() => {
        return (
            <ConnectivityEdition
                disabled={disabled}
                voltageLevelOptions={voltageLevelOptions}
                voltageLevel={connectivity.voltageLevel}
                voltageLevelPreviousValue={voltageLevelPreviousValue}
                busOrBusbarSection={connectivity.busOrBusbarSection}
                busOrBusbarSectionPreviousValue={
                    busOrBusbarSectionPreviousValue
                }
                onChangeVoltageLevel={(value) => setVoltageLevel(value)}
                onChangeBusOrBusbarSection={(busOrBusbarSection) =>
                    setBusOrBusbarSection(busOrBusbarSection)
                }
                errorVoltageLevel={errorVoltageLevel}
                helperTextVoltageLevel={
                    errorVoltageLevel &&
                    intl.formatMessage({
                        id: errorVoltageLevel,
                    })
                }
                errorBusOrBusBarSection={errorBusBarSection}
                helperTextBusOrBusBarSection={
                    errorBusBarSection &&
                    intl.formatMessage({
                        id: errorBusBarSection,
                    })
                }
                direction={direction}
                voltageLevelBusOrBBSCallback={makeRefreshBusOrBusbarSectionsCallback(
                    studyUuid,
                    currentNodeUuid
                )}
            />
        );
    }, [
        connectivity,
        disabled,
        direction,
        errorBusBarSection,
        errorVoltageLevel,
        intl,
        setBusOrBusbarSection,
        setVoltageLevel,
        voltageLevelOptions,
        studyUuid,
        currentNodeUuid,
        voltageLevelPreviousValue,
        busOrBusbarSectionPreviousValue,
    ]);

    return [connectivity, render];
};

const filter = createFilterOptions();

export const useAutocompleteField = ({
    id,
    label,
    validation = {},
    inputForm,
    formProps,
    values,
    getLabel = func_identity,
    allowNewValue = false,
    errorMsg,
    selectedValue,
    defaultValue,
    previousValue,
    loading = false,
}) => {
    const [value, setValue] = useState(defaultValue);
    const [error, setError] = useState('');
    const validationRef = useRef();
    validationRef.current = validation;

    useEffect(() => {
        if (defaultValue) {
            setValue(defaultValue);
        }
    }, [defaultValue]);

    useEffect(() => {
        function validate() {
            const res = validateField(value, validationRef.current);
            setError(res?.errorMsgId);
            return !res.error;
        }
        inputForm.addValidation(id ? id : label, validate);
    }, [label, validation, inputForm, value, id]);

    const handleChangeValue = useCallback((value) => {
        setValue(value);
    }, []);

    useEffect(() => {
        if (selectedValue) {
            setValue(selectedValue);
        }
    }, [selectedValue]);

    const field = useMemo(() => {
        return (
            <Autocomplete
                id={label}
                onChange={(event, newValue) => {
                    handleChangeValue(newValue);
                }}
                size={'small'}
                forcePopupIcon
                options={values}
                getOptionLabel={getLabel}
                defaultValue={defaultValue}
                value={value}
                loading={loading}
                loadingText={<FormattedMessage id="loadingOptions" />}
                freeSolo={allowNewValue}
                {...(allowNewValue && {
                    freeSolo: true,
                    isOptionEqualToValue: (option, input) =>
                        option === input ||
                        option.id === input ||
                        option.id === input?.id,
                    filterOptions: (options, params) => {
                        const filtered = filter(options, params);
                        if (
                            params.inputValue !== '' &&
                            !options.find((opt) => opt.id === params.inputValue)
                        ) {
                            filtered.push({
                                inputValue: params.inputValue,
                                id: params.inputValue,
                            });
                        }
                        return filtered;
                    },
                    autoSelect: true,
                    autoComplete: true,
                    autoHighlight: true,
                    blurOnSelect: true,
                    clearOnBlur: true,
                })}
                renderInput={(props) => (
                    <TextField
                        {...formProps}
                        {...props}
                        size="small"
                        label={
                            <FieldLabel
                                label={label}
                                optional={validation.isFieldRequired === false}
                            />
                        }
                        value={value}
                        {...genHelperPreviousValue(previousValue)}
                        {...genHelperError(error, errorMsg)}
                    />
                )}
            />
        );
    }, [
        label,
        values,
        getLabel,
        allowNewValue,
        handleChangeValue,
        validation.isFieldRequired,
        value,
        defaultValue,
        previousValue,
        error,
        errorMsg,
        formProps,
        loading,
    ]);

    return [value, field, setValue];
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

export const useCountryValue = (props) => {
    const [languageLocal] = useParameterState(PARAM_LANGUAGE);
    const [code, setCode] = useState(props.defaultCodeValue);

    const countriesList = useMemo(() => {
        try {
            return require('localized-countries')(
                require('localized-countries/data/' +
                    getComputedLanguage(languageLocal).substr(0, 2))
            );
        } catch (error) {
            // fallback to english if no localised list found
            return require('localized-countries')(
                require('localized-countries/data/en')
            );
        }
    }, [languageLocal]);

    useEffect(() => {
        //We only need to search for the code if we only have the label
        if (
            props.defaultLabelValue !== null &&
            props.defaultCodeValue === null
        ) {
            let res = countriesList
                .array()
                .filter(
                    (obj) =>
                        obj.label.toLowerCase() ===
                        props.defaultLabelValue.toLowerCase()
                )[0];
            setCode(res.code);
        } else if (props.defaultCodeValue !== null) {
            setCode(props.defaultCodeValue);
        } else {
            setCode(null);
        }
    }, [countriesList, props.defaultLabelValue, props.defaultCodeValue]);

    const values = useMemo(
        () => (countriesList ? Object.keys(countriesList.object()) : []),
        [countriesList]
    );
    const getOptionLabel = useCallback(
        (code) => countriesList.get(code),
        [countriesList]
    );

    return useAutocompleteField({
        values,
        getLabel: getOptionLabel,
        selectedValue: code,
        defaultValue: code,
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

    useEffect(() => {
        function validate() {
            return true;
        }
        inputForm.addValidation(label, validate);
    }, [label, validation, inputForm, value]);

    const handleChangeValue = useCallback((event) => {
        setValue(event.target.value);
    }, []);

    const field = useMemo(() => {
        return (
            <FormControl fullWidth size="small">
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
                    <FormHelperText>{previousValue}</FormHelperText>
                )}
            </FormControl>
        );
    }, [
        getId,
        getEnumLabel,
        label,
        value,
        previousValue,
        handleChangeValue,
        formProps,
        enumValues,
        doTranslation,
        validation.isFieldRequired,
    ]);

    useEffect(() => {
        setValue('');
    }, [inputForm.toggleClear]);

    useEffect(() => {
        setValue(defaultValue || '');
    }, [defaultValue]);

    return [value, field];
};

export const useExpandableValues = ({
    id,
    labelAddValue,
    Field,
    inputForm,
    defaultValues,
    fieldProps,
    validateItem,
    isRequired,
}) => {
    const classes = useStyles();
    const [values, setValues] = useState([]);
    const [errors, setErrors] = useState();
    const [itemListError, setItemListError] = useState({
        show: false,
        type: '',
    });

    useEffect(() => {
        if (defaultValues) {
            setValues([...defaultValues]);
        } else {
            setValues([]);
        }
    }, [defaultValues]);

    const handleDeleteItem = useCallback(
        (index) => {
            setValues((oldValues) => {
                let newValues = [...oldValues];
                newValues.splice(index, 1);
                return newValues;
            });
            inputForm.reset();
        },
        [inputForm]
    );

    const handleSetValue = useCallback((index, newValue) => {
        setValues((oldValues) => {
            let newValues = [...oldValues];
            newValues[index] = newValue;
            return newValues;
        });
    }, []);

    const handleAddValue = useCallback(() => {
        setValues((oldValues) => [...oldValues, {}]);
        setItemListError({
            show: false,
            type: '',
        });
    }, []);

    useEffect(() => {
        function validation() {
            const res = validateItem(values);
            setErrors(res);
            if (res?.size !== 0) {
                return false;
            } else if (isRequired && values?.length === 0) {
                setItemListError({
                    show: true,
                    type: 'empty',
                });
                return false;
            }
            setItemListError({
                show: false,
                type: '',
            });

            return true;
        }

        inputForm.addValidation(id, validation);
    }, [inputForm, values, id, validateItem, isRequired]);

    const isEmptyListError =
        itemListError.show && itemListError.type === 'empty';

    const field = useMemo(() => {
        return (
            <Grid item container spacing={2}>
                {values.map((value, idx) => (
                    <Grid key={id + idx} container spacing={2} item>
                        <Field
                            fieldProps={fieldProps}
                            defaultValue={value}
                            onChange={handleSetValue}
                            index={idx}
                            inputForm={inputForm}
                            errors={errors?.get(idx)}
                        />
                        <Grid item xs={1}>
                            <IconButton
                                className={classes.icon}
                                key={id + idx}
                                onClick={() => handleDeleteItem(idx)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                ))}
                <Grid container spacing={2}>
                    <Grid item xs={3}>
                        <Button
                            fullWidth
                            className={classes.button}
                            startIcon={<AddIcon />}
                            onClick={handleAddValue}
                        >
                            <FormattedMessage id={labelAddValue} />
                        </Button>
                        {isEmptyListError && (
                            <div className={classes.emptyListError}>
                                <FormattedMessage id={'EmptyList/' + id} />
                            </div>
                        )}
                    </Grid>
                </Grid>
            </Grid>
        );
    }, [
        values,
        classes.button,
        classes.emptyListError,
        classes.icon,
        handleAddValue,
        labelAddValue,
        isEmptyListError,
        id,
        fieldProps,
        handleSetValue,
        inputForm,
        errors,
        handleDeleteItem,
    ]);

    return [values, field];
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
    const intlRef = useIntlRef();
    const { enqueueSnackbar } = useSnackbar();
    const [isValidName, setIsValidName] = useState(false);
    const [error, setError] = useState();
    const timer = useRef();
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
                    .catch((errorMessage) => {
                        displayErrorMessageWithSnackbar({
                            errorMessage: errorMessage,
                            enqueueSnackbar: enqueueSnackbar,
                            headerMessage: {
                                headerMessageId: 'NodeUpdateError',
                                intlRef: intlRef,
                            },
                        });
                    });
            } else {
                setChecking(undefined);
            }
        },
        [studyUuid, intl, defaultValue, enqueueSnackbar, intlRef]
    );

    useEffect(() => {
        if (checking === undefined) setAdornment(null);
        if (checking)
            setAdornment(inputAdornment(<CircularProgress size="1rem" />));
        else if (!isValidName) setAdornment(undefined);
        else
            setAdornment(
                inputAdornment(<CheckIcon style={{ color: 'green' }} />)
            );
    }, [checking, isValidName]);

    useEffect(() => {
        if (name === '' && !timer.current) return; // initial render

        clearTimeout(timer.current);
        setIsValidName(false);
        setAdornment(undefined);
        setChecking(true);
        setError(undefined);
        timer.current = setTimeout(() => validName(name), 700);
    }, [studyUuid, name, validName, triggerReset]);

    return [error, field, isValidName, name];
};
