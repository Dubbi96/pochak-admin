package com.tmax.ruletestddddddd;

import org.slf4j.Logger;
import com.tmax.superobject.object.AbstractServiceObject;
import com.tmax.superobject.object.BodyObject;
import com.tmax.superobject.object.DefaultBodyObject;
import com.tmax.superobject.servicemanager.ServiceManager;
import com.tmax.superobject.manager.db.ResourceUtils;
import com.tmax.superobject.logger.SuperAppDefaultLogger;

import java.nio.ByteBuffer;
import java.sql.ResultSet;
import java.sql.PreparedStatement;
import java.sql.Connection;
import java.sql.Blob;
import java.sql.Clob;
import java.sql.Types;
import java.sql.Timestamp;
import java.sql.Time;
import java.sql.Array;

import java.io.Reader;

import com.google.gson.JsonParser;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Locale;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonNull;

public class VirtualRuleEntityIInsertCheck_1 extends AbstractServiceObject {
  private static Logger logger = SuperAppDefaultLogger.getLogger(VirtualRuleEntityIInsertCheck_1.class.getName());

  @Override
  public void service(BodyObject bodyObject) throws Exception {
    ServiceManager serviceManager = ServiceManager.getInstance();
    JsonObject request = bodyObject.getAsJsonObject();
    DefaultBodyObject response = new DefaultBodyObject();
    JsonObject responseBody = new JsonObject();
    Connection conn = ResourceUtils.getConnection();
    try {
      conn.setAutoCommit(false);
      ByteBuffer blobBuffer = null;
      ByteBuffer responseBlobBuffer = ByteBuffer.allocate(0);
      if (bodyObject.getByteBuffer() != null) {
        blobBuffer = bodyObject.getByteBuffer();
      }
      JsonObject InsertObject = request.get("InsertObject").getAsJsonObject();
      String insertQuery0 = "INSERT INTO \"BusinessEntityCheck\" (\"NAME\", \"number\", \"ID\") VALUES (?, ?, \"BusinessEntityCheck_SEQ\".NEXTVAL) RETURNING \"ID\", \"ID\" INTO \"ID\", \"ID\";";
      try (
        PreparedStatement insertPsmt0 = conn.prepareStatement(insertQuery0)) {
        int paramIdx0 = 1;
        if (InsertObject.get("insertString").isJsonNull()) {
          insertPsmt0.setNull(paramIdx0, Types.NULL);
        } else {
          insertPsmt0.setString(paramIdx0, InsertObject.get("insertString").getAsString());
        }
        paramIdx0++;
        if (InsertObject.get("insertNumber").isJsonNull()) {
          insertPsmt0.setNull(paramIdx0, Types.NULL);
        } else {
          insertPsmt0.setBigDecimal(paramIdx0, InsertObject.get("insertNumber").getAsBigDecimal());
        }
        paramIdx0++;
        insertPsmt0.execute();
        HashMap<Integer, JsonArray> outDtoMap0 = new HashMap<>();
        outDtoMap0.put(0, new JsonArray());
        outDtoMap0.put(1, new JsonArray());
        try (ResultSet rs = insertPsmt0.getResultSet()) {
          while (rs.next()) {
            for(int i = 1; i <= rs.getMetaData().getColumnCount(); i++) {
              Integer columnType = rs.getMetaData().getColumnType(i);
              if (rs.getObject(i) == null) {
                outDtoMap0.get(i-1).add(JsonNull.INSTANCE);
                continue;
              }
              switch (columnType) {
                case 2 : {
                  outDtoMap0.get(i-1).add(rs.getBigDecimal(i));
                  break;
                }
                case 2005 : {
                  Clob clobData = rs.getClob(i);
                  StringBuilder sb = new StringBuilder();
                  try (Reader reader = clobData.getCharacterStream()) {
                    int charValue;
                    while ((charValue = reader.read()) != -1) {
                      sb.append((char) charValue);
                    }
                  }
                  outDtoMap0.get(i-1).add(sb.toString());
                  break;
                }
                case 2003:{
                  Array arrayData = rs.getArray(i);
                  if (arrayData != null) {
                    Object[] arrayValues = (Object[]) arrayData.getArray();
                    JsonArray jsonArray = new JsonArray();
                    for (Object value : arrayValues) {
                      if (value instanceof BigDecimal) {
                        jsonArray.add((BigDecimal) value);
                      }
                    }
                    outDtoMap0.get(i-1).add(jsonArray);
                  } else {
                    outDtoMap0.get(i-1).add(JsonNull.INSTANCE);
                  }
                  break;
                }
                case 2004: {
                  Blob blobData = rs.getBlob(i);
                  if (blobData != null) {
                    byte[] bytes = blobData.getBytes(1, (int) blobData.length());
                    ByteBuffer newByteBuffer = ByteBuffer.allocate(responseBlobBuffer.capacity() + bytes.length);
                    responseBlobBuffer.flip();
                    newByteBuffer.put(responseBlobBuffer);
                    newByteBuffer.put(bytes);
                    responseBlobBuffer = newByteBuffer;
                    outDtoMap0.get(i - 1).add(bytes.length);
                  } else {
                    outDtoMap0.get(i - 1).add(0);
                  }
                  break;
                }
                default: {
                  outDtoMap0.get(i-1).add(rs.getObject(i).toString());
                  break;
                }
              }
            }
          }
        }
        JsonArray _2025 = outDtoMap0.get(0).getAsJsonArray();
        JsonArray OutObjectArray = new JsonArray();
        for (int i = 0; i < outDtoMap0.get(0).size(); i++) {
          OutObjectArray.add(new JsonObject());
        }
        for (int i = 0; i< outDtoMap0.get(0).size(); i++) {
          if (outDtoMap0.get(1).getAsJsonArray().get(i).isJsonNull()) {
            OutObjectArray.get(i).getAsJsonObject().add("OutNumber", null);
          } else {
            OutObjectArray.get(i).getAsJsonObject().addProperty("OutNumber", outDtoMap0.get(1).getAsJsonArray().get(i).getAsBigDecimal());
          }
        }
        responseBody.add("OutObject", OutObjectArray);
      } catch (Exception e) {
        logger.error("error", e);
        throw e;
      }
      if(responseBlobBuffer.capacity() > 0){
        responseBlobBuffer.flip();
        response.setByteBuffer(responseBlobBuffer);
      }
    } catch (Exception e) {
      logger.error("error", e);
      throw e;
    }
    response.setJsonObject(responseBody);
    setReply(response);
  }

  @Override
  public void completeService() throws Exception {
  }
}