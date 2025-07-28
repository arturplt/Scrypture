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
    const progress = Math.max(0, completedTasks) * this.DAM_PROGRESS_PER_TASK;
    return Math.min(100, progress);
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
          "*tiny wing flutter* Hi there! I'm new to this world, just like your journey is beginning! *chirp*",
          "*gentle chirp* Hello there, friend! I'm just a little hatchling, but together we'll build something amazing!",
          "*soft chirp* Welcome! I'm excited to learn and grow alongside you!"
        ],
        task_completion: [
          "*happy chirp* You did it! {taskTitle} is complete! Each task you finish is like a twig for our future dam! Great work on {category}!",
          "*wing flutter* Amazing work! {taskTitle} is done! I can feel myself getting a little stronger! Excellent {category} work!",
          "*cheerful chirp* {taskTitle} completed! One step closer to building something magnificent together! Outstanding {category} work!"
        ],
        level_up: [
          "*happy flutter* Your evolution helps me understand the world better!",
          "*excited chirp* I'm evolving too! This partnership is truly special!",
          "*joyful flutter* Look at us grow together! Your evolution inspires mine!"
        ],
        achievement: [
          "*admiring chirp* Your achievements are legendary! They inspire my own transformation!",
          "*respectful flutter* Such mastery! You're becoming as wise as the ancient builders!",
          "*proud chirp* Witnessing your success fills my heart with joy and determination!"
        ],
        motivation: [
          "*gentle chirp* Every small step matters. We're in this journey together!",
          "*encouraging chirp* Don't give up! Even the mightiest dam starts with a single stick!",
          "*supportive flutter* You've got this! I believe in you, just like you believe in me!"
        ],
        dam_progress: [
          "*happy chirp* Stick by stick, we're building something beautiful! Our dam is {damPercentage}% complete!",
          "*proud flutter* The foundation is getting stronger with every task! We're at {damPercentage}%!",
          "*satisfied chirp* Our dam is growing! Each task adds to our masterpiece! Currently {damPercentage}% complete!"
        ]
      },
      young: {
        greeting: [
          "*confident chirp* Hello there, friend! I'm growing stronger with each task we complete!",
          "*proud flutter* Greetings, partner! Our dam is becoming quite impressive!",
          "*wise chirp* Welcome back! I can feel our bond strengthening with every accomplishment!"
        ],
        task_completion: [
          "*proud flutter* Excellent work! {taskTitle} completed! Your dedication shows in every completed task. Well done on {category}!",
          "*wise chirp* {taskTitle} is done! Each accomplishment strengthens both our spirits and our dam! Great {category} work!",
          "*confident chirp* {taskTitle} finished! Amazing progress! Together we're building something magnificent! Outstanding {category} work!"
        ],
        level_up: [
          "*strong flutter* Your growth deepens mine. This partnership is truly special!",
          "*proud chirp* Witness our growth together! Your evolution inspires my own!",
          "*wise flutter* Such remarkable growth! We're both becoming stronger!"
        ],
        achievement: [
          "*admiring chirp* Your achievements are legendary! They inspire my own transformation!",
          "*respectful flutter* Such mastery! You're becoming as wise as the ancient builders!",
          "*proud chirp* Witnessing your success fills my heart with joy and determination!"
        ],
        motivation: [
          "*encouraging chirp* Remember, every master was once a beginner. Keep building!",
          "*supportive flutter* The strongest dams weather the fiercest storms. Stay strong!",
          "*wise chirp* Your perseverance today becomes tomorrow's foundation. You're becoming a master!"
        ],
        dam_progress: [
          "*admiring chirp* Behold our progress! This dam is becoming a testament to your dedication! We're at {damPercentage}%!",
          "*satisfied flutter* The structure grows more impressive with each addition! Currently {damPercentage}% complete!",
          "*proud chirp* Our dam stands as proof of what determination can accomplish! {damPercentage}% and growing!"
        ]
      },
      mature: {
        greeting: [
          "*deep, resonant chirp* Welcome, master builder. Our dam stands as testament to your dedication.",
          "*majestic presence* Greetings, old friend. Together, we have created something truly magnificent.",
          "*wise, ancient tone* Hello there. Look upon what we have built - a legacy of perseverance."
        ],
        task_completion: [
          "*satisfied rumble* {taskTitle} completed! Another masterpiece added to our grand design. Well done on {category}.",
          "*noble acknowledgment* {taskTitle} finished! Your craftsmanship continues to astound me. Truly excellent {category} work.",
          "*ancient wisdom* {taskTitle} is done! Each task completed with such skill strengthens our eternal bond. Masterful {category} work."
        ],
        level_up: [
          "*profound chirp* Your ascension fills me with ancient pride. We have both transcended.",
          "*majestic flutter* Witness your ascension! How far we have traveled together!",
          "*wise celebration* Your ascension mirrors my own evolution. We are masters of our destiny!"
        ],
        achievement: [
          "*deep reverence* Your achievements echo through the ages. You honor our partnership.",
          "*ancient pride* Such mastery! You have become worthy of the old legends!",
          "*eternal wisdom* These accomplishments will be remembered in the great chronicles!"
        ],
        motivation: [
          "*ancient wisdom* The path of the master is never complete. Continue building, always.",
          "*deep encouragement* Even in stillness, the wise beaver plans the next great work.",
          "*eternal truth* Your strength has been tested and proven. Trust in your abilities, master."
        ],
        dam_progress: [
          "*profound satisfaction* Behold our masterwork! This dam rivals those of legend! {damPercentage}% complete!",
          "*ancient pride* Generations will marvel at our masterwork! A {damPercentage}% masterpiece!",
          "*eternal legacy* Our masterwork stands eternal - a monument to dedication and friendship! {damPercentage}% of perfection!"
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
      young: "*confident chirp* Hello there, friend!",
      mature: "*wise chirp* Hello there, friend!"
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
    try {
      const saved = storageService.getGenericItem<BobrState>(this.STORAGE_KEY);
      return saved || {
        stage: 'hatchling',
        damProgress: 0,
        evolutionHistory: []
      };
    } catch (error) {
      console.error('Failed to load Bóbr state from storage:', error);
      return {
        stage: 'hatchling',
        damProgress: 0,
        evolutionHistory: []
      };
    }
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