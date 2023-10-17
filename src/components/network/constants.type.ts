/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export enum EventCrudType {
    EVENT_CREATING_IN_PROGRESS = 'eventCreatingInProgress',
    EVENT_UPDATING_IN_PROGRESS = 'eventUpdatingInProgress',
    EVENT_DELETING_IN_PROGRESS = 'eventDeletingInProgress',
}

export const EVENT_CRUD_FINISHED = 'EVENT_CRUD_FINISHED';
