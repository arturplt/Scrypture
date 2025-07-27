import { BobrMessage, BobrState, User } from '../types';
import { storageService } from './storageService';

class BobrService {
  private readonly STORAGE_KEY = 'bobr_state';
  
  // Evolution thresholds based on user level
  private readonly EVOLUTION_THRESHOLDS = {
    hatchling: { min: 1, max: 3 },
    young: { min: 4, max: 7 },
    mature: { min: 8, max: Infinity }
  };

  // Dam progress calculation: 5% per completed task (max 100%)
  private readonly DAM_PROGRESS_PER_TASK = 5;

  /**
   * Get the current Bóbr stage based on user level
   */
  getBobrStage(userLevel: number): 'hatchling' | 'young' | 'mature' {
    if (userLevel <= this.EVOLUTION_THRESHOLDS.hatchling.max) return 'hatchling';
    if (userLevel <= this.EVOLUTION_THRESHOLDS.young.max) return 'young';
    return 'mature';
  }

  /**
   * Calculate dam progress based on completed tasks
   */
  calculateDamProgress(completedTasks: number): number {
    return Math.min(100, completedTasks * this.DAM_PROGRESS_PER_TASK);
  }

  /**
   * Update user's Bóbr stage and dam progress
   */
  updateBobrStatus(user: User, completedTasks: number): { 
    user: User; 
    evolved: boolean; 
    damProgressChanged: boolean;
  } {
    const newStage = this.getBobrStage(user.level);
    const newDamProgress = this.calculateDamProgress(completedTasks);
    
    const evolved = user.bobrStage !== newStage;
    const damProgressChanged = user.damProgress !== newDamProgress;

    if (evolved || damProgressChanged) {
      const updatedUser = {
        ...user,
        bobrStage: newStage,
        damProgress: newDamProgress,
        updatedAt: new Date()
      };

      // Save evolution history if evolved
      if (evolved) {
        this.saveEvolutionHistory(newStage);
      }

      return { 
        user: updatedUser, 
        evolved, 
        damProgressChanged 
      };
    }

    return { user, evolved: false, damProgressChanged: false };
  }

  /**
   * Generate contextual motivational message
   */
  generateMessage(
    type: BobrMessage['type'],
    stage: 'hatchling' | 'young' | 'mature',
    context?: BobrMessage['context']
  ): BobrMessage {
    const messages = this.getMessageTemplates();
    const stageMessages = messages[stage]?.[type] || messages.hatchling[type];
    
    if (!stageMessages || stageMessages.length === 0) {
      return this.getFallbackMessage(stage);
    }

    const randomMessage = stageMessages[Math.floor(Math.random() * stageMessages.length)];
    
    return {
      id: this.generateMessageId(),
      type,
      stage,
      context,
      message: this.interpolateMessage(randomMessage, context),
      animation: this.getAnimationForType(type)
    };
  }

  /**
   * Get message templates organized by stage and type
   */
  private getMessageTemplates() {
    return {
      hatchling: {
        greeting: [
          "*chirp chirp* Welcome, friend! I'm just a little hatchling, but together we'll build something amazing!",
          "*tiny wing flutter* Hi there! I'm new to this world, just like your journey is beginning!",
          "*excited chirping* Every task you complete helps me grow stronger!"
        ],
        task_completion: [
          "*happy chirp* You did it! Each task you finish is like a twig for our future dam!",
          "*wing flutter* Amazing work! I can feel myself getting a little stronger!",
          "*cheerful chirp* One step closer to building something magnificent together!"
        ],
        level_up: [
          "*excited chirping* You've grown so much! I can feel my own evolution approaching!",
          "*happy flutter* Your wisdom helps me understand the world better!",
          "*proud chirp* Together, we're both becoming stronger!"
        ],
        achievement: [
          "*amazed chirp* Incredible! Your achievements inspire my own growth!",
          "*excited flutter* You're amazing! Each achievement brings us closer to greatness!",
          "*proud chirping* I knew you had it in you! You're helping me believe in myself too!"
        ],
        motivation: [
          "*encouraging chirp* Don't give up! Even the mightiest dam starts with a single stick!",
          "*supportive flutter* You've got this! I believe in you, just like you believe in me!",
          "*gentle chirp* Every small step matters. We're in this journey together!"
        ],
        dam_progress: [
          "*excited chirp* Look! Our dam is growing! Each task you complete adds another stick!",
          "*proud flutter* The foundation is getting stronger with every task!",
          "*happy chirp* Stick by stick, we're building something beautiful!"
        ]
      },
      young: {
        greeting: [
          "*confident chirp* Greetings! I've grown quite a bit since we started this journey together!",
          "*mature flutter* Hello there! Look how much we've both accomplished!",
          "*wise chirp* Welcome back! Our bond grows stronger with each passing day."
        ],
        task_completion: [
          "*satisfied chirp* Excellent work! Our dam is becoming quite impressive!",
          "*proud flutter* Your dedication shows in every completed task. Well done!",
          "*wise chirp* Each accomplishment strengthens both our spirits and our dam!"
        ],
        level_up: [
          "*majestic chirp* Your growth fills me with pride! We're becoming quite the team!",
          "*strong flutter* Your wisdom deepens mine. This partnership is truly special!",
          "*noble chirp* Together, we're reaching heights I never imagined!"
        ],
        achievement: [
          "*admiring chirp* Your achievements are legendary! They inspire my own transformation!",
          "*respectful flutter* Such mastery! You're becoming as wise as the ancient builders!",
          "*proud chirp* Witnessing your success fills my heart with joy and determination!"
        ],
        motivation: [
          "*encouraging chirp* Remember, every master was once a beginner. Keep building!",
          "*supportive flutter* The strongest dams weather the fiercest storms. Stay strong!",
          "*wise chirp* Your perseverance today becomes tomorrow's foundation."
        ],
        dam_progress: [
          "*admiring chirp* Behold our progress! This dam is becoming a testament to your dedication!",
          "*satisfied flutter* The structure grows more impressive with each addition!",
          "*proud chirp* Our dam stands as proof of what determination can accomplish!"
        ]
      },
      mature: {
        greeting: [
          "*deep, resonant chirp* Welcome, master builder. Our dam stands as testament to your dedication.",
          "*majestic presence* Greetings, old friend. Together, we have created something truly magnificent.",
          "*wise, ancient tone* Hello there. Look upon what we have built - a legacy of perseverance."
        ],
        task_completion: [
          "*satisfied rumble* Another masterpiece added to our grand design. Well done.",
          "*noble acknowledgment* Your craftsmanship continues to astound me. Truly excellent work.",
          "*ancient wisdom* Each task completed with such skill strengthens our eternal bond."
        ],
        level_up: [
          "*profound chirp* Your ascension fills me with ancient pride. We have both transcended.",
          "*majestic flutter* Witness how far we have traveled together! Truly remarkable growth.",
          "*wise celebration* Your evolution mirrors my own. We are masters of our destiny!"
        ],
        achievement: [
          "*deep reverence* Your achievements echo through the ages. You honor our partnership.",
          "*ancient pride* Such mastery! You have become worthy of the old legends!",
          "*eternal wisdom* These accomplishments will be remembered in the great chronicles!"
        ],
        motivation: [
          "*ancient wisdom* The path of the master is never complete. Continue building, always.",
          "*deep encouragement* Even in stillness, the wise beaver plans the next great work.",
          "*eternal truth* Your strength has been tested and proven. Trust in your abilities."
        ],
        dam_progress: [
          "*profound satisfaction* Behold our masterwork! This dam rivals those of legend!",
          "*ancient pride* Generations will marvel at what we have built together!",
          "*eternal legacy* Our dam stands eternal - a monument to dedication and friendship!"
        ]
      }
    };
  }

  /**
   * Interpolate context variables into message templates
   */
  private interpolateMessage(template: string, context?: BobrMessage['context']): string {
    if (!context) return template;
    
    return template
      .replace(/\{taskTitle\}/g, context.taskTitle || 'task')
      .replace(/\{category\}/g, context.category || 'category')
      .replace(/\{newLevel\}/g, context.newLevel?.toString() || 'level')
      .replace(/\{achievementName\}/g, context.achievementName || 'achievement')
      .replace(/\{damPercentage\}/g, context.damPercentage?.toString() || '0');
  }

  /**
   * Get animation type for message type
   */
  private getAnimationForType(type: BobrMessage['type']): BobrMessage['animation'] {
    const animationMap: Record<BobrMessage['type'], BobrMessage['animation']> = {
      greeting: 'idle',
      task_completion: 'celebrate',
      level_up: 'evolve',
      achievement: 'celebrate',
      motivation: 'idle',
      dam_progress: 'build'
    };
    
    return animationMap[type] || 'idle';
  }

  /**
   * Get fallback message if no template found
   */
  private getFallbackMessage(stage: 'hatchling' | 'young' | 'mature'): BobrMessage {
    const stageGreetings = {
      hatchling: "*chirp* Hello there, friend!",
      young: "*confident chirp* Greetings, partner!",
      mature: "*wise chirp* Welcome, master builder."
    };

    return {
      id: this.generateMessageId(),
      type: 'greeting',
      stage,
      message: stageGreetings[stage],
      animation: 'idle'
    };
  }

  /**
   * Save evolution history
   */
  private saveEvolutionHistory(newStage: 'hatchling' | 'young' | 'mature'): void {
    const state = this.getBobrState();
    const updatedHistory = [
      ...state.evolutionHistory,
      { stage: newStage, evolvedAt: new Date() }
    ];
    
    this.saveBobrState({
      ...state,
      stage: newStage,
      evolutionHistory: updatedHistory
    });
  }

  /**
   * Get Bóbr state from storage
   */
  getBobrState(): BobrState {
    const saved = storageService.getGenericItem<BobrState>(this.STORAGE_KEY);
    return saved || {
      stage: 'hatchling',
      damProgress: 0,
      evolutionHistory: []
    };
  }

  /**
   * Save Bóbr state to storage
   */
  saveBobrState(state: BobrState): boolean {
    return storageService.setGenericItem(this.STORAGE_KEY, state);
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `bobr_msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get a celebration message for task completion
   */
  getTaskCelebrationMessage(
    user: User, 
    taskTitle: string, 
    category: string
  ): BobrMessage {
    return this.generateMessage('task_completion', user.bobrStage, {
      taskTitle,
      category,
      damPercentage: user.damProgress
    });
  }

  /**
   * Get an evolution celebration message
   */
  getEvolutionMessage(newStage: 'hatchling' | 'young' | 'mature'): BobrMessage {
    return this.generateMessage('level_up', newStage);
  }

  /**
   * Get a motivational message
   */
  getMotivationalMessage(stage: 'hatchling' | 'young' | 'mature'): BobrMessage {
    return this.generateMessage('motivation', stage);
  }

  /**
   * Get dam progress celebration message
   */
  getDamProgressMessage(
    stage: 'hatchling' | 'young' | 'mature',
    damPercentage: number
  ): BobrMessage {
    return this.generateMessage('dam_progress', stage, { damPercentage });
  }
}

export const bobrService = new BobrService(); 