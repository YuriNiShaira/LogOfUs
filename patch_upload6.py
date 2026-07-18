from pathlib import Path
p = Path("backend/utils/upload.py")
lines = p.read_text().splitlines()
print('old_line', repr(lines[28]))
new_line = '                "Authorization": f"Bearer {supabase_key}",' 
print('new_line', repr(new_line))
print('equal new? ', new_line == lines[28])
