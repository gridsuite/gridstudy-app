/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useIntl } from 'react-intl';
import { useState } from 'react';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { EQUIPMENT_INFOS_TYPES } from '../utils/equipment-types';
import { fetchNetworkElementInfos } from '../../services/study/network';

export const useFormSearchCopy = ({
    studyUuid,
    currentNodeUuid,
    currentRootNetworkUuid,
    toFormValues,
    setFormValues,
    elementType,
}) => {
    const intl = useIntl();

    const { snackInfo, snackError } = useSnackMessage();

    const [isDialogSearchOpen, setDialogSearchOpen] = useState(false);

    const handleSelectionChange = (element) => {
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
