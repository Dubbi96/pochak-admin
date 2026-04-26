package com.pochak.bo.bff.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.pochak.bo.bff.client.OperationServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Pass-through controller for BO operation management.
 * Supports: venues, cameras, reservations, streaming ingest.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class BoOperationController {

    private final OperationServiceClient operationClient;

    // --- Venues ---

    @GetMapping("/venues")
    public ResponseEntity<JsonNode> listVenues(@RequestParam Map<String, String> params) {
        log.debug("BO listing venues");
        return operationClient.list("venues", params)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/venues/{id}")
    public ResponseEntity<JsonNode> getVenue(@PathVariable Long id) {
        log.debug("BO get venue/{}", id);
        return operationClient.get("venues", id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/venues")
    public ResponseEntity<JsonNode> createVenue(@RequestBody Map<String, Object> body) {
        log.debug("BO creating venue");
        return ResponseEntity.ok(operationClient.create("venues", body));
    }

    @PutMapping("/venues/{id}")
    public ResponseEntity<JsonNode> updateVenue(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        log.debug("BO updating venue/{}", id);
        return ResponseEntity.ok(operationClient.update("venues", id, body));
    }

    @DeleteMapping("/venues/{id}")
    public ResponseEntity<Void> deleteVenue(@PathVariable Long id) {
        log.debug("BO deleting venue/{}", id);
        operationClient.delete("venues", id);
        return ResponseEntity.noContent().build();
    }

    // --- Cameras ---

    @GetMapping("/cameras")
    public ResponseEntity<JsonNode> listCameras(@RequestParam Map<String, String> params) {
        log.debug("BO listing cameras");
        return operationClient.list("cameras", params)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/cameras/{id}")
    public ResponseEntity<JsonNode> getCamera(@PathVariable Long id) {
        log.debug("BO get camera/{}", id);
        return operationClient.get("cameras", id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/cameras")
    public ResponseEntity<JsonNode> createCamera(@RequestBody Map<String, Object> body) {
        log.debug("BO creating camera");
        return ResponseEntity.ok(operationClient.create("cameras", body));
    }

    @PutMapping("/cameras/{id}")
    public ResponseEntity<JsonNode> updateCamera(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        log.debug("BO updating camera/{}", id);
        return ResponseEntity.ok(operationClient.update("cameras", id, body));
    }

    @DeleteMapping("/cameras/{id}")
    public ResponseEntity<Void> deleteCamera(@PathVariable Long id) {
        log.debug("BO deleting camera/{}", id);
        operationClient.delete("cameras", id);
        return ResponseEntity.noContent().build();
    }

    // --- Reservations ---

    @GetMapping("/reservations")
    public ResponseEntity<JsonNode> listReservations(@RequestParam Map<String, String> params) {
        log.debug("BO listing reservations");
        return operationClient.list("reservations", params)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/reservations/{id}")
    public ResponseEntity<JsonNode> getReservation(@PathVariable Long id) {
        log.debug("BO get reservation/{}", id);
        return operationClient.get("reservations", id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PutMapping("/reservations/{id}")
    public ResponseEntity<JsonNode> updateReservation(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        log.debug("BO updating reservation/{}", id);
        return ResponseEntity.ok(operationClient.update("reservations", id, body));
    }

    // --- VPU Contracts ---

    @GetMapping("/equipment/vpu-contracts")
    public ResponseEntity<JsonNode> listVpuContracts(@RequestParam Map<String, String> params) {
        log.debug("BO listing vpu contracts");
        return operationClient.listVpuContracts(params)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/equipment/vpu-contracts/{id}")
    public ResponseEntity<JsonNode> getVpuContract(@PathVariable Long id) {
        log.debug("BO get vpu contract/{}", id);
        return operationClient.getVpuContract(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/equipment/vpu-contracts")
    public ResponseEntity<JsonNode> createVpuContract(@RequestBody Map<String, Object> body) {
        log.debug("BO creating vpu contract");
        return ResponseEntity.ok(operationClient.createVpuContract(body));
    }

    @PutMapping("/equipment/vpu-contracts/{id}")
    public ResponseEntity<JsonNode> updateVpuContract(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        log.debug("BO updating vpu contract/{}", id);
        return ResponseEntity.ok(operationClient.updateVpuContract(id, body));
    }

    // --- VPU Devices ---

    @GetMapping("/equipment/vpu-devices")
    public ResponseEntity<JsonNode> listVpuDevices(@RequestParam Map<String, String> params) {
        log.debug("BO listing vpu devices");
        return operationClient.listVpuDevices(params)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/equipment/vpu-devices")
    public ResponseEntity<JsonNode> createVpuDevice(@RequestBody Map<String, Object> body) {
        log.debug("BO creating vpu device");
        return ResponseEntity.ok(operationClient.createVpuDevice(body));
    }

    @PutMapping("/equipment/vpu-devices/{id}/status")
    public ResponseEntity<JsonNode> updateVpuDeviceStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        log.debug("BO updating vpu device status/{}", id);
        return ResponseEntity.ok(operationClient.updateVpuDeviceStatus(id, body));
    }

    // --- Reservations (booking / admin) ---

    @GetMapping("/reservations/booking")
    public ResponseEntity<JsonNode> listAdminReservations(@RequestParam Map<String, String> params) {
        log.debug("BO listing admin reservations");
        return operationClient.listAdminReservations(params)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PatchMapping("/reservations/{id}/status")
    public ResponseEntity<JsonNode> updateReservationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        log.debug("BO updating reservation status/{}", id);
        return ResponseEntity.ok(operationClient.updateReservationStatus(id, body));
    }

    // --- Skylife ---

    @GetMapping("/skylife/chus")
    public ResponseEntity<JsonNode> listChus(@RequestParam Map<String, String> params) {
        log.debug("BO listing skylife CHUs");
        return operationClient.listChus(params)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/skylife/chus/{id}")
    public ResponseEntity<JsonNode> getChu(@PathVariable Long id) {
        log.debug("BO get skylife CHU/{}", id);
        return operationClient.getChu(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/skylife/chus")
    public ResponseEntity<JsonNode> createChu(@RequestBody Map<String, Object> body) {
        log.debug("BO creating skylife CHU");
        return ResponseEntity.ok(operationClient.createChu(body));
    }

    @PostMapping("/skylife/chus/{id}/connect")
    public ResponseEntity<JsonNode> connectChu(@PathVariable Long id) {
        log.debug("BO connecting skylife CHU/{}", id);
        return ResponseEntity.ok(operationClient.connectChu(id));
    }

    @PostMapping("/skylife/chus/{id}/disconnect")
    public ResponseEntity<JsonNode> disconnectChu(@PathVariable Long id) {
        log.debug("BO disconnecting skylife CHU/{}", id);
        return ResponseEntity.ok(operationClient.disconnectChu(id));
    }

    @GetMapping("/skylife/activation")
    public ResponseEntity<JsonNode> listActivation(@RequestParam Map<String, String> params) {
        log.debug("BO listing skylife activation");
        return operationClient.listActivation(params)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    // --- Streaming Ingest ---

    @GetMapping("/streaming/ingest")
    public ResponseEntity<JsonNode> listIngest(@RequestParam Map<String, String> params) {
        log.debug("BO listing streaming ingest");
        return operationClient.listIngest(params)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/streaming/ingest")
    public ResponseEntity<JsonNode> createIngest(@RequestBody Map<String, Object> body) {
        log.debug("BO creating ingest");
        return ResponseEntity.ok(operationClient.createIngest(body));
    }

    @DeleteMapping("/streaming/ingest/{id}")
    public ResponseEntity<Void> deleteIngest(@PathVariable Long id) {
        log.debug("BO deleting ingest/{}", id);
        operationClient.deleteIngest(id);
        return ResponseEntity.noContent().build();
    }
}
