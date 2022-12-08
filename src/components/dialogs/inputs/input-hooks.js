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
import { validateField } from '../../util/validation-functions';
import {
    CircularProgress,
    FormHelperText,
    FormLabel,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    TextField,
    Tooltip,
    Button,
    FormControlLabel,
    Grid,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import FolderIcon from '@mui/icons-material/Folder';
import TextFieldWithAdornment from '../../util/text-field-with-adornment';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import {
    func_identity,
    toFloatValue,
    toIntValue,
    useStyles,
} from '../dialogUtils';
import { getComputedLanguage } from '../../../utils/language';
import { PARAM_LANGUAGE } from '../../../utils/config-params';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { isNodeExists } from '../../../utils/rest-api';
import { TOOLTIP_DELAY } from '../../../utils/UIconstants';
import { useParameterState } from '../parameters/parameters';
import {
    FieldLabel,
    genHelperError,
    genHelperPreviousValue,
} from './hooks-helpers';
import { useAutocompleteField } from './use-autocomplete-field';
import RegulatingTerminalEdition, {
    makeRefreshRegulatingTerminalSectionsCallback,
} from '../regulating-terminal-edition';
import Chip from '@mui/material/Chip';
import DirectoryItemSelector from '../../directory-item-selector';
import { OverflowableText } from '@gridsuite/commons-ui';
import { useCSVReader } from 'react-papaparse';

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
            if (acceptValue === undefined || acceptValue(event.target.value))
                setValue(transformValue(event.target.value));
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

export const useCountryValue = (props) => {
    const [languageLocal] = useParameterState(PARAM_LANGUAGE);
    const [code, setCode] = useState(props.defaultCodeValue);

    // supposed cached by node.js
    const englishCountriesModule = require('localized-countries')(
        require('localized-countries/data/en')
    );
    const localizedCountriesModule = useMemo(() => {
        try {
            return require('localized-countries')(
                require('localized-countries/data/' +
                    getComputedLanguage(languageLocal).substr(0, 2))
            );
        } catch (error) {
            // fallback to english if no localised list found
            return englishCountriesModule;
        }
    }, [languageLocal, englishCountriesModule]);

    useEffect(() => {
        //We only need to search for the code if we only have the label
        if (props.defaultLabelValue && !props.defaultCodeValue) {
            // code -> name is currently done in NetworkMapService::toDataMap and gives english
            let res = englishCountriesModule
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
    }, [
        englishCountriesModule,
        props.defaultLabelValue,
        props.defaultCodeValue,
    ]);

    const values = useMemo(
        () =>
            localizedCountriesModule
                ? Object.keys(localizedCountriesModule.object())
                : [],
        [localizedCountriesModule]
    );
    const getOptionLabel = useCallback(
        (code) => localizedCountriesModule.get(code),
        [localizedCountriesModule]
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
                    <FormHelperText>{previousValue}</FormHelperText>
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
export const useRegulatingTerminalValue = ({
    validation = {
        isFieldRequired: false,
    },
    disabled = false,
    inputForm,
    voltageLevelOptionsPromise,
    direction = 'row',
    voltageLevelIdDefaultValue,
    equipmentSectionTypeDefaultValue,
    equipmentSectionIdDefaultValue,
}) => {
    const [regulatingTerminal, setRegulatingTerminal] = useState({
        voltageLevel: voltageLevelIdDefaultValue,
        equipmentSection: {
            id: equipmentSectionIdDefaultValue,
            type: equipmentSectionTypeDefaultValue,
        },
    });
    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);
    const [voltageLevelsEquipments, setVoltageLevelsEquipments] = useState([]);

    useEffect(() => {
        setRegulatingTerminal({
            voltageLevel: null,
            equipmentSection: null,
        });
    }, [inputForm.toggleClear]);

    useEffect(() => {
        if (!voltageLevelOptionsPromise) return;

        voltageLevelOptionsPromise.then((values) => {
            setVoltageLevelOptions(
                Array.from(values, (val) => val.voltageLevel).sort((a, b) =>
                    a.id.localeCompare(b.id)
                )
            );
            setVoltageLevelsEquipments(values);
        });
    }, [voltageLevelOptionsPromise]);

    useEffect(() => {
        if (!voltageLevelOptions) return;
        setRegulatingTerminal({
            voltageLevel: voltageLevelIdDefaultValue
                ? {
                      id: voltageLevelIdDefaultValue,
                      topologyKind: voltageLevelOptions.find(
                          (vl) => vl.id === voltageLevelIdDefaultValue
                      )?.topologyKind,
                  }
                : null,
            equipmentSection:
                equipmentSectionIdDefaultValue &&
                equipmentSectionTypeDefaultValue
                    ? {
                          id: equipmentSectionIdDefaultValue,
                          type: equipmentSectionTypeDefaultValue,
                      }
                    : null,
        });
    }, [
        voltageLevelOptions,
        equipmentSectionIdDefaultValue,
        equipmentSectionTypeDefaultValue,
        voltageLevelIdDefaultValue,
    ]);

    const setVoltageLevel = useCallback((newVal) => {
        setRegulatingTerminal((oldVal) => {
            return { ...oldVal, voltageLevel: newVal };
        });
    }, []);

    const setEquipmentSection = useCallback((newVal) => {
        setRegulatingTerminal((oldVal) => {
            return { ...oldVal, equipmentSection: newVal };
        });
    }, []);

    const render = useMemo(() => {
        return (
            <RegulatingTerminalEdition
                validation={validation}
                inputForm={inputForm}
                disabled={disabled}
                voltageLevelOptions={voltageLevelOptions}
                regulatingTerminalValue={regulatingTerminal}
                voltageLevelsEquipments={voltageLevelsEquipments}
                onChangeVoltageLevel={(value) => setVoltageLevel(value)}
                onChangeEquipmentSection={(equipmentSection) =>
                    setEquipmentSection(equipmentSection)
                }
                direction={direction}
                voltageLevelEquipmentsCallback={makeRefreshRegulatingTerminalSectionsCallback()}
                equipmentSectionTypeDefaultValue={
                    equipmentSectionTypeDefaultValue
                }
            />
        );
    }, [
        validation,
        inputForm,
        disabled,
        voltageLevelOptions,
        regulatingTerminal,
        voltageLevelsEquipments,
        direction,
        equipmentSectionTypeDefaultValue,
        setVoltageLevel,
        setEquipmentSection,
    ]);
    return [regulatingTerminal, render];
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

export const useDirectoryElements = ({
    label,
    initialValues,
    elementType,
    equipmentTypes,
    titleId,
    elementClassName,
}) => {
    const classes = useStyles();
    const [values, setValues] = useState(initialValues);
    const [directoryItemSelectorOpen, setDirectoryItemSelectorOpen] =
        useState(false);
    const intl = useIntl();
    const { snackError } = useSnackMessage();

    useEffect(() => {
        if (initialValues !== null) {
            setValues(initialValues);
        }
    }, [initialValues]);

    const handleDelete = useCallback(
        (item, index) => {
            let arr = [...values];
            arr.splice(index, 1);
            setValues(arr);
        },
        [values]
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
                setValues(values.concat(elementsToAdd));
            }

            setDirectoryItemSelectorOpen(false);
        },
        [values, snackError]
    );

    const field = useMemo(() => {
        return (
            <>
                <FormControl className={classes.formDirectoryElements1}>
                    <Grid container>
                        <Grid item>
                            <InputLabel
                                id="elements"
                                className={classes.labelDirectoryElements}
                            >
                                <FieldLabel label={label} optional={false} />
                            </InputLabel>
                        </Grid>
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
                    </Grid>
                    <FormControl className={classes.formDirectoryElements2}>
                        <div>
                            {values.map((item, index) => (
                                <Chip
                                    className={elementClassName}
                                    key={label + '_' + index}
                                    size="small"
                                    onDelete={() => handleDelete(item, index)}
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
                </FormControl>
                <DirectoryItemSelector
                    open={directoryItemSelectorOpen}
                    onClose={addElements}
                    types={[elementType]}
                    equipmentTypes={equipmentTypes}
                    title={intl.formatMessage({ id: titleId })}
                />
            </>
        );
    }, [
        classes.formDirectoryElements1,
        classes.formDirectoryElements2,
        classes.labelDirectoryElements,
        classes.addDirectoryElements,
        values,
        addElements,
        handleDelete,
        directoryItemSelectorOpen,
        elementType,
        equipmentTypes,
        intl,
        titleId,
        label,
        elementClassName,
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

export const useRadioValue = ({
    label,
    possibleValues = [],
    defaultValue,
    id,
    inputForm,
    doTranslation = true,
}) => {
    const [value, setValue] = useState(defaultValue);
    const intl = useIntl();

    useEffect(() => {
        // Updates the component when the correct default value is given by the parent component.
        if (defaultValue?.length > 0) {
            setValue(defaultValue);
        }
    }, [defaultValue]);

    const handleChangeValue = useCallback(
        (event) => {
            setValue(event.target.value);
            inputForm.setHasChanged(true);
        },
        [inputForm]
    );

    const field = useMemo(() => {
        return (
            <FormControl
                style={{
                    marginTop: '-12px',
                }}
            >
                {label && (
                    <FormLabel id={id ? id : label}>
                        <FormattedMessage id={label} />
                    </FormLabel>
                )}
                <RadioGroup
                    row
                    aria-labelledby={id ? id : label}
                    value={value ?? defaultValue}
                    onChange={handleChangeValue}
                >
                    {possibleValues.map((value) => (
                        <FormControlLabel
                            key={value.id}
                            value={value.id}
                            control={<Radio />}
                            label={
                                doTranslation
                                    ? intl.formatMessage({ id: value.label })
                                    : value.label
                            }
                        />
                    ))}
                </RadioGroup>
            </FormControl>
        );
    }, [
        intl,
        label,
        id,
        defaultValue,
        doTranslation,
        possibleValues,
        value,
        handleChangeValue,
    ]);

    return [value, field];
};
