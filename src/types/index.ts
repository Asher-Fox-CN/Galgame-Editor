export interface Character {
  id: string;
  name: string;
  sprites: CharacterSprite[];
}

export interface CharacterSprite {
  id: string;
  name: string;
  url: string;
  emotion: string;
}

export interface Chapter {
  id: string;
  title: string;
  condition?: {
    type: 'choice' | 'flag';
    value: string;
  };
}

export interface Background {
  type: 'image' | 'color';
  value: string;
  duration?: number;
}

export interface DialogueNode {
  id: string;
  chapterId: string;
  type: 'dialogue' | 'choice' | 'background' | 'sound' | 'jump';
  characterName?: string;
  characterColor?: string;
  textColor?: string;
  character?: string;
  sprite?: string;
  text?: string;
  choices?: Choice[];
  backgrounds?: Background[];
  currentBackgroundIndex?: number;
  sound?: {
    type: 'bgm' | 'sfx' | 'voice';
    url: string;
  };
  nextId?: string;
  targetChapterId?: string;
  jumpConfig?: {
    showTransitionText?: boolean;
    hideBottomPanel?: boolean;
  };
}

export interface Choice {
  text: string;
  nextId: string;
}

export interface TextPosition {
  paddingLeft: number;
  paddingRight: number;
}

export interface GameSettings {
  characterNamePosition: TextPosition;
  characterNameColor?: string;
  dialogueTextPosition: TextPosition;
  dialogueTextColor?: string;
}

export interface GameState {
  chapters: Chapter[];
  characters: Character[];
  dialogueNodes: DialogueNode[];
  backgrounds: string[];
  sounds: {
    bgm: string[];
    sfx: string[];
    voice: string[];
  };
  currentChapter: string;
  gameFlags: Record<string, boolean>;
  settings: GameSettings;
}
