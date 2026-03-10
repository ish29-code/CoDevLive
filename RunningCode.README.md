User clicks Submit
        ↓
submissionController
        ↓
Submission saved (Pending)
        ↓
BullMQ Queue
        ↓
Worker picks job
        ↓
status = Running
        ↓
Docker executes code
        ↓
Run testcases
        ↓
Verdict generated
        ↓
Submission updated
        ↓
Progress updated (if Accepted)



right now
socket run-code
      ↓
BullMQ queue
      ↓
worker
      ↓
dockerExecutor
      ↓
publish executionResults
      ↓
subscriber
      ↓
socket emit
      ↓
frontend output






for larger scaleClient
   ↓
API Gateway
   ↓
Execution Service
   ↓
Queue (Kafka / Redis)
   ↓
Judge Workers
   ↓
Event Bus
   ↓
Realtime Gateway
   ↓
Client