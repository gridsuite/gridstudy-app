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

    const updateMcsLists = useCallback(
        (hvdcLineData, editData) => {
            function mergeMcsLists(dynamicList, editList) {
                if (!dynamicList && !editList) {
                    return [];
                } else if (!dynamicList) {
                    // TODO: we should refactor modification-server to store only selected MCS
                    return editList.filter((item) => item.connectedToHvdc);
                } else if (!editList) {
                    return dynamicList;
                }
                const mergedList = dynamicList.map((obj) => {
                    return { ...obj, connectedToHvdc: false };
                });
                // now overwrite dynamic values with edited modification values
                const dynamicIds = dynamicList.map((obj) => obj.id);
                for (let editObj of editList.values()) {
                    if (dynamicIds.includes(editObj.id)) {
                        const mergedObj = mergedList.find((obj) => obj.id === editObj.id);
                        if (mergedObj) {
                            mergedObj.connectedToHvdc = editObj.connectedToHvdc;
                        }
                    } else if (editObj.connectedToHvdc) {
                        // if a selected edit data does not exist at this time, we add/display it anyway
                        mergedList.push(editObj);
                    }
                }
                return mergedList;
            }

            if (
                hvdcLineData?.mcsOnSide1 ||
                hvdcLineData?.mcsOnSide2 ||
                editData?.[DELETION_SPECIFIC_DATA]?.mcsOnSide1 ||
                editData?.[DELETION_SPECIFIC_DATA]?.mcsOnSide2
            ) {
                setValue(`${DELETION_SPECIFIC_DATA}.${DELETION_SPECIFIC_TYPE}`, HVDC_LINE_LCC_DELETION_SPECIFIC_TYPE);
                replaceMcsList1(
                    mergeMcsLists(hvdcLineData?.mcsOnSide1, editData?.[DELETION_SPECIFIC_DATA]?.mcsOnSide1)
                );
                replaceMcsList2(
                    mergeMcsLists(hvdcLineData?.mcsOnSide2, editData?.[DELETION_SPECIFIC_DATA]?.mcsOnSide2)
                );
            } else {
                setValue(DELETION_SPECIFIC_DATA, null);
            }
        },
        [replaceMcsList1, replaceMcsList2, setValue]
    );

    const specificUpdate = useCallback(
        (studyUuid, nodeId, currentRootNetworkUuid, equipmentId, editData) => {
            fetchHvdcLineWithShuntCompensators(studyUuid, nodeId, currentRootNetworkUuid, equipmentId)
                .then((hvdcLineData) => {
                    updateMcsLists(hvdcLineData, editData);
                })
                .catch((error) => {
                    setValue(DELETION_SPECIFIC_DATA, null);
                    snackError({
                        messageTxt: error.message,
                        headerId: 'HVDCLineConverterStationError',
                    });
                });
        },
        [setValue, updateMcsLists, snackError]
    );

    return { specificUpdate };
};

export default useHvdcLccDeletion;
