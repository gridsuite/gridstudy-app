/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Grid, TextField } from '@mui/material';
import { filledTextField, gridItem } from '../../dialogUtils';
import { Event, EventDefinition } from './types/event.type';
import React from 'react';
import { makeComponentFor } from './util/make-component-utils';

export type DynamicSimulationBasicEventFormProps = {
    equipmentId: string;
    eventDefinition: EventDefinition | undefined;
    eventValue?: Event | undefined;
};

export const DynamicSimulationEventForm = (
    props: DynamicSimulationBasicEventFormProps
) => {
    const { equipmentId, eventDefinition, eventValue } = props;

    const propertyNames = eventDefinition ? Object.keys(eventDefinition) : [];

    const EquipmentIdField = (
        <TextField
            size="small"
            fullWidth
            label={'ID'}
            value={equipmentId}
            InputProps={{
                readOnly: true,
                ...filledTextField,
            }}
            disabled
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                {gridItem(EquipmentIdField, 8)}
            </Grid>
            {propertyNames.map((propertyName) => (
                <Grid container spacing={2}>
                    {gridItem(
                        makeComponentFor(
                            propertyName,
                            eventDefinition
                                ? eventDefinition[propertyName]
                                : undefined,
                            eventValue ? eventValue[propertyName] : undefined
                        ),
                        8
                    )}
                </Grid>
            ))}
        </>
    );
};
