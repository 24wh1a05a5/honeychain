// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract HoneyTraceability {
    struct Batch {
        string batchId;
        string producer;
        string origin;
        string hive;
        string harvestDate;
        string honeyType;
        string qualityStatus;
        uint256 createdAt;
        bool exists;
    }

    struct TraceabilityEvent {
        string eventType;
        string detail;
        uint256 timestamp;
        address recordedBy;
    }

    mapping(string => Batch) private batches;
    mapping(string => TraceabilityEvent[]) private batchEvents;

    event BatchCreated(string indexed batchId, address indexed producer, uint256 timestamp);
    event TraceabilityEventAdded(string indexed batchId, string eventType, uint256 timestamp);

    function registerBatch(string calldata batchId, string calldata producer, string calldata origin, string calldata hive, string calldata harvestDate, string calldata honeyType, string calldata qualityStatus) external {
        require(!batches[batchId].exists, "Batch already exists");
        batches[batchId] = Batch(batchId, producer, origin, hive, harvestDate, honeyType, qualityStatus, block.timestamp, true);
        emit BatchCreated(batchId, msg.sender, block.timestamp);
    }

    function getBatch(string calldata batchId) external view returns (Batch memory) {
        require(batches[batchId].exists, "Batch not found");
        return batches[batchId];
    }

    function addTraceabilityEvent(string calldata batchId, string calldata eventType, string calldata detail) external {
        require(batches[batchId].exists, "Batch not found");
        batchEvents[batchId].push(TraceabilityEvent(eventType, detail, block.timestamp, msg.sender));
        emit TraceabilityEventAdded(batchId, eventType, block.timestamp);
    }

    function getBatchEvents(string calldata batchId) external view returns (TraceabilityEvent[] memory) {
        require(batches[batchId].exists, "Batch not found");
        return batchEvents[batchId];
    }
}
