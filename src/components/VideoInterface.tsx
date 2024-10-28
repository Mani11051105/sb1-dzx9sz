import React from 'react';
import Webcam from 'react-webcam';
import { Camera, CameraOff, Mic, MicOff } from 'lucide-react';

interface VideoInterfaceProps {
  isVideoOn: boolean;
  isAudioOn: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
}

const VideoInterface: React.FC<VideoInterfaceProps> = ({
  isVideoOn,
  isAudioOn,
  onToggleVideo,
  onToggleAudio,
}) => {
  return (
    <div className="relative w-full max-w-2xl">
      {isVideoOn ? (
        <Webcam
          audio={false}
          className="w-full rounded-lg shadow-lg"
          mirrored
          videoConstraints={{
            width: 1280,
            height: 720,
            facingMode: "user",
          }}
        />
      ) : (
        <div className="w-full h-[405px] bg-gray-800 rounded-lg flex items-center justify-center">
          <CameraOff className="w-16 h-16 text-gray-400" />
        </div>
      )}
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
        <button
          onClick={onToggleVideo}
          className={`p-3 rounded-full ${
            isVideoOn ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'
          } text-white transition-colors`}
        >
          {isVideoOn ? <Camera size={24} /> : <CameraOff size={24} />}
        </button>
        <button
          onClick={onToggleAudio}
          className={`p-3 rounded-full ${
            isAudioOn ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'
          } text-white transition-colors`}
        >
          {isAudioOn ? <Mic size={24} /> : <MicOff size={24} />}
        </button>
      </div>
    </div>
  );
};

export default VideoInterface;