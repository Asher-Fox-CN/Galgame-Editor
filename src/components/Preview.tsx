import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Play, Save, Upload, Pause } from 'lucide-react';

export const Preview: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const dialogueNodes = useGameStore((state) => state.dialogueNodes);
  const currentNode = dialogueNodes[currentNodeIndex];

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentNodeIndex < dialogueNodes.length - 1) {
      setCurrentNodeIndex(currentNodeIndex + 1);
    }
  };

  const handleChoice = (nextId: string) => {
    const nextIndex = dialogueNodes.findIndex(node => node.id === nextId);
    if (nextIndex !== -1) {
      setCurrentNodeIndex(nextIndex);
    }
  };

  return (
    <div className="w-96 border-l border-gray-200 bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">预览</h2>
          <div className="flex gap-2">
            <button className="p-2 text-gray-600 hover:text-gray-800">
              <Save className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-800">
              <Upload className="w-5 h-5" />
            </button>
          </div>
        </div>
        <button 
          onClick={handlePlay}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              暂停游戏
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              开始游戏
            </>
          )}
        </button>
      </div>
      
      {isPlaying && (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            {currentNode?.backgrounds && currentNode.backgrounds.length > 0 && (
              <img 
                src={currentNode.backgrounds[currentNode.currentBackgroundIndex || 0].value} 
                alt="背景"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </div>
          <div className="p-4 bg-white border-t border-gray-200">
            {currentNode?.type === 'dialogue' && (
              <div className="space-y-4">
                <p className="text-gray-800">{currentNode.text}</p>
                <button 
                  onClick={handleNext}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  继续
                </button>
              </div>
            )}
            {currentNode?.type === 'choice' && (
              <div className="space-y-2">
                {currentNode.choices?.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => handleChoice(choice.nextId)}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    {choice.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {!isPlaying && (
        <div className="flex-1 p-4">
          <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center text-gray-500">
            点击"开始游戏"预览
          </div>
        </div>
      )}
    </div>
  );
};
