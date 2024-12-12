/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useForm } from 'react-hook-form';
import ModificationDialog from '../../commons/modificationDialog';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../network/constants';
import { DialogProps } from '@mui/material/Dialog/Dialog';
import { DynamicSimulationEventForm } from './dynamic-simulation-event-form';
import { Event, EventProperty, EventPropertyName, PrimitiveTypes } from './types/event.type';
import yup from 'components/utils/yup-config';
import { getSchema } from './util/event-yup';
import { eventDefinitions, getEventType } from './model/event.model';
import { fetchDynamicSimulationEvent, saveDynamicSimulationEvent } from '../../../../services/dynamic-simulation';
import { CustomFormProvider, useSnackMessage } from '@gridsuite/commons-ui';
import { FetchStatus } from '../../../../services/utils';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';

export type DynamicSimulationEventDialogProps = {
    equipmentId: string;
    equipmentType: EQUIPMENT_TYPES;
    onClose: () => void;
    title: string;
    open?: boolean;
} & Omit<DialogProps, 'open'>;

export const DynamicSimulationEventDialog = (props: DynamicSimulationEventDialogProps) => {
    const { equipmentId, equipmentType, onClose, title, open: defaultOpen, ...dialogProps } = props;

    const { snackError } = useSnackMessage();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentNodeId = currentNode?.id;
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);
    const [event, setEvent] = useState<Event>();

    const eventType = useMemo(() => getEventType(equipmentType), [equipmentType]);

    const eventDefinition = useMemo(() => (eventType ? eventDefinitions[eventType] : undefined), [eventType]);

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
                ? Object.fromEntries(Object.entries(eventDefinition).map(([key, value]) => [key, value.default]))
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
        if (!studyUuid || !currentNodeId) {
            return;
        }
        setDataFetchStatus(FetchStatus.RUNNING);
        fetchDynamicSimulationEvent(studyUuid, currentNodeId, equipmentId).then((event) => {
            setDataFetchStatus(FetchStatus.SUCCEED);
            setEvent(event);
        });
    }, [currentNodeId, equipmentId, studyUuid, reset]);

    // reset form data when event available after fetch
    useEffect(() => {
        if (event && eventDefinition) {
            const formData = Object.fromEntries(
                Object.entries(eventDefinition).map(([key, value]) => [
                    key,
                    event.properties.find((property) => property.name === key)?.value,
                ])
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
            if (!studyUuid || !currentNodeId) {
                return;
            }
            // formObj to EventProperty[]
            const propertyNames = Object.keys(formObj ?? {}) as EventPropertyName[];

            // new or changed properties
            const properties = propertyNames.reduce(
                (arr, propertyName) => [
                    ...arr,
                    {
                        // lookup the corresponding old property by name to merge
                        ...event?.properties.find((elem) => elem.name === propertyName),
                        name: propertyName,
                        value: formObj[propertyName],
                        type: eventDefinition ? eventDefinition[propertyName]?.type : PrimitiveTypes.STRING,
                    } as EventProperty,
                ],
                [
                    {
                        ...event?.properties.find((elem) => elem.name === 'staticId'),
                        name: 'staticId',
                        value: equipmentId,
                        type: PrimitiveTypes.STRING,
                    },
                ] as EventProperty[]
            );

            const submitEvent: Event = event
                ? {
                      // existing event for the equipment => merge only properties
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

            saveDynamicSimulationEvent(studyUuid, currentNodeId, submitEvent).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'DynamicSimulationEventSaveError',
                });
            });
        },
        [currentNodeId, equipmentId, equipmentType, snackError, studyUuid, eventType, event, eventDefinition]
    );

    const waitingOpen = useOpenShortWaitFetching({
        isDataFetched: dataFetchStatus === FetchStatus.SUCCEED || dataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const open = defaultOpen ?? waitingOpen;

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
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
                isDataFetching={dataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <DynamicSimulationEventForm
                    equipmentId={equipmentId}
                    equipmentType={equipmentType}
                    eventDefinition={eventType ? eventDefinitions[eventType] : undefined}
                    event={event}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};
