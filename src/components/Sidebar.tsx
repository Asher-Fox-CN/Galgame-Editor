import React from 'react';
import { Users, Image, Music, Settings, Plus, Upload } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export const Sidebar: React.FC = () => {
  const characters = useGameStore((state) => state.characters);
  const backgrounds = useGameStore((state) => state.backgrounds);
  const addCharacter = useGameStore((state) => state.addCharacter);
  const addBackground = useGameStore((state) => state.addBackground);

  const handleAddCharacter = () => {
    const name = prompt('请输入角色名称');
    if (name) {
      addCharacter({
        id: crypto.randomUUID(),
        name,
        sprites: [],
      });
    }
  };

  const handleAddBackground = () => {
    const url = prompt('请输入背景图片URL');
    if (url) {
      addBackground(url);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-700">资源管理</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600" />
                <h3 className="font-medium text-gray-700">角色</h3>
              </div>
              <button
                onClick={handleAddCharacter}
                className="text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {characters.map((char) => (
                <div
                  key={char.id}
                  className="p-2 bg-gray-50 rounded-md text-sm hover:bg-gray-100"
                >
                  {char.name}
                  <button className="ml-2 text-blue-600 hover:text-blue-700">
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Image className="w-5 h-5 text-gray-600" />
                <h3 className="font-medium text-gray-700">背景</h3>
              </div>
              <button
                onClick={handleAddBackground}
                className="text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {backgrounds.map((bg) => (
                <div
                  key={bg}
                  className="p-2 bg-gray-50 rounded-md text-sm hover:bg-gray-100"
                >
                  {bg.split('/').pop()}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-gray-600" />
                <h3 className="font-medium text-gray-700">音频</h3>
              </div>
              <button className="text-blue-600 hover:text-blue-700">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
          <Settings className="w-5 h-5" />
          <span>设置</span>
        </button>
      </div>
    </div>
  );
};
