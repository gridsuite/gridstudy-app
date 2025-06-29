/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';
import { CellContextMenuEvent } from 'ag-grid-community';
import { Edit, Polyline } from '@mui/icons-material';
import { useIntl } from 'react-intl';
import { isCalculationRow } from '../../../utils/calculation-utils';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';

export interface EquipmentData {
    id: string;
    [key: string]: string | undefined;
}

interface ContextMenuState {
    mouseX: number;
    mouseY: number;
    equipmentData: EquipmentData;
}

interface UseEquipmentContextMenuProps {
    equipmentType?: string;
    isEditDisabled?: boolean;
    handleModify: (equipmentId: string) => void;
    handleOpenDiagram: (voltageLevelId: string) => void;
}

export const useEquipmentContextMenu = ({
    equipmentType,
    isEditDisabled = false,
    handleModify,
    handleOpenDiagram,
}: UseEquipmentContextMenuProps) => {
    const intl = useIntl();
    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

    const openContextMenu = useCallback((event: CellContextMenuEvent) => {
        if (isCalculationRow(event.node.data?.rowType)) {
            return;
        }

        event.event?.preventDefault();
        const mouseEvent = event.event as MouseEvent;
        const selectedRow = event.api.getRowNode(event.data.id);
        if (selectedRow) {
            selectedRow.setSelected(true, true);
        }

        setContextMenu({
            mouseX: mouseEvent.clientX,
            mouseY: mouseEvent.clientY,
            equipmentData: event.data,
        });
    }, []);

    const closeContextMenu = useCallback(() => setContextMenu(null), []);

    const handleEdit = useCallback(() => {
        if (contextMenu && !isEditDisabled) {
            handleModify(contextMenu.equipmentData.id);
            closeContextMenu();
        }
    }, [contextMenu, isEditDisabled, handleModify, closeContextMenu]);

    const handleViewDetails = useCallback(
        (voltageLevelId: string) => {
            handleOpenDiagram(voltageLevelId);
            closeContextMenu();
        },
        [handleOpenDiagram, closeContextMenu]
    );

    const getDetailsLabel = useCallback(
        (equipmentType?: string, side?: string): string => {
            if (equipmentType === EQUIPMENT_TYPES.SUBSTATION) {
                return intl.formatMessage({ id: 'openSubstationDiagram' });
            }

            const baseLabel = intl.formatMessage({ id: 'openVoltageLevelDiagram' });
            return side ? `${baseLabel} ${side}` : baseLabel;
        },
        [intl]
    );

    // Generate menu items
    const menuItems = contextMenu
        ? (() => {
              const { equipmentData } = contextMenu;
              const items = [];

              if (!isEditDisabled) {
                  items.push({
                      label: intl.formatMessage({ id: 'ModifyFromMenu' }),
                      icon: Edit,
                      onClick: handleEdit,
                  });
              }

              // Get voltage level details
              const voltageLevels = [];

              // For voltage level and substation, use the equipment's own ID
              if (equipmentType === EQUIPMENT_TYPES.VOLTAGE_LEVEL || equipmentType === EQUIPMENT_TYPES.SUBSTATION) {
                  voltageLevels.push({
                      id: equipmentData.id,
                      label: getDetailsLabel(equipmentType),
                  });
              } else if (equipmentData.voltageLevelId) {
                  // For other equipment types, use their voltage level ID
                  voltageLevels.push({
                      id: equipmentData.voltageLevelId,
                      label: getDetailsLabel(),
                  });
              }

              // for equipment types with multiple sides (e.g., transformers)
              for (let i = 1; i <= 3; i++) {
                  const voltageLevelKey = `voltageLevelId${i}`;
                  if (equipmentData[voltageLevelKey]) {
                      const sideLabel = intl.formatMessage({ id: 'Side' }) + i;
                      voltageLevels.push({
                          id: equipmentData[voltageLevelKey],
                          label: getDetailsLabel(undefined, sideLabel),
                      });
                  }
              }

              voltageLevels.forEach((vl) => {
                  items.push({
                      label: vl.label,
                      icon: Polyline,
                      onClick: () => handleViewDetails(vl.id),
                  });
              });

              return items;
          })()
        : [];

    return {
        contextMenu,
        menuItems,
        openContextMenu,
        closeContextMenu,
    };
};
