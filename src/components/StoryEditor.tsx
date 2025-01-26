import React from 'react';
import { useGameStore } from '../store/gameStore';
import { 
  GripVertical,
  Trash2,
  Plus,
  MessageSquare,
  Split,
  Image,
  Music
} from 'lucide-react';

export const StoryEditor: React.FC = () => {
  const dialogueNodes = useGameStore((state) => state.dialogueNodes);
  const addDialogueNode = useGameStore((state) => state.addDialogueNode);
  const updateDialogueNode = useGameStore((state) => state.updateDialogueNode);
  const removeDialogueNode = useGameStore((state) => state.removeDialogueNode);

  const handleAddNode = (type: 'dialogue' | 'choice' | 'background' | 'sound') => {
    addDialogueNode({
      id: crypto.randomUUID(),
      chapterId: useGameStore.getState().currentChapter,
      type,
      text: type === 'dialogue' ? '新对话' : undefined,
      choices: type === 'choice' ? [{ text: '选项1', nextId: '' }] : undefined,
    });
  };

  const handleUpdateText = (id: string, text: string) => {
    updateDialogueNode(id, { text });
  };

  const handleAddChoice = (nodeId: string, choices: any[]) => {
    updateDialogueNode(nodeId, {
      choices: [...choices, { text: '新选项', nextId: '' }]
    });
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => handleAddNode('dialogue')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <MessageSquare className="w-4 h-4" />
            添加对话
          </button>
          <button
            onClick={() => handleAddNode('choice')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            <Split className="w-4 h-4" />
            添加选项
          </button>
          <button
            onClick={() => handleAddNode('background')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Image className="w-4 h-4" />
            添加背景
          </button>
          <button
            onClick={() => handleAddNode('sound')}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            <Music className="w-4 h-4" />
            添加音效
          </button>
        </div>

        <div className="space-y-4">
          {dialogueNodes.map((node) => (
            <div
              key={node.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <div className="flex items-center gap-4 mb-4">
                <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-500">
                    {node.type === 'dialogue' && '对话'}
                    {node.type === 'choice' && '选项'}
                    {node.type === 'background' && '背景'}
                    {node.type === 'sound' && '音效'}
                  </div>
                </div>
                <button 
                  onClick={() => removeDialogueNode(node.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {node.type === 'dialogue' && (
                <textarea
                  value={node.text}
                  onChange={(e) => handleUpdateText(node.id, e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-md"
                  rows={3}
                  placeholder="输入对话内容..."
                />
              )}

              {node.type === 'choice' && (
                <div className="space-y-2">
                  {node.choices?.map((choice, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={choice.text}
                        onChange={(e) => {
                          const newChoices = [...(node.choices || [])];
                          newChoices[index] = { ...choice, text: e.target.value };
                          updateDialogueNode(node.id, { choices: newChoices });
                        }}
                        className="flex-1 p-2 border border-gray-200 rounded-md"
                        placeholder="选项文本..."
                      />
                      <button 
                        onClick={() => {
                          const newChoices = node.choices?.filter((_, i) => i !== index);
                          updateDialogueNode(node.id, { choices: newChoices });
                        }}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => handleAddChoice(node.id, node.choices || [])}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    添加选项
                  </button>
                </div>
              )}

              {node.type === 'background' && (
                <input
                  type="text"
                  value={node.backgrounds?.[0]?.value || ''}
                  onChange={(e) => updateDialogueNode(node.id, { 
                    backgrounds: [{ 
                      type: 'image', 
                      value: e.target.value 
                    }] 
                  })}
                  className="w-full p-2 border border-gray-200 rounded-md"
                  placeholder="输入背景图片URL..."
                />
              )}

              {node.type === 'sound' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-2">音效设置</div>
                  <div className="space-y-2">
                    <select
                      value={node.sound?.type || 'bgm'}
                      onChange={(e) => updateDialogueNode(node.id, { 
                        sound: { 
                        type: e.target.value as 'bgm' | 'sfx' | 'voice',
                        url: node.sound?.url || ''
                      }
                      })}
                      className="w-full p-2 border border-gray-200 rounded-md bg-white"
                    >
                      <option value="bgm">背景音乐</option>
                      <option value="sfx">音效</option>
                      <option value="voice">语音</option>
                    </select>
                    <input
                      type="text"
                      value={node.sound?.url || ''}
                      onChange={(e) => updateDialogueNode(node.id, { 
                        sound: { 
                        type: node.sound?.type || 'bgm',
                        url: e.target.value 
                      }
                      })}
                      className="w-full p-2 border border-gray-200 rounded-md bg-white"
                      placeholder="输入音频文件URL..."
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
