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

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Arrays;
import java.util.Locale;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonNull;

public class VirtualRuleEntityQueryCheck_1 extends AbstractServiceObject {
  private static Logger logger = SuperAppDefaultLogger.getLogger(VirtualRuleEntityQueryCheck_1.class.getName());

  @Override
  public void service(BodyObject bodyObject) throws Exception {
    ServiceManager serviceManager = ServiceManager.getInstance();
    JsonObject request = bodyObject.getAsJsonObject();
    Timestamp startTimestamp = new Timestamp(System.currentTimeMillis());
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

      String selectQuery = "SELECT JSON_OBJECT(KEY ('outputObject') VALUE (\"outputObject\") FORMAT JSON) FROM (SELECT JSON_ARRAYAGG(JSON_OBJECT(KEY ('id') VALUE (\"BusinessEntityCheck_ID\"), KEY ('name') VALUE (\"BusinessEntityCheck_NAME\"), KEY ('number') VALUE (\"BusinessEntityCheck_number\"), KEY ('output') VALUE (\"BusinessEntityCheck_output\"))) AS \"outputObject\" FROM (SELECT \"BusinessEntityCheck\".\"ID\" AS \"BusinessEntityCheck_ID\", \"BusinessEntityCheck\".\"NAME\" AS \"BusinessEntityCheck_NAME\", \"BusinessEntityCheck\".\"number\" AS \"BusinessEntityCheck_number\", VirtualRuleEntityCheck(\"BusinessEntityCheck\".\"NAME\", \"BusinessEntityCheck\".\"number\") AS \"BusinessEntityCheck_StringOutput\" FROM \"BusinessEntityCheck\"))";

      try (PreparedStatement selectPsmt = conn.prepareStatement(selectQuery)) {

        JsonObject resultObject = new JsonObject();
        try (ResultSet rs = selectPsmt.executeQuery()) {
          if (rs.next()) {
            resultObject = JsonParser.parseString(rs.getString(1)).getAsJsonObject();
          }
        }
        response.setJsonObject(resultObject);
        if(responseBlobBuffer.capacity() > 0){
          responseBlobBuffer.flip();
          response.setByteBuffer(responseBlobBuffer);
        }
        setReply(response);
      } catch (Exception e) {
        logger.error("error", e);
        throw e;
      }
    } catch (Exception e) {
      logger.error("error", e);
      throw e;
    } 
  }

  @Override
  public void completeService() throws Exception {
  }
}