import os

with open('selected.txt', 'r') as f:
    lines = f.readlines()
    i = 0
    for line in lines:
        mp4_path = line.strip()
        print(mp4_path)
        # get the first frame of each mp4 file into the current dir
        os.system(f'ffmpeg -i {mp4_path} -vframes 1 -q:v 2 -y ./{i}.jpg')
        i += 1