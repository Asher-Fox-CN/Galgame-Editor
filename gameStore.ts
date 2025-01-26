import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, Character, DialogueNode, Chapter, Background } from '../types';

interface GameStore extends GameState {
  addChapter: (chapter: Chapter) => void;
  removeChapter: (id: string) => void;
  setCurrentChapter: (id: string) => void;
  addCharacter: (character: Character) => void;
  removeCharacter: (id: string) => void;
  addDialogueNode: (node: DialogueNode) => void;
  updateDialogueNode: (id: string, node: Partial<DialogueNode>) => void;
  removeDialogueNode: (id: string) => void;
  reorderDialogueNodes: (nodes: DialogueNode[]) => void;
  addBackground: (url: string) => void;
  removeBackground: (url: string) => void;
  addSound: (type: 'bgm' | 'sfx' | 'voice', url: string) => void;
  removeSound: (type: 'bgm' | 'sfx' | 'voice', url: string) => void;
  setGameFlag: (flag: string, value: boolean) => void;
  advanceBackground: (nodeId: string) => void;
  importConfig: (config: { 
    chapters: Chapter[]; 
    dialogueNodes: DialogueNode[];
    settings?: {
      characterNamePosition: {
        paddingLeft: number;
        paddingRight: number;
      };
      dialogueTextPosition: {
        paddingLeft: number;
        paddingRight: number;
      };
    };
  }) => void;
  updateGlobalSettings: (settings: Partial<GameState['settings']>) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      chapters: [],
      characters: [],
      dialogueNodes: [],
      backgrounds: [],
      sounds: {
        bgm: [],
        sfx: [],
        voice: [],
      },
      currentChapter: '',
      gameFlags: {},
      settings: {
        characterNamePosition: {
          paddingLeft: 20,
          paddingRight: 20,
        },
        dialogueTextPosition: {
          paddingLeft: 20,
          paddingRight: 20,
        },
      },

      addChapter: (chapter) =>
        set((state) => ({
          chapters: state.chapters.map(c => c.id === chapter.id ? chapter : c).concat(
            state.chapters.find(c => c.id === chapter.id) ? [] : [chapter]
          ),
        })),

      removeChapter: (id) =>
        set((state) => ({
          chapters: state.chapters.filter((c) => c.id !== id),
          dialogueNodes: state.dialogueNodes.filter((n) => n.chapterId !== id),
          currentChapter: state.currentChapter === id ? '' : state.currentChapter,
        })),

      setCurrentChapter: (id) =>
        set(() => ({
          currentChapter: id,
        })),

      addCharacter: (character) =>
        set((state) => ({
          characters: [...state.characters, character],
        })),

      removeCharacter: (id) =>
        set((state) => ({
          characters: state.characters.filter((c) => c.id !== id),
        })),

      addDialogueNode: (node) =>
        set((state) => ({
          dialogueNodes: [...state.dialogueNodes, {
            ...node,
            currentBackgroundIndex: node.backgrounds?.length ? 0 : undefined,
            sound: node.type === 'sound' ? { type: 'bgm', url: '' } : undefined
          }],
        })),

      updateDialogueNode: (id, node) =>
        set((state) => ({
          dialogueNodes: state.dialogueNodes.map((n) =>
            n.id === id ? { ...n, ...node } : n
          ),
        })),

      removeDialogueNode: (id) =>
        set((state) => ({
          dialogueNodes: state.dialogueNodes.filter((n) => n.id !== id),
        })),

      reorderDialogueNodes: (nodes) =>
        set(() => ({
          dialogueNodes: nodes,
        })),

      addBackground: (url) =>
        set((state) => ({
          backgrounds: [...state.backgrounds, url],
        })),

      removeBackground: (url) =>
        set((state) => ({
          backgrounds: state.backgrounds.filter((b) => b !== url),
        })),

      addSound: (type, url) =>
        set((state) => ({
          sounds: {
            ...state.sounds,
            [type]: [...state.sounds[type], url],
          },
        })),

      removeSound: (type, url) =>
        set((state) => ({
          sounds: {
            ...state.sounds,
            [type]: state.sounds[type].filter((s) => s !== url),
          },
        })),

      setGameFlag: (flag, value) =>
        set((state) => ({
          gameFlags: {
            ...state.gameFlags,
            [flag]: value,
          },
        })),

      advanceBackground: (nodeId) =>
        set((state) => ({
          dialogueNodes: state.dialogueNodes.map((node) => {
            if (node.id === nodeId && node.backgrounds?.length) {
              const currentIndex = node.currentBackgroundIndex || 0;
              const nextIndex = currentIndex + 1;
              if (nextIndex < node.backgrounds.length) {
                return {
                  ...node,
                  currentBackgroundIndex: nextIndex,
                };
              }
            }
            return node;
          }),
        })),

      importConfig: (config) =>
        set(() => ({
          chapters: config.chapters,
          dialogueNodes: config.dialogueNodes,
          currentChapter: config.chapters[0]?.id || '',
          characters: [],
          backgrounds: [],
          sounds: {
            bgm: [],
            sfx: [],
            voice: [],
          },
          gameFlags: {},
          settings: {
            characterNamePosition: {
              paddingLeft: config.settings?.characterNamePosition?.paddingLeft || 20,
              paddingRight: config.settings?.characterNamePosition?.paddingRight || 20,
            },
            dialogueTextPosition: {
              paddingLeft: config.settings?.dialogueTextPosition?.paddingLeft || 20,
              paddingRight: config.settings?.dialogueTextPosition?.paddingRight || 20,
            },
          },
        })),

      updateGlobalSettings: (settings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...settings,
          },
        })),
    }),
    {
      name: 'galgame-storage',
    }
  )
);
