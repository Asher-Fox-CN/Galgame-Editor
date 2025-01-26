import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { X } from 'lucide-react';
import type { Background } from '../types';

interface Props {
  onExit: () => void;
}

export const GamePlayer: React.FC<Props> = ({ onExit }) => {
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const dialogueNodes = useGameStore((state) => state.dialogueNodes);
  const currentChapter = useGameStore((state) => state.currentChapter);
  const setCurrentChapter = useGameStore((state) => state.setCurrentChapter);
  const gameFlags = useGameStore((state) => state.gameFlags);
  const advanceBackground = useGameStore((state) => state.advanceBackground);
  const settings = useGameStore((state) => state.settings);

  // 获取当前章节的所有节点
  const currentChapterNodes = dialogueNodes.filter(
    (node) => node.chapterId === currentChapter
  );

  // 获取当前节点
  const currentNode =
    currentChapterNodes.find((node) => node.id === currentNodeId) ||
    currentChapterNodes[0];

  // 章节变化时重置当前节点和背景索引
  useEffect(() => {
    if (currentChapterNodes.length > 0) {
      setCurrentNodeId(currentChapterNodes[0].id);
      // 重置当前节点的背景索引
      useGameStore.setState((state) => ({
        dialogueNodes: state.dialogueNodes.map((node) => {
          if (node.id === currentChapterNodes[0].id && node.backgrounds?.length) {
            return {
              ...node,
              currentBackgroundIndex: 0,
            };
          }
          return node;
        }),
      }));
    }
  }, [currentChapter]);

  // 节点变化时重置背景索引
  useEffect(() => {
    if (currentNodeId && currentNode?.backgrounds?.length) {
      useGameStore.setState((state) => ({
        dialogueNodes: state.dialogueNodes.map((node) => {
          if (node.id === currentNodeId) {
            return {
              ...node,
              currentBackgroundIndex: 0,
            };
          }
          return node;
        }),
      }));
    }
  }, [currentNodeId]);

  const getCurrentBackground = () => {
    if (!currentNode?.backgrounds?.length) return null;
    const index = Math.min(
      currentNode.currentBackgroundIndex || 0,
      currentNode.backgrounds.length - 1
    );
    return currentNode.backgrounds[index];
  };

  const handleNext = () => {
    if (!currentNode) return;

    if (currentNode.type === 'jump' && currentNode.targetChapterId) {
      setCurrentChapter(currentNode.targetChapterId);
      return;
    }

    if (
      currentNode.backgrounds &&
      currentNode.backgrounds.length > 1 &&
      (currentNode.currentBackgroundIndex || 0) <
        currentNode.backgrounds.length - 1
    ) {
      advanceBackground(currentNode.id);
      return;
    }

    const currentIndex = currentChapterNodes.findIndex(
      (node) => node.id === currentNodeId
    );

    if (currentIndex === -1 || currentIndex >= currentChapterNodes.length - 1) {
      return;
    }

    const nextNode = currentChapterNodes[currentIndex + 1];
    setCurrentNodeId(nextNode.id);
  };

  const handleChoice = (nextId: string) => {
    const nextNode = dialogueNodes.find((node) => node.id === nextId);
    if (nextNode && nextNode.chapterId === currentChapter) {
      setCurrentNodeId(nextId);
    }
  };

  const renderBackground = (background: Background) => {
    if (background.type === 'color') {
      return (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: background.value }}
        />
      );
    }
    return (
      <img
        src={background.value}
        alt="背景"
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  };

  return (
    <div className="relative h-full flex flex-col">
      <button
        onClick={onExit}
        className="absolute top-4 right-4 z-10 p-2 bg-gray-800 rounded-full hover:bg-gray-700"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="flex-1 relative cursor-pointer" onClick={handleNext}>
        {getCurrentBackground() ? (
          renderBackground(getCurrentBackground()!)
        ) : (
          <div className="absolute inset-0 bg-black" />
        )}
        {/* 聊天框 */}
        {currentNode?.type === 'dialogue' && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75">
            {currentNode.characterName && (
              <div 
                className="text-xl font-medium"
                style={{
                  color: currentNode.characterColor || '#3B82F6',
                  paddingTop: '1.5rem',
                  paddingLeft: `${settings.characterNamePosition.paddingLeft}px`,
                  paddingRight: `${settings.characterNamePosition.paddingRight}px`,
                }}
              >
                {currentNode.characterName}
              </div>
            )}
            <p 
              className="text-xl mb-6 whitespace-pre-line leading-relaxed"
              style={{ 
                color: currentNode.textColor || '#FFFFFF',
                letterSpacing: '0.025em',
                lineHeight: '1.75',
                maxWidth: '1200px',
                paddingLeft: `${settings.dialogueTextPosition.paddingLeft}px`,
                paddingRight: `${settings.dialogueTextPosition.paddingRight}px`,
                paddingBottom: '0rem',
                paddingTop: currentNode.characterName ? '0.75rem' : '0rem',
              }}
            >
              {currentNode.text}
            </p>
            <div 
              className="text-gray-400 text-sm"
              style={{
                paddingLeft: `${settings.dialogueTextPosition.paddingLeft}px`,
                paddingRight: `${settings.dialogueTextPosition.paddingRight}px`,
                paddingBottom: '1rem',
              }}
            >
              {currentNode.backgrounds && 
               currentNode.backgrounds.length > 1 && 
               (currentNode.currentBackgroundIndex || 0) < currentNode.backgrounds.length - 1
                ? "点击切换背景..."
                : "点击继续..."}
            </div>
          </div>
        )}

        {currentNode?.type === 'choice' &&
          currentNode.chapterId === currentChapter && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-96 space-y-4">
                {currentNode.choices?.map((choice, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChoice(choice.nextId);
                    }}
                    className="w-full px-6 py-3 bg-white bg-opacity-10 hover:bg-opacity-20 text-white rounded-lg transition-colors"
                  >
                    {choice.text}
                  </button>
                ))}
              </div>
            </div>
          )}

        {currentNode?.type === 'jump' && (
          <>
            {(currentNode.jumpConfig?.showTransitionText ?? true) && (
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-black bg-opacity-75">
                <p className="text-white text-lg mb-4">
                  正在跳转到新章节...
                </p>
                <div className="text-gray-400 text-sm">点击继续...</div>
              </div>
            )}
            {currentNode.jumpConfig?.hideBottomPanel && (
              <style>{`
                .bottom-panel {
                  display: none !important;
                }
              `}</style>
            )}
          </>
        )}
      </div>
    </div>
  );
};
