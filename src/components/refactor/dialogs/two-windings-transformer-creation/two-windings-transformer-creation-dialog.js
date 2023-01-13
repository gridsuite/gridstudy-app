/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import ModificationDialog from '../modificationDialog';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSnackMessage } from '@gridsuite/commons-ui';

import { FormProvider, useForm } from 'react-hook-form';
import yup from '../../utils/yup-config';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    getConnectivityEmptyFormData,
    getConnectivityFormValidationSchema,
} from '../connectivity/connectivity-form-utils';
import { Box, Grid, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import TwoWindingsTransformerPane from './two-windings-transformer-pane/two-windings-transformer-pane';
import RatioTapChangerPane from './ratio-tap-changer-pane/ratio-tap-changer-pane';
import PhaseTapChangerPane from './phase-tap-changer-pane/phase-tap-changer-pane';
import {
    getPhaseTapChangerEmptyFormData,
    getPhaseTapChangerValidationSchema,
} from './phase-tap-changer-pane/phase-tap-changer-pane-utils';
import {
    getRatioTapChangerEmptyFormData,
    getRatioTapChangerValidationSchema,
} from './ratio-tap-changer-pane/ratio-tap-changer-pane-utils';
import {
    getTwoWindingsTransformerEmptyFormData,
    getTwoWindingsTransformerValidationSchema,
} from './two-windings-transformer-pane/two-windings-transformer-pane-utils';

/**
 * Dialog to create a two windings transformer in the network
 * @param currentNodeUuid The node we are currently working on
 * @param editData the data to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */

const emptyFormData = {
    ...getTwoWindingsTransformerEmptyFormData(),
    ...getRatioTapChangerEmptyFormData(),
    ...getPhaseTapChangerEmptyFormData(),
    ...getConnectivityEmptyFormData('connectivity1'),
    ...getConnectivityEmptyFormData('connectivity2'),
};

const schema = yup
    .object()
    .shape({
        ...getTwoWindingsTransformerValidationSchema(),
        ...getRatioTapChangerValidationSchema(),
        ...getPhaseTapChangerValidationSchema(),
        ...getConnectivityFormValidationSchema('connectivity1'),
        ...getConnectivityFormValidationSchema('connectivity2'),
    })
    .required();

const useStyles = makeStyles((theme) => ({
    tabWithError: {
        '&.Mui-selected': { color: theme.palette.error.main },
        color: theme.palette.error.main,
    },
    tabWithErrorIndicator: {
        backgroundColor: theme.palette.error.main,
    },
}));

const DialogTab = {
    CHARACTERISTICS_TAB: 0,
    RATIO_TAP_TAB: 1,
    PHASE_TAP_TAB: 2,
};

const TwoWindingsTransformerCreationDialog = ({
    editData,
    currentNodeUuid,
    ...dialogProps
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const { snackError } = useSnackMessage();

    const classes = useStyles();

    const equipmentPath = '2-windings-transformers';

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const {
        reset,
        formState: { isDirty },
    } = methods;

    const [tabIndex, setTabIndex] = useState(DialogTab.CHARACTERISTICS_TAB);
    const [dialogWidth, setDialogWidth] = useState('sm');
    const [tabIndexesWithError, setTabIndexesWithError] = useState([]);

    // const searchCopy = useFormSearchCopy({
    //     studyUuid,
    //     currentNodeUuid,
    //     equipmentPath,
    //     toFormValues: (data) => data,
    //     setFormValues: fromSearchCopyToFormValues,
    // });

    // useEffect(() => {
    //     if (editData) {
    //         fromEditDataToFormValues(editData);
    //     }
    // }, [fromEditDataToFormValues, editData]);

    const getTabIndicatorClass = (index) =>
        tabIndexesWithError.includes(index)
            ? {
                  indicator: classes.tabWithErrorIndicator,
              }
            : {};

    const getTabClass = (index) =>
        clsx({
            [classes.tabWithError]: tabIndexesWithError.includes(index),
        });

    const renderSubtitle = () => {
        return (
            <Grid container>
                <Tabs
                    value={tabIndex}
                    variant="scrollable"
                    onChange={(event, newValue) => setTabIndex(newValue)}
                    classes={getTabIndicatorClass(tabIndex)}
                >
                    <Tab
                        label={
                            <FormattedMessage id="TwoWindingsTransformerCharacteristicsTab" />
                        }
                        className={getTabClass(DialogTab.CHARACTERISTICS_TAB)}
                        onClick={() => setDialogWidth('sm')}
                    />
                    <Tab
                        onClick={() => setDialogWidth('xl')}
                        label={
                            <FormattedMessage id="TwoWindingsTransformerRatioTapChangerTab" />
                        }
                        className={getTabClass(DialogTab.RATIO_TAP_TAB)}
                    />
                    <Tab
                        onClick={() => setDialogWidth('xl')}
                        label={
                            <FormattedMessage id="TwoWindingsTransformerPhaseTapChangerTab" />
                        }
                        className={getTabClass(DialogTab.PHASE_TAP_TAB)}
                    />
                </Tabs>
            </Grid>
        );
    };

    const onSubmit = useCallback(
        (load) => {
            alert(JSON.stringify(load, null, 4));
        },
        [editData, studyUuid, currentNodeUuid, snackError]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    return (
        <FormProvider validationSchema={schema} {...methods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                disabledSave={!isDirty}
                aria-labelledby="dialog-create-two-windings-transformer"
                maxWidth={dialogWidth}
                titleId="CreateTwoWindingsTransformer"
                subtitle={renderSubtitle()}
                //searchCopy={searchCopy}
                {...dialogProps}
            >
                <Box hidden={tabIndex !== DialogTab.CHARACTERISTICS_TAB} p={1}>
                    <TwoWindingsTransformerPane />
                </Box>

                <Box hidden={tabIndex !== DialogTab.RATIO_TAP_TAB} p={1}>
                    <RatioTapChangerPane />
                </Box>

                <Box hidden={tabIndex !== DialogTab.PHASE_TAP_TAB} p={1}>
                    <PhaseTapChangerPane />
                </Box>

                {/* <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={'LOAD'}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                /> */}
            </ModificationDialog>
        </FormProvider>
    );
};

TwoWindingsTransformerCreationDialog.propTypes = {
    editData: PropTypes.object,
    currentNodeUuid: PropTypes.string,
};

export default TwoWindingsTransformerCreationDialog;
