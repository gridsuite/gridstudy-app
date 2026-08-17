/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { VoltageLevelCreationDto } from '@gridsuite/commons-ui';
import { VoltageLevelCreationInfo } from '../../../../../services/network-modification-types';

/**
 * Drops the call context, keeping only the modification-server DTO.
 */
export const toVoltageLevelCreationDto = ({
    studyUuid,
    nodeUuid,
    isUpdate,
    modificationUuid,
    ...dto
}: VoltageLevelCreationInfo): VoltageLevelCreationDto => dto;
