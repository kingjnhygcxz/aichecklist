import React from 'react';

// Global audio elements that need to be available across all tabs
export const GlobalAudioElements: React.FC = () => {
  return (
    <div style={{ display: 'none' }}>
      {/* Timer alarm sounds */}
      <audio id="happy-bells" preload="auto">
        <source src="/attached_assets/mixkit-happy-bells-notification-937_1754888838454.wav" type="audio/wav" />
      </audio>
      <audio id="arcade-score" preload="auto">
        <source src="/attached_assets/mixkit-arcade-score-interface-217_1754888838451.wav" type="audio/wav" />
      </audio>
      <audio id="kids-cartoon-bells" preload="auto">
        <source src="/attached_assets/mixkit-kids-cartoon-close-bells-2256_1754888838454.wav" type="audio/wav" />
      </audio>
      <audio id="page-forward" preload="auto">
        <source src="/attached_assets/mixkit-page-forward-single-chime-1107 (1)_1754888838456.wav" type="audio/wav" />
      </audio>
      <audio id="relaxing-bell" preload="auto">
        <source src="/attached_assets/mixkit-relaxing-bell-chime-3109_1754891549153.wav" type="audio/wav" />
      </audio>
      <audio id="small-win" preload="auto">
        <source src="/attached_assets/mixkit-small-win-2020_1754891549153.wav" type="audio/wav" />
      </audio>
      <audio id="street-alarm" preload="auto">
        <source src="/attached_assets/mixkit-street-public-alarm-997_1754891549153.wav" type="audio/wav" />
      </audio>
      <audio id="trumpet-fanfare" preload="auto">
        <source src="/attached_assets/mixkit-trumpet-fanfare-2293_1754891549154.wav" type="audio/wav" />
      </audio>
      <audio id="unlock-game" preload="auto">
        <source src="/attached_assets/mixkit-unlock-game-notification-253_1754891549154.wav" type="audio/wav" />
      </audio>
      <audio id="uplifting-bells" preload="auto">
        <source src="/attached_assets/mixkit-uplifting-bells-notification-938_1754891549154.wav" type="audio/wav" />
      </audio>
      <audio id="winning-notification" preload="auto">
        <source src="/attached_assets/mixkit-winning-notification-2018_1754891549154.wav" type="audio/wav" />
      </audio>
      <audio id="achievement-drums" preload="auto">
        <source src="/attached_assets/mixkit-achievement-win-drums-555_1754888838450.wav" type="audio/wav" />
      </audio>
      <audio id="bell-promise" preload="auto">
        <source src="/attached_assets/mixkit-bell-of-promise-930_1754888838451.wav" type="audio/wav" />
      </audio>
      <audio id="drums-war-1" preload="auto">
        <source src="/attached_assets/mixkit-drums-of-war-call-2780 (1)_1754888838452.wav" type="audio/wav" />
      </audio>
      <audio id="electronics-power" preload="auto">
        <source src="/attached_assets/mixkit-electronics-power-up-2602_1754888838453.wav" type="audio/wav" />
      </audio>
      <audio id="elegant-door" preload="auto">
        <source src="/attached_assets/mixkit-elegant-door-announcement-224_1754888838453.wav" type="audio/wav" />
      </audio>
      <audio id="epic-orchestra" preload="auto">
        <source src="/attached_assets/mixkit-epic-orchestra-transition-2290_1754888838453.wav" type="audio/wav" />
      </audio>
      <audio id="facility-alarm" preload="auto">
        <source src="/attached_assets/mixkit-facility-alarm-sound-999_1754888838453.wav" type="audio/wav" />
      </audio>
      <audio id="flute-notification" preload="auto">
        <source src="/attached_assets/mixkit-flute-mobile-phone-notification-alert-2316_1754888838454.wav" type="audio/wav" />
      </audio>
      <audio id="guitar-stroke" preload="auto">
        <source src="/attached_assets/mixkit-guitar-stroke-down-slow-2339_1754888838454.wav" type="audio/wav" />
      </audio>
      <audio id="high-tech-bleep" preload="auto">
        <source src="/attached_assets/mixkit-high-tech-bleep-confirmation-2520_1754888838454.wav" type="audio/wav" />
      </audio>
      <audio id="melodic-gold" preload="auto">
        <source src="/attached_assets/mixkit-melodic-gold-price-2000_1754888838455.wav" type="audio/wav" />
      </audio>
      <audio id="mythical-violin-1" preload="auto">
        <source src="/attached_assets/mixkit-mythical-violin-jingle-2281 (1)_1754888838455.wav" type="audio/wav" />
      </audio>
      <audio id="orchestral-violin" preload="auto">
        <source src="/attached_assets/mixkit-orchestral-violin-jingle-2280_1754888838455.wav" type="audio/wav" />
      </audio>
    </div>
  );
};