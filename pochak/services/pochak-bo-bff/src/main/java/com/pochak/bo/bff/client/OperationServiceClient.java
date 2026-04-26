package com.pochak.bo.bff.client;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Map;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class OperationServiceClient {

    private final RestClient operationClient;

    private static String resourceBasePath(String resource) {
        if (resource == null || resource.isBlank()) return "/";
        return "/" + resource;
    }

    // --- Generic CRUD pass-through ---

    public Optional<JsonNode> list(String resource, Map<String, String> params) {
        try {
            String base = resourceBasePath(resource);
            return Optional.ofNullable(
                operationClient.get()
                        .uri(uriBuilder -> {
                            var builder = uriBuilder.path(base);
                            params.forEach(builder::queryParam);
                            return builder.build();
                        })
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Operation service list {} call failed: {}", resource, e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<JsonNode> get(String resource, Long id) {
        try {
            String base = resourceBasePath(resource);
            return Optional.ofNullable(
                operationClient.get()
                        .uri(base + "/" + id)
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Operation service get {}/{} call failed: {}", resource, id, e.getMessage());
            return Optional.empty();
        }
    }

    public JsonNode create(String resource, Map<String, Object> body) {
        String base = resourceBasePath(resource);
        return operationClient.post()
                .uri(base)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode update(String resource, Long id, Map<String, Object> body) {
        String base = resourceBasePath(resource);
        return operationClient.put()
                .uri(base + "/" + id)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public void delete(String resource, Long id) {
        String base = resourceBasePath(resource);
        operationClient.delete()
                .uri(base + "/" + id)
                .retrieve()
                .toBodilessEntity();
    }

    // --- VPU Contracts ---

    public Optional<JsonNode> listVpuContracts(Map<String, String> params) {
        try {
            return Optional.ofNullable(
                operationClient.get()
                        .uri(uriBuilder -> {
                            var builder = uriBuilder.path("/admin/vpu/contracts");
                            params.forEach(builder::queryParam);
                            return builder.build();
                        })
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Operation service list vpu/contracts call failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<JsonNode> getVpuContract(Long id) {
        try {
            return Optional.ofNullable(
                operationClient.get()
                        .uri("/admin/vpu/contracts/{id}", id)
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Operation service get vpu/contracts/{} call failed: {}", id, e.getMessage());
            return Optional.empty();
        }
    }

    public JsonNode createVpuContract(Map<String, Object> body) {
        return operationClient.post()
                .uri("/admin/vpu/contracts")
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode updateVpuContract(Long id, Map<String, Object> body) {
        return operationClient.put()
                .uri("/admin/vpu/contracts/{id}", id)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    // --- VPU Devices ---

    public Optional<JsonNode> listVpuDevices(Map<String, String> params) {
        try {
            return Optional.ofNullable(
                operationClient.get()
                        .uri(uriBuilder -> {
                            var builder = uriBuilder.path("/admin/vpu/devices");
                            params.forEach(builder::queryParam);
                            return builder.build();
                        })
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Operation service list vpu/devices call failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public JsonNode createVpuDevice(Map<String, Object> body) {
        return operationClient.post()
                .uri("/admin/vpu/devices")
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode updateVpuDeviceStatus(Long id, Map<String, Object> body) {
        return operationClient.put()
                .uri("/admin/vpu/devices/{id}/status", id)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    // --- Reservations (admin) ---

    public Optional<JsonNode> listAdminReservations(Map<String, String> params) {
        try {
            return Optional.ofNullable(
                operationClient.get()
                        .uri(uriBuilder -> {
                            var builder = uriBuilder.path("/admin/reservations");
                            params.forEach(builder::queryParam);
                            return builder.build();
                        })
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Operation service list admin/reservations call failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public JsonNode updateReservationStatus(Long id, Map<String, Object> body) {
        return operationClient.patch()
                .uri("/admin/reservations/{id}/status", id)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    // --- CHU / Skylife ---

    public Optional<JsonNode> listChus(Map<String, String> params) {
        try {
            return Optional.ofNullable(
                operationClient.get()
                        .uri(uriBuilder -> {
                            var builder = uriBuilder.path("/admin/skylife/chus");
                            params.forEach(builder::queryParam);
                            return builder.build();
                        })
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Operation service list skylife/chus call failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<JsonNode> getChu(Long id) {
        try {
            return Optional.ofNullable(
                operationClient.get()
                        .uri("/admin/skylife/chus/{id}", id)
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Operation service get skylife/chus/{} call failed: {}", id, e.getMessage());
            return Optional.empty();
        }
    }

    public JsonNode createChu(Map<String, Object> body) {
        return operationClient.post()
                .uri("/admin/skylife/chus")
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode connectChu(Long id) {
        return operationClient.post()
                .uri("/admin/skylife/chus/{id}/connect", id)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode disconnectChu(Long id) {
        return operationClient.post()
                .uri("/admin/skylife/chus/{id}/disconnect", id)
                .retrieve()
                .body(JsonNode.class);
    }

    public Optional<JsonNode> listActivation(Map<String, String> params) {
        try {
            return Optional.ofNullable(
                operationClient.get()
                        .uri(uriBuilder -> {
                            var builder = uriBuilder.path("/admin/skylife/activation");
                            params.forEach(builder::queryParam);
                            return builder.build();
                        })
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Operation service list skylife/activation call failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    // --- Streaming Ingest ---

    public Optional<JsonNode> listIngest(Map<String, String> params) {
        try {
            return Optional.ofNullable(
                operationClient.get()
                        .uri(uriBuilder -> {
                            var builder = uriBuilder.path("/streaming/ingest");
                            params.forEach(builder::queryParam);
                            return builder.build();
                        })
                        .retrieve()
                        .body(JsonNode.class)
            );
        } catch (RestClientException e) {
            log.warn("Operation service streaming ingest list failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public JsonNode createIngest(Map<String, Object> body) {
        return operationClient.post()
                .uri("/streaming/ingest")
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }

    public void deleteIngest(Long id) {
        operationClient.delete()
                .uri("/streaming/ingest/{id}", id)
                .retrieve()
                .toBodilessEntity();
    }
}
