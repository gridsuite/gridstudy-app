/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { elementType } from '@gridsuite/commons-ui';
import { Box, DialogContent, Grid, Typography } from '@mui/material';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import {
    EQUIPMENT_SELECTION,
    FIXED_GENERATORS,
    VARIABLE_SHUNT_COMPENSATORS,
    VARIABLE_TRANSFORMERS
} from 'components/utils/field-constants';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useStyles } from '../parameters';
import DirectoryItemsInput from '../../../utils/rhf-inputs/directory-items-input';

const EquipmentSelectionParameters = () => {
    const classes = useStyles();

    // const formatNewParams = useCallback((equipmentSelection) => {
    //     return {
    //         [EQUIPMENT_SELECTION]: {
    //             [FIXED_GENERATORS]: equipmentSelection[FIXED_GENERATORS].map(
    //                 (filter) => {
    //                     return {
    //                         [FILTER_ID]: filter[ID],
    //                         [FILTER_NAME]: filter[NAME],
    //                     };
    //                 }
    //             ),
    //             [VARIABLE_TRANSFORMERS]: equipmentSelection[
    //                 VARIABLE_TRANSFORMERS
    //             ].map((filter) => {
    //                 return {
    //                     [FILTER_ID]: filter[ID],
    //                     [FILTER_NAME]: filter[NAME],
    //                 };
    //             }),
    //             [VARIABLE_SHUNT_COMPENSATORS]: equipmentSelection[
    //                 VARIABLE_SHUNT_COMPENSATORS
    //             ].map((filter) => {
    //                 return {
    //                     [FILTER_ID]: filter[ID],
    //                     [FILTER_NAME]: filter[NAME],
    //                 };
    //             }),
    //         },
    //     };
    // }, []);

    // useEffect(() => {
    //     if (voltageInitParams?.equipmentSelection) {
    //         fromEquipmentSelectionDataToFormValues(
    //             voltageInitParams.equipmentSelection
    //         );
    //     }
    // }, [fromEquipmentSelectionDataToFormValues, voltageInitParams]);

    return (
        <DialogContent>
            <Grid item container>
                <Grid item xs={4}>
                    <Typography component="span" variant="body1">
                        <Box fontWeight="fontWeightBold" m={1}>
                            <FormattedMessage id={'FixedGenerators'} />
                        </Box>
                    </Typography>
                </Grid>
                <Grid item xs={4} className={classes.controlItem}>
                    <DirectoryItemsInput
                        name={FIXED_GENERATORS}
                        equipmentTypes={[EQUIPMENT_TYPES.GENERATOR.type]}
                        elementType={elementType.FILTER}
                        titleId={'FixedGenerators'}
                        hideErrorMessage={true}
                    />
                </Grid>
            </Grid>
            <Grid item container>
                <Grid item xs={4}>
                    <Typography component="span" variant="body1">
                        <Box fontWeight="fontWeightBold" m={1}>
                            <FormattedMessage id={'VariableTransformers'} />
                        </Box>
                    </Typography>
                </Grid>
                <Grid item xs={4} className={classes.controlItem}>
                    <DirectoryItemsInput
                        name={VARIABLE_TRANSFORMERS}
                        equipmentTypes={[
                            EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER.type,
                            EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER.type,
                        ]}
                        elementType={elementType.FILTER}
                        titleId={'VariableTransformers'}
                        hideErrorMessage={true}
                    />
                </Grid>
            </Grid>
            <Grid item container>
                <Grid item xs={4}>
                    <Typography component="span" variant="body1">
                        <Box fontWeight="fontWeightBold" m={1}>
                            <FormattedMessage
                                id={'VariableShuntCompensators'}
                            />
                        </Box>
                    </Typography>
                </Grid>
                <Grid item xs={4} className={classes.controlItem}>
                    <DirectoryItemsInput
                        name={VARIABLE_SHUNT_COMPENSATORS}
                        equipmentTypes={[
                            EQUIPMENT_TYPES.SHUNT_COMPENSATOR.type,
                        ]}
                        elementType={elementType.FILTER}
                        titleId={'VariableShuntCompensators'}
                        hideErrorMessage={true}
                    />
                </Grid>
            </Grid>
        </DialogContent>
    );
};

export default EquipmentSelectionParameters;
