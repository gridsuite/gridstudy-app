import { FlatParameters } from '@gridsuite/commons-ui';
import { FunctionComponent, useCallback, useState } from 'react';
import { AdvancedParameterButton } from './advanced-parameter-button';
import { CaseImportParameters } from 'services/network-conversion';
import { Box, Divider, Theme } from '@mui/material';

export interface ImportParametersProps {
    formatWithParameters: CaseImportParameters[];
    currentParameters: Record<string, any>;
    onChange: (paramName: string, value: any, isEdit: boolean) => void;
}

const styles = {
    paramDivider: (theme: Theme) => ({
        marginTop: theme.spacing(2),
    }),
};

export const ImportParameters: FunctionComponent<ImportParametersProps> = (
    props
) => {
    const { formatWithParameters, onChange, currentParameters } = props;

    const [areParamsDisplayed, setAreParamsDisplayed] = useState(false);

    const handleShowParametersForCaseFileClick = useCallback(() => {
        setAreParamsDisplayed((oldValue) => !oldValue);
    }, []);

    return (
        <>
            <Divider sx={styles.paramDivider} />
            <Box
                sx={{
                    marginTop: '10px',
                }}
            >
                <AdvancedParameterButton
                    showOpenIcon={areParamsDisplayed}
                    label={'importParameters'}
                    callback={handleShowParametersForCaseFileClick}
                    disabled={formatWithParameters.length === 0}
                />
                {areParamsDisplayed && (
                    <FlatParameters
                        paramsAsArray={formatWithParameters}
                        initValues={currentParameters}
                        onChange={onChange}
                        variant="standard"
                    />
                )}
            </Box>
        </>
    );
};
