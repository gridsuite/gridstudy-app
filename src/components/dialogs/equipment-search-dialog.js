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
    EquipmentItem,
} from '@gridsuite/commons-ui';
import React from 'react';
import { useParams } from 'react-router-dom';
import makeStyles from '@mui/styles/makeStyles';
import { useSearchMatchingEquipments } from '../utils/search-matching-equipments';

const useEquipmentStyles = makeStyles(equipmentStyles);

/**
 * Dialog to search equipment with a given type
 * @param {Boolean} open: Is the dialog open ?
 * @param {Function} onClose: callback to call when closing the dialog
 * @param {Function} onSelectionChange: callback when the selection changes
 * @param {String} equipmentType: the type of equipment we want to search
 * @param {String} currentNodeUuid: the node selected
 */
const EquipmentSearchDialog = ({
    open,
    onClose,
    onSelectionChange,
    equipmentType,
    currentNodeUuid,
}) => {
    const equipmentClasses = useEquipmentStyles();

    const intl = useIntl();
    const studyUuid = decodeURIComponent(useParams().studyUuid);
    const [searchMatchingEquipments, equipmentsFound] =
        useSearchMatchingEquipments(
            studyUuid,
            currentNodeUuid,
            true,
            equipmentType
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
            renderElement={(props) => (
                <EquipmentItem
                    classes={equipmentClasses}
                    {...props}
                    key={props.element.key}
                />
            )}
        />
    );
};

EquipmentSearchDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSelectionChange: PropTypes.func.isRequired,
    equipmentType: PropTypes.string.isRequired,
    currentNodeUuid: PropTypes.string.isRequired,
};

export default EquipmentSearchDialog;
