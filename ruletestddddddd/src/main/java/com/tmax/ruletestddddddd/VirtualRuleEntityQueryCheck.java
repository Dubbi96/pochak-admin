
package com.tmax.ruletestddddddd;

import org.slf4j.Logger;
import com.tmax.superobject.object.AbstractServiceObject;
import com.tmax.superobject.object.BodyObject;
import com.tmax.superobject.object.DefaultBodyObject;
import com.tmax.superobject.servicemanager.ServiceManager;
import com.tmax.superobject.manager.db.ResourceUtils;
import com.tmax.superobject.logger.SuperAppDefaultLogger;
import com.tmax.superobject.object.MessageObject;

import java.nio.ByteBuffer;
import java.sql.ResultSet;
import java.sql.PreparedStatement;
import com.google.gson.JsonElement;
import java.sql.Connection;
import java.sql.Blob;
import java.sql.Clob;
import java.sql.Types;
import java.sql.Timestamp;
import java.sql.Time;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonNull;


public class VirtualRuleEntityQueryCheck extends AbstractServiceObject {
  static Logger _logger = SuperAppDefaultLogger.getLogger(VirtualRuleEntityQueryCheck.class.getName());


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

    JsonObject outputObject = new JsonObject();
    try {
      _interRequest = new JsonObject();
      _serviceRequest.setJsonObject(_interRequest);

      BodyObject responseOfVirtualRuleEntityQueryCheck_1 = _serviceManager.callSyncInternal("ruletestddddddd/com.tmax.ruletestddddddd.VirtualRuleEntityQueryCheck_1", _serviceRequest);
      ByteBuffer byteBufferOfVirtualRuleEntityQueryCheck_1 = null;
      _interResponse = new JsonObject();

      _interResponse = responseOfVirtualRuleEntityQueryCheck_1.getAsJsonObject();
      if (!_interResponse.get("outputObject").isJsonNull()) {
        if (!_interResponse.get("outputObject").getAsJsonArray().isEmpty()) {
          outputObject = _interResponse.get("outputObject").getAsJsonArray().get(0).isJsonNull() ? null : _interResponse.get("outputObject").getAsJsonArray().get(0).getAsJsonObject();
        } else {
          outputObject =  null;
        } 
      } else {
        outputObject =  null;
      }
      if (responseOfVirtualRuleEntityQueryCheck_1.getByteBuffer() != null) {
        byteBufferOfVirtualRuleEntityQueryCheck_1 = responseOfVirtualRuleEntityQueryCheck_1.getByteBuffer();
        ByteBuffer _newByteBuffer = ByteBuffer.allocate(_responseBlobBuffer.capacity() + byteBufferOfVirtualRuleEntityQueryCheck_1.capacity());
        _responseBlobBuffer.flip();
        _newByteBuffer.put(_responseBlobBuffer);
        _newByteBuffer.put(byteBufferOfVirtualRuleEntityQueryCheck_1);
        _responseBlobBuffer = _newByteBuffer;
      }

      _responseBody.add("outputObject",outputObject);
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