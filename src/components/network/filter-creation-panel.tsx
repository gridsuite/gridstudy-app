/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useState } from 'react';
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
import {
    fetchDirectoryContent,
    fetchPath,
    fetchRootFolders,
} from 'services/directory';
import { fetchElementsMetadata } from 'services/explore';
import { UniqueNameInput } from 'components/dialogs/commons/unique-name-input';
import { useSelector } from 'react-redux';
import {
    equipementTypeToLabel,
    EQUIPMENT_TYPES,
} from '../utils/equipment-types';
import { UUID } from 'crypto';

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
        distDir: TreeViewFinderNodeProps
    ) => void;
    onCancel: () => void;
};

const FilterCreationPanel: React.FC<FilterCreationPanelProps> = ({
    onSaveFilter,
    onCancel,
}) => {
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
        fetchPath(studyUuid).then((res) => {
            if (res) {
                setDefaultFolder({
                    id: res[1].elementUuid,
                    name: res[1].elementName,
                });
            }
        });
    }, [studyUuid]);

    const generateFilterName = () => {
        formMethods.setValue(
            NAME,
            'Generated-filter-' + new Date().toISOString()
        );
    };

    useEffect(() => {
        //Generate a new name every time the component is mounted
        generateFilterName();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                            options={Object.values(EQUIPMENT_TYPES)
                                .filter(
                                    (type) =>
                                        !type.includes(EQUIPMENT_TYPES.BUS)
                                )
                                .map((value) => {
                                    return {
                                        id: value,
                                        label: equipementTypeToLabel(value),
                                    };
                                })}
                            label={'EquipmentType'}
                            fullWidth
                            size={'medium'}
                            disableClearable={true}
                            formProps={{ style: { fontStyle: 'italic' } }}
                        />
                    </Grid>

                    <Grid container paddingTop={2}>
                        <UniqueNameInput
                            name={NAME}
                            label={'Name'}
                            elementType={ElementType.DIRECTORY}
                            activeDirectory={defaultFolder?.id as UUID}
                            autoFocus
                        />
                    </Grid>
                    <Grid container paddingTop={2}>
                        <Button
                            onClick={handleChangeFolder}
                            variant="contained"
                        >
                            <FormattedMessage
                                id={'showSelectDirectoryDialog'}
                            />
                        </Button>

                        <Typography m={1} component="span">
                            <Box fontWeight={'fontWeightBold'}>
                                {defaultFolder?.name}
                            </Box>
                        </Typography>
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
                            fetchDirectoryContent={fetchDirectoryContent}
                            fetchRootFolders={fetchRootFolders}
                            fetchElementsInfos={fetchElementsMetadata}
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
                        variant="contained"
                        type={'submit'}
                        onClick={() => {
                            formMethods.trigger().then((isValid) => {
                                if (isValid && defaultFolder) {
                                    onSaveFilter(
                                        formMethods.getValues() as IFilterCreation,
                                        defaultFolder
                                    );
                                    generateFilterName();
                                }
                            });
                        }}
                        size={'large'}
                    >
                        {intl.formatMessage({
                            id: 'validate',
                        })}
                    </Button>
                </Grid>
            </Box>
        </CustomFormProvider>
    );
};

export default FilterCreationPanel;
