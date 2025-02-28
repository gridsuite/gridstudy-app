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
    IconButton,
    Typography,
    useTheme,
} from '@mui/material';
import { FunctionComponent, useCallback, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import CurveSelector, { GetSelectedItemsHandler } from './curve-selector';
import CurvePreview, { Curve, CurveHandler } from './curve-preview';
import Tooltip from '@mui/material/Tooltip';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import { mergeSx } from '@gridsuite/commons-ui';
import { styles } from 'components/dialogs/parameters/parameters-style';

interface CurveSelectorDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (curves: Curve[]) => void;
}

const CurveSelectorDialog: FunctionComponent<CurveSelectorDialogProps> = ({ open, onClose, onSave }) => {
    const theme = useTheme();

    const selectorRef = useRef<GetSelectedItemsHandler>(null);
    const previewRef = useRef<CurveHandler>(null);

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    const handleAdd = useCallback(() => {
        if (!previewRef.current) {
            return;
        }
        onSave(previewRef.current.api.getCurves());
    }, [onSave]);

    const intl = useIntl();

    const handleAddButton = useCallback(() => {
        if (!selectorRef.current || !previewRef.current) {
            return;
        }
        const selectedEquipments = selectorRef.current.api.getSelectedEquipments();

        const selectedVariables = selectorRef.current.api.getSelectedVariables();

        // combine between equipments and variables
        const curves = selectedEquipments.flatMap((equipment) =>
            selectedVariables.map((variable) => ({
                equipmentType: equipment.type,
                equipmentId: equipment.id,
                variableId: variable.variableId,
            }))
        );
        previewRef.current.api.addCurves(curves);
    }, []);
    const handleDeleteButton = useCallback(() => {
        if (!previewRef.current) {
            return;
        }
        previewRef.current.api.removeCurves();
    }, []);

    const hasSelectedRow = false;

    return (
        <Dialog open={open} aria-labelledby="curve-selector-dialog-title" maxWidth={'xl'} fullWidth={true}>
            <DialogTitle id="curve-selector-dialog-title">
                <Typography component="span" variant="h5" sx={styles.title}>
                    <FormattedMessage id="DynamicSimulationCurveSelectorDialogTitle" />
                </Typography>
            </DialogTitle>
            <DialogContent style={{ overflowY: 'hidden', height: '60vh' }}>
                <Grid
                    container
                    sx={mergeSx(styles.scrollableGrid, {
                        maxWidth: 'xl',
                        height: '100%',
                        maxHeight: '100%',
                    })}
                >
                    <Grid item container xs={8} spacing={theme.spacing(1)}>
                        <CurveSelector ref={selectorRef} />
                    </Grid>
                    <Grid item container direction={'column'} justifyContent={'center'} alignItems={'center'} xs={0.5}>
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
                    <Grid item container xs direction={'column'}>
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
