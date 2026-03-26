import java.math.BigDecimal;
import java.nio.ByteBuffer;

public class ProcedureAsService extends AbstractServiceObject {
    static Logger _logger = SuperAppDefaultLogger.getLogger(ProcedureAsService.class.getName());

    public JsonObject ProcedureRuleEntityCheck_Func(String StringInput, BigDecimal NumberInput, Boolean BooleanInput) {
        JsonObject _outObj = new JsonObject();
        String StringOutput;
        if (StringInput.equals("input1") && NumberInput.equals(new BigDecimal("1")) && BooleanInput) {
            StringOutput = "A";
        } else if (StringInput.equals("input2") && NumberInput.equals(new BigDecimal("2")) && BooleanInput) {
            StringOutput = "B";
        } else {
            StringOutput = "C";
        }
        _outObj.addProperty("StringOutput", StringOutput);
        return _outObj;

    }

    @Override
    public void service(BodyObject _bodyObject) throws Exception {
        JsonObject _interRequest = new JsonObject();
        JsonObject _interResponse = new JsonObject();
        DefaultBodyObject _serviceRequest = new DefaultBodyObject();
        _serviceRequest.setByteBuffer(_bodyObject.getByteBuffer());
        ServiceManager _serviceManager = ServiceManager.getInstance();
        JsonObject _request = _bodyObject.getAsJsonObject();
        DefaultBodyObject _response = new DefaultBodyObject();
        ByteBuffer _responseBlobBuffer = ByteBuffer.allocate(0);
        JsonObject _responseBody = new JsonObject();

        JsonObject ProcedureRuleInput = new JsonObject();
        if (!_request.get("ProcedureRuleInput").isJsonNull()) {
            ProcedureRuleInput = _request.get("ProcedureRuleInput").getAsJsonObject();
        } else {
            ProcedureRuleInput = null;
        }
        String StringOutput = "";
        try {
            JsonObject _ProcedureRuleEntityCheckOutObj = new JsonObject();
            _ProcedureRuleEntityCheckOutObj = ProcedureRuleEntityCheck_Func(
                    ProcedureRuleInput,
                    ProcedureRuleInput,
                    ProcedureRuleInput
            );

            if (_ProcedureRuleEntityCheckOutObj.get("StringOutput") != null) {
                if(!_ProcedureRuleEntityCheckOutObj.get("StringOutput").isJsonNull()) {
                    StringOutput = _ProcedureRuleEntityCheckOutObj.get("StringOutput").getAsString();
                }  else {
                    StringOutput =  null;
                }
            } else {
                StringOutput =  null;
            }

            _responseBody.addProperty("StringOutput",StringOutput);
        } catch (Exception _e) {
            _logger.error("error", _e);
            throw _e;
        }
        _response.setJsonObject(_responseBody);
        if(_responseBlobBuffer.capacity() > 0){
            _responseBlobBuffer.flip();
            _response.setByteBuffer(_responseBlobBuffer);
        }
        setReply(_response);
    }
    @Override
    public void completeService() throws Exception {
    }
}