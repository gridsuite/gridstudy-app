/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Grid, TextField } from '@mui/material';
import { filledTextField, gridItem } from '../../dialogUtils';
import { Event, EventDefinition, EventPropertyName } from './types/event.type';
import React from 'react';
import { makeComponentFor } from './util/event-rhf';

export type DynamicSimulationBasicEventFormProps = {
    equipmentId: string;
    eventDefinition?: EventDefinition;
    eventValue?: Event;
};

export const DynamicSimulationEventForm = (
    props: DynamicSimulationBasicEventFormProps
) => {
    const { equipmentId, eventDefinition, eventValue } = props;

    const propertyNames: EventPropertyName[] = (
        eventDefinition ? Object.keys(eventDefinition) : []
    ) as EventPropertyName[];

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
        <Grid container rowSpacing={2} spacing={2} paddingTop={2}>
            <Grid container item spacing={2}>
                {gridItem(EquipmentIdField, 8)}
            </Grid>
            {/* event's properties defined in the eventDefinition   */}
            <Grid container item spacing={2}>
                {propertyNames.map((propertyName) =>
                    gridItem(
                        makeComponentFor(
                            propertyName,
                            eventDefinition
                                ? eventDefinition[propertyName]
                                : undefined,
                            eventValue ? eventValue[propertyName] : undefined
                        ),
                        8
                    )
                )}
            </Grid>
        </Grid>
    );
};
