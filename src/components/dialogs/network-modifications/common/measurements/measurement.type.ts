/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FieldType } from '@gridsuite/commons-ui/dist/utils/types/fieldType';

export interface BranchActiveReactivePowerMeasurementsFormProps {
    equipmentToModify: any;
}

export interface MeasurementInfo {
    value: number;
    validity: boolean;
}

export interface MeasurementProps {
    id: string;
    field: FieldType;
    measurement?: MeasurementInfo;
}
