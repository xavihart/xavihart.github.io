import json

in_path = "s3.json"        # original json (dict: image_path -> [prompts])
out_path = "s3_list.json"  # new json (list of dicts)

# load original json
with open(in_path, "r") as f:
    data = json.load(f)

# convert to list of {"image_path": ..., "lang": ...}
records = []
for image_path, prompts in data.items():
    for text in prompts:
        records.append({
            "image_path": image_path,
            "lang": text
        })

# save new structure
with open(out_path, "w") as f:
    json.dump(records, f, indent=2, ensure_ascii=False)

