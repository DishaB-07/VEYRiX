/**
 * VEYRiX Theme & Humanized Guidelines
 * 
 * A calm, fresh, attractive palette inspired by serene coastal spruce,
 * fresh seafoam, eucalyptus mint, and airy glacier sky.
 * Designed to provide peace of mind and reassurance during stressful call verification.
 */

export const THEME = {
  colors: {
    // Calm & Fresh canvas
    bgCanvas: '#0a131c', // Deep tranquil spruce-slate
    bgSurface: '#0f1b26', // Calming dark card surface
    bgSurfaceElevated: '#142433', // Slightly raised card surface
    bgInput: '#0c1620', // Input and deep container wells
    
    // Fresh accents
    mint: '#2dd4bf',
    emerald: '#10b981',
    seafoam: '#34d399',
    glacierSky: '#38bdf8',
    
    // Warm reassurance / warnings
    honey: '#f59e0b',
    softCoral: '#f43f5e',
  },
  
  // Reassuring human-centered messages
  privacyPromise: '100% Private & Safe: Voice processing happens right inside your browser. Your audio is never stored or sent to remote servers.',
  goldenRule: 'The Golden Rule: Never send money or share codes during an unexpected call. Always hang up and call the person back on a known, trusted number.',
};

export const HUMANIZED_SAFETY_STEPS = [
  {
    title: 'Take a Calm Breath',
    description: 'Scammers deliberately invent fake emergencies to rush you into making a mistake. Taking 30 seconds to pause instantly breaks their momentum.',
    icon: 'HeartHandshake',
  },
  {
    title: 'Hang Up & Call Back Directly',
    description: 'Never use the phone number they give you on the call. Dial your family member, coworker, or bank using the number saved in your personal contacts.',
    icon: 'PhoneForwarded',
  },
  {
    title: 'Ask a Personal Family Question',
    description: 'Ask a simple question only the real person would know (like "What was our pet\'s name growing up?" or "Where did we eat last Sunday?"). AI bots cannot answer unexpected personal trivia.',
    icon: 'HelpCircle',
  },
  {
    title: 'Keep Passcodes & Money Safe',
    description: 'Real executives and real banks will never fire you or arrest you for verifying a financial request through official channels first.',
    icon: 'ShieldCheck',
  },
];
