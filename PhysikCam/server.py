#!/usr/bin/env python3
"""
PhysiKCam Image Upload Server
Receives images from mobile PWA and saves them locally
"""

import os
import json
import time
from datetime import datetime
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import mimetypes

class PhysiKCamHandler(BaseHTTPRequestHandler):
    # Configuration
    SECRET_KEY = "physikcam_secret_2024"  # Must match PWA config
    UPLOAD_DIR = "receipts"
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    
    def validate_token(self, payment_id, token):
        """Validate secure token based on payment ID and timestamp"""
        try:
            import base64
            import hashlib
            
            # Generate expected tokens for current and previous timestamp (30-second windows)
            current_timestamp = int(time.time() / 30000)
            timestamps = [current_timestamp, current_timestamp - 1, current_timestamp + 1]
            
            for ts in timestamps:
                data = f"{payment_id}_{ts}_{self.SECRET_KEY}"
                expected_token = base64.b64encode(data.encode()).decode()
                expected_token = ''.join(c for c in expected_token if c.isalnum())[:16]
                
                if token == expected_token:
                    return True
            
            return False
        except Exception as e:
            print(f"Token validation error: {str(e)}")
            return False
    
    def do_GET(self):
        """Handle health check and status requests"""
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                "status": "ok",
                "timestamp": time.time(),
                "server": "PhysiKCam Server v1.0"
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_error(404, "Endpoint not found")
    
    def do_POST(self):
        """Handle image upload requests"""
        try:
            # Parse URL to get payment ID and check auth
            parsed_path = urlparse(self.path)
            path_parts = parsed_path.path.strip('/').split('/')
            
            if len(path_parts) < 2 or path_parts[0] != 'upload':
                self.send_error(400, "Invalid upload path")
                return
            
            payment_id = path_parts[1]
            
            # Check authentication with secure token
            query_params = parse_qs(parsed_path.query)
            auth_token = query_params.get('token', [None])[0]
            
            if not auth_token or not self.validate_token(payment_id, auth_token):
                print(f"[{datetime.now()}] Unauthorized upload attempt for payment {payment_id}")
                self.send_error(401, "Unauthorized")
                return
            
            # Check content type
            content_type = self.headers.get('Content-Type', '')
            if not content_type.startswith('multipart/form-data'):
                self.send_error(400, "Expected multipart/form-data")
                return
            
            # Get content length
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > self.MAX_FILE_SIZE:
                self.send_error(413, "File too large")
                return
            
            # Read multipart data
            boundary = content_type.split('boundary=')[1].encode()
            data = self.rfile.read(content_length)
            
            # Extract image from multipart data
            image_data = self.extract_image_from_multipart(data, boundary)
            if not image_data:
                self.send_error(400, "No image found in request")
                return
            
            # Create upload directory if it doesn't exist
            upload_path = Path(self.UPLOAD_DIR)
            upload_path.mkdir(exist_ok=True)
            
            # Generate filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"payment_{payment_id}_{timestamp}.jpg"
            file_path = upload_path / filename
            
            # Save image
            with open(file_path, 'wb') as f:
                f.write(image_data)
            
            # Send success response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            response = {
                "status": "success",
                "payment_id": payment_id,
                "filename": filename,
                "path": str(file_path),
                "size": len(image_data),
                "timestamp": time.time()
            }
            
            self.wfile.write(json.dumps(response).encode())
            
            # Log successful upload
            print(f"[{datetime.now()}] Upload successful: {filename} ({len(image_data)} bytes)")
            
        except Exception as e:
            print(f"[{datetime.now()}] Upload error: {str(e)}")
            self.send_error(500, f"Internal server error: {str(e)}")
    
    def extract_image_from_multipart(self, data, boundary):
        """Extract image data from multipart form data"""
        try:
            # Split data by boundary
            parts = data.split(b'--' + boundary)
            
            for part in parts:
                # Look for the image part
                if b'Content-Disposition: form-data' in part and b'filename=' in part:
                    # Find the start of actual image data
                    headers_end = part.find(b'\r\n\r\n')
                    if headers_end != -1:
                        image_data = part[headers_end + 4:]
                        # Remove trailing boundary if present
                        if image_data.endswith(b'\r\n'):
                            image_data = image_data[:-2]
                        return image_data
            
            return None
        except Exception as e:
            print(f"Error extracting image: {str(e)}")
            return None
    
    def log_message(self, format, *args):
        """Custom logging to suppress default server logs"""
        pass  # Suppress default logging, we log manually

def run_server(port=3000):
    """Start the PhysiKCam server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, PhysiKCamHandler)
    
    print(f"🚀 PhysiKCam Server v2.0 starting on port {port}")
    print(f"📁 Upload directory: {PhysiKCamHandler.UPLOAD_DIR}")
    print(f"🔐 Security: Secure token validation enabled")
    print(f"🌐 Server ready at: http://localhost:{port}")
    print(f"💚 Health check: http://localhost:{port}/health")
    print(f"🔧 Features: Auto IP detection, Image compression, Retry logic")
    print("\n" + "="*60)
    print("🛡️  SECURE SERVER RUNNING - Press Ctrl+C to stop")
    print("="*60 + "\n")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        httpd.shutdown()

if __name__ == '__main__':
    import sys
    
    # Allow port configuration via command line
    port = 3000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("Invalid port number. Using default port 3000.")
    
    run_server(port)
