import os
import time
import uuid
import requests

def upload_to_supabase(file, folder="memories", user_id=None):
    """Upload file to Supabase Storage and return public URL."""
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_ANON_KEY')
    bucket = "memories"

    if not supabase_url or not supabase_key or not file:
        return None

    file_ext = file.name.split('.')[-1].lower() if '.' in file.name else 'jpg'
    timestamp = int(time.time())
    unique_name = f"{timestamp}_{uuid.uuid4().hex}.{file_ext}"
    folder_path = folder.strip('/')

    if user_id:
        file_name = f"{folder_path}/{user_id}/{unique_name}"
    else:
        file_name = f"{folder_path}/{unique_name}"

    try:
        response = requests.post(
            f"{supabase_url}/storage/v1/object/{bucket}/{file_name}",
            headers={
                "Authorization": f"Bearer {supabase_key}",
                "apikey": supabase_key,
                "Content-Type": file.content_type or "image/jpeg",
            },
            data=file.read(),
        )

        if response.status_code == 200:
            return f"{supabase_url}/storage/v1/object/public/{bucket}/{file_name}"

        print(f"Upload failed: {response.status_code} - {response.text}")
        return None
    except Exception as e:
        print(f"Upload error: {e}")
        return None