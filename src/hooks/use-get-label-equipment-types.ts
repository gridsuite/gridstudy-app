/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { EQUIPMENT_TYPES } from '../components/utils/equipment-types';
import { getIdOrValue } from '../components/dialogs/commons/utils';
import { Option } from '@gridsuite/commons-ui';

export default function useGetLabelEquipmentTypes() {
    const intl = useIntl();
    return useMemo(
        () => (equipmentType: Option) =>
            intl.formatMessage({
                id: equipmentType === EQUIPMENT_TYPES.HVDC_LINE ? 'Hvdc' : getIdOrValue(equipmentType),
            }),
        [intl]
    );
}
