import os
import whisper
from dotenv import load_dotenv

load_dotenv()

MODEL = os.getenv('WHISPER_MODEL')

if MODEL not in ['tiny', 'base', 'small', 'medium', 'large']:
    MODEL = 'small'

whisper.load_model(MODEL)
