from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
import logging

logger = logging.getLogger(__name__)

try:
    import redis.asyncio as redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logger.warning("redis not installed. Running in local broadcast mode only.")

class WebSocketManager:
    def __init__(self, redis_url="redis://localhost:6379", channel="ewvlm_events"):
        self.active_connections: List[WebSocket] = []
        self.redis_url = redis_url
        self.channel = channel
        self.redis_client = None
        self.pubsub = None
        self._listener_task = None
        
        if REDIS_AVAILABLE:
            try:
                self.redis_client = redis.from_url(self.redis_url)
                # Since __init__ is synchronous, we create a task for the listener
                # Wait, this might fail if event loop isn't running yet. We'll handle it gracefully.
                import asyncio
                self._listener_task = asyncio.create_task(self._listen_redis())
                logger.info(f"Redis Pub/Sub configured on channel '{self.channel}'.")
            except Exception as e:
                logger.error(f"Failed to connect to Redis: {e}. Falling back to local mode.")
                self.redis_client = None

    async def _listen_redis(self):
        if not self.redis_client:
            return
            
        try:
            self.pubsub = self.redis_client.pubsub()
            await self.pubsub.subscribe(self.channel)
            logger.info(f"Subscribed to Redis channel: {self.channel}")
            
            async for message in self.pubsub.listen():
                if message["type"] == "message":
                    data = message["data"].decode("utf-8")
                    await self._local_broadcast(data)
        except asyncio.CancelledError:
            logger.info("Redis listener task cancelled.")
        except Exception as e:
            logger.error(f"Redis Listener error: {e}. Fallback to local mode.")
            self.redis_client = None

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Client connected. Active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"Client disconnected. Active connections: {len(self.active_connections)}")

    async def broadcast_event(self, event_data: dict):
        message = json.dumps(event_data)
        if self.redis_client:
            try:
                # Publish to Redis channel (the listener will catch it and broadcast locally)
                await self.redis_client.publish(self.channel, message)
                return
            except Exception as e:
                logger.error(f"Redis publish failed: {e}. Falling back to local broadcast.")
        
        # Fallback to local broadcast if Redis is disabled or failed
        await self._local_broadcast(message)
        
    async def _local_broadcast(self, message: str):
        if not self.active_connections:
            return
            
        import fastapi
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except fastapi.WebSocketDisconnect:
                disconnected.append(connection)
            except Exception as e:
                logger.error(f"Error sending message to websocket: {e}")
                disconnected.append(connection)
                
        for dead_conn in disconnected:
            self.disconnect(dead_conn)

manager = WebSocketManager()
