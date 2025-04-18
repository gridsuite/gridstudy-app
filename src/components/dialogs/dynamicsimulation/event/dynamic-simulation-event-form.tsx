/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Grid, TextField } from '@mui/material';
import { filledTextField } from '../../dialog-utils';
import { Event, EventDefinition, EventPropertyName } from './types/event.type';
import { makeComponentFor } from './util/event-rhf';
import { useIntl } from 'react-intl';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import GridItem from '../../commons/grid-item';

export type DynamicSimulationBasicEventFormProps = {
    equipmentId: string;
    equipmentType: EQUIPMENT_TYPES;
    eventDefinition?: EventDefinition;
    event?: Event;
};

export const DynamicSimulationEventForm = (props: DynamicSimulationBasicEventFormProps) => {
    const { equipmentId, equipmentType, eventDefinition, event } = props;

    const propertyNames: EventPropertyName[] = (
        eventDefinition ? Object.keys(eventDefinition) : []
    ) as EventPropertyName[];

    const intl = useIntl();

    const EquipmentIdField = (
        <TextField
            size="small"
            fullWidth
            label={'ID'}
            value={equipmentId}
            InputProps={{
                readOnly: true,
            }}
            {...filledTextField}
            disabled
        />
    );

    return (
        <Grid container rowSpacing={2} spacing={2} paddingTop={2}>
            <Grid container item spacing={2}>
                <GridItem size={12}>{EquipmentIdField}</GridItem>
            </Grid>
            {/* event's properties defined in the eventDefinition   */}
            <Grid container item spacing={2}>
                {propertyNames.map((propertyName) => {
                    const propertyDefinition = eventDefinition ? eventDefinition[propertyName] : undefined;

                    const hasEnumValues = propertyDefinition ? !!propertyDefinition.values : false;

                    const propertyValue = event?.properties.find((elem) => elem.name === propertyName)?.value;

                    // compatibility check between event property and equipment type to show or not
                    const visible = !propertyDefinition?.acceptOnly || propertyDefinition.acceptOnly(equipmentType);

                    return (
                        visible && (
                            <GridItem size={12}>
                                {makeComponentFor(
                                    propertyName,
                                    propertyDefinition,
                                    propertyValue && hasEnumValues
                                        ? intl.formatMessage({
                                              id: propertyValue,
                                          })
                                        : propertyValue
                                )}
                            </GridItem>
                        )
                    );
                })}
            </Grid>
        </Grid>
    );
};
