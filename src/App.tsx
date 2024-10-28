import React, { useState, useCallback } from 'react';
import { Send } from 'lucide-react';
import VideoInterface from './components/VideoInterface';
import SpeechToText from './components/SpeechToText';
import { generateResponse } from './services/gemini';

function App() {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponses, setAiResponses] = useState<Array<{ text: string; isAi: boolean }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTranscriptChange = useCallback((newTranscript: string) => {
    setTranscript(newTranscript);
  }, []);

  const handleSendMessage = async () => {
    if (!transcript.trim() || isProcessing) return;

    setIsProcessing(true);
    setAiResponses(prev => [...prev, { text: transcript, isAi: false }]);
    
    try {
      const response = await generateResponse(transcript);
      setAiResponses(prev => [...prev, { text: response, isAi: true }]);
    } catch (error) {
      console.error('Error:', error);
      setAiResponses(prev => [...prev, { text: 'Sorry, an error occurred while processing your request.', isAi: true }]);
    }
    
    setTranscript('');
    setIsProcessing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleToggleAudio = () => {
    setIsAudioOn(!isAudioOn);
    if (isAudioOn) {
      setTranscript(''); // Clear transcript when turning off audio
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Interface Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Video Interface</h2>
            <VideoInterface
              isVideoOn={isVideoOn}
              isAudioOn={isAudioOn}
              onToggleVideo={() => setIsVideoOn(!isVideoOn)}
              onToggleAudio={handleToggleAudio}
            />
            <div className="mt-4">
              <SpeechToText
                isListening={isAudioOn}
                onTranscriptChange={handleTranscriptChange}
                onListeningChange={setIsAudioOn}
              />
            </div>
          </div>

          {/* Chat Interface Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 h-[600px] flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Chat</h2>
            
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {aiResponses.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg max-w-[80%] ${
                    message.isAi
                      ? 'bg-blue-100 ml-auto'
                      : 'bg-gray-100'
                  }`}
                >
                  <p className="text-gray-800">{message.text}</p>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Speak or type your message..."
              />
              <button
                onClick={handleSendMessage}
                disabled={isProcessing || !transcript.trim()}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;