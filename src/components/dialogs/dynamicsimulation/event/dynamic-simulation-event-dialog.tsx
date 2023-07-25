/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormProvider, useForm } from 'react-hook-form';
import ModificationDialog from '../../commons/modificationDialog';
import { yupResolver } from '@hookform/resolvers/yup';
import { FetchStatus } from '../../../../utils/rest-api';
import { useCallback, useMemo, useState } from 'react';
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../network/constants';
import { DialogProps } from '@mui/material/Dialog/Dialog';
import { DynamicSimulationEventForm } from './dynamic-simulation-event-form';
import { Event, PrimitiveTypes } from './types/event.type';
import yup from 'components/utils/yup-config';
import { equipments } from '../../../network/network-equipments';

export const START_TIME = 'startTime';
export const SIDE = 'side';

const formSchema = yup
    .object()
    .shape({
        [START_TIME]: yup.number().required(),
        [SIDE]: yup.string(),
    })
    .required();

const emptyFormData = {
    [START_TIME]: 0,
    [SIDE]: null,
};

export type DynamicSimulationEventDialogProps = {
    studyUuid: string;
    currentNode: string;
    equipmentId: string;
    equipmentType: string; // must be a string enum
    isUpdate: boolean;
    onClose: () => void;
    editDataFetchStatus: string; // must be a string enum
    title: string;
} & DialogProps;

const DISCONNECT_EVENT_DEFINITION = {
    [START_TIME]: {
        type: PrimitiveTypes.FLOAT,
        labelId: 'T Event',
    },
};

enum EventType {
    DISCONNECT = 'Disconnect',
    STEP = 'Step',
    NODE_FAULT = 'NodeFault',
}

const eventDefinitions = {
    [EventType.DISCONNECT]: DISCONNECT_EVENT_DEFINITION,
    [EventType.STEP]: undefined,
    [EventType.NODE_FAULT]: undefined,
};

const getEventType = (equipmentType: string): EventType | undefined => {
    let eventType = undefined;
    switch (equipmentType) {
        case equipments.lines:
        case equipments.twoWindingsTransformers:
            eventType = EventType.DISCONNECT;
            break;
        default:
    }

    return eventType;
};

export const DynamicSimulationEventDialog = (
    props: DynamicSimulationEventDialogProps
) => {
    const {
        studyUuid,
        currentNode,
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
    const [eventValue, setEventValue] = useState<Event>();

    const waitingOpen = useOpenShortWaitFetching({
        isDataFetched: true,
        delay: FORM_LOADING_DELAY,
    });
    const open = defaultOpen !== undefined ? defaultOpen : waitingOpen;

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    // empty form
    const handleSetValuesAndEmptyOthers = useCallback(() => {}, []);

    // submit form
    const handleSubmit = useCallback(() => {}, []);

    const eventType = useMemo(
        () => getEventType(equipmentType),
        [equipmentType]
    );

    return (
        <FormProvider {...{ validationSchema: formSchema, ...formMethods }}>
            <ModificationDialog
                fullWidth
                onClose={onClose}
                onClear={handleSetValuesAndEmptyOthers}
                onSave={handleSubmit}
                aria-labelledby="dialog-event-configuration"
                maxWidth={'sm'}
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
                    eventValue={eventValue}
                />
            </ModificationDialog>
        </FormProvider>
    );
};
