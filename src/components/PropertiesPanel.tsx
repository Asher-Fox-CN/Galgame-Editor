import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { Settings, Sliders, Trash2, Plus } from 'lucide-react';
import type { Background } from '../types';

interface Props {
  selectedNode: string | null;
}

export const PropertiesPanel: React.FC<Props> = ({ selectedNode }) => {
  const [showNodePicker, setShowNodePicker] = useState(false);
  const [nodeSearch, setNodeSearch] = useState('');

  // 点击外部关闭选择器
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showNodePicker) {
        setShowNodePicker(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showNodePicker]);

  const dialogueNodes = useGameStore((state) => state.dialogueNodes);
  const chapters = useGameStore((state) => state.chapters);
  const updateDialogueNode = useGameStore((state) => state.updateDialogueNode);

  const selectedNodeData = dialogueNodes.find(
    (node) => node.id === selectedNode
  );

  const handleAddChoice = () => {
    if (!selectedNode) return;
    if (selectedNodeData?.type === 'choice') {
      const newChoices = [...(selectedNodeData.choices || [])];
      newChoices.push({ text: '新选项', nextId: '' });
      updateDialogueNode(selectedNode, { choices: newChoices });
    }
  };

  const handleAddBackground = () => {
    if (!selectedNode) return;
    const backgrounds = selectedNodeData?.backgrounds || [];
    const newBackground: Background = {
      type: 'image',
      value: '',
    };
    updateDialogueNode(selectedNode, {
      backgrounds: [...backgrounds, newBackground],
      currentBackgroundIndex: 0,
    });
  };

  const handleRemoveBackground = (index: number) => {
    if (!selectedNode || !selectedNodeData?.backgrounds) return;
    const newBackgrounds = [...selectedNodeData.backgrounds];
    newBackgrounds.splice(index, 1);
    updateDialogueNode(selectedNode, { backgrounds: newBackgrounds });
  };

  const handleUpdateBackground = (
    index: number,
    updates: Partial<Background>
  ) => {
    if (!selectedNode || !selectedNodeData?.backgrounds) return;
    const newBackgrounds = [...selectedNodeData.backgrounds];
    newBackgrounds[index] = { ...newBackgrounds[index], ...updates };
    updateDialogueNode(selectedNode, { backgrounds: newBackgrounds });
  };

  if (!selectedNodeData) {
    return (
      <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Settings className="w-5 h-5" />
          <h2 className="font-medium">属性面板</h2>
        </div>
        <div className="mt-4 text-sm text-gray-500">请选择一个节点查看属性</div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5" />
          <h2 className="font-medium">节点属性</h2>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 hover:scrollbar-thumb-gray-500">
        {/* 章节选择 */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">所属章节</label>
          <select
            value={selectedNodeData.chapterId}
            onChange={(e) => {
              if (!selectedNode) return;
              updateDialogueNode(selectedNode, {
                chapterId: e.target.value,
              });
            }}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
          >
            <option value="">选择章节...</option>
            {chapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.title}
              </option>
            ))}
          </select>
        </div>

        {/* 节点类型 */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">节点类型</label>
          <select
            value={selectedNodeData.type}
            onChange={(e) => {
              if (!selectedNode) return;
              updateDialogueNode(selectedNode, {
                type: e.target.value as any,
              });
            }}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
          >
            <option key="dialogue" value="dialogue">
              对话
            </option>
            <option key="choice" value="choice">
              选项
            </option>
            <option key="background" value="background">
              背景
            </option>
            <option key="sound" value="sound">
              音频
            </option>
            <option key="jump" value="jump">
              章节跳转
            </option>
          </select>
        </div>

        {/* 跳转节点属性 */}
        {selectedNodeData.type === 'jump' && (
          <div className="space-y-2">
            <label className="text-sm text-gray-400">目标章节</label>
            <select
              value={selectedNodeData.targetChapterId || ''}
              onChange={(e) => {
                if (!selectedNode) return;
                updateDialogueNode(selectedNode, {
                  targetChapterId: e.target.value,
                });
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            >
              <option value="">选择目标章节...</option>
              {chapters
                .filter((chapter) => chapter.id !== selectedNodeData.chapterId)
                .map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.title}
                  </option>
                ))}
            </select>

            {/* 跳转配置 */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">跳转配置</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedNodeData.jumpConfig?.showTransitionText ?? true}
                    onChange={(e) => {
                      if (!selectedNode) return;
                      updateDialogueNode(selectedNode, {
                        jumpConfig: {
                          ...selectedNodeData.jumpConfig,
                          showTransitionText: e.target.checked
                        }
                      });
                    }}
                    className="w-4 h-4 rounded bg-gray-700 border border-gray-600"
                  />
                  显示跳转提示
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedNodeData.jumpConfig?.hideBottomPanel ?? false}
                    onChange={(e) => {
                      if (!selectedNode) return;
                      updateDialogueNode(selectedNode, {
                        jumpConfig: {
                          ...selectedNodeData.jumpConfig,
                          hideBottomPanel: e.target.checked
                        }
                      });
                    }}
                    className="w-4 h-4 rounded bg-gray-700 border border-gray-600"
                  />
                  隐藏底部聊天框
                </label>
              </div>
            </div>
          </div>
        )}

        {/* 背景设置 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-400">背景设置</label>
            <button
              onClick={handleAddBackground}
              className="text-blue-400 hover:text-blue-300"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {selectedNodeData.backgrounds?.map((bg, index) => (
              <div key={index} className="space-y-2 p-2 bg-gray-700 rounded">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-400">
                    背景 {index + 1}
                  </label>
                  <button
                    onClick={() => handleRemoveBackground(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <select
                  value={bg.type}
                  onChange={(e) =>
                    handleUpdateBackground(index, {
                      type: e.target.value as 'image' | 'color',
                    })
                  }
                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2"
                >
                  <option value="image">图片</option>
                  <option value="color">纯色</option>
                </select>
                <input
                  type="text"
                  value={bg.value}
                  onChange={(e) =>
                    handleUpdateBackground(index, {
                      value: e.target.value,
                    })
                  }
                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2"
                  placeholder={
                    bg.type === 'image'
                      ? '输入图片URL...'
                      : '输入颜色值 (如 #000000)'
                  }
                />
                <input
                  type="number"
                  value={bg.duration || ''}
                  onChange={(e) =>
                    handleUpdateBackground(index, {
                      duration: parseInt(e.target.value) || undefined,
                    })
                  }
                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2"
                  placeholder="自动切换时长（毫秒，可选）"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 对话节点属性 */}
        {selectedNodeData.type === 'dialogue' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">角色名称</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={selectedNodeData.characterName || ''}
                  onChange={(e) => {
                    if (!selectedNode) return;
                    updateDialogueNode(selectedNode, {
                      characterName: e.target.value,
                    });
                  }}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  placeholder="输入角色名称..."
                />
                <input
                  type="color"
                  value={selectedNodeData.characterColor || '#3B82F6'}
                  onChange={(e) => {
                    if (!selectedNode) return;
                    updateDialogueNode(selectedNode, {
                      characterColor: e.target.value,
                    });
                  }}
                  className="w-10 h-10 bg-gray-700 border border-gray-600 rounded p-1 cursor-pointer"
                  title="角色名称颜色"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">对话内容</label>
              <div className="flex gap-2">
                <textarea
                  value={selectedNodeData.text || ''}
                  onChange={(e) => {
                    if (!selectedNode) return;
                    updateDialogueNode(selectedNode, {
                      text: e.target.value,
                    });
                  }}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 min-h-[200px] font-[inherit] text-base leading-relaxed"
                  style={{
                    width: '600px',
                    maxWidth: '100%',
                    letterSpacing: '0.025em',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                  placeholder="输入对话内容..."
                />
                <input
                  type="color"
                  value={selectedNodeData.textColor || '#FFFFFF'}
                  onChange={(e) => {
                    if (!selectedNode) return;
                    updateDialogueNode(selectedNode, {
                      textColor: e.target.value,
                    });
                  }}
                  className="w-10 h-10 bg-gray-700 border border-gray-600 rounded p-1 cursor-pointer"
                  title="对话文本颜色"
                />
              </div>
              <p className="text-xs text-gray-500">提示：使用回车键换行，编辑框已优化为每行约28个汉字</p>
            </div>
          </div>
        )}

        {/* 音效节点属性 */}
        {selectedNodeData.type === 'sound' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">音效类型</label>
              <select
                value={selectedNodeData.sound?.type || 'bgm'}
                onChange={(e) => {
                  if (!selectedNode) return;
                  updateDialogueNode(selectedNode, {
                    sound: {
                      type: e.target.value as 'bgm' | 'sfx' | 'voice',
                      url: selectedNodeData.sound?.url || ''
                    }
                  });
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              >
                <option value="bgm">背景音乐</option>
                <option value="sfx">音效</option>
                <option value="voice">语音</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">音效URL</label>
              <input
                type="text"
                value={selectedNodeData.sound?.url || ''}
                onChange={(e) => {
                  if (!selectedNode) return;
                  updateDialogueNode(selectedNode, {
                    sound: {
                      type: selectedNodeData.sound?.type || 'bgm',
                      url: e.target.value
                    }
                  });
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                placeholder="输入音效文件URL..."
              />
            </div>
          </div>
        )}

        {/* 选项节点属性 */}
        {selectedNodeData.type === 'choice' && (
          <div className="space-y-4">
            {selectedNodeData.choices?.map((choice, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-400">
                    选项 {index + 1}
                  </label>
                  <button
                    onClick={() => {
                      if (!selectedNode) return;
                      const newChoices = [...(selectedNodeData.choices || [])];
                      newChoices.splice(index, 1);
                      updateDialogueNode(selectedNode, { choices: newChoices });
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={choice.text}
                  onChange={(e) => {
                    if (!selectedNode) return;
                    const newChoices = [...(selectedNodeData.choices || [])];
                    newChoices[index] = { ...choice, text: e.target.value };
                    updateDialogueNode(selectedNode, { choices: newChoices });
                  }}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  placeholder="选项文本..."
                />
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowNodePicker(true);
                    }}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-left hover:bg-gray-600 transition-colors"
                  >
                    {choice.nextId
                      ? `已选择节点: #${
                          dialogueNodes
                            .filter(
                              (n) => n.chapterId === selectedNodeData.chapterId
                            )
                            .indexOf(
                              dialogueNodes.find((n) => n.id === choice.nextId)!
                            ) + 1
                        } - ${choice.nextId}`
                      : '选择下一个节点...'}
                  </button>

                  {showNodePicker && (
                    <div
                      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                      onClick={() => setShowNodePicker(false)}
                    >
                      <div
                        className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg border border-gray-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-4 border-b border-gray-700">
                          <h3 className="font-medium mb-2">选择下一个节点</h3>
                          <input
                            type="text"
                            value={nodeSearch}
                            onChange={(e) => setNodeSearch(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                            placeholder="搜索节点ID或内容..."
                            autoFocus
                          />
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto">
                          {dialogueNodes
                            .filter(
                              (node) =>
                                node.id !== selectedNodeData.id &&
                                node.chapterId === selectedNodeData.chapterId &&
                                (!nodeSearch ||
                                  node.id.includes(nodeSearch) ||
                                  (node.type === 'dialogue' &&
                                    node.text?.includes(nodeSearch)) ||
                                  (node.type === 'choice' &&
                                    node.choices?.some((c) =>
                                      c.text.includes(nodeSearch)
                                    )))
                            )
                            .map((node) => (
                              <div
                                key={node.id}
                                onClick={() => {
                                  if (!selectedNode) return;
                                  const newChoices = [
                                    ...(selectedNodeData.choices || []),
                                  ];
                                  newChoices[index] = {
                                    ...choice,
                                    nextId: node.id,
                                  };
                                  updateDialogueNode(selectedNode, {
                                    choices: newChoices,
                                  });
                                  setShowNodePicker(false);
                                }}
                                className="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-full text-sm font-medium">
                                    #
                                    {dialogueNodes
                                      .filter(
                                        (n) =>
                                          n.chapterId ===
                                          selectedNodeData.chapterId
                                      )
                                      .indexOf(node) + 1}
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">
                                      {node.id}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                      {node.type === 'dialogue' &&
                                        `对话: ${node.text?.slice(0, 50)}${
                                          node.text && node.text.length > 50
                                            ? '...'
                                            : ''
                                        }`}
                                      {node.type === 'choice' &&
                                        `选项: ${
                                          node.choices
                                            ?.map((c) => c.text)
                                            .join(' | ') || '无选项'
                                        }`}
                                      {node.type === 'background' &&
                                        `背景: ${
                                          node.backgrounds?.[0]?.value || '无'
                                        }`}
                                      {node.type === 'sound' &&
                                        `音频: ${node.sound?.url}`}
                                      {node.type === 'jump' &&
                                        `跳转: ${
                                          chapters.find(
                                            (c) => c.id === node.targetChapterId
                                          )?.title || '未设置目标章节'
                                        }`}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <button
              onClick={handleAddChoice}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
            >
              <Plus className="w-4 h-4" />
              添加选项
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
