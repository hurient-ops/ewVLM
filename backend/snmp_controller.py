import logging
import asyncio
import random
from typing import Dict, Any

logger = logging.getLogger("ewVLMSNMP")

try:
    from pysnmp.hlapi.asyncio import *
    SNMP_AVAILABLE = True
except ImportError:
    SNMP_AVAILABLE = False
    logger.warning("pysnmp library not installed. SNMP will run in Mock mode.")

class SNMPController:
    def __init__(self, ip: str, community: str = "public"):
        self.ip = ip
        self.community = community

    async def get_node_stats(self, node_id: str) -> Dict[str, Any]:
        """Poll SNMP data for a given node. Falls back to mock if real polling fails or pysnmp is missing."""
        if not SNMP_AVAILABLE:
            return self._get_mock_stats(node_id)
        
        # Real SNMP Polling logic
        try:
            # sysUpTime OID: 1.3.6.1.2.1.1.3.0
            errorIndication, errorStatus, errorIndex, varBinds = await getCmd(
                SnmpEngine(),
                CommunityData(self.community, mpModel=0),
                UdpTransportTarget((self.ip, 161), timeout=2.0, retries=1),
                ContextData(),
                ObjectType(ObjectIdentity('SNMPv2-MIB', 'sysUpTime', 0))
            )

            if errorIndication or errorStatus:
                logger.warning(f"SNMP Poll failed for {self.ip} ({node_id}): {errorIndication or errorStatus}. Falling back to dynamic mock.")
                return self._get_mock_stats(node_id)
            else:
                uptime_ticks = int(varBinds[0][1])
                uptime_days = uptime_ticks // 8640000
                uptime_hours = (uptime_ticks % 8640000) // 360000
                uptime_str = f"{uptime_days}d {uptime_hours}h 00m"
                
                mock_data = self._get_mock_stats(node_id)
                mock_data["uptime"] = uptime_str
                mock_data["status"] = "online"
                return mock_data

        except Exception as e:
            logger.error(f"SNMP Exception for {self.ip}: {e}")
            return self._get_mock_stats(node_id)

    def _get_mock_stats(self, node_id: str) -> Dict[str, Any]:
        """Generate dynamic mock statistics for demonstration."""
        if "SW" in node_id:
            return {
                "id": node_id,
                "type": "switch",
                "status": random.choices(["online", "warning", "offline"], weights=[80, 15, 5])[0],
                "uptime": f"{random.randint(10, 100)}d {random.randint(0,23)}h {random.randint(0,59)}m",
                "throughput": f"{round(random.uniform(0.5, 2.5), 2)} Gbps",
                "power_draw": f"{random.randint(100, 200)}W (PoE)",
                "temperature": f"{random.randint(35, 65)}°C"
            }
        elif "NVR" in node_id:
            return {
                "id": node_id,
                "type": "nvr",
                "status": "online",
                "uptime": f"{random.randint(100, 200)}d {random.randint(0,23)}h {random.randint(0,59)}m",
                "throughput": f"{round(random.uniform(2.0, 5.0), 2)} Gbps",
                "power_draw": f"{random.randint(250, 400)}W",
                "temperature": f"{random.randint(40, 55)}°C"
            }
        else:
            return {
                "id": node_id,
                "type": "camera",
                "status": random.choices(["online", "offline"], weights=[90, 10])[0],
                "uptime": f"{random.randint(1, 30)}d {random.randint(0,23)}h {random.randint(0,59)}m",
                "throughput": f"{random.randint(2, 10)} Mbps",
                "power_draw": f"{round(random.uniform(5.0, 25.0), 1)}W",
                "temperature": f"{random.randint(30, 45)}°C"
            }
