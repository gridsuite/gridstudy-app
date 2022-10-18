/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
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
} from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { gridItem } from '../dialogUtils';
import { useInputForm, useTextValue } from '../inputs/input-hooks';
import {
    PHASE_TAP,
    RATIO_TAP,
} from './two-windings-transformer-creation-dialog';

export const CreateRuleDialog = (props) => {
    const inputForm = useInputForm();

    const [lowTapValue, lowTapValueField] = useTextValue({
        ...(props.ruleType === PHASE_TAP && { label: 'LowTapAlpha' }),
        ...(props.ruleType === RATIO_TAP && { label: 'LowTapRatio' }),
        validation: { isFieldRequired: true },
        inputForm: inputForm,
    });

    const [highTapValue, highTapValueField] = useTextValue({
        ...(props.ruleType === PHASE_TAP && { label: 'HighTapAlpha' }),
        ...(props.ruleType === RATIO_TAP && { label: 'HighTapRatio' }),
        validation: { isFieldRequired: true },
        inputForm: inputForm,
    });

    const isTapValuesValid = () => {
        if (highTapValue && lowTapValue) {
            return !(highTapValue - lowTapValue > 0);
        }
        return true;
    };

    const handleCloseDialog = () => {
        inputForm.reset();
        props.setOpenCreateRuleDialog(false);
    };

    const handleSave = () => {
        props.handleCreateTapRule(
            parseFloat(lowTapValue),
            parseFloat(highTapValue)
        );
        handleCloseDialog();
    };

    return (
        <Dialog open={props.openCreateRuleDialog} fullWidth={true}>
            <DialogTitle>
                <FormattedMessage
                    id={
                        props.ruleType === PHASE_TAP
                            ? 'CreateDephasingRule'
                            : 'CreateRegulationRule'
                    }
                />
            </DialogTitle>
            <DialogContent>
                <Grid
                    container
                    spacing={2}
                    direction={'column'}
                    style={{
                        paddingTop: '2px',
                    }}
                >
                    {gridItem(lowTapValueField)}
                    {gridItem(highTapValueField)}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseDialog}>
                    <FormattedMessage id="cancel" />
                </Button>
                <Button onClick={handleSave} disabled={isTapValuesValid()}>
                    <FormattedMessage id="validate" />
                </Button>
            </DialogActions>
        </Dialog>
    );
};
