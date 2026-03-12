import requests

# Replace with your actual API key and token
API_KEY = "12994d45-5ac7-4024-81ed-1bd67a4eb25b"
BEARER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoid29sZmVyZ21pbmczM0BnbWFpbC5jb20iLCJuYmYiOiIxNzQyNDU2MDQwIiwiZXhwIjoiMTc3Mzk5MjA0MCJ9.V1N1qy95Uf2qvMM6PwiFeAdyhJzryYQV3FWhYAfNrhY"

API_URL = "https://gen.powerpointgeneratorapi.com/v1.0/generator/create"

def generate_ppt(slides):
    headers = {
        "Authorization": f"Bearer {BEARER_TOKEN}",
        "Content-Type": "application/json"
    }
    
    data = {
        "slides": slides  # List of slides with content
    }

    response = requests.post(API_URL, json=data, headers=headers)

    try:
        response_data = response.json()
    except requests.exceptions.JSONDecodeError:
        return f"Error: Unable to parse API response. Status Code: {response.status_code}, Response: {response.text}"

    if response.status_code == 200:
        ppt_link = response_data.get("downloadUrl")
        return f"PPT generated successfully. Download it here: {ppt_link}"
    else:
        return f"Error: {response_data.get('message', 'Failed to generate PPT')}"

# Example usage
slides_data = [
    {"title": "Welcome", "content": "This is the first slide."},
    {"title": "About AI", "content": "AI is transforming the world."}
]

print(generate_ppt(slides_data))
