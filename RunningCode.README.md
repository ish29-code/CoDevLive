User writes code in editor
        ↓
Clicks RUN
        ↓
Frontend sends request via WebSocket
        ↓
Backend receives code + language + socketId
        ↓
Backend pushes job to Redis queue (BullMQ)
        ↓
Judge Worker listens to queue
        ↓
Worker spins Docker container
        ↓
Code compiled & executed in sandbox
        ↓
Worker publishes result to Redis Pub/Sub
        ↓
Backend receives result
        ↓
Backend sends result via WebSocket
        ↓
Frontend updates UI (Queued → Running → Completed)



right now
Client
  ↓
Backend (API + WebSocket + Queue producer)
  ↓
Redis Queue
  ↓
Worker Service
  ↓
Docker Execution
  ↓
Redis Pub/Sub
  ↓
Backend
  ↓
WebSocket
  ↓
Client






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