/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import EditIcon from '@mui/icons-material/Edit';

import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import ListItemIcon from '@mui/material/ListItemIcon';
import TableChartIcon from '@mui/icons-material/TableChart';
import DeleteIcon from '@mui/icons-material/Delete';

import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useNameOrId } from '../utils/equipmentInfosHandler';
import { getCommonEquipmentType } from 'components/diagrams/diagram-common';
import { isNodeReadOnly } from '../graph/util/model-functions';
import { CustomMenuItem, CustomNestedMenuItem } from '../utils/custom-nested-menu';
import { Equipment, EquipmentType } from '@gridsuite/commons-ui';
import { AppState } from 'redux/reducer';

const styles = {
    menuItem: {
        // NestedMenu item manages only label prop of string type
        // It fix paddings itself then we must force this padding
        // to justify menu items texts
        paddingLeft: '12px',
    },
};

type HandleViewInSpreadsheet = (equipmentType: EquipmentType, equipmentId: string) => void;
type HandleDeleteEquipment = (equipmentType: EquipmentType | null, equipmentId: string) => void;
type HandleOpenModificationDialog = (equipmentId: string, equipmentType: EquipmentType | null) => void;

const ViewInSpreadsheetItem = ({
    equipmentType,
    equipmentId,
    itemText,
    handleViewInSpreadsheet,
}: {
    equipmentType: EquipmentType;
    equipmentId: string;
    itemText: string;
    handleViewInSpreadsheet: HandleViewInSpreadsheet;
}) => {
    return (
        <CustomMenuItem
            sx={styles.menuItem}
            onClick={() => handleViewInSpreadsheet(equipmentType, equipmentId)}
            selected={false}
        >
            <ListItemIcon>
                <TableChartIcon />
            </ListItemIcon>

            <ListItemText primary={<Typography noWrap>{itemText}</Typography>} />
        </CustomMenuItem>
    );
};

const DeleteEquipmentItem = ({
    equipmentType,
    equipmentId,
    itemText,
    handleDeleteEquipment,
}: {
    equipmentType: EquipmentType;
    equipmentId: string;
    itemText: string;
    handleDeleteEquipment: HandleDeleteEquipment;
}) => {
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);

    return (
        <CustomMenuItem
            sx={styles.menuItem}
            onClick={() => handleDeleteEquipment(getCommonEquipmentType(equipmentType), equipmentId)}
            selected={false}
            disabled={isNodeReadOnly(currentNode)}
        >
            <ListItemIcon>
                <DeleteIcon />
            </ListItemIcon>

            <ListItemText primary={<Typography noWrap>{itemText}</Typography>} />
        </CustomMenuItem>
    );
};
const ModifyEquipmentItem = ({
    equipmentType,
    equipmentId,
    itemText,
    handleOpenModificationDialog,
}: {
    equipmentType: EquipmentType;
    equipmentId: string;
    itemText: string;
    handleOpenModificationDialog: HandleOpenModificationDialog;
}) => {
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);

    return (
        <CustomMenuItem
            sx={styles.menuItem}
            onClick={() => handleOpenModificationDialog(equipmentId, getCommonEquipmentType(equipmentType))}
            selected={false}
            disabled={isNodeReadOnly(currentNode)}
        >
            <ListItemIcon>
                <EditIcon />
            </ListItemIcon>

            <ListItemText primary={<Typography noWrap>{itemText}</Typography>} />
        </CustomMenuItem>
    );
};

const ItemViewInForm = ({
    equipmentType,
    equipmentId,
    itemText,
    handleOpenModificationDialog,
}: {
    equipmentType: EquipmentType;
    equipmentId: string;
    itemText: string;
    handleOpenModificationDialog: (equipmentId: string, equipmentType: EquipmentType) => void;
}) => {
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);

    return (
        <CustomMenuItem
            sx={styles.menuItem}
            onClick={() => handleOpenModificationDialog(equipmentId, equipmentType)}
            disabled={isNodeReadOnly(currentNode)}
        >
            <ListItemIcon>
                <EditIcon></EditIcon>
            </ListItemIcon>
            <ListItemText primary={<Typography noWrap>{itemText}</Typography>}></ListItemText>
        </CustomMenuItem>
    );
};

// TODO: Temporary type definition for VoltageLevel Equipment, pending a more comprehensive Equipment typing in diagramViewer
export type MapEquipment = Equipment & {
    substationId: string;
    substationName: string;
};

export type BaseEquipmentMenuProps = {
    equipment: MapEquipment;
    equipmentType: EquipmentType;
    handleViewInSpreadsheet: HandleViewInSpreadsheet;
    handleDeleteEquipment: HandleDeleteEquipment;
    handleOpenModificationDialog: HandleOpenModificationDialog;
};

const BaseEquipmentMenu = ({
    equipment,
    equipmentType,
    handleViewInSpreadsheet,
    handleDeleteEquipment,
    handleOpenModificationDialog,
}: BaseEquipmentMenuProps) => {
    const intl = useIntl();
    const { getNameOrId } = useNameOrId();

    const displayWithOperatingStatusMenu = [
        EquipmentType.LINE,
        EquipmentType.TWO_WINDINGS_TRANSFORMER,
        EquipmentType.THREE_WINDINGS_TRANSFORMER,
        EquipmentType.HVDC_LINE,
    ];
    const equipmentsNotDeletable = [EquipmentType.LCC_CONVERTER_STATION, EquipmentType.VSC_CONVERTER_STATION];

    return (
        <>
            {/* menus for equipment other than substation and voltage level */}
            {equipment &&
                equipmentType &&
                equipmentType !== EquipmentType.SUBSTATION &&
                equipmentType !== EquipmentType.VOLTAGE_LEVEL && (
                    <>
                        <ViewInSpreadsheetItem
                            key="ViewOnSpreadsheet"
                            equipmentType={equipmentType}
                            equipmentId={equipment.id}
                            itemText={intl.formatMessage({
                                id: 'ViewOnSpreadsheet',
                            })}
                            handleViewInSpreadsheet={handleViewInSpreadsheet}
                        />
                        {
                            // Delete button is already in MenuBranch for equipmentsWithBranch
                            // equipmentsNotDeletable deletion is not implemented yet
                            !(
                                displayWithOperatingStatusMenu.includes(equipmentType) ||
                                equipmentsNotDeletable.includes(equipmentType)
                            ) && (
                                <DeleteEquipmentItem
                                    key="DeleteFromMenu"
                                    equipmentType={equipmentType}
                                    equipmentId={equipment.id}
                                    itemText={intl.formatMessage({
                                        id: 'DeleteFromMenu',
                                    })}
                                    handleDeleteEquipment={handleDeleteEquipment}
                                />
                            )
                        }
                    </>
                )}
            {/* menus for equipment generator, load and shunt compensator */}
            {(equipmentType === EquipmentType.GENERATOR ||
                equipmentType === EquipmentType.BATTERY ||
                equipmentType === EquipmentType.SHUNT_COMPENSATOR ||
                equipmentType === EquipmentType.LOAD) && (
                <ItemViewInForm
                    equipmentId={equipment?.id}
                    equipmentType={equipmentType}
                    itemText={intl.formatMessage({
                        id: 'ModifyFromMenu',
                    })}
                    handleOpenModificationDialog={handleOpenModificationDialog}
                ></ItemViewInForm>
            )}
            {/* menus for equipment substation */}
            {equipmentType === EquipmentType.SUBSTATION && equipment && (
                <>
                    {/* menus for the substation */}
                    <CustomNestedMenuItem label={intl.formatMessage({ id: 'ViewOnSpreadsheet' })}>
                        <ViewInSpreadsheetItem
                            key={equipment.id}
                            equipmentType={equipmentType}
                            equipmentId={equipment.id}
                            itemText={getNameOrId(equipment)}
                            handleViewInSpreadsheet={handleViewInSpreadsheet}
                        />

                        {equipment.voltageLevels?.map((voltageLevel) => (
                            // menus for all voltage levels in the substation
                            <ViewInSpreadsheetItem
                                key={voltageLevel.id}
                                equipmentType={EquipmentType.VOLTAGE_LEVEL}
                                equipmentId={voltageLevel.id}
                                itemText={getNameOrId(voltageLevel)}
                                handleViewInSpreadsheet={handleViewInSpreadsheet}
                            />
                        ))}
                    </CustomNestedMenuItem>
                    <CustomNestedMenuItem label={intl.formatMessage({ id: 'DeleteFromMenu' })}>
                        <DeleteEquipmentItem
                            key={equipment.id}
                            equipmentType={equipmentType}
                            equipmentId={equipment.id}
                            itemText={getNameOrId(equipment)}
                            handleDeleteEquipment={handleDeleteEquipment}
                        />

                        {equipment.voltageLevels?.map((voltageLevel) => (
                            // menus for all voltage levels in the substation
                            <DeleteEquipmentItem
                                key={voltageLevel.id}
                                equipmentType={EquipmentType.VOLTAGE_LEVEL}
                                equipmentId={voltageLevel.id}
                                itemText={getNameOrId(voltageLevel)}
                                handleDeleteEquipment={handleDeleteEquipment}
                            />
                        ))}
                    </CustomNestedMenuItem>
                    <CustomNestedMenuItem label={intl.formatMessage({ id: 'ModifyFromMenu' })}>
                        {/* menus for the substation */}
                        <ModifyEquipmentItem
                            key={equipment.id}
                            equipmentType={equipmentType}
                            equipmentId={equipment.id}
                            itemText={getNameOrId(equipment)}
                            handleOpenModificationDialog={handleOpenModificationDialog}
                        />
                        {/* menus for the voltage level */}
                        {equipment.voltageLevels?.map((voltageLevel) => (
                            // menus for all voltage levels in the substation
                            <ModifyEquipmentItem
                                key={voltageLevel.id}
                                equipmentType={EquipmentType.VOLTAGE_LEVEL}
                                equipmentId={voltageLevel.id}
                                itemText={getNameOrId(voltageLevel)}
                                handleOpenModificationDialog={handleOpenModificationDialog}
                            />
                        ))}
                    </CustomNestedMenuItem>
                </>
            )}
            {/* menus for equipment voltage level */}
            {equipmentType === EquipmentType.VOLTAGE_LEVEL && equipment && (
                <>
                    <CustomNestedMenuItem
                        label={intl.formatMessage({
                            id: 'ViewOnSpreadsheet',
                        })}
                    >
                        {/* menus for the substation */}
                        <ViewInSpreadsheetItem
                            key={equipment.substationId}
                            equipmentType={EquipmentType.SUBSTATION}
                            equipmentId={equipment.substationId}
                            itemText={getNameOrId({
                                name: equipment.substationName,
                                id: equipment.substationId,
                            })}
                            handleViewInSpreadsheet={handleViewInSpreadsheet}
                        />
                        {/* menus for the voltage level */}
                        <ViewInSpreadsheetItem
                            key={equipment.id}
                            equipmentType={EquipmentType.VOLTAGE_LEVEL}
                            equipmentId={equipment.id}
                            itemText={getNameOrId(equipment)}
                            handleViewInSpreadsheet={handleViewInSpreadsheet}
                        />
                    </CustomNestedMenuItem>
                    <CustomNestedMenuItem label={intl.formatMessage({ id: 'DeleteFromMenu' })}>
                        {/* menus for the substation */}
                        <DeleteEquipmentItem
                            key={equipment.substationId}
                            equipmentType={EquipmentType.SUBSTATION}
                            equipmentId={equipment.substationId}
                            itemText={getNameOrId({
                                name: equipment.substationName,
                                id: equipment.substationId,
                            })}
                            handleDeleteEquipment={handleDeleteEquipment}
                        />
                        {/* menus for the voltage level */}
                        <DeleteEquipmentItem
                            key={equipment.id}
                            equipmentType={EquipmentType.VOLTAGE_LEVEL}
                            equipmentId={equipment.id}
                            itemText={getNameOrId(equipment)}
                            handleDeleteEquipment={handleDeleteEquipment}
                        />
                    </CustomNestedMenuItem>
                    <CustomNestedMenuItem label={intl.formatMessage({ id: 'ModifyFromMenu' })}>
                        {/* menus for the substation */}
                        <ModifyEquipmentItem
                            key={equipment.substationId}
                            equipmentType={EquipmentType.SUBSTATION}
                            equipmentId={equipment.substationId}
                            itemText={getNameOrId({
                                name: equipment.substationName,
                                id: equipment.substationId,
                            })}
                            handleOpenModificationDialog={handleOpenModificationDialog}
                        />
                        {/* menus for the voltage level */}
                        <ModifyEquipmentItem
                            key={equipment.id}
                            equipmentType={EquipmentType.VOLTAGE_LEVEL}
                            equipmentId={equipment.id}
                            itemText={getNameOrId(equipment)}
                            handleOpenModificationDialog={handleOpenModificationDialog}
                        />
                    </CustomNestedMenuItem>
                </>
            )}
        </>
    );
};

export default BaseEquipmentMenu;
