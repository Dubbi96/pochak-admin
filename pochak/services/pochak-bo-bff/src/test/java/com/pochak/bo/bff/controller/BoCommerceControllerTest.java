package com.pochak.bo.bff.controller;

import com.pochak.bo.bff.client.CommerceServiceClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BoCommerceController.class)
class BoCommerceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CommerceServiceClient commerceClient;

    private final ObjectMapper mapper = new ObjectMapper();

    // ── Products ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /products - 상품 목록 조회가 Commerce 서비스로 패스스루된다")
    void listProducts() throws Exception {
        ObjectNode expected = mapper.createObjectNode().put("total", 20);
        when(commerceClient.listProducts(anyMap())).thenReturn(expected);

        mockMvc.perform(get("/products").param("page", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(20));

        verify(commerceClient).listProducts(anyMap());
    }

    @Test
    @DisplayName("GET /products/{id} - 상품 단건 조회")
    void getProduct() throws Exception {
        ObjectNode expected = mapper.createObjectNode().put("id", 3).put("name", "Season Pass");
        when(commerceClient.getProduct(3L)).thenReturn(expected);

        mockMvc.perform(get("/products/3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Season Pass"));

        verify(commerceClient).getProduct(3L);
    }

    @Test
    @DisplayName("POST /products - 상품 생성")
    void createProduct() throws Exception {
        ObjectNode expected = mapper.createObjectNode().put("id", 11);
        when(commerceClient.createProduct(anyMap())).thenReturn(expected);

        mockMvc.perform(post("/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"New Product\",\"price\":9900}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(11));

        verify(commerceClient).createProduct(anyMap());
    }

    @Test
    @DisplayName("PUT /products/{id} - 상품 수정")
    void updateProduct() throws Exception {
        ObjectNode expected = mapper.createObjectNode().put("id", 3).put("price", 12000);
        when(commerceClient.updateProduct(eq(3L), anyMap())).thenReturn(expected);

        mockMvc.perform(put("/products/3")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"price\":12000}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.price").value(12000));

        verify(commerceClient).updateProduct(eq(3L), anyMap());
    }

    @Test
    @DisplayName("DELETE /products/{id} - 상품 삭제")
    void deleteProduct() throws Exception {
        doNothing().when(commerceClient).deleteProduct(3L);

        mockMvc.perform(delete("/products/3"))
                .andExpect(status().isNoContent());

        verify(commerceClient).deleteProduct(3L);
    }

    // ── Refunds ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /refunds - 환불 목록 조회가 Commerce 서비스로 패스스루된다")
    void listRefunds() throws Exception {
        ObjectNode expected = mapper.createObjectNode().put("total", 7);
        when(commerceClient.listRefunds(anyMap())).thenReturn(expected);

        mockMvc.perform(get("/refunds"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(7));

        verify(commerceClient).listRefunds(anyMap());
    }

    @Test
    @DisplayName("GET /refunds/{id} - 환불 단건 조회")
    void getRefund() throws Exception {
        ObjectNode expected = mapper.createObjectNode().put("id", 5).put("status", "PENDING");
        when(commerceClient.getRefund(5L)).thenReturn(expected);

        mockMvc.perform(get("/refunds/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"));

        verify(commerceClient).getRefund(5L);
    }

    @Test
    @DisplayName("PUT /refunds/{id}/process - 환불 승인/거절 처리")
    void processRefund() throws Exception {
        ObjectNode expected = mapper.createObjectNode().put("id", 5).put("status", "APPROVED");
        when(commerceClient.processRefund(eq(5L), anyMap())).thenReturn(expected);

        mockMvc.perform(put("/refunds/5/process")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"approved\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        verify(commerceClient).processRefund(eq(5L), anyMap());
    }
}
