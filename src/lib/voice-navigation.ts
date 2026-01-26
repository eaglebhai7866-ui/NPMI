// Voice Navigation Utility
export class VoiceNavigator {
  private synthesis: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private isEnabled: boolean = true;
  private currentStepIndex: number = -1;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.initializeVoice();
    }
  }

  private initializeVoice() {
    if (!this.synthesis) return;

    const setVoice = () => {
      const voices = this.synthesis!.getVoices();
      // Prefer English voices
      this.voice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.localService
      ) || voices[0] || null;
    };

    if (this.synthesis.getVoices().length > 0) {
      setVoice();
    } else {
      this.synthesis.onvoiceschanged = setVoice;
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled && this.synthesis) {
      this.synthesis.cancel();
    }
  }

  speak(text: string, priority: 'high' | 'normal' = 'normal') {
    if (!this.isEnabled || !this.synthesis || !text.trim()) return;

    // Cancel previous utterances for high priority messages
    if (priority === 'high') {
      this.synthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (this.voice) {
      utterance.voice = this.voice;
    }
    
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    this.synthesis.speak(utterance);
  }

  announceDirection(instruction: string, distance?: string) {
    let announcement = instruction;
    if (distance) {
      announcement = `In ${distance}, ${instruction.toLowerCase()}`;
    }
    this.speak(announcement, 'high');
  }

  announceStep(stepIndex: number, instruction: string, distance?: string) {
    if (!this.isEnabled) return;
    
    // Always announce when step is clicked, update current step index
    this.currentStepIndex = stepIndex;
    
    let announcement = this.cleanInstruction(instruction);
    if (distance && distance !== '0 min') {
      announcement = `${announcement}. Distance: ${distance}`;
    }
    
    this.speak(announcement, 'high');
  }

  announceStepOnClick(instruction: string, distance?: string) {
    if (!this.isEnabled) return;
    
    // Always announce when step is manually clicked
    let announcement = this.cleanInstruction(instruction);
    if (distance && distance !== '0 min') {
      announcement = `${announcement}. Distance: ${distance}`;
    }
    
    this.speak(announcement, 'high');
  }

  announceCurrentStep(instruction: string, distance?: string) {
    let announcement = `Current step: ${this.cleanInstruction(instruction)}`;
    if (distance && distance !== '0 min') {
      announcement += `. Distance: ${distance}`;
    }
    this.speak(announcement, 'high');
  }

  announceNextStep(instruction: string, distance?: string) {
    let announcement = `Next: ${this.cleanInstruction(instruction)}`;
    if (distance && distance !== '0 min') {
      announcement += `. Distance: ${distance}`;
    }
    this.speak(announcement, 'normal');
  }

  private cleanInstruction(instruction: string): string {
    // Clean up common instruction patterns for better speech
    return instruction
      .replace(/Continue onto/gi, 'Continue on')
      .replace(/Turn left onto/gi, 'Turn left on')
      .replace(/Turn right onto/gi, 'Turn right on')
      .replace(/Enter the roundabout/gi, 'Enter roundabout')
      .replace(/Exit the roundabout/gi, 'Exit roundabout')
      .replace(/Keep left/gi, 'Keep left')
      .replace(/Keep right/gi, 'Keep right')
      .replace(/Make a U-turn/gi, 'Make U-turn')
      .replace(/Head/gi, 'Go')
      .trim();
  }

  announceRouteStart(destination: string) {
    this.currentStepIndex = -1; // Reset step tracking
    this.speak(`Starting navigation to ${destination}`, 'high');
  }

  announceRouteComplete() {
    this.currentStepIndex = -1; // Reset step tracking
    this.speak('You have arrived at your destination', 'high');
  }

  announceRecalculating() {
    this.speak('Recalculating route', 'normal');
  }

  announceStepNavigation(currentIndex: number, totalSteps: number) {
    this.speak(`Step ${currentIndex + 1} of ${totalSteps}`, 'normal');
  }

  resetStepTracking() {
    this.currentStepIndex = -1;
  }

  stop() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }
}

export const voiceNavigator = new VoiceNavigator();