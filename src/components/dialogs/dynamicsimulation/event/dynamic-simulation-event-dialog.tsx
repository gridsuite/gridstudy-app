/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormProvider, useForm } from 'react-hook-form';
import ModificationDialog from '../../commons/modificationDialog';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../network/constants';
import { DialogProps } from '@mui/material/Dialog/Dialog';
import { DynamicSimulationEventForm } from './dynamic-simulation-event-form';
import {
    Event,
    EventProperty,
    EventPropertyName,
    PrimitiveTypes,
} from './types/event.type';
import yup from 'components/utils/yup-config';
import { getSchema } from './util/event-yup';
import { eventDefinitions, getEventType } from './model/event.model';
import {
    fetchDynamicSimulationEvent,
    saveDynamicSimulationEvent,
} from '../../../../services/dynamic-simulation';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { FetchStatus } from '../../../../services/utils';

export type DynamicSimulationEventDialogProps = {
    studyUuid: string;
    currentNodeId: string;
    equipmentId: string;
    equipmentType: string; // must be a string enum
    isUpdate: boolean;
    onClose: () => void;
    editDataFetchStatus: string; // must be a string enum
    title: string;
} & DialogProps;

export const DynamicSimulationEventDialog = (
    props: DynamicSimulationEventDialogProps
) => {
    const {
        studyUuid,
        currentNodeId,
        equipmentId,
        equipmentType,
        isUpdate,
        onClose,
        editDataFetchStatus,
        title,
        open: defaultOpen,
        ...dialogProps
    } = props;

    const { snackError } = useSnackMessage();
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);
    const [event, setEvent] = useState<Event>();

    const eventType = useMemo(
        () => getEventType(equipmentType),
        [equipmentType]
    );

    const eventDefinition = useMemo(
        () => (eventType ? eventDefinitions[eventType] : undefined),
        [eventType]
    );

    // build formSchema from an event definition
    const formSchema = useMemo(
        () =>
            yup
                .object()
                .shape(
                    eventDefinition
                        ? Object.entries(eventDefinition).reduce(
                              (obj, [key, value]) => ({
                                  ...obj,
                                  [key]: getSchema(value),
                              }),
                              {}
                          )
                        : {}
                )
                .required(),
        [eventDefinition]
    );

    // build default values from an event definition
    const defaultFormData: {
        [Property in EventPropertyName]?: any;
    } = useMemo(
        () =>
            eventDefinition
                ? Object.entries(eventDefinition).reduce(
                      (obj, [key, value]) => ({
                          ...obj,
                          [key]: value.default,
                      }),
                      {}
                  )
                : {},
        [eventDefinition]
    );

    const formMethods = useForm({
        defaultValues: defaultFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset } = formMethods;

    // load event for equipment
    useEffect(() => {
        setDataFetchStatus(FetchStatus.RUNNING);
        fetchDynamicSimulationEvent(studyUuid, currentNodeId, equipmentId).then(
            (event) => {
                setDataFetchStatus(FetchStatus.SUCCEED);
                setEvent(event);
            }
        );
    }, [currentNodeId, equipmentId, studyUuid, reset]);

    // reset form data when event available after fetch
    useEffect(() => {
        if (event && eventDefinition) {
            const formData = Object.entries(eventDefinition).reduce(
                (obj, [key, value]) => ({
                    ...obj,
                    [key]: event.properties.find(
                        (property) => property.name === key
                    )?.value,
                }),
                {}
            );
            reset(formData);
        }
    }, [eventDefinition, event, reset]);

    // empty form
    const handleClear = useCallback(() => {
        reset(defaultFormData);
    }, [reset, defaultFormData]);

    // submit form
    const handleSubmit = useCallback(
        (formObj: { [KEY in EventPropertyName]: any }) => {
            // formObj to EventProperty[]
            const propertyNames = Object.keys(
                eventDefinition ?? {}
            ) as EventPropertyName[];

            const properties = propertyNames.reduce(
                (arr, propertyName) => [
                    ...arr,
                    {
                        name: propertyName,
                        value: formObj[propertyName],
                        type: eventDefinition
                            ? eventDefinition[propertyName]?.type
                            : PrimitiveTypes.STRING,
                    } as EventProperty,
                ],
                [
                    {
                        name: 'staticId',
                        value: equipmentId,
                        type: PrimitiveTypes.STRING,
                    },
                ] as EventProperty[]
            );

            const submitEvent: Event = event
                ? {
                      // existing event for the equipment => override only properties
                      ...event,
                      properties,
                  }
                : {
                      // create a new event for the equipment
                      nodeId: currentNodeId,
                      equipmentId,
                      equipmentType,
                      eventType,
                      properties,
                  };

            saveDynamicSimulationEvent(
                studyUuid,
                currentNodeId,
                submitEvent
            ).catch((error) => {
                // should use snackError from useSnackMessage in common-ui
                snackError({
                    messageTxt: error.message,
                    headerId: 'DynamicSimulationEventSaveError',
                });
            });
        },
        [
            currentNodeId,
            equipmentId,
            equipmentType,
            snackError,
            studyUuid,
            eventType,
            event,
            eventDefinition,
        ]
    );

    const waitingOpen = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED ||
                editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED ||
                    dataFetchStatus === FetchStatus.FAILED)),
        delay: FORM_LOADING_DELAY,
    });
    const open = defaultOpen !== undefined ? defaultOpen : waitingOpen;

    return (
        <FormProvider
            {...{
                validationSchema: formSchema,
                removeOptional: true,
                ...formMethods,
            }}
        >
            <ModificationDialog
                fullWidth
                onClose={onClose}
                onClear={handleClear}
                onSave={handleSubmit}
                aria-labelledby="dialog-event-configuration"
                maxWidth={'xs'}
                titleId={title}
                open={open}
                keepMounted={true}
                showNodeNotBuiltWarning={!!equipmentId}
                isDataFetching={
                    isUpdate &&
                    (editDataFetchStatus === FetchStatus.RUNNING ||
                        dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                <DynamicSimulationEventForm
                    equipmentId={equipmentId}
                    eventDefinition={
                        eventType ? eventDefinitions[eventType] : undefined
                    }
                    event={event}
                />
            </ModificationDialog>
        </FormProvider>
    );
};
