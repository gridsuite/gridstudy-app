/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    DELETION_SPECIFIC_DATA,
    DELETION_SPECIFIC_TYPE,
    HVDC_LINE_LCC_DELETION_SPECIFIC_TYPE,
    SHUNT_COMPENSATOR_SIDE_1,
    SHUNT_COMPENSATOR_SIDE_2,
} from 'components/utils/field-constants';
import { useCallback } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { fetchHvdcLineWithShuntCompensators } from '../../../../../services/study/network-map';

const useHvdcLccDeletion = () => {
    const { replace: replaceMcsList1 } = useFieldArray({
        name: `${DELETION_SPECIFIC_DATA}.${SHUNT_COMPENSATOR_SIDE_1}`,
    });
    const { replace: replaceMcsList2 } = useFieldArray({
        name: `${DELETION_SPECIFIC_DATA}.${SHUNT_COMPENSATOR_SIDE_2}`,
    });
    const { setValue } = useFormContext();
    const { snackError } = useSnackMessage();

    const updateMscLists = useCallback(
        (hvdcLineData) => {
            if (hvdcLineData?.mcsOnSide1 || hvdcLineData?.mcsOnSide2) {
                setValue(
                    `${DELETION_SPECIFIC_DATA}.${DELETION_SPECIFIC_TYPE}`,
                    HVDC_LINE_LCC_DELETION_SPECIFIC_TYPE
                );
                replaceMcsList1(
                    hvdcLineData?.mcsOnSide1 ? hvdcLineData.mcsOnSide1 : []
                );
                replaceMcsList2(
                    hvdcLineData?.mcsOnSide2 ? hvdcLineData.mcsOnSide2 : []
                );
            } else {
                setValue(DELETION_SPECIFIC_DATA, null);
            }
        },
        [replaceMcsList1, replaceMcsList2, setValue]
    );

    const specificUpdate = useCallback(
        (studyUuid, nodeId, equipmentId) => {
            fetchHvdcLineWithShuntCompensators(studyUuid, nodeId, equipmentId)
                .then((hvdcLineData) => {
                    updateMscLists(hvdcLineData);
                })
                .catch((error) => {
                    setValue(DELETION_SPECIFIC_DATA, null);
                    snackError({
                        messageTxt: error.message,
                        headerId: 'HVDCLineConverterStationError',
                    });
                });
        },
        [setValue, updateMscLists, snackError]
    );

    return { specificUpdate };
};

export default useHvdcLccDeletion;
