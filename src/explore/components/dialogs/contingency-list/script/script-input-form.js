import AceInput from '../../../utils/rhf-inputs/ace-input';
import { SCRIPT } from '../../../utils/field-constants';
import { styled } from '@mui/system';

const StyledAceInput = styled(AceInput)({
    minWidth: '650px',
    minHeight: '450px',
    marginTop: '4px',
    flexGrow: 1,
});

const ScriptInputForm = () => {
    return (
        <StyledAceInput
            name={SCRIPT}
            placeholder="Insert your groovy script here"
            editorProps={{ $blockScrolling: true }}
            fontSize="18px"
        />
    );
};

export default ScriptInputForm;
