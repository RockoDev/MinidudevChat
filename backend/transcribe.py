import sys
import os
import json
import whisper

model = whisper.load_model('small')

input_file = sys.argv[1]
ouput_file = sys.argv[2]

if not os.path.isfile(input_file):
    print('File not found.')
    sys.exit(1)

if not input_file.endswith('.wav'):
    print('Invalid file format. Only .wav files are supported.')
    sys.exit(1)

if not ouput_file.endswith('.json'):
    print('Invalid output file format. Only .json files are supported.')
    sys.exit(1)

result = model.transcribe(input_file, word_timestamps=False, language='es', max_initial_timestamp=None, verbose=True)

with open(ouput_file, 'w', encoding='utf-8') as file:
    file.write(json.dumps(result['segments'], ensure_ascii=False))

