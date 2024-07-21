import sys
import os
import json
import whisper
from dotenv import load_dotenv

load_dotenv()

MODEL = os.getenv('WHISPER_MODEL')

if MODEL not in ['tiny', 'base', 'small', 'medium', 'large']:
    MODEL = 'small'

model = whisper.load_model(MODEL)

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

output_dir = os.path.dirname(ouput_file)
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

result = model.transcribe(input_file, word_timestamps=False, language='es', max_initial_timestamp=None, verbose=False)

with open(ouput_file, 'w', encoding='utf-8') as file:
    file.write(json.dumps(result['segments'], ensure_ascii=False))

# for segment in result['segments']:
#     for index, word in enumerate(segment['words']):
#         print(f'{word["start"]} - {word["end"]} -> {word["word"]}')

# offset_size = 7

# parse_word = lambda word: {
#     'start': word['start'],
#     'end': word['end'],
#     'word': word['word'].strip().lower(),
#     'probability': word['probability'],
# }

# parse_words = lambda words: [
#     parse_word(word) for word in words
# ]

# get_offsets = lambda words: [
#     word['word'].strip().lower() for word in words
# ]

# with open('transcription.txt', 'w', encoding='utf-8') as file:
#     for segment in result['segments']:
#         for index in range(len(segment['words'])):
#             word = parse_word(segment['words'][index])
#             words_left = len(segment['words']) - (index + 1)
#             # word['offsets'] = parse_words(segment['words'][index + 1 : index + 1 + offset_size])
#             word['offsets'] = get_offsets(segment['words'][index + 1 : index + 1 + offset_size])
#             file.write(json.dumps(word, ensure_ascii=False) + '\n')