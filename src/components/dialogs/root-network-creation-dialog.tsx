import { FormattedMessage, useIntl } from 'react-intl';
import {
    CustomFormProvider,
    ElementType,
    fetchDirectoryElementPath,
    TreeViewFinderNodeProps,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { UUID } from 'crypto';
import { useCallback, useEffect, useState } from 'react';
import { Grid, Button} from '@mui/material';
import { UniqueNameInput } from './commons/unique-name-input';
import { CASE_NAME, CASE_ID, NAME } from '../utils/field-constants';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from '../utils/yup-config';
import { useSelector } from 'react-redux';
import BasicModificationDialog from './commons/basicModificationDialog';
import { AppState } from 'redux/reducer';
import ImportCaseDialog from './import-case-dialog';

export interface FormData {
    [NAME]: string;
    [CASE_NAME]: string;
    [CASE_ID]: string;
}

interface RootNetworkCreationDialogProps {
    open: boolean;
    onSave: (data: FormData) => void;
    onClose: () => void;
    type: ElementType;
    titleId: string;
    dialogProps: any;
    prefixIdForGeneratedName?: string;
}

const formSchema = yup
    .object()
    .shape({
        [NAME]: yup.string().trim().required(),
        [CASE_NAME]: yup.string().required(),
        [CASE_ID]: yup.string().required(),
    })
    .required();

const emptyFormData: FormData = {
    [NAME]: '',
    [CASE_NAME]: '',
    [CASE_ID]: '',
};

const RootNetworkCreationDialog: React.FC<RootNetworkCreationDialogProps> = ({
    open,
    onSave,
    onClose,
    type,
    titleId,
    dialogProps = undefined,
    prefixIdForGeneratedName,
}) => {
    const intl = useIntl();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const { snackError } = useSnackMessage();

    const [directorySelectorOpen, setDirectorySelectorOpen] = useState(false);
    const [destinationFolder, setDestinationFolder] = useState<TreeViewFinderNodeProps>();
    const [selectedCase, setSelectedCase] = useState<TreeViewFinderNodeProps | null>(null);
    const [caseSelectorOpen, setCaseSelectorOpen] = useState(false);

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const {
        reset,
        setValue,
        formState: { errors },
    } = formMethods;
    const disableSave =
        // Form validation must pass
        !selectedCase || // A case must be selected
        !formMethods.getValues(NAME); // NAME must not be empty

    // Clear form and reset selected case
    const clear = useCallback(() => {
        reset(emptyFormData);
        setSelectedCase(null); // Reset the selected case on clear
    }, [reset]);

    // Fetch default directory based on study UUID
    const fetchDefaultDirectoryForStudy = useCallback(() => {
        fetchDirectoryElementPath(studyUuid).then((res) => {
            if (!res || res.length < 2) {
                snackError({
                    messageTxt: 'unknown study directory',
                    headerId: 'studyDirectoryFetchingError',
                });
                return;
            }
            const parentFolderIndex = res.length - 2;
            const { elementUuid, elementName } = res[parentFolderIndex];
            setDestinationFolder({
                id: elementUuid,
                name: elementName,
            });
        });
    }, [studyUuid, snackError]);

    // Auto-generate a name with prefix and current date
    useEffect(() => {
        if (prefixIdForGeneratedName) {
            const getCurrentDateTime = () => new Date().toISOString();
            const formattedMessage = intl.formatMessage({
                id: prefixIdForGeneratedName,
            });
            const dateTime = getCurrentDateTime();
            reset(
                {
                    ...emptyFormData,
                    [NAME]: `${formattedMessage}-${dateTime}`,
                },
                { keepDefaultValues: true }
            );
        }
    }, [prefixIdForGeneratedName, intl, reset]);

    useEffect(() => {
        if (open && studyUuid) {
            fetchDefaultDirectoryForStudy();
        }
    }, [fetchDefaultDirectoryForStudy, studyUuid, open]);

    // Open case selector
    const handleCaseSelection = () => {
        setCaseSelectorOpen(true);
    };

    // Set selected case when a case is selected
    const onSelectCase = (selectedCase: TreeViewFinderNodeProps) => {
        setSelectedCase(selectedCase);
        setValue(NAME, selectedCase.name); // Set the name from the selected case
        setValue(CASE_NAME, selectedCase.name);
        setValue(CASE_ID, selectedCase.id as string);
        setCaseSelectorOpen(false);
    };

    const handleSave = useCallback(
        (values: FormData) => {
            if (selectedCase) {
                // Save data, including CASE_NAME and CASE_ID
                const creationData1: FormData = {
                    ...values,
                    [CASE_NAME]: selectedCase.name,
                    [CASE_ID]: selectedCase.id as UUID,
                };
                onSave(creationData1);
            } else {
                snackError({
                    messageTxt: 'Please select a case before saving.',
                    headerId: 'caseNotSelectedError',
                });
            }
        },
        [onSave, selectedCase, snackError]
    );

    // Case selection component
    const caseSelection = (
        <Grid container item>
            <Grid item>
                <Button onClick={handleCaseSelection} variant="contained" size={'small'}>
                    <FormattedMessage id={'selectCase'} />
                </Button>
            </Grid>
        </Grid>
    );

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <BasicModificationDialog
                fullWidth
                maxWidth={'md'}
                open={open}
                onClose={onClose}
                onClear={clear}
                onSave={handleSave}
                aria-labelledby="dialog-root-network-creation"
                {...dialogProps}
                titleId={titleId}
                disabledSave={disableSave}
            >
                <Grid container spacing={2} marginTop={'auto'} direction="column">
                    <Grid item>
                        <UniqueNameInput
                            name={NAME}
                            label={'Name'}
                            elementType={type}
                            activeDirectory={destinationFolder?.id as UUID}
                            autoFocus
                        />
                    </Grid>
                    {type === ElementType.ROOT_NETWORK && caseSelection}
                </Grid>

                <ImportCaseDialog
                    open={caseSelectorOpen}
                    onClose={() => setCaseSelectorOpen(false)}
                    onSelectCase={onSelectCase}
                />
            </BasicModificationDialog>
        </CustomFormProvider>
    );
};

export default RootNetworkCreationDialog;
