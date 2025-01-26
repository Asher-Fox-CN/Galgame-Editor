import React, { useState } from 'react';
import { WorkspacePanel } from './WorkspacePanel';
import { ResourcePanel } from './ResourcePanel';
import { TimelinePanel } from './TimelinePanel';
import { PropertiesPanel } from './PropertiesPanel';
import { GamePlayer } from './GamePlayer';
import { Menu, Maximize2, X } from 'lucide-react';

export const EditorLayout: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  if (isPlaying) {
    return (
      <div className="fixed inset-0 bg-black">
        <GamePlayer onExit={() => setIsPlaying(false)} />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col text-gray-300">
      {/* 主工作区 */}
      <div className="flex-1 flex">
        {/* 左侧资源面板 */}
        <ResourcePanel />

        {/* 中间工作区 */}
        <div className="flex-1 flex flex-col">
          <WorkspacePanel
            onNodeSelect={setSelectedNode}
            onPlay={() => setIsPlaying(true)}
          />
          <TimelinePanel selectedNode={selectedNode} />
        </div>

        {/* 右侧属性面板 */}
        <PropertiesPanel selectedNode={selectedNode} />
      </div>
    </div>
  );
};
