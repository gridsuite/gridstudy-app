import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { ImportParameters } from './import-parameters';
import {
    CaseImportParameters,
    getCaseImportParameters,
} from 'services/network-conversion';
import { UUID } from 'crypto';
import { UploadFileButton } from './upload-file-button';
import { createCaseWithoutDirectoryElementCreation } from 'services/case';
import { importStudy } from 'services/study/study';
import { useSelector } from 'react-redux';
import { ReduxState } from 'redux/reducer.type';

interface CreateStudyDialogProps {
    closeDialog: () => void;
}

export const CreateStudyDialog: FunctionComponent<CreateStudyDialogProps> = ({
    closeDialog,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [currentParameters, setCurrentParameters] = useState<
        Record<string, any>
    >({});
    const [formatWithParameters, setFormatWithParameters] = useState<
        CaseImportParameters[]
    >([]);
    const [isUploadingFileInProgress, setUploadingFileInProgress] =
        useState(false);

    const [generatedCaseUuid, setGeneratedCaseUuid] = useState<
        UUID | undefined
    >();
    const studyUuid = useSelector((state: ReduxState) => state.studyUuid);

    const isCreationAllowed = !!selectedFile && !isUploadingFileInProgress;

    const onChange = useCallback(
        (paramName: string, value: any, isEdit: boolean) => {
            if (!isEdit) {
                setCurrentParameters((prevCurrentParameters) => {
                    return {
                        ...prevCurrentParameters,
                        ...{ [paramName]: value },
                    };
                });
            }
        },
        []
    );

    // @PathVariable("caseUuid") UUID caseUuid,
    // @RequestParam(required = false, value = "studyUuid") UUID studyUuid,
    // @RequestParam(required = false, value = "duplicateCase", defaultValue = "false") Boolean duplicateCase,
    // @RequestBody(required = false) Map<String, Object> importParameters,
    // @RequestHeader(HEADER_USER_ID) String userId

    const handleCreateNewStudy = () => {
        if (generatedCaseUuid) {
            importStudy(generatedCaseUuid, studyUuid, currentParameters)
                .then(() => {
                    closeDialog();
                    //oldTempCaseUuid.current = null;
                    // handleCloseDialog();
                })
                .catch((error) => {
                    // snackError({
                    //     messageTxt: error.message,
                    //     headerId: 'studyCreationError',
                    //     headerValues: {
                    //         studyName,
                    //     },
                    // });
                })
                .finally(() => {
                    // setTempCaseUuid(null);
                    // dispatch(removeUploadingElement(uploadingStudy));
                });
        }
    };

    const getCaseImportParams = useCallback(
        (caseUuid: UUID) => {
            getCaseImportParameters(caseUuid)
                .then((result) => {
                    // sort possible values alphabetically to display select options sorted
                    result.parameters = result.parameters?.map((p) => {
                        p.possibleValues = p.possibleValues?.sort((a, b) =>
                            a.localeCompare(b)
                        );
                        return p;
                    });
                    setFormatWithParameters(result.parameters);
                    // setIsParamsOk(true);
                })
                .catch(() => {
                    setFormatWithParameters([]);
                    // setIsParamsOk(false);
                    // setCreateStudyErr(
                    //     intl.formatMessage({ id: 'parameterLoadingProblem' })
                    // );
                });
        },
        [
            /*intl*/
        ]
    );

    useEffect(() => {
        if (selectedFile) {
            setUploadingFileInProgress(true);
            createCaseWithoutDirectoryElementCreation(selectedFile)
                .then((caseUuid) => {
                    setGeneratedCaseUuid(caseUuid);
                    getCaseImportParams(caseUuid);
                    // setCreateStudyErr('');
                })
                .catch((error) => {
                    // setTempCaseUuid(null);
                    // handleFileUploadError(error, setCreateStudyErr);
                    // dispatch(selectFile(null));
                    // setFormatWithParameters([]);
                    // setProvidedCaseFileOk(false);
                })
                .finally(() => {
                    setUploadingFileInProgress(false);
                    // setFileCheckedCase(true);
                });
        }
    }, [
        selectedFile,
        getCaseImportParams,
        // open,
        // dispatch,
        // selectedDirectory?.elementName,
        // providedExistingCase,
        // getCaseImportParams,
        // handleFileUploadError,
        // setStudyName,
        // setProvidedCaseFileOk,
    ]);

    return (
        <Dialog
            aria-labelledby="form-dialog-title"
            fullWidth={true}
            maxWidth="md"
            open={true}
        >
            <DialogTitle id="form-dialog-title">
                <FormattedMessage id="createNewStudy" />
            </DialogTitle>
            <DialogContent>
                <UploadFileButton
                    isLoading={isUploadingFileInProgress}
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                    label="uploadCase"
                />
                <ImportParameters
                    formatWithParameters={formatWithParameters}
                    currentParameters={currentParameters}
                    onChange={onChange}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleCreateNewStudy}
                    disabled={!isCreationAllowed}
                    variant="outlined"
                >
                    <FormattedMessage id="validate" />
                </Button>
            </DialogActions>
        </Dialog>
    );
};
