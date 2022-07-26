/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import {
    Autocomplete,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from '@mui/material';
import FormControl from '@mui/material/FormControl';
import { useParams } from 'react-router-dom';
import { deleteEquipment } from '../../utils/rest-api';
import { useSnackMessage } from '../../utils/messages';
import { validateField } from '../util/validation-functions';
import { useInputForm } from './input-hooks';
import { EquipmentItem, equipmentStyles } from '@gridsuite/commons-ui';
import { useSearchMatchingEquipments } from '../util/search-matching-equipments';
import makeStyles from '@mui/styles/makeStyles';

const equipmentTypes = [
    'LINE',
    'TWO_WINDINGS_TRANSFORMER',
    'THREE_WINDINGS_TRANSFORMER',
    'GENERATOR',
    'LOAD',
    'BATTERY',
    'DANGLING_LINE',
    'HVDC_LINE',
    'HVDC_CONVERTER_STATION',
    'SHUNT_COMPENSATOR',
    'STATIC_VAR_COMPENSATOR',
    'SUBSTATION',
    'VOLTAGE_LEVEL',
];

const QUESTIONABLE_SIZE = 1000;

const isWorthLoading = (term, elements, old, minLen) => {
    console.debug('worth?', term, elements, old, minLen);
    const idx = elements.findIndex((e) => e.label === term);
    if (idx >= 0) {
        console.debug('already matched');
        return false;
    }
    if (term.length < minLen) {
        console.debug('not long enough');
        return false;
    }
    if (!term.startsWith(old)) {
        console.debug('not incr');
        return true;
    }
    if (old.length < minLen || minLen === 0) {
        console.debug('empty, has to be filled');
        return true;
    }
    if (elements.length === QUESTIONABLE_SIZE) {
        console.debug('suspicious length');
        return true;
    }

    return false;
};

const useAutoPartial = (props) => {
    const {
        onClose,
        searchingLabel,
        onSearchTermChange,
        elementsFound, // [{ label: aLabel, id: anId }, ...]
        renderElement,
        minCharsBeforeSearch = 3,
        allowsUnknown = false,
    } = props;

    const intl = useIntl();

    const [expanded, setExpanded] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const [userStr, setUserStr] = useState('');

    const [selectedValue, setSelectedValue] = useState(null);

    useEffect(() => {
        setIsLoading(false);
        if (elementsFound?.length === 0) setExpanded(false);
    }, [elementsFound]);

    const handleKeyDown = (e) => {
        if (e.ctrlKey && e.code === 'Space') {
            handleForcedSearch(userStr);
        }
    };

    const handleForcedSearch = useCallback(
        (term) => {
            if (!onSearchTermChange) return;
            console.debug('search asked term=', term);
            setIsLoading(true);
            setExpanded(true);
            onSearchTermChange(term, true);
        },
        [onSearchTermChange]
    );

    const myOnOpen = useCallback(() => {
        console.debug('my open=', isLoading, elementsFound);
        setExpanded(true);

        if (!onSearchTermChange) return;
        if (isWorthLoading(userStr, elementsFound, userStr, 0)) {
            setIsLoading(true);
            onSearchTermChange(userStr, false);
        }
    }, [userStr, elementsFound, isLoading, onSearchTermChange]);

    const handleSearchTermChange = useCallback(
        (term) => {
            console.debug('handleSearchTermChange', term);
            const min = minCharsBeforeSearch;

            setUserStr((old) => {
                if (isWorthLoading(term, elementsFound, old, min)) {
                    setIsLoading(true);
                    setExpanded(true);
                    onSearchTermChange(term, false);
                    // } else {
                    //     setExpanded(false);
                }
                return term;
            });
        },
        [elementsFound, minCharsBeforeSearch, onSearchTermChange]
    );

    const handleClose = useCallback(() => {
        setExpanded(false);
        onClose();
    }, [onClose]);

    const optionEqualsToValue = (option, input) => {
        if (!allowsUnknown) return option.id === input.id;
        return (
            option === input || option.id === input || option.id === input?.id
        );
    };

    const onSelectionChange = useCallback(
        (newValue) => {
            console.debug('to select', newValue);
            setSelectedValue(newValue);
        },
        [setSelectedValue]
    );

    console.debug('expanded', expanded);

    const field = (
        <Autocomplete
            id="element-search"
            onChange={(_event, newValue) => {
                onSelectionChange(newValue);
            }}
            open={expanded}
            onOpen={myOnOpen}
            onClose={() => {
                setExpanded(false);
            }}
            forcePopupIcon
            options={isLoading ? [] : elementsFound}
            getOptionLabel={(option) => option?.label || option?.id || option}
            loading={isLoading}
            loadingText={<FormattedMessage id="loadingOptions" />}
            // fullWidth
            {...(allowsUnknown && {
                freeSolo: true,
                autoSelect: true,
                autoComplete: true,
                blurOnSelect: true,
                clearOnBlur: true,
            })}
            onInputChange={(_event, value) => handleSearchTermChange(value)}
            isOptionEqualToValue={optionEqualsToValue}
            // autoHighlight={true}
            noOptionsText={intl.formatMessage({
                id: 'element_search/noResult',
            })}
            renderOption={(optionProps, element, { inputValue }) =>
                renderElement({
                    ...optionProps,
                    element,
                    inputValue,
                    onClose: handleClose,
                })
            }
            renderInput={(params) => (
                <TextField
                    autoFocus={true}
                    {...params}
                    variant={'filled'}
                    onKeyDown={handleKeyDown}
                    size="small"
                    label={
                        searchingLabel ||
                        intl.formatMessage({
                            id: 'element_search/label',
                        })
                    }
                    InputProps={{
                        ...params.InputProps,
                    }}
                />
            )}
        />
    );

    return [selectedValue, field];
};

const makeItems = (eqpts, usesNames) => {
    console.debug('got eqpts', eqpts);
    if (!eqpts) return [];
    return eqpts
        .map((e) => {
            let label = usesNames ? e.name : e.id;
            return {
                label: label,
                id: e.id,
                key: e.id,
                // type: e.type,
            };
        })
        .sort((a, b) => a.label.localeCompare(b.label));
};

const useEquipmentStyles = makeStyles(equipmentStyles);

/**
 * Dialog to delete an equipment in the network
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param {String} title Title of the dialog
 * @param currentNodeUuid : the currently selected tree node
 */
const EquipmentDeletionDialog = ({ open, onClose, currentNodeUuid }) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const { snackError } = useSnackMessage();

    const intl = useIntl();
    const inputForm = useInputForm();

    const equipmentClasses = useEquipmentStyles();

    const [equipmentType, setEquipmentType] = useState('LINE');
    // const [equipmentOrId, setEquipmentOrId] = useState(null);

    const [errors, setErrors] = useState(new Map());

    const handleChangeEquipmentType = (event) => {
        const nextEquipmentType = event.target.value;
        setEquipmentType(nextEquipmentType);
    };

    const [searchMatchingEquipments, equipmentsFound] =
        useSearchMatchingEquipments(
            studyUuid,
            currentNodeUuid,
            true,
            equipmentType,
            makeItems
        );

    const [equipmentOrId, equipmentField] = useAutoPartial({
        // onClose: onClose,
        allowsUnknown: true,
        searchingLabel: intl.formatMessage({
            id: 'ID',
        }),
        onSearchTermChange: searchMatchingEquipments,
        elementsFound: equipmentsFound,
        renderElement: (props) => (
            <EquipmentItem
                classes={equipmentClasses}
                {...props}
                key={props.element.key}
                showsJustText={true}
            />
        ),
    });

    function handleDeleteEquipmentError(response, messsageId) {
        const utf8Decoder = new TextDecoder('utf-8');
        response.body
            .getReader()
            .read()
            .then((value) => {
                snackError(utf8Decoder.decode(value.value), messsageId);
            });
    }

    const handleSave = () => {
        console.debug('to save', equipmentOrId, inputForm);
        // Check if error list contains an error
        let isValid;
        if (inputForm) {
            isValid = inputForm.validate();
        } else {
            let errMap = new Map(errors);

            errMap.set(
                'equipment-id',
                validateField(equipmentOrId, {
                    isFieldRequired: true,
                })
            );
            setErrors(errMap);
            isValid = Array.from(errMap.values())
                .map((p) => p.error)
                .every((e) => e);
        }

        if (isValid) {
            deleteEquipment(
                studyUuid,
                currentNodeUuid,
                equipmentType.endsWith('CONVERTER_STATION')
                    ? 'HVDC_CONVERTER_STATION'
                    : equipmentType,
                equipmentOrId?.id || equipmentOrId
            ).then((response) => {
                if (response.status !== 200) {
                    handleDeleteEquipmentError(
                        response,
                        'UnableToDeleteEquipment'
                    );
                }
            });
            // do not wait fetch response and close dialog, errors will be shown in snackbar.
            handleCloseAndClear();
        }
    };

    const clearValues = () => {
        setEquipmentType('LINE');
    };

    const handleCloseAndClear = () => {
        clearValues();
        setErrors(new Map());
        onClose();
    };

    const handleClose = (event, reason) => {
        if (reason !== 'backdropClick') {
            setErrors(new Map());
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="dialog-delete-equipment"
            fullWidth
        >
            <DialogTitle>
                {intl.formatMessage({ id: 'DeleteEquipment' })}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={6} align="start">
                        <FormControl fullWidth size="small">
                            <InputLabel
                                id="equipment-type-label"
                                variant={'filled'}
                            >
                                {intl.formatMessage({ id: 'Type' })}
                            </InputLabel>
                            <Select
                                id="equipment-type"
                                value={equipmentType}
                                onChange={handleChangeEquipmentType}
                                variant="filled"
                                fullWidth
                            >
                                {equipmentTypes.map((item) => {
                                    return (
                                        <MenuItem key={item} value={item}>
                                            {intl.formatMessage({
                                                id: item,
                                            })}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} align="start">
                        {equipmentField}
                        {/*<AutoPartial*/}
                        {/*    onClose={onClose}*/}
                        {/*    allowsUnknown={true}*/}
                        {/*    searchingLabel={intl.formatMessage({*/}
                        {/*        id: 'ID',*/}
                        {/*    })}*/}
                        {/*    onSearchTermChange={searchMatchingEquipments}*/}
                        {/*    onSelectionChange={(element) => {*/}
                        {/*        console.debug('sel changed to', element);*/}
                        {/*        setEquipmentOrId(element);*/}
                        {/*    }}*/}
                        {/*    elementsFound={equipmentsFound}*/}
                        {/*    renderElement={(props) => (*/}
                        {/*        <EquipmentItem*/}
                        {/*            classes={equipmentClasses}*/}
                        {/*            {...props}*/}
                        {/*            key={props.element.key}*/}
                        {/*            showsJustText={true}*/}
                        {/*        />*/}
                        {/*    )}*/}
                        {/*/>*/}
                        {/*{idField}*/}
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseAndClear}>
                    <FormattedMessage id="cancel" />
                </Button>
                <Button onClick={handleSave}>
                    <FormattedMessage id="validate" />
                </Button>
            </DialogActions>
        </Dialog>
    );
};

EquipmentDeletionDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    currentNodeUuid: PropTypes.string,
};

export default EquipmentDeletionDialog;
