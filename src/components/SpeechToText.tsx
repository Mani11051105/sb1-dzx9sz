import React, { useEffect, useState, useCallback, useRef } from 'react';

interface SpeechToTextProps {
  isListening: boolean;
  onTranscriptChange: (transcript: string) => void;
  onListeningChange: (isListening: boolean) => void;
}

const SpeechToText: React.FC<SpeechToTextProps> = ({
  isListening,
  onTranscriptChange,
  onListeningChange,
}) => {
  const recognitionRef = useRef<any>(null);
  const [error, setError] = useState<string>('');
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [noSpeechTimeout, setNoSpeechTimeout] = useState<NodeJS.Timeout | null>(null);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (noSpeechTimeout) {
      clearTimeout(noSpeechTimeout);
      setNoSpeechTimeout(null);
    }
  }, [noSpeechTimeout]);

  const resetNoSpeechTimer = useCallback(() => {
    if (noSpeechTimeout) {
      clearTimeout(noSpeechTimeout);
    }
    // Set a new timeout for no speech detection (8 seconds)
    const timeout = setTimeout(() => {
      if (recognitionRef.current) {
        // Instead of stopping completely, restart the recognition
        recognitionRef.current.stop();
        startRecognition();
      }
    }, 8000);
    setNoSpeechTimeout(timeout);
  }, [noSpeechTimeout]);

  const startRecognition = useCallback(() => {
    try {
      stopRecognition();

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error('Speech recognition is not supported in this browser');
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setError('');
        console.log('Speech recognition started');
        resetNoSpeechTimer();
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        if (currentText) {
          setCurrentTranscript(currentText);
          onTranscriptChange(currentText.trim());
          resetNoSpeechTimer(); // Reset timer when speech is detected
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.log('Speech recognition error:', event.error);
        
        if (event.error === 'no-speech') {
          // Don't show error to user, just restart recognition
          recognition.stop();
          setTimeout(() => {
            if (isListening) {
              startRecognition();
            }
          }, 100);
          return;
        }

        const errorMessages: Record<string, string> = {
          'network': 'Network error occurred. Please check your connection.',
          'audio-capture': 'No microphone was found or microphone is disabled.',
          'not-allowed': 'Microphone permission was denied.',
          'service-not-allowed': 'Speech recognition service is not allowed.',
          'aborted': 'Speech recognition was aborted.',
        };

        const errorMessage = errorMessages[event.error] || `Error: ${event.error}`;
        setError(errorMessage);
        
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          onListeningChange(false);
          stopRecognition();
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        if (isListening) {
          // Small delay before restarting to prevent rapid restarts
          setTimeout(() => {
            if (isListening) {
              startRecognition();
            }
          }, 100);
        } else {
          stopRecognition();
        }
      };

      recognition.onaudiostart = () => {
        setError('');
        resetNoSpeechTimer();
      };

      recognition.onsoundstart = () => {
        setError('');
        resetNoSpeechTimer();
      };

      recognition.onspeechstart = () => {
        setError('');
        resetNoSpeechTimer();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize speech recognition');
      onListeningChange(false);
    }
  }, [isListening, onTranscriptChange, onListeningChange, stopRecognition, resetNoSpeechTimer]);

  useEffect(() => {
    if (isListening) {
      startRecognition();
    } else {
      stopRecognition();
      setCurrentTranscript('');
    }

    return () => {
      stopRecognition();
    };
  }, [isListening, startRecognition, stopRecognition]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div 
          className={`w-3 h-3 rounded-full ${
            isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
          }`} 
        />
        <span className="text-sm text-gray-600">
          {isListening ? 'Listening...' : 'Microphone off'}
        </span>
        {currentTranscript && isListening && (
          <span className="text-sm text-gray-500 italic">
            "{currentTranscript}"
          </span>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default SpeechToText;