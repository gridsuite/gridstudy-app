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
import { Event, EventPropertyName } from './types/event.type';
import yup from 'components/utils/yup-config';
import { getSchema } from './util/event-yup';
import { eventDefinitions, getEventType } from './model/event.model';
import { saveEvent, getEvent } from '../../../../services/dynamic-simulation';
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

    const [selectedId, setSelectedId] = useState(equipmentId ?? null);
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);
    const [event, setEvent] = useState<Event>();

    const { snackError } = useSnackMessage();

    const waitingOpen = useOpenShortWaitFetching({
        isDataFetched: true,
        delay: FORM_LOADING_DELAY,
    });
    const open = defaultOpen !== undefined ? defaultOpen : waitingOpen;

    // empty form
    const handleSetValuesAndEmptyOthers = useCallback(() => {}, []);

    const eventType = useMemo(
        () => getEventType(equipmentType),
        [equipmentType]
    );

    // submit form
    const handleSubmit = useCallback(
        (event: Event) => {
            const eventWithId = {
                ...event,
                staticId: equipmentId,
                equipmentType,
                eventType,
            };
            saveEvent(studyUuid, currentNodeId, eventWithId)
                .then((event) => {
                    console.log('Save successfully event : ', event);
                })
                .catch((error) => {
                    // should use snackError from useSnackMessage in common-ui
                    snackError({
                        messageTxt: error.message,
                        headerId: 'DynamicSimulationEventSaveError',
                    });
                    console.log('Error occurs when save an event');
                });
        },
        [
            currentNodeId,
            equipmentId,
            equipmentType,
            snackError,
            studyUuid,
            eventType,
        ]
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
    const emptyFormData: {
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
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    // load event for equipment
    useEffect(() => {
        setDataFetchStatus(FetchStatus.RUNNING);
        getEvent(studyUuid, currentNodeId, equipmentId).then((event) => {
            setDataFetchStatus(FetchStatus.SUCCEED);
            setEvent(event);
        });
    }, [currentNodeId, equipmentId, studyUuid]);

    return (
        <FormProvider {...{ validationSchema: formSchema, ...formMethods }}>
            <ModificationDialog
                fullWidth
                onClose={onClose}
                onClear={handleSetValuesAndEmptyOthers}
                onSave={handleSubmit}
                aria-labelledby="dialog-event-configuration"
                maxWidth={'xs'}
                titleId={title}
                open={open}
                keepMounted={true}
                showNodeNotBuiltWarning={selectedId != null}
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
