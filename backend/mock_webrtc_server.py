import http.server
import socketserver
import json
import logging

PORT = 8889

class MockWebRTCServer(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS, POST')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type')
        self.end_headers()

    def do_POST(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        # Return a dummy SDP answer so the WebRTC player doesn't crash
        dummy_answer = {
            "type": "answer",
            "sdp": "v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nc=IN IP4 127.0.0.1\r\nt=0 0\r\nm=video 9 UDP/TLS/RTP/SAVPF 96\r\nc=IN IP4 127.0.0.1\r\na=rtpmap:96 VP8/90000\r\na=setup:passive\r\n"
        }
        self.wfile.write(json.dumps(dummy_answer).encode('utf-8'))

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({"status": "running"}).encode('utf-8'))

    def log_message(self, format, *args):
        # Keep it quiet
        pass

if __name__ == "__main__":
    Handler = MockWebRTCServer
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger("MockWebRTC")
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        logger.info(f"Mock WebRTC Media Server running at port {PORT}")
        httpd.serve_forever()
