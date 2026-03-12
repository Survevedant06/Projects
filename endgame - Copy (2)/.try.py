import requests
import json
import os

# ✅ Replace with your API Key
API_KEY = "12994d45-5ac7-4024-81ed-1bd67a4eb25b"
API_URL = "https://gen.powerpointgeneratorapi.com/v1.0/generator/create"

# ✅ Check if the file exists before proceeding
pptx_file_path = "title_slide_template.pptx"
if not os.path.exists(pptx_file_path):
    print(f"❌ Error: File '{pptx_file_path}' not found. Please place it in the same directory.")
    exit()

# ✅ Prepare API Headers
headers = {
    "Authorization": f"Bearer {API_KEY}"
}

# ✅ Prepare API Payload (formatted correctly)
payload = {
    "template": "my_dummy_presentation.pptx",
    "export_version": "Pptx2010",
    "resultFileName": "quick_start_example",
    "slides": [
        {
            "type": "slide",
            "slide_index": 0,
            "shapes": [
                {"name": "Title 1", "content": "Your generated PowerPoint presentation"},
                {"name": "Subtitle 2", "content": "Create, fill and manage PowerPoint documents through simple API requests."}
            ]
        }
    ]
}

# ✅ Open the PPTX template file
with open(pptx_file_path, "rb") as pptx_file:
    files = [
        ('files', ('title_slide_template.pptx', pptx_file, 'application/vnd.openxmlformats-officedocument.presentationml.presentation'))
    ]

    # ✅ Send request
    response = requests.post(
        API_URL,
        data={"jsonData": json.dumps(payload)},  # Proper JSON formatting
        files=files,
        headers=headers,
        timeout=360
    )

    # ✅ Debugging Output
    print("Status Code:", response.status_code)
    print("Response:", response.text)

    # ✅ Save the generated PPTX if request is successful
    if response.status_code == 200:
        with open("generated.pptx", "wb") as file:
            file.write(response.content)
        print("✅ PowerPoint generated successfully: saved as 'generated.pptx'")
    else:
        print(f"❌ Error: {response.json().get('message', 'Failed to generate PPT')}")
