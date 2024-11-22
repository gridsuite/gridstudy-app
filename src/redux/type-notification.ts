/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';
import type ComputingType from '../components/computing-status/computing-type';

export enum NotificationType {
    STUDY = 'study',
    COMPUTATION_PARAMETERS_UPDATED = 'computationParametersUpdated',
}

// Headers
export interface StudyUpdatedEventDataHeader {
    studyUuid: UUID;
    parentNode: UUID;
    timestamp: number;
    updateType?: string;
    node?: UUID;
    nodes?: UUID[];
    error?: string;
    userId?: string;
    computationType?: ComputingType;
}

// Payloads
export interface DeletedEquipment {
    equipmentId: string;
    equipmentType: string;
}
export interface NetworkImpactsInfos {
    impactedSubstationsIds: UUID[];
    deletedEquipments: DeletedEquipment[];
    impactedElementTypes: string[];
}

// Redux state
export type StudyUpdated = {
    force: number; //IntRange<0, 1>;
} & (
    | {
          type: undefined;
          eventData: {
              headers: StudyUpdatedEventDataHeader;
              payload: string;
          };
      }
    | {
          type: NotificationType.STUDY;
          eventData: {
              headers: StudyUpdatedEventDataHeader;
              payload: NetworkImpactsInfos;
          };
      }
);
