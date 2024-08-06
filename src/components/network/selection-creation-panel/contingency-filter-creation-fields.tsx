import {
    DirectoryItemSelector,
    ElementType,
    FILTER_EQUIPMENTS,
    FormEquipment,
    SelectInput,
    TreeViewFinderNodeProps,
    UniqueNameInput,
    fetchDirectoryElementPath,
} from '@gridsuite/commons-ui';
import { FolderOutlined } from '@mui/icons-material';
import { Box, Button, Grid, Typography } from '@mui/material';
import { EQUIPMENT_TYPES, equipmentTypeToLabel } from 'components/utils/equipment-types';
import { EQUIPMENT_TYPE_FIELD, NAME } from 'components/utils/field-constants';
import { UUID } from 'crypto';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { SELECTION_TYPES } from './selection-types';
import { AppState } from 'redux/reducer';

interface ContingencyFilterCreationListProps {
    pendingState: boolean;
    selectionType: SELECTION_TYPES.CONTIGENCY_LIST | SELECTION_TYPES.FILTER;
}

const selectionTypeToElementType = (selectionType: SELECTION_TYPES.CONTIGENCY_LIST | SELECTION_TYPES.FILTER) => {
    if (selectionType === SELECTION_TYPES.CONTIGENCY_LIST) {
        return ElementType.CONTINGENCY_LIST;
    }

    return ElementType.FILTER;
};

export const ContingencyFilterCreationList: FC<ContingencyFilterCreationListProps> = (props) => {
    const { selectionType, pendingState } = props;
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const intl = useIntl();

    const [openDirectorySelector, setOpenDirectorySelector] = useState(false);

    const [destinationFolder, setDestinationFolder] = useState<TreeViewFinderNodeProps>();

    const fetchDefaultDirectoryForStudy = useCallback(() => {
        if (studyUuid) {
            fetchDirectoryElementPath(studyUuid).then((res) => {
                if (res) {
                    const parentFolderIndex = res.length - 2;
                    setDestinationFolder({
                        id: res[parentFolderIndex].elementUuid,
                        name: res[parentFolderIndex].elementName,
                    });
                }
            });
        }
    }, [studyUuid]);

    const handleChangeFolder = () => {
        setOpenDirectorySelector(true);
    };
    const setSelectedFolder = (folder: TreeViewFinderNodeProps[]) => {
        if (folder && folder.length > 0) {
            if (folder[0].id !== destinationFolder?.id) {
                setDestinationFolder({
                    id: folder[0].id,
                    name: folder[0].name,
                });
            }
        }
        setOpenDirectorySelector(false);
    };

    useEffect(() => {
        if (studyUuid) {
            fetchDefaultDirectoryForStudy();
        }
    }, [fetchDefaultDirectoryForStudy, studyUuid]);

    const equipmentTypesOptions = useMemo(() => {
        if (selectionType === SELECTION_TYPES.FILTER) {
            return Object.values(FILTER_EQUIPMENTS).map((equipment: FormEquipment) => {
                return {
                    id: equipment.id,
                    label: equipment.label,
                };
            });
        } else {
            // might be better to use CONTINGENCY_LIST_EQUIPMENTS from commons ui once the list is finalised
            const equipmentTypesToExclude = new Set([
                EQUIPMENT_TYPES.SWITCH,
                EQUIPMENT_TYPES.BUS,
                EQUIPMENT_TYPES.HVDC_CONVERTER_STATION,
            ]);
            return Object.values(EQUIPMENT_TYPES)
                .filter((equipmentType) => !equipmentTypesToExclude.has(equipmentType))
                .map((value) => {
                    return {
                        id: value,
                        label: equipmentTypeToLabel(value),
                    };
                });
        }
    }, [selectionType]);

    return (
        <>
            <Grid container>
                <SelectInput
                    name={EQUIPMENT_TYPE_FIELD}
                    options={equipmentTypesOptions}
                    label={'EquipmentType'}
                    fullWidth
                    size={'medium'}
                    disableClearable={true}
                    disabled={pendingState}
                />
            </Grid>

            <Grid container>
                <UniqueNameInput
                    name={NAME}
                    label={'Name'}
                    elementType={selectionTypeToElementType(selectionType)}
                    activeDirectory={destinationFolder?.id as UUID}
                    autoFocus
                    formProps={{
                        variant: 'standard',
                        disabled: pendingState,
                    }}
                />
            </Grid>
            <Grid container>
                {/* icon directory */}

                <Typography m={1} component="span">
                    <Box fontWeight={'fontWeightBold'} display="flex" justifyContent="center" alignItems="center">
                        <FolderOutlined />
                        <span>
                            &nbsp;{destinationFolder?.name}
                            &nbsp;
                        </span>
                    </Box>
                </Typography>
                <Button onClick={handleChangeFolder} variant="contained" size="small" disabled={pendingState}>
                    <FormattedMessage id={'button.changeType'} />
                </Button>
            </Grid>
            <Grid container>
                <DirectoryItemSelector
                    open={openDirectorySelector}
                    onClose={setSelectedFolder}
                    types={[ElementType.DIRECTORY]}
                    onlyLeaves={false}
                    multiSelect={false}
                    validationButtonText={intl.formatMessage({
                        id: 'validate',
                    })}
                    title={intl.formatMessage({
                        id: 'showSelectDirectoryDialog',
                    })}
                />
            </Grid>
        </>
    );
};
