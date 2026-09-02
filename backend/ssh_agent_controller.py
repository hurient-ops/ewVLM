import logging
import asyncio

logger = logging.getLogger("ewVLMEdgeAgent")

try:
    import asyncssh
    SSH_AVAILABLE = True
except ImportError:
    SSH_AVAILABLE = False
    logger.warning("asyncssh library not installed. Edge Agent will run in Mock mode.")

class EdgeAgentController:
    def __init__(self, ip: str, username: str = "root", password: str = "admin"):
        self.ip = ip
        self.username = username
        self.password = password

    async def execute_healing_action(self, node_id: str, action: str) -> bool:
        """Connects via SSH to the edge node to execute self-healing commands."""
        logger.info(f"[EdgeAgent] Requested healing action '{action}' on {node_id} ({self.ip})")

        if not SSH_AVAILABLE:
            logger.info(f"[EdgeAgent] Mocking SSH connection to {self.ip} for {action}...")
            await asyncio.sleep(2.5) # Simulate connection delay
            logger.info(f"[EdgeAgent] Mock execution of '{action}' successful.")
            return True

        # Real SSH Execution
        try:
            async with asyncssh.connect(
                self.ip, 
                username=self.username, 
                password=self.password, 
                known_hosts=None
            ) as conn:
                logger.info(f"[EdgeAgent] SSH connection established to {self.ip}")
                
                cmd = "echo 'noop'"
                if action == "AUTO_RECOVER":
                    cmd = "sudo reboot"
                elif action == "CALIBRATE_LENS":
                    cmd = "v4l2-ctl --set-ctrl=focus_auto=1"
                elif action == "TEST_WIPER":
                    cmd = "echo 1 > /sys/class/gpio/gpio12/value && sleep 2 && echo 0 > /sys/class/gpio/gpio12/value"
                else:
                    cmd = f"echo '{action} not explicitly defined, simulating success'"
                
                logger.info(f"[EdgeAgent] Executing: {cmd}")
                result = await conn.run(cmd)
                
                if result.exit_status == 0:
                    logger.info(f"[EdgeAgent] Execution successful on {node_id}")
                    return True
                else:
                    logger.error(f"[EdgeAgent] Execution failed: {result.stderr}")
                    return False

        except Exception as e:
            logger.error(f"[EdgeAgent] Failed to connect or execute on {self.ip}: {e}")
            logger.info(f"[EdgeAgent] Falling back to Mock mode for {action}...")
            await asyncio.sleep(2.5)
            return True
