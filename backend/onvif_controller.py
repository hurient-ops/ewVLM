import logging
import asyncio
from typing import Optional

logger = logging.getLogger("ewVLMPTZ")

try:
    from onvif import ONVIFCamera
except ImportError:
    ONVIFCamera = None
    logger.warning("onvif-zeep library not installed. PTZ will run in Mock mode.")

class PTZController:
    def __init__(self, ip: str, port: int, user: str, password: str):
        self.ip = ip
        self.port = port
        self.user = user
        self.password = password
        self.camera = None
        self.ptz_service = None
        self.profile = None
        
    async def connect(self) -> bool:
        """Connect to the ONVIF camera and get PTZ service."""
        if not ONVIFCamera:
            logger.info(f"Mock connecting to PTZ camera at {self.ip}:{self.port}")
            return True
            
        try:
            # ONVIFCamera initialization is synchronous but involves network calls,
            # so we run it in a thread pool to avoid blocking the event loop.
            self.camera = await asyncio.to_thread(
                ONVIFCamera, self.ip, self.port, self.user, self.password, '/wsdl/'
            )
            media_service = self.camera.create_media_service()
            profiles = await asyncio.to_thread(media_service.GetProfiles)
            if not profiles:
                logger.error(f"No media profiles found for {self.ip}")
                return False
                
            self.profile = profiles[0]
            self.ptz_service = self.camera.create_ptz_service()
            logger.info(f"Successfully connected to PTZ camera {self.ip}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to ONVIF camera {self.ip}: {e}")
            return False

    async def continuous_move(self, pan: float, tilt: float, zoom: float):
        """
        Send a continuous move command to the camera.
        Speeds are typically between -1.0 and 1.0.
        """
        logger.info(f"[PTZ MOVE] IP: {self.ip} | Pan: {pan}, Tilt: {tilt}, Zoom: {zoom}")
        if not self.ptz_service or not self.profile:
            return

        try:
            request = self.ptz_service.create_type('ContinuousMove')
            request.ProfileToken = self.profile.token
            
            status = self.ptz_service.GetStatus({'ProfileToken': self.profile.token})
            
            if pan != 0 or tilt != 0:
                request.Velocity.PanTilt = status.Position.PanTilt
                request.Velocity.PanTilt.x = pan
                request.Velocity.PanTilt.y = tilt
            
            if zoom != 0:
                request.Velocity.Zoom = status.Position.Zoom
                request.Velocity.Zoom.x = zoom

            await asyncio.to_thread(self.ptz_service.ContinuousMove, request)
        except Exception as e:
            logger.error(f"Error in continuous_move for {self.ip}: {e}")

    async def stop(self):
        """Stop all ongoing PTZ movements."""
        logger.info(f"[PTZ STOP] IP: {self.ip}")
        if not self.ptz_service or not self.profile:
            return
            
        try:
            request = self.ptz_service.create_type('Stop')
            request.ProfileToken = self.profile.token
            request.PanTilt = True
            request.Zoom = True
            await asyncio.to_thread(self.ptz_service.Stop, request)
        except Exception as e:
            logger.error(f"Error stopping PTZ for {self.ip}: {e}")

# Global registry of controllers for active cameras
controllers = {}

async def get_controller(camera_id: str, ip: str = "192.168.1.100") -> PTZController:
    if camera_id not in controllers:
        controller = PTZController(ip, 80, "admin", "admin")
        await controller.connect()
        controllers[camera_id] = controller
    return controllers[camera_id]
