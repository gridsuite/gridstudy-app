/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
import { NativeSelect, TextField } from '@material-ui/core';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { useIntl } from 'react-intl';
import { updateTreeNode } from '../../../utils/rest-api';
import { useSnackbar } from 'notistack';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../../utils/messages';

const ModelNodeEditor = ({ selectedNode }) => {
    const intl = useIntl();
    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const [nameValue, setNameValue] = useState(selectedNode.data?.label);
    const [modelType, setModelType] = useState(selectedNode.modelType);

    const updateNameValue = (event) => {
        setNameValue(event.target.value);
    };

    const updateModelType = (event) => {
        setModelType(event.target.value);
    };

    const handleValidate = (event) => {
        updateTreeNode({
            id: selectedNode.id,
            type: selectedNode.type,
            name: nameValue,
        }).catch((errorMessage) => {
            displayErrorMessageWithSnackbar({
                errorMessage: errorMessage,
                enqueueSnackbar: enqueueSnackbar,
                headerMessage: {
                    headerMessageId: 'NodeUpdateError',
                    intlRef: intlRef,
                },
            });
        });
    };

    return (
        <>
            <Grid container spacing={3} alignItems="flex-end">
                <Grid item xs={12}>
                    <TextField
                        label={intl.formatMessage({ id: 'Name' })}
                        value={nameValue}
                        onChange={updateNameValue}
                    />
                </Grid>
            </Grid>
            <Grid container spacing={3} alignItems="flex-start">
                <Grid item xs={12}>
                    <NativeSelect value={modelType} onChange={updateModelType}>
                        <option aria-label="None" value="" />
                        <option value={'LOADFLOW'}>
                            {intl.formatMessage({ id: 'LoadFlow' })}
                        </option>
                        <option value={'SECURITY_ANALYSIS'}>
                            {intl.formatMessage({ id: 'SecurityAnalysis' })}
                        </option>
                    </NativeSelect>
                </Grid>
            </Grid>
            <Grid container spacing={3} alignItems={'flex-start'}>
                <Grid item>
                    <Button onClick={handleValidate}>
                        {intl.formatMessage({ id: 'validate' })}
                    </Button>
                </Grid>
            </Grid>
        </>
    );
};

ModelNodeEditor.propTypes = {
    selectedNode: PropTypes.object.isRequired,
};

export default ModelNodeEditor;
