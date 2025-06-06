import requests

# Test CORS headers
def test_cors_headers():
    # Test with your frontend URL
    test_urls = [
        'http://localhost:8000/api/health/',  # Local Django
        'https://studentms-backend.onrender.com/api/health/',  # Your production backend
    ]
    
    for url in test_urls:
        print(f"\nTesting CORS for: {url}")
        try:
            # Test OPTIONS preflight request
            response = requests.options(
                url,
                headers={
                    'Origin': 'https://student-sm.vercel.app',
                    'Access-Control-Request-Method': 'GET',
                    'Access-Control-Request-Headers': 'authorization,content-type',
                }
            )
            print(f"OPTIONS Status: {response.status_code}")
            print("CORS Headers:")
            for header, value in response.headers.items():
                if header.lower().startswith('access-control-'):
                    print(f"  {header}: {value}")
            
            # Test actual GET request
            response = requests.get(
                url,
                headers={
                    'Origin': 'https://student-sm.vercel.app',
                }
            )
            print(f"\nGET Status: {response.status_code}")
            print("Response Headers:")
            for header, value in response.headers.items():
                if header.lower().startswith('access-control-'):
                    print(f"  {header}: {value}")
            
        except Exception as e:
            print(f"Error testing {url}: {str(e)}")

if __name__ == "__main__":
    test_cors_headers()
