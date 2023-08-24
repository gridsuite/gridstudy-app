/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SelectInput } from '@gridsuite/commons-ui';
import { Grid } from '@mui/material';
import { gridItem } from 'components/dialogs/dialogUtils';
import {
    CRITERIA_BASED,
    EQUIPMENT_TYPE,
} from 'components/utils/field-constants';
import InputWithPopupConfirmation from 'components/utils/rhf-inputs/select-inputs/input-with-popup-confirmation';
import { useFormContext, useWatch } from 'react-hook-form';

const CriteriaBasedForm = ({ equipments, defaultValues }) => {
    const { getValues, setValue } = useFormContext();

    const watchEquipmentType = useWatch({
        name: EQUIPMENT_TYPE,
    });

    const openConfirmationPopup = () => {
        return (
            JSON.stringify(getValues(CRITERIA_BASED)) !==
            JSON.stringify(defaultValues)
        );
    };

    const handleResetOnConfirmation = () => {
        Object.keys(defaultValues).forEach((field) =>
            setValue(`${CRITERIA_BASED}.${field}`, defaultValues[field])
        );
    };

    const equipmentTypeSelectionField = (
        <InputWithPopupConfirmation
            Input={SelectInput}
            name={EQUIPMENT_TYPE}
            options={Object.values(equipments)}
            label={'equipmentType'}
            shouldOpenPopup={openConfirmationPopup}
            resetOnConfirmation={handleResetOnConfirmation}
        />
    );

    return (
        <Grid container item spacing={2}>
            {gridItem(equipmentTypeSelectionField, 12)}
            {watchEquipmentType &&
                equipments[watchEquipmentType].fields.map(
                    (equipment, index) => {
                        const EquipmentForm = equipment.renderer;
                        return (
                            <Grid item xs={12} key={index} flexGrow={1}>
                                <EquipmentForm {...equipment.props} />
                            </Grid>
                        );
                    }
                )}
        </Grid>
    );
};

export default CriteriaBasedForm;
