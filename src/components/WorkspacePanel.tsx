import React from 'react';
import { useGameStore } from '../store/gameStore';
import {
  MessageSquare,
  Split,
  Image as ImageIcon,
  Music,
  Plus,
  Trash2,
  GripVertical,
  ArrowRight,
  ArrowRightToLine,
} from 'lucide-react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DialogueNode } from '../types';

interface Props {
  onNodeSelect: (nodeId: string) => void;
  onPlay: () => void;
}

interface SortableNodeProps {
  node: DialogueNode;
  index: number;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const SortableNode: React.FC<SortableNodeProps> = ({
  node,
  index,
  onSelect,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
  };

  const getNodeIcon = () => {
    switch (node.type) {
      case 'dialogue':
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case 'choice':
        return <Split className="w-4 h-4 text-purple-400" />;
      case 'background':
        return <ImageIcon className="w-4 h-4 text-green-400" />;
      case 'sound':
        return <Music className="w-4 h-4 text-yellow-400" />;
      case 'jump':
        return <ArrowRightToLine className="w-4 h-4 text-orange-400" />;
    }
  };

  const dialogueNodes = useGameStore((state) => state.dialogueNodes);
  const chapters = useGameStore((state) => state.chapters);

  const getPreviewContent = () => {
    switch (node.type) {
      case 'dialogue':
        return (
          <div>
            {node.characterName && (
              <div 
                className="text-sm mb-1"
                style={{ color: node.characterColor || '#3B82F6' }}
              >
                {node.characterName}
              </div>
            )}
            <div 
              className="text-sm"
              style={{ color: node.textColor || '#9CA3AF' }}
            >
              {node.text || '未设置对话内容'}
            </div>
          </div>
        );
      case 'choice':
        return (
          <div>
            <div className="text-sm text-gray-400 truncate">
              {node.text || node.backgrounds?.[0]?.value || '未设置选项内容'}
            </div>
            {node.choices && (
              <div className="mt-2 space-y-1">
                {node.choices.map((choice, index) => {
                  const targetNode = dialogueNodes.find(
                    (n: DialogueNode) => n.id === choice.nextId
                  );
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-xs text-gray-400"
                    >
                      <ArrowRight className="w-3 h-3" />
                      {choice.text}{' '}
                      {targetNode &&
                        `→ ${
                          {
                            dialogue: '对话',
                            choice: '选项',
                            background: '背景',
                            sound: '音频',
                            jump: '跳转',
                          }[targetNode.type]
                        }`}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      case 'background':
        return node.backgrounds?.[0]?.value
          ? '背景图片已设置'
          : '未设置背景图片';
      case 'sound':
        return node.sound?.url ? '背景音乐已设置' : '未设置背景音乐';
      case 'jump':
        const targetChapter = chapters.find(c => c.id === node.targetChapterId);
        return targetChapter ? `跳转到: ${targetChapter.title}` : '未设置目标章节';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group bg-gray-800 rounded-lg p-3 hover:bg-gray-750 transition-all shadow-lg ${
        isDragging
          ? 'shadow-2xl scale-105 border-2 border-blue-400'
          : 'hover:shadow-xl border border-gray-700'
      }`}
    >
      {/* 顺序标识 */}
      <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600/30 rounded-full flex items-center justify-center text-xs font-medium text-blue-400">
        {index + 1}
      </div>

      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-2 pr-6">
          <div className="flex items-center gap-2">
            <div
              {...attributes}
              {...listeners}
              className="cursor-move opacity-80 hover:opacity-100 transition-opacity"
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>
            {getNodeIcon()}
          </div>
          <button
            onClick={() => onDelete(node.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 -mt-1 -mr-1 p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div
          className="flex-1 cursor-pointer"
          onClick={() => onSelect(node.id)}
        >
          <h3 className="text-sm font-medium text-gray-200 mb-1">
            {node.type === 'dialogue' && '对话'}
            {node.type === 'choice' && '选项'}
            {node.type === 'background' && '背景'}
            {node.type === 'sound' && '音频'}
            {node.type === 'jump' && '章节跳转'}
          </h3>
          <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
            {getPreviewContent()}
          </p>
        </div>
      </div>
    </div>
  );
};

export const WorkspacePanel: React.FC<Props> = ({ onNodeSelect, onPlay }) => {
  const dialogueNodes = useGameStore((state) => state.dialogueNodes);
  const currentChapter = useGameStore((state) => state.currentChapter);
  const addDialogueNode = useGameStore((state) => state.addDialogueNode);
  const removeDialogueNode = useGameStore((state) => state.removeDialogueNode);
  const reorderDialogueNodes = useGameStore(
    (state) => state.reorderDialogueNodes
  );

  const currentNodes = dialogueNodes.filter(
    (node) => node.chapterId === currentChapter
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = dialogueNodes.findIndex((node) => node.id === active.id);
      const newIndex = dialogueNodes.findIndex((node) => node.id === over.id);

      const newNodes = [...dialogueNodes];
      const [movedNode] = newNodes.splice(oldIndex, 1);
      newNodes.splice(newIndex, 0, movedNode);

      reorderDialogueNodes(newNodes);
    }
  };

  const handleAddNode = (
    type: 'dialogue' | 'choice' | 'background' | 'sound' | 'jump'
  ) => {
    addDialogueNode({
      id: crypto.randomUUID(),
      type,
      chapterId: currentChapter,
      text: type === 'dialogue' ? '新对话' : undefined,
      choices: type === 'choice' ? [{ text: '选项1', nextId: '' }] : undefined,
      backgrounds:
        type === 'background'
          ? [{ type: 'color', value: '#000000' }]
          : undefined,
    });
  };

  if (!currentChapter) {
    return (
      <div className="flex-1 bg-gray-900 p-4 flex items-center justify-center min-h-[600px]">
        <div className="text-gray-500">请选择或创建章节</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-900 flex flex-col min-h-[600px] max-h-[600px]">
      <div className="flex-none p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAddNode('dialogue')}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            新增对话
          </button>
          <button
            onClick={() => handleAddNode('jump')}
            className="flex items-center gap-2 px-3 py-1.5 bg-orange-600/80 hover:bg-orange-600 text-white rounded-lg transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            章节跳转
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPlay}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={currentNodes} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {currentNodes.map((node, index) => (
                <SortableNode
                  key={node.id}
                  node={node}
                  index={index}
                  onSelect={onNodeSelect}
                  onDelete={removeDialogueNode}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};