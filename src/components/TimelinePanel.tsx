import React, { useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import {
  MessageSquare,
  Split,
  Image as ImageIcon,
  Music,
  ChevronRight,
} from 'lucide-react';

interface Props {
  selectedNode: string | null;
}

export const TimelinePanel: React.FC<Props> = ({ selectedNode }) => {
  const dialogueNodes = useGameStore((state) => state.dialogueNodes);
  const currentChapter = useGameStore((state) => state.currentChapter);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const currentNodes = dialogueNodes.filter(
    (node) => node.chapterId === currentChapter
  );

  useEffect(() => {
    if (!selectedNode || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const targetNode = container.querySelector(
      `[data-node-id="${selectedNode}"]`
    );

    if (targetNode) {
      const containerRect = container.getBoundingClientRect();
      const nodeRect = targetNode.getBoundingClientRect();

      // Calculate scroll position to center the node (ai修的 计算滚动位置)
      const scrollLeft =
        nodeRect.left -
        containerRect.left +
        container.scrollLeft -
        containerRect.width / 2 +
        nodeRect.width / 2;

      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth',
      });
    }
  }, [selectedNode]);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'dialogue':
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case 'choice':
        return <Split className="w-4 h-4 text-purple-400" />;
      case 'background':
        return <ImageIcon className="w-4 h-4 text-green-400" />;
      case 'sound':
        return <Music className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <div className="h-52 bg-gray-800 border-t border-gray-700 flex flex-col w-full">
      {/* 标题区域 */}
      <div className="flex-none flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <h3 className="font-medium text-sm">时间轴</h3>
      </div>

      {/* 滚动区域容器 */}
      <div className="flex-1 min-h-0">
        <div className="h-full overflow-hidden relative">
          {/* 滚动视图 */}
          <div
            className="absolute inset-0 overflow-x-auto overflow-y-hidden"
            ref={scrollContainerRef}
          >
            {/* 节点容器 */}
            <div className="flex h-full items-center gap-1.5 pl-4 pr-8 flex-nowrap">
              {currentNodes.map((node, index) => (
                <div
                  key={node.id}
                  data-node-id={node.id}
                  className={`
                    flex-none flex items-center gap-1.5 
                    px-2 py-1.5 rounded cursor-pointer
                    ${
                      node.id === selectedNode
                        ? 'bg-blue-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }
                    transition-colors
                    min-w-[120px]
                  `}
                >
                  {getNodeIcon(node.type)}
                  <span className="text-xs truncate flex-1">
                    节点 {index + 1}
                  </span>
                  <ChevronRight className="w-3 h-3 text-gray-500 flex-shrink-0" />
                </div>
              ))}

              {/* 填充空白空间 */}
              <div className="flex-none pr-4" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
