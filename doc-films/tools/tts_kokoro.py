# Local Kokoro-82M (onnx) with misaki Chinese G2P. Model files come from the HyperFrames tts cache.
import os, soundfile as sf
_M = os.path.expanduser('~/.cache/hyperframes/tts')
_k = _g = None

def synth(text, voice, out_path):
    global _k, _g
    if _k is None:
        from kokoro_onnx import Kokoro
        from misaki import zh
        _k = Kokoro(f'{_M}/models/kokoro-v1.0.onnx', f'{_M}/voices/voices-v1.0.bin')
        _g = zh.ZHG2P()
    ph = _g(text)
    ph = ph[0] if isinstance(ph, tuple) else ph
    samples, sr = _k.create(ph, voice=(voice.get('id') if isinstance(voice, dict) else voice) or 'zm_yunxi', speed=1.0, is_phonemes=True)
    sf.write(out_path, samples, sr)
