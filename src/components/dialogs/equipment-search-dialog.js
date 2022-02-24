/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import {
    ElementSearchDialog,
    equipmentStyles,
    getEquipmentsInfosForSearchBar,
    renderEquipmentForSearchBar,
} from '@gridsuite/commons-ui';
import React, { useCallback, useState } from 'react';
import { fetchEquipmentsInfos } from '../../utils/rest-api';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';
import { useParams } from 'react-router-dom';
import { PARAM_USE_NAME } from '../../utils/config-params';
import { makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';

const useEquipmentStyles = makeStyles(equipmentStyles);

/**
 * Dialog to search equipment with a given type
 * @param {Boolean} open: Is the dialog open ?
 * @param {Function} onClose: callback to call when closing the dialog
 * @param {Function} onSelectionChange: callback when the selection changes
 * @param {String} equipmentType: the type of equipment we want to search
 * @param {String} workingNodeUuid: the node we are currently working on
 */
const EquipmentSearchDialog = ({
    open,
    onClose,
    onSelectionChange,
    equipmentType,
    workingNodeUuid,
}) => {
    const equipmentClasses = useEquipmentStyles();

    const intl = useIntl();
    const intlRef = useIntlRef();
    const { enqueueSnackbar } = useSnackbar();
    const studyUuid = decodeURIComponent(useParams().studyUuid);
    const useNameLocal = useState(PARAM_USE_NAME);

    const [equipmentsFound, setEquipmentsFound] = useState([]);

    const searchMatchingEquipments = useCallback(
        (searchTerm) => {
            fetchEquipmentsInfos(
                studyUuid,
                workingNodeUuid,
                searchTerm,
                useNameLocal,
                equipmentType
            )
                .then((infos) =>
                    setEquipmentsFound(
                        getEquipmentsInfosForSearchBar(infos, useNameLocal)
                    )
                )
                .catch((errorMessage) =>
                    displayErrorMessageWithSnackbar({
                        errorMessage: errorMessage,
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId: 'equipmentsSearchingError',
                            intlRef: intlRef,
                        },
                    })
                );
        },
        [
            studyUuid,
            workingNodeUuid,
            useNameLocal,
            enqueueSnackbar,
            intlRef,
            equipmentType,
        ]
    );

    return (
        <ElementSearchDialog
            open={open}
            onClose={onClose}
            searchingLabel={intl.formatMessage({
                id: 'equipment_search/label',
            })}
            onSearchTermChange={searchMatchingEquipments}
            onSelectionChange={(element) => {
                onSelectionChange(element);
            }}
            elementsFound={equipmentsFound}
            renderElement={renderEquipmentForSearchBar(equipmentClasses, intl)}
        />
    );
};

EquipmentSearchDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSelectionChange: PropTypes.func.isRequired,
    equipmentType: PropTypes.string.isRequired,
    workingNodeUuid: PropTypes.string.isRequired,
};

export default EquipmentSearchDialog;
