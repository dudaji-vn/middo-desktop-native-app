'use client';

import useSpeechRecognizer from '@/hooks/use-speech-recognizer';
import useSpeechToText from 'react-hook-speech-to-text';

export default function Test() {
    const {
        error,
        isRecording,
        interimResult,
        results,
        startSpeechToText,
        stopSpeechToText,
      } = useSpeechRecognizer()
      console.log('error', error);
        console.log('isRecording', isRecording);
        console.log('interimResult', interimResult);
        console.log('results', results);

    const startRecord = () => {
        startSpeechToText();
    }
    const stopRecord = () => {
        stopSpeechToText();
    }
  return (
    <div className="flex flex-col items-center bg-background bg-cover bg-center bg-no-repeat md:!bg-[url('/bg_auth.png')]">
      <button onClick={startRecord}>Start</button>
      <button onClick={stopRecord}>Stop</button>
    </div>
  );
}
