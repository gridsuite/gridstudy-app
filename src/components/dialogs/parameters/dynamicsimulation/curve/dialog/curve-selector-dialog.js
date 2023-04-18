/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Typography,
} from '@mui/material';
import React, { useCallback, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useStyles } from '../../../parameters';
import CurveSelector from './curve-selector';
import CurvePreview from './curve-preview';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import { useTheme } from '@mui/styles';
const CurveSelectorDialog = ({ open, onClose, onSave }) => {
    const classes = useStyles();
    const theme = useTheme();

    const selectorRef = useRef();
    const previewRef = useRef();

    const handleClose = useCallback(() => {
        console.log('handleClose is called');
        onClose();
    }, [onClose]);

    const handleAdd = useCallback(() => {
        console.log('hanldeAdd is called', previewRef.current.api.getCurves());
        onSave(previewRef.current.api.getCurves());
    }, [onSave]);

    const intl = useIntl();

    const handleAddButton = useCallback(() => {
        console.log('handleAddButton called');
        const selectedEquipments =
            selectorRef.current.api.getSelectedEquipments();
        console.log('selectedEquipments retrieved', selectedEquipments);

        const selectedVariables =
            selectorRef.current.api.getSelectedVariables();
        console.log('selectedVariables retrieved', selectedVariables);

        // combine between equipments and variables
        const curves = selectedEquipments.reduce(
            (arr, equipment) =>
                selectedVariables.reduce(
                    (acc, variable) => [
                        ...acc,
                        {
                            equipmentId: equipment.id,
                            equipmentName: equipment.name,
                            variableId: variable.variableId,
                            variableName: variable.name,
                        },
                    ],
                    arr
                ),
            []
        );
        previewRef.current.api.addCurves(curves);
    }, []);
    const handleDeleteButton = useCallback(() => {
        console.log('handleDeleteButton called');
        previewRef.current.api.removeCurves();
    }, []);

    const hasSelectedRow = false;

    return (
        <Dialog
            open={open}
            aria-labelledby="curve-selector-dialog-title"
            maxWidth={'xl'}
            fullWidth={true}
        >
            <DialogTitle id="curve-selector-dialog-title">
                <Typography
                    component="span"
                    variant="h5"
                    className={classes.title}
                >
                    <FormattedMessage id="DynamicSimulationCurveSelectorDialogTitle" />
                </Typography>
            </DialogTitle>
            <DialogContent style={{ overflowY: 'hidden', height: '60vh' }}>
                <Grid container maxWidth={'xl'} sx={{ height: '100%' }}>
                    <Grid item container xs={8} spacing={theme.spacing(1)}>
                        <CurveSelector ref={selectorRef} />
                    </Grid>
                    <Grid
                        item
                        container
                        direction={'column'}
                        justifyContent={'center'}
                        alignItems={'center'}
                        xs={0.5}
                    >
                        <Grid item>
                            <Tooltip
                                title={intl.formatMessage({
                                    id: 'AddRows',
                                })}
                                placement="top"
                            >
                                <span>
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleAddButton()}
                                        disabled={hasSelectedRow}
                                    >
                                        <ArrowCircleRightIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Grid>
                        <Grid item>
                            <Tooltip
                                title={intl.formatMessage({
                                    id: 'DeleteRows',
                                })}
                                placement="top"
                            >
                                <span>
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleDeleteButton()}
                                        disabled={hasSelectedRow}
                                    >
                                        <ArrowCircleLeftIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Grid>
                    </Grid>
                    <Grid item xs>
                        <CurvePreview ref={previewRef} />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleAdd}>
                    <FormattedMessage id="DynamicSimulationAdd" />
                </Button>
                <Button onClick={handleClose}>
                    <FormattedMessage id="DynamicSimulationClose" />
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CurveSelectorDialog;
