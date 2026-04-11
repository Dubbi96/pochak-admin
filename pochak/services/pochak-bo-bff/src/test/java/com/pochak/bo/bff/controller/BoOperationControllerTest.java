package com.pochak.bo.bff.controller;

import com.pochak.bo.bff.client.OperationServiceClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BoOperationController.class)
class BoOperationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OperationServiceClient operationClient;

    private final ObjectMapper mapper = new ObjectMapper();

    // ── Venues ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /venues - 목록 조회가 Operation 서비스로 패스스루된다")
    void listVenues() throws Exception {
        ObjectNode expected = mapper.createObjectNode().put("total", 5);
        when(operationClient.list(eq("venues"), anyMap())).thenReturn(expected);

        mockMvc.perform(get("/venues").param("page", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(5));

        verify(operationClient).list(eq("venues"), anyMap());
    }

    @Test
    @DisplayName("GET /venues/{id} - 단건 조회가 Operation 서비스로 패스스루된다")
    void getVenue() throws Exception {
        ObjectNode expected = mapper.createObjectNode().put("id", 1).put("name", "Stadium A");
        when(operationClient.get("venues", 1L)).thenReturn(expected);

        mockMvc.perform(get("/venues/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Stadium A"));

        verify(operationClient).get("venues", 1L);
    }

    @Test
    @DisplayName("POST /venues - 생성 요청이 Operation 서비스로 패스스루된다")
    void createVenue() throws Exception {
        ObjectNode expected = mapper.createObjectNode().put("id", 10);
        when(operationClient.create(eq("venues"), anyMap())).thenReturn(expected);

        mockMvc.perform(post("/venues")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"New Venue\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10));

        verify(operationClient).create(eq("venues"), anyMap());
    }

    @Test
    @DisplayName("PUT /venues/{id} - 수정 요청이 Operation 서비스로 패스스루된다")
    void updateVenue() throws Exception {
        ObjectNode expected = mapper.createObjectNode().put("id", 1).put("name", "Updated");
        when(operationClient.update(eq("venues"), eq(1L), anyMap())).thenReturn(expected);

        mockMvc.perform(put("/venues/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Updated\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated"));

        verify(operationClient).update(eq("venues"), eq(1L), anyMap());
    }

    @Test
    @DisplayName("DELETE /venues/{id} - 삭제 요청이 Operation 서비스로 패스스루된다")
    void deleteVenue() throws Exception {
        doNothing().when(operationClient).delete("venues", 1L);

        mockMvc.perform(delete("/venues/1"))
                .andExpect(status().isNoContent());

        verify(operationClient).delete("venues", 1L);
    }

    // ── Cameras ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /cameras - 카메라 목록 조회")
    void listCameras() throws Exception {
        ObjectNode expected = mapper.createObjectNode().put("total", 3);
        when(operationClient.list(eq("cameras"), anyMap())).thenReturn(expected);

        mockMvc.perform(get("/cameras"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(3));
    }

    @Test
    @DisplayName("GET /cameras/{id} - 카메라 단건 조회")
    void getCamera() throws Exception {
        ObjectNode expected = mapper.createObjectNode().put("id", 2);
        when(operationClient.get("cameras", 2L)).thenReturn(expected);

        mockMvc.perform(get("/cameras/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2));
    }

    @Test
    @DisplayName("POST /cameras - 카메라 생성")
    void createCamera() throws Exception {
        ObjectNode expected = mapper.createObjectNode().put("id", 5);
        when(operationClient.create(eq("cameras"), anyMap())).thenReturn(expected);

        mockMvc.perform(post("/cameras")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"model\":\"PTZ-100\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5));
    }

    @Test
    @DisplayName("PUT /cameras/{id} - 카메라 수정")
    void updateCamera() throws Exception {
        ObjectNode expected = mapper.createObjectNode().put("id", 2).put("model", "PTZ-200");
        when(operationClient.update(eq("cameras"), eq(2L), anyMap())).thenReturn(expected);

        mockMvc.perform(put("/cameras/2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"model\":\"PTZ-200\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.model").value("PTZ-200"));
    }

    @Test
    @DisplayName("DELETE /cameras/{id} - 카메라 삭제")
    void deleteCamera() throws Exception {
        doNothing().when(operationClient).delete("cameras", 2L);

        mockMvc.perform(delete("/cameras/2"))
                .andExpect(status().isNoContent());

        verify(operationClient).delete("cameras", 2L);
    }

    // ── Reservations ────────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /reservations - 예약 목록 조회")
    void listReservations() throws Exception {
        ObjectNode expected = mapper.createObjectNode().put("total", 10);
        when(operationClient.list(eq("reservations"), anyMap())).thenReturn(expected);

        mockMvc.perform(get("/reservations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(10));
    }

    @Test
    @DisplayName("GET /reservations/{id} - 예약 단건 조회")
    void getReservation() throws Exception {
        ObjectNode expected = mapper.createObjectNode().put("id", 7);
        when(operationClient.get("reservations", 7L)).thenReturn(expected);

        mockMvc.perform(get("/reservations/7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7));
    }

    @Test
    @DisplayName("PUT /reservations/{id} - 예약 수정")
    void updateReservation() throws Exception {
        ObjectNode expected = mapper.createObjectNode().put("id", 7).put("status", "CONFIRMED");
        when(operationClient.update(eq("reservations"), eq(7L), anyMap())).thenReturn(expected);

        mockMvc.perform(put("/reservations/7")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"CONFIRMED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    // ── Streaming Ingest ────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /streaming/ingest - 인제스트 목록 조회")
    void listIngest() throws Exception {
        ObjectNode expected = mapper.createObjectNode().put("total", 2);
        when(operationClient.listIngest(anyMap())).thenReturn(expected);

        mockMvc.perform(get("/streaming/ingest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(2));
    }

    @Test
    @DisplayName("POST /streaming/ingest - 인제스트 생성")
    void createIngest() throws Exception {
        ObjectNode expected = mapper.createObjectNode().put("id", 1);
        when(operationClient.createIngest(anyMap())).thenReturn(expected);

        mockMvc.perform(post("/streaming/ingest")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"streamKey\":\"abc123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @DisplayName("DELETE /streaming/ingest/{id} - 인제스트 삭제")
    void deleteIngest() throws Exception {
        doNothing().when(operationClient).deleteIngest(1L);

        mockMvc.perform(delete("/streaming/ingest/1"))
                .andExpect(status().isNoContent());

        verify(operationClient).deleteIngest(1L);
    }
}
