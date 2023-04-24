/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { useInputForm } from '../../util/inputs/input-hooks';
import { getIdOrSelf, gridItem } from '../dialogUtils';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useAutocompleteField } from '../../util/inputs/use-autocomplete-field';
import {
    fetchDynamicSimulationParameters,
    updateDynamicSimulationParameters,
} from '../../../utils/rest-api';

export const checkDynamicSimulationParameters = (studyUuid) => {
    return fetchDynamicSimulationParameters(studyUuid).then((params) => {
        // check mapping configuration
        const mappings = params.mappings.map((elem) => elem.name);
        const mapping = params.mapping;
        const isMappingValid = mappings.includes(mapping);
        return isMappingValid;
    });
};

const MAPPING_SELECTION_LABEL = 'DynamicSimulationMappingSelection';

const DynamicSimulationParametersSelector = (props) => {
    const { open, onClose, onStart, studyUuid } = props;

    const [mappingNames, setMappingNames] = useState([]);
    const [dynamicSimulationParams, setDynamicSimulationParams] =
        useState(null);

    const { snackError } = useSnackMessage();

    const inputForm = useInputForm();

    const [mappingName, mappingNameField, setMappingName] =
        useAutocompleteField({
            label: MAPPING_SELECTION_LABEL,
            inputForm: inputForm,
            values: mappingNames,
            defaultValue: '',
            validation: {
                isFieldRequired: true,
            },
            getLabel: getIdOrSelf,
        });

    useEffect(() => {
        fetchDynamicSimulationParameters(studyUuid)
            .then((params) => {
                // save all params to state
                setDynamicSimulationParams(params);
                // extract mapping configuration
                const mappings = params.mappings.map((elem) => elem.name);
                const mapping = params.mapping;
                setMappingNames(mappings);
                setMappingName(mapping);
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'DynamicSimulationGetMappingError',
                });
            });
    }, [snackError, studyUuid, setMappingName]);

    const handleClose = () => {
        onClose();
    };

    const handleStart = () => {
        if (inputForm.validate()) {
            // save parameters before start computation
            const newDynamicSimulationParams = {
                ...dynamicSimulationParams,
                mapping: mappingName,
            };
            updateDynamicSimulationParameters(
                studyUuid,
                newDynamicSimulationParams
            )
                .then(() => {
                    // start computation
                    onStart();
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'DynamicSimulationParametersChangeError',
                    });
                });
        }
    };

    const makeButton = (onClick, message, disabled) => {
        return (
            <Grid item>
                <Button
                    onClick={onClick}
                    variant="contained"
                    disabled={disabled}
                >
                    <FormattedMessage id={message} />
                </Button>
            </Grid>
        );
    };

    const renderButtons = () => {
        return (
            <Grid container spacing={1} item justifyContent={'right'}>
                {makeButton(handleClose, 'close', false)}
                {makeButton(handleStart, 'Execute', false)}
            </Grid>
        );
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth={'sm'}
                fullWidth={true}
            >
                <DialogTitle>
                    <Typography component="span" variant="h5">
                        <FormattedMessage id="DynamicSimulationParametersSelection" />
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Grid
                        container
                        spacing={2}
                        direction="column"
                        item
                        xs={12}
                        justifyContent={'center'}
                        padding={1}
                    >
                        <Grid item>{gridItem(mappingNameField, 6)}</Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>{renderButtons()}</DialogActions>
            </Dialog>
        </>
    );
};

DynamicSimulationParametersSelector.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    onStart: PropTypes.func,
    studyUuid: PropTypes.string,
    currentNodeUuid: PropTypes.string,
};

export default DynamicSimulationParametersSelector;
