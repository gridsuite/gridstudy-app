import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import {
    DirectoryItemSelector,
    elementType,
    SelectInput,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { Identifier } from '../dialogs/parameters/voltageinit/voltage-init-utils';
import { FormProvider, useForm } from 'react-hook-form';
import { FILTER_NAME, NAME } from 'components/utils/field-constants';
import { GridSection } from 'components/dialogs/dialogUtils';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    fetchDirectoryContent,
    fetchPath,
    fetchRootFolders,
} from 'services/directory';
import { createFilter, fetchElementsMetadata } from 'services/explore';
import { UniqueNameInput } from 'components/dialogs/commons/unique-name-input';
import { useSelector } from 'react-redux';
import { EQUIPMENT_TYPES } from '../utils/equipment-types';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

const EXPERT_FILTER_EQUIPMENTS = {
    GENERATOR: {
        id: 'GENERATOR',
        label: 'Generators',
    },
    LOAD: {
        id: 'LOAD',
        label: 'Loads',
    },
    BATTERY: {
        id: 'BATTERY',
        label: 'Batteries',
    },
    VOLTAGE_LEVEL: {
        id: 'VOLTAGE_LEVEL',
        label: 'VoltageLevels',
    },
    SUBSTATION: {
        id: 'SUBSTATION',
        label: 'Substations',
    },
    SHUNT_COMPENSATOR: {
        id: 'SHUNT_COMPENSATOR',
        label: 'ShuntCompensators',
    },
    LINE: {
        id: 'LINE',
        label: 'Lines',
    },
    TWO_WINDINGS_TRANSFORMER: {
        id: 'TWO_WINDINGS_TRANSFORMER',
        label: 'TwoWindingsTransformers',
    },
};

interface IFilterCreation {
    [FILTER_NAME]: string | null;
    [NAME]: string;
    equipmentType: string | null;
}

const formSchema = yup
    .object()
    .shape({
        [FILTER_NAME]: yup.string().nullable(),
        [NAME]: yup.string(),
        equipmentType: yup.string().nullable(),
    })
    .required();
const emptyFormData = {
    [FILTER_NAME]: '',
    [NAME]: '',
    equipmentType: '',
};

function getSubstationsInPolygone(
    features: any,
    mapEquipments: any,
    geoData: any
): any[] {
    const firstPolygonFeatures: any = Object.values(features)[0];
    const polygonCoordinates = firstPolygonFeatures?.geometry;
    if (!polygonCoordinates || polygonCoordinates.coordinates < 3) {
        return [];
    }
    //get the list of substation
    const substationsList = mapEquipments?.substations ?? [];

    const positions = substationsList // we need a list of substation and their positions
        .map((substation: any) => {
            return {
                substation: substation,
                pos: geoData.getSubstationPosition(substation.id),
            };
        });
    if (!positions) {
        return [];
    }

    return positions.filter((substation: any) => {
        return booleanPointInPolygon(substation.pos, polygonCoordinates);
    });
}

function getVoltageLevelFromSubstation(substations: any): any[] {
    return substations
        .map((substation: any) => {
            return substation.substation.voltageLevels;
        })
        .flat();
}

function createVoltageLevelIdentifierList(
    equipmentType: string,
    equipmentList: any
) {
    return {
        type: 'IDENTIFIER_LIST',
        equipmentType: equipmentType,
        filterEquipmentsAttributes: equipmentList.map((eq: any) => {
            return { equipmentID: eq.id };
        }),
    };
}

function getRequestedEquipements(
    equipementType: string,
    substationsInPolygone: any[]
) {
    switch (equipementType) {
        case EQUIPMENT_TYPES.VOLTAGE_LEVEL:
            const allowedNominalVoltageMap = new Set();
            allowedNominalVoltageMap.add(380);
            allowedNominalVoltageMap.add(225);
            allowedNominalVoltageMap.add(110);
            allowedNominalVoltageMap.add(21);
            allowedNominalVoltageMap.add(10.5);
            return getVoltageLevelFromSubstation(substationsInPolygone).filter(
                (vl: any) => allowedNominalVoltageMap.has(vl.nominalV)
            );
        case EQUIPMENT_TYPES.SUBSTATION:
            return substationsInPolygone
                .map((substation: any) => {
                    return substation.substation;
                })
                .flat();
        default:
            console.error(
                'debug',
                'getRequestedEquipements',
                'not implemented'
            );
            throw new Error('not implemented');
    }
}

type FilterCreationPanelProps = {
    onSaveFilter: (data: IFilterCreation) => void;
    onCancel: () => void;
};

const FilterCreationPanel: React.FC<FilterCreationPanelProps> = ({
    onSaveFilter,
    onCancel,
}) => {
    const studyUuid = useSelector((state: any) => state.studyUuid);
    const [openDirectoryFolders, setOpenDirectoryFolders] = useState(false);
    const intl = useIntl();
    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const [defaultFolder, setDefaultFolder] = useState<Identifier>({
        id: null,
        name: null,
    });

    // const handleValidationButtonClick = () => {
    //     // get the form data
    //     const formData = formMethods.getValues();
    //     console.log('debug', 'formData', formData);
    //     const substationsInPolygone = getSubstationsInPolygone(
    //         polygonCoordinates,
    //         mapEquipments,
    //         geoData
    //     );
    //     const equipments = getRequestedEquipements(
    //         formData.equipmentType,
    //         substationsInPolygone
    //     );
    //
    //     console.log('debug', 'equipments', equipments);
    //
    //     const filterData = createVoltageLevelIdentifierList(
    //         formData.equipmentType,
    //         equipments
    //     );
    //     //create the filter
    //     createFilter(
    //         filterData,
    //         formData[NAME],
    //         'description',
    //         defaultFolder.id?.toString() ?? ''
    //     )
    //         .then((res) => {
    //             console.log('debug', 'createFilter', res);
    //         })
    //         .catch((err) => {
    //             console.error('debug', 'createFilter', err);
    //         });
    // };
    // function handleCancelButtonClick() {}
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

    useEffect(() => {
        if (studyUuid) {
            fetchDefaultDirectoryForStudy();
        }
    }, [fetchDefaultDirectoryForStudy, studyUuid]);

    const handleChangeFolder = () => {
        setOpenDirectoryFolders(true);
    };
    const setSelectedFolder = (folder: Identifier[]) => {
        if (folder && folder.length > 0) {
            if (folder[0].id !== defaultFolder?.id) {
                setDefaultFolder({
                    id: folder[0].id,
                    name: folder[0].name,
                });
            }
        }
        setOpenDirectoryFolders(false);
    };

    const folderChooser = //compied from src/components/dialogs/parameters/common/parameters-creation-dialog.tsx
        (
            <Grid container item>
                <Grid item>
                    <Button onClick={handleChangeFolder} variant="contained">
                        <FormattedMessage id={'showSelectDirectoryDialog'} />
                    </Button>
                </Grid>
                <Typography m={1} component="span">
                    <Box fontWeight={'fontWeightBold'}>
                        {defaultFolder == null ? (
                            <CircularProgress />
                        ) : (
                            defaultFolder.name
                        )}
                    </Box>
                </Typography>
            </Grid>
        );

    return (
        <>
            <Grid container>
                <FormProvider
                    {...{
                        validationSchema: formSchema,
                        removeOptional: true,
                        ...formMethods,
                    }}
                >
                    <GridSection title="createNewFilter" />
                    <Grid container paddingTop={2}>
                        <SelectInput
                            name={'equipmentType'}
                            options={Object.values(EXPERT_FILTER_EQUIPMENTS)}
                            label={'equipmentType'}
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
                            elementType={'DIRECTORY'}
                            activeDirectory={defaultFolder.id}
                            autoFocus
                        />
                        {folderChooser}
                    </Grid>
                    <Grid container paddingTop={2}>
                        <DirectoryItemSelector
                            open={openDirectoryFolders}
                            onClose={setSelectedFolder}
                            types={[elementType.DIRECTORY]}
                            onlyLeaves={false}
                            multiselect={false}
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

                    <Grid container paddingTop={2}>
                        <Button
                            variant="contained"
                            onClick={() => {
                                onSaveFilter(formMethods.getValues());
                            }}
                            size={'large'}
                        >
                            {intl.formatMessage({
                                id: 'validate',
                            })}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={onCancel}
                            size={'large'}
                        >
                            {intl.formatMessage({
                                id: 'cancel',
                            })}
                        </Button>
                    </Grid>
                </FormProvider>
            </Grid>
        </>
    );
};

export default FilterCreationPanel;
