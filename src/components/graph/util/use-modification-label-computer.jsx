/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useIntl } from 'react-intl';
import { MODIFICATION_TYPES } from '../../utils/modification-type';

export const useModificationLabelComputer = () => {
    const intl = useIntl();

    const getBranchStatusModificationValues = (modification, withFormat) => {
        return {
            action: modification.action,
            energizedEnd: modification.energizedVoltageLevelId,
            computedLabel: withFormat ? (
                <strong>{modification.equipmentId}</strong>
            ) : (
                modification.equipmentId
            ),
        };
    };

    const getEquipmentAttributeModificationValues = (
        modification,
        withFormat
    ) => {
        return {
            equipmentAttributeName: modification.equipmentAttributeName,
            equipmentAttributeValue: modification.equipmentAttributeValue,
            computedLabel: withFormat ? (
                <strong>{modification.equipmentId}</strong>
            ) : (
                modification.equipmentId
            ),
        };
    };

    const getLabel = (modif) => {
        const modificationMetadata = JSON.parse(modif.messageValues);

        switch (modif.messageType) {
            case MODIFICATION_TYPES.LINE_SPLIT_WITH_VOLTAGE_LEVEL.type:
                return modificationMetadata.lineToSplitId;
            case MODIFICATION_TYPES.LINE_ATTACH_TO_VOLTAGE_LEVEL.type:
                return modificationMetadata.lineToAttachToId;
            case MODIFICATION_TYPES.LINES_ATTACH_TO_SPLIT_LINES.type:
                return modificationMetadata.attachedLineId;
            case MODIFICATION_TYPES.DELETE_VOLTAGE_LEVEL_ON_LINE.type:
                return (
                    modificationMetadata.lineToAttachTo1Id +
                    '/' +
                    modificationMetadata.lineToAttachTo2Id
                );
            case MODIFICATION_TYPES.DELETE_ATTACHING_LINE.type:
                return (
                    modificationMetadata.attachedLineId +
                    '/' +
                    modificationMetadata.lineToAttachTo1Id +
                    '/' +
                    modificationMetadata.lineToAttachTo2Id
                );
            case MODIFICATION_TYPES.TABULAR_MODIFICATION.type:
                return intl.formatMessage({
                    id:
                        'network_modifications.tabular.' +
                        modificationMetadata.tabularModificationType,
                });
            case MODIFICATION_TYPES.BY_FILTER_DELETION.type:
                return intl.formatMessage({
                    id: modificationMetadata.equipmentType,
                });
            case MODIFICATION_TYPES.TABULAR_CREATION.type:
                return intl.formatMessage({
                    id:
                        'network_modifications.tabular.' +
                        modificationMetadata.tabularCreationType,
                });
            default:
                return modificationMetadata.equipmentId || '';
        }
    };

    const computeLabel = (modif, withFormat = true) => {
        const modificationValues = JSON.parse(modif.messageValues);

        switch (modif.messageType) {
            case MODIFICATION_TYPES.OPERATING_STATUS_MODIFICATION.type:
                return getBranchStatusModificationValues(
                    modificationValues,
                    withFormat
                );
            case MODIFICATION_TYPES.EQUIPMENT_ATTRIBUTE_MODIFICATION.type:
                return getEquipmentAttributeModificationValues(
                    modificationValues,
                    withFormat
                );
            default:
                return {
                    computedLabel: withFormat ? (
                        <strong>{getLabel(modif)}</strong>
                    ) : (
                        getLabel(modif)
                    ),
                };
        }
    };

    return { computeLabel };
};
