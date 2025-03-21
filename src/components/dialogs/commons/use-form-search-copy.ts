/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useIntl } from 'react-intl';
import { useState } from 'react';
import { EquipmentType, ExtendedEquipmentType, useSnackMessage } from '@gridsuite/commons-ui';
import { EQUIPMENT_INFOS_TYPES, EQUIPMENT_TYPES } from '../../utils/equipment-types';
import { fetchNetworkElementInfos } from '../../../services/study/network';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import { UUID } from 'crypto';
import { EquipmentInfos } from '@gridsuite/commons-ui/dist/utils/types/equipmentType';

export const useFormSearchCopy = (
    toFormValues: (data: any) => any,
    setFormValues: (data: any) => void,
    elementType: EquipmentType | ExtendedEquipmentType | EQUIPMENT_TYPES
) => {
    const intl = useIntl();
    const { snackInfo, snackError } = useSnackMessage();
    const currentNodeUuid = useSelector((state: AppState) => state.currentTreeNode?.id);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid as UUID);
    const studyUuid = useSelector((state: AppState) => state.studyUuid as UUID);

    const [isDialogSearchOpen, setDialogSearchOpen] = useState(false);

    const handleSelectionChange = (element: EquipmentInfos) => {
        let msg;
        const fetchElementPromise = fetchNetworkElementInfos(
            studyUuid,
            currentNodeUuid,
            currentRootNetworkUuid,
            elementType,
            EQUIPMENT_INFOS_TYPES.FORM.type,
            element.id,
            true
        );
        return fetchElementPromise
            .then((response) => {
                const equipmentFormValues = toFormValues(response);
                setFormValues(equipmentFormValues);

                msg = intl.formatMessage(
                    { id: 'EquipmentCopied' },
                    {
                        equipmentId: element.id,
                    }
                );
                snackInfo({
                    messageTxt: msg,
                });
            })
            .catch((error) => {
                console.error(
                    'error while fetching equipment {equipmentId} : message = {message}',
                    element.id,
                    error.message
                );
                if (error.status === 404) {
                    msg = intl.formatMessage(
                        { id: 'EquipmentCopyFailed404' },
                        {
                            equipmentId: element.id,
                        }
                    );
                } else {
                    msg =
                        intl.formatMessage(
                            { id: 'EquipmentCopyFailed' },
                            {
                                equipmentId: element.id,
                            }
                        ) +
                        ' ' +
                        error.message;
                }
                snackError({
                    messageTxt: msg,
                });
            })
            .finally(() => handleCloseSearchDialog());
    };

    const handleCloseSearchDialog = () => {
        setDialogSearchOpen(false);
    };

    const handleOpenSearchDialog = () => {
        setDialogSearchOpen(true);
    };

    return {
        isDialogSearchOpen,
        handleOpenSearchDialog,
        handleSelectionChange,
        handleCloseSearchDialog,
    };
};
