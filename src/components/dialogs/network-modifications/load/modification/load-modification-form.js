/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TextInput } from '@gridsuite/commons-ui';
import {
    ACTIVE_POWER, ADDED, ADDITIONAL_PROPERTIES, DELETION_MARK,
    EQUIPMENT_NAME,
    LOAD_TYPE, PREVIOUS_VALUE,
    REACTIVE_POWER
} from 'components/utils/field-constants';
import {
    ActivePowerAdornment,
    filledTextField,
    gridItem,
    GridSection,
    ReactivePowerAdornment,
} from '../../../dialogUtils';
import { SelectInput } from '@gridsuite/commons-ui';
import { getLoadTypeLabel, LOAD_TYPES } from 'components/network/constants';
import { FloatInput } from '@gridsuite/commons-ui';
import Grid from '@mui/material/Grid';
import React, { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import {
    EQUIPMENT_INFOS_TYPES,
    EQUIPMENT_TYPES,
} from 'components/utils/equipment-types';
import { TextField } from '@mui/material';
import { fetchNetworkElementInfos } from '../../../../../services/study/network';
import { FetchStatus } from '../../../../../services/utils';
import ExpandableInput from '../../../../utils/rhf-inputs/expandable-input';
import PropertyForm from '../../common/property-form';
import { concatProperties, getPropertiesFromEquipment, initializedProperty } from '../../common/property-utils';
import { useFormContext, useWatch } from 'react-hook-form';

const LoadModificationForm = ({
    loadToModify,
    equipmentId,
}) => {
    const intl = useIntl();
    const { getValues, setValue } = useFormContext();
    const watchProps = useWatch({
        name: ADDITIONAL_PROPERTIES,
    });

    const getDeletionMark = useCallback(
        (idx) => {
            const properties = getValues(`${ADDITIONAL_PROPERTIES}`);
            if (properties && typeof properties[idx] !== 'undefined') {
                return watchProps && properties[idx][DELETION_MARK];
            }
            return false;
        },
        [getValues, watchProps]
    );

    const deleteCallback = useCallback(
        (idx) => {
            let marked = false;
            const properties = getValues(`${ADDITIONAL_PROPERTIES}`);
            if (properties && typeof properties[idx] !== 'undefined') {
                marked = properties[idx][DELETION_MARK];
            } else {
                return false;
            }

            let canRemoveLine = true;
            if (marked) {
                // just unmark
                setValue(
                    `${ADDITIONAL_PROPERTIES}.${idx}.${DELETION_MARK}`,
                    false,
                    { shouldDirty: true }
                );
                canRemoveLine = false;
            } else {
                // we can mark as deleted only prop having a previous value, not added in current modification
                if (
                    properties[idx][PREVIOUS_VALUE] &&
                    properties[idx][ADDED] === false
                ) {
                    setValue(
                        `${ADDITIONAL_PROPERTIES}.${idx}.${DELETION_MARK}`,
                        true,
                        { shouldDirty: true }
                    );
                    canRemoveLine = false;
                }
            }
            // otherwise just delete the line
            return canRemoveLine;
        },
        [getValues, setValue]
    );

    const loadIdField = (
        <TextField
            size="small"
            fullWidth
            label={'ID'}
            value={equipmentId}
            InputProps={{
                readOnly: true,
            }}
            disabled
            {...filledTextField}
        />
    );

    const loadNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label={'Name'}
            formProps={filledTextField}
            previousValue={loadToModify?.name}
            clearable
        />
    );

    const loadTypeField = (
        <SelectInput
            name={LOAD_TYPE}
            label="Type"
            options={LOAD_TYPES}
            fullWidth
            size={'small'}
            formProps={filledTextField}
            previousValue={
                loadToModify?.type && loadToModify.type !== 'UNDEFINED'
                    ? intl.formatMessage({
                          id: getLoadTypeLabel(loadToModify?.type),
                      })
                    : undefined
            }
        />
    );

    const activePowerField = (
        <FloatInput
            name={ACTIVE_POWER}
            label={'ActivePowerText'}
            adornment={ActivePowerAdornment}
            previousValue={loadToModify?.p0}
            clearable
        />
    );

    const reactivePowerField = (
        <FloatInput
            name={REACTIVE_POWER}
            label={'ReactivePowerText'}
            adornment={ReactivePowerAdornment}
            previousValue={loadToModify?.q0}
            clearable
        />
    );

    const additionalProps = (
        <ExpandableInput
            name={ADDITIONAL_PROPERTIES}
            Field={PropertyForm}
            fieldProps={{networkElementType: "load"}}
            addButtonLabel={'AddProperty'}
            initialValue={initializedProperty()}
            getDeletionMark={getDeletionMark}
            deleteCallback={deleteCallback}
            watchProps={watchProps}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                {gridItem(loadIdField, 4)}
                {gridItem(loadNameField, 4)}
                {gridItem(loadTypeField, 4)}
            </Grid>
            <GridSection title="Setpoints" />
            <Grid container spacing={2}>
                {gridItem(activePowerField, 4)}
                {gridItem(reactivePowerField, 4)}
            </Grid>
            <Grid container>
                <GridSection title={'AdditionalInformations'} />
                {additionalProps}
            </Grid>
        </>
    );
};

export default LoadModificationForm;
