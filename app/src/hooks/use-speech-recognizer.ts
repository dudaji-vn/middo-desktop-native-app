import { NEXT_PUBLIC_GOOGLE_SPEECH_TO_TEXT_API_KEY } from '@/configs/env.public';
import useSpeechToText from 'react-hook-speech-to-text';
export default function useSpeechRecognizer(
    language?: string
) {
    let { error, isRecording, interimResult, results, startSpeechToText, stopSpeechToText } = useSpeechToText({
        continuous: true,
        crossBrowser: true,
        // timeout: 200,
        googleApiKey: NEXT_PUBLIC_GOOGLE_SPEECH_TO_TEXT_API_KEY,
        googleCloudRecognitionConfig: {
            languageCode: language || 'en-US'
        },
        useOnlyGoogleCloud: true
    });

    const finalTranscript = results.join(' ');
    let interimTranscript = interimResult;
    if(!interimTranscript && results.length > 0) {
        interimTranscript = results.join(' ');
    }
    return {
        error, listening: isRecording, interimTranscript, finalTranscript, startSpeechToText, stopSpeechToText
    };
}

