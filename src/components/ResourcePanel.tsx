import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import {
  BookOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  Save,
  Upload,
  AlertTriangle,
  Settings,
  X,
} from 'lucide-react';

export const ResourcePanel: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'chapters',
  ]);
  const [showSettings, setShowSettings] = useState(false);
  const chapters = useGameStore((state) => state.chapters);
  const currentChapter = useGameStore((state) => state.currentChapter);
  const addChapter = useGameStore((state) => state.addChapter);
  const removeChapter = useGameStore((state) => state.removeChapter);
  const setCurrentChapter = useGameStore((state) => state.setCurrentChapter);
  const dialogueNodes = useGameStore((state) => state.dialogueNodes);
  const importConfig = useGameStore((state) => state.importConfig);
  const settings = useGameStore((state) => state.settings);
  const updateGlobalSettings = useGameStore((state) => state.updateGlobalSettings);
  const [showClearWarning, setShowClearWarning] = useState(false);

  const handleAddChapter = () => {
    const title = prompt('请输入章节标题');
    if (title) {
      const chapter = {
        id: crypto.randomUUID(),
        title,
      };
      addChapter(chapter);
    }
  };

  const handleEditChapter = (id: string, currentTitle: string) => {
    const title = prompt('请输入新的章节标题', currentTitle);
    if (title) {
      const chapter = chapters.find((c) => c.id === id);
      if (chapter) {
        addChapter({ ...chapter, title });
      }
    }
  };

  const handleExportConfig = () => {
    const config = {
      chapters,
      dialogueNodes,
      settings: {
        characterNamePosition: {
          paddingLeft: settings.characterNamePosition.paddingLeft,
          paddingRight: settings.characterNamePosition.paddingRight,
        },
        characterNameColor: settings.characterNameColor || '#ffffff',
        dialogueTextPosition: {
          paddingLeft: settings.dialogueTextPosition.paddingLeft,
          paddingRight: settings.dialogueTextPosition.paddingRight,
        },
        dialogueTextColor: settings.dialogueTextColor || '#ffffff',
      },
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'story-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = () => {
    setShowClearWarning(true);
  };

  const confirmImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const config = JSON.parse(e.target?.result as string);
            if (config.chapters && config.dialogueNodes) {
              importConfig({
                ...config,
                settings: {
                  characterNamePosition: {
                    paddingLeft: config.settings?.characterNamePosition?.paddingLeft || 0,
                    paddingRight: config.settings?.characterNamePosition?.paddingRight || 0,
                  },
                  dialogueTextPosition: {
                    paddingLeft: config.settings?.dialogueTextPosition?.paddingLeft || 0,
                    paddingRight: config.settings?.dialogueTextPosition?.paddingRight || 0,
                  },
                },
              });
              setShowClearWarning(false);
            } else {
              alert('无效的配置文件格式');
            }
          } catch (error) {
            alert('配置文件解析失败');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="flex-none p-4 border-b border-gray-700">
        <div className="flex items-center justify-between text-gray-300 mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <h2 className="font-semibold">章节管理器</h2>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="全局设置"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportConfig}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
          <button
            onClick={handleImportConfig}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            导入
          </button>
        </div>
      </div>

      <div className="h-[calc(100vh-8rem)] overflow-y-auto">
        {/* 章节列表 */}
        <div className="chapter-section">
          <button
            onClick={() =>
              setExpandedSections((prev) =>
                prev.includes('chapters')
                  ? prev.filter((s) => s !== 'chapters')
                  : [...prev, 'chapters']
              )
            }
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-700 transition-colors"
          >
            {expandedSections.includes('chapters') ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <span>章节列表</span>
          </button>
          {expandedSections.includes('chapters') && (
            <div className="px-4 py-2 space-y-1 overflow-x-auto">
              {chapters.map((chapter) => {
                const nodeCount = dialogueNodes.filter(
                  (node) => node.chapterId === chapter.id
                ).length;
                return (
                  <div
                    key={chapter.id}
                    className={`
                      flex items-center justify-between p-2 rounded
                      ${
                        currentChapter === chapter.id
                          ? 'bg-blue-600'
                          : 'hover:bg-gray-700'
                      }
                      cursor-pointer transition-colors
                    `}
                    onClick={() => setCurrentChapter(chapter.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {chapter.title}
                      </div>
                      <div className="text-xs text-gray-400">
                        {nodeCount} 个节点
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditChapter(chapter.id, chapter.title);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('确定要删除这个章节吗？')) {
                            removeChapter(chapter.id);
                          }
                        }}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              <button
                onClick={handleAddChapter}
                className="flex items-center gap-2 px-2 py-1.5 text-blue-400 hover:text-blue-300 transition-colors w-full"
              >
                <Plus className="w-4 h-4" />
                添加章节
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 全局设置对话框 */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl w-[480px] border border-gray-700/50 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-semibold text-gray-100">全局设置</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-300 hover:text-gray-100" />
              </button>
            </div>

            <div className="space-y-8">
              {/* 角色名称位置 */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-300 tracking-wide">角色名称位置</h4>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs text-gray-400 mb-2 tracking-wide">左边距 (px)</label>
                    <input
                      type="number"
                      value={settings.characterNamePosition.paddingLeft}
                      onChange={(e) => {
                        updateGlobalSettings({
                          characterNamePosition: {
                            ...settings.characterNamePosition,
                            paddingLeft: parseInt(e.target.value) || 0,
                          },
                        });
                      }}
                      className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-2 tracking-wide">右边距 (px)</label>
                    <input
                      type="number"
                      value={settings.characterNamePosition.paddingRight}
                      onChange={(e) => {
                        updateGlobalSettings({
                          characterNamePosition: {
                            ...settings.characterNamePosition,
                            paddingRight: parseInt(e.target.value) || 0,
                          },
                        });
                      }}
                      className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>

              {/* 对话文本位置 */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-300 tracking-wide">对话文本位置</h4>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs text-gray-400 mb-2 tracking-wide">左边距 (px)</label>
                    <input
                      type="number"
                      value={settings.dialogueTextPosition.paddingLeft}
                      onChange={(e) => {
                        updateGlobalSettings({
                          dialogueTextPosition: {
                            ...settings.dialogueTextPosition,
                            paddingLeft: parseInt(e.target.value) || 0,
                          },
                        });
                      }}
                      className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-2 tracking-wide">右边距 (px)</label>
                    <input
                      type="number"
                      value={settings.dialogueTextPosition.paddingRight}
                      onChange={(e) => {
                        updateGlobalSettings({
                          dialogueTextPosition: {
                            ...settings.dialogueTextPosition,
                            paddingRight: parseInt(e.target.value) || 0,
                          },
                        });
                      }}
                      className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg hover:shadow-blue-500/20"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 清空确认对话框 */}
      {showClearWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md">
            <div className="flex items-center gap-3 text-yellow-400 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-semibold">导入确认</h3>
            </div>
            <p className="text-gray-300 mb-6">
              导入新配置将清空当前所有章节和节点数据，确定要继续吗？
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearWarning(false)}
                className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmImport}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
              >
                确认导入
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
