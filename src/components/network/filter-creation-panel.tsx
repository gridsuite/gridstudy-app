/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import {
    CustomFormProvider,
    DirectoryItemSelector,
    ElementType,
    SelectInput,
    TreeViewFinderNodeProps,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { useForm } from 'react-hook-form';
import { FILTER_NAME, NAME } from 'components/utils/field-constants';
import { GridSection } from 'components/dialogs/dialogUtils';
import { FormattedMessage, useIntl } from 'react-intl';
import { UniqueNameInput } from 'components/dialogs/commons/unique-name-input';
import { useSelector } from 'react-redux';
import {
    equipementTypeToLabel,
    EQUIPMENT_TYPES,
} from '../utils/equipment-types';
import { UUID } from 'crypto';
import { fetchDirectoryElementPath } from '@gridsuite/commons-ui';
import CircularProgress from '@mui/material/CircularProgress';
import FolderOutlined from '@mui/icons-material/FolderOutlined';

interface IFilterCreation {
    [FILTER_NAME]: string | null;
    [NAME]: string;
    equipmentType: string | null;
}

const formSchema = yup
    .object()
    .shape({
        [FILTER_NAME]: yup.string().nullable(),
        [NAME]: yup.string().required(),
        equipmentType: yup.string().required(),
    })
    .required();
const emptyFormData = {
    [FILTER_NAME]: '',
    [NAME]: '',
    equipmentType: '',
};

type FilterCreationPanelProps = {
    onSaveFilter: (
        data: IFilterCreation,
        distDir: TreeViewFinderNodeProps,
        setSavingState: (state: boolean) => void
    ) => boolean;
    onCancel: () => void;
};

const FilterCreationPanel: React.FC<FilterCreationPanelProps> = ({
    onSaveFilter,
    onCancel,
}) => {
    const [savingState, setSavingState] = useState(false);
    const studyUuid = useSelector((state: any) => state.studyUuid);
    const [openDirectorySelector, setOpenDirectorySelector] = useState(false);
    const intl = useIntl();
    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const [defaultFolder, setDefaultFolder] =
        useState<TreeViewFinderNodeProps>();

    const fetchDefaultDirectoryForStudy = useCallback(() => {
        fetchDirectoryElementPath(studyUuid).then((res) => {
            if (res) {
                setDefaultFolder({
                    id: res[1].elementUuid,
                    name: res[1].elementName,
                });
            }
        });
    }, [studyUuid]);

    useEffect(() => {
        if (studyUuid) {
            fetchDefaultDirectoryForStudy();
        }
    }, [fetchDefaultDirectoryForStudy, studyUuid]);

    const handleChangeFolder = () => {
        setOpenDirectorySelector(true);
    };
    const setSelectedFolder = (folder: TreeViewFinderNodeProps[]) => {
        if (folder && folder.length > 0) {
            if (folder[0].id !== defaultFolder?.id) {
                setDefaultFolder({
                    id: folder[0].id,
                    name: folder[0].name,
                });
            }
        }
        setOpenDirectorySelector(false);
    };
    const equipmentTypesOptions = useMemo(() => {
        const equipmentTypesToExclude = new Set([
            EQUIPMENT_TYPES.SWITCH,
            EQUIPMENT_TYPES.BUS,
            EQUIPMENT_TYPES.HVDC_CONVERTER_STATION,
            EQUIPMENT_TYPES.BUSBAR_SECTION,
            EQUIPMENT_TYPES.TIE_LINE,
        ]);

        return Object.values(EQUIPMENT_TYPES)
            .filter(
                (equipmentType) => !equipmentTypesToExclude.has(equipmentType)
            )
            .map((value) => {
                return {
                    id: value,
                    label: equipementTypeToLabel(value),
                };
            });
    }, []);

    const onSubmit = () => {
        formMethods.trigger().then((isValid) => {
            if (isValid && defaultFolder) {
                const success = onSaveFilter(
                    formMethods.getValues() as IFilterCreation,
                    defaultFolder,
                    setSavingState
                );
                if (success) {
                    formMethods.setValue(NAME, '');
                }
            }
        });
    };

    return (
        <CustomFormProvider
            removeOptional={true}
            validationSchema={formSchema}
            {...formMethods}
        >
            <Box
                p={4}
                display="flex"
                justifyContent="space-between"
                flexDirection="column"
                height="100%"
            >
                <Grid container>
                    <GridSection title="createNewFilter" />
                    <Grid container paddingTop={2}>
                        <SelectInput
                            name={'equipmentType'}
                            options={equipmentTypesOptions}
                            label={'EquipmentType'}
                            fullWidth
                            size={'medium'}
                            disableClearable={true}
                            disabled={savingState}
                        />
                    </Grid>

                    <Grid container paddingTop={2}>
                        <UniqueNameInput
                            name={NAME}
                            label={'Name'}
                            elementType={ElementType.FILTER}
                            activeDirectory={defaultFolder?.id as UUID}
                            autoFocus
                            formProps={{
                                variant: 'standard',
                                disabled: savingState,
                            }}
                        />
                    </Grid>
                    <Grid container paddingTop={2}>
                        {/* icon directory */}

                        <Typography m={1} component="span">
                            <Box
                                fontWeight={'fontWeightBold'}
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <FolderOutlined />
                                <span>&nbsp;{defaultFolder?.name}&nbsp;</span>
                            </Box>
                        </Typography>
                        <Button
                            onClick={handleChangeFolder}
                            variant="contained"
                            size="small"
                        >
                            <FormattedMessage id={'button.changeType'} />
                        </Button>
                    </Grid>
                    <Grid container paddingTop={2}>
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
                </Grid>
                <Grid container paddingTop={2} justifyContent="flex-end">
                    <Button onClick={onCancel} size={'large'}>
                        {intl.formatMessage({
                            id: 'cancel',
                        })}
                    </Button>
                    <Box m={1} />
                    <Button
                        variant="outlined"
                        type={'submit'}
                        disabled={!formMethods.formState.isValid || savingState}
                        onClick={onSubmit}
                        size={'large'}
                    >
                        {(savingState && <CircularProgress size={24} />) || (
                            <FormattedMessage id="save" />
                        )}
                    </Button>
                </Grid>
            </Box>
        </CustomFormProvider>
    );
};

export default FilterCreationPanel;
