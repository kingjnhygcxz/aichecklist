import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Crown, Diamond } from "lucide-react";
import { Achievement } from "@shared/schema";
import { FireworksEffect } from "@/components/ui/FireworksEffect";

interface AchievementNotificationProps {
  achievement: Achievement | null;
  isVisible: boolean;
  onClose: () => void;
}

const rarityColors = {
  common: "from-yellow-500 to-orange-500",
  rare: "from-orange-500 to-red-500", 
  epic: "from-red-500 to-pink-500",
  legendary: "from-amber-500 to-yellow-600",
};

const rarityIcons = {
  common: Star,
  rare: Trophy,
  epic: Crown,
  legendary: Diamond,
};

export function AchievementNotification({ 
  achievement, 
  isVisible, 
  onClose 
}: AchievementNotificationProps) {
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    if (isVisible && achievement) {
      setShowFireworks(true);
      
      // Auto-close after 4 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, achievement, onClose]);

  if (!achievement) return null;

  const RarityIcon = rarityIcons[achievement.rarity];
  const gradientColor = rarityColors[achievement.rarity];

  return (
    <>
      <FireworksEffect 
        isActive={showFireworks} 
        onComplete={() => setShowFireworks(false)}
      />
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`relative bg-gradient-to-br ${gradientColor} rounded-xl p-6 max-w-md w-full text-white shadow-2xl`}
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl blur opacity-40" />
              
              <div className="relative">
                <div className="text-center mb-4">
                  <motion.div
                    className="inline-block mb-2"
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 0.6,
                      repeat: 2,
                      ease: "easeInOut"
                    }}
                  >
                    <RarityIcon className="h-16 w-16 mx-auto text-white drop-shadow-lg" />
                  </motion.div>
                  
                  <motion.h2 
                    className="text-2xl font-bold mb-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Achievement Unlocked!
                  </motion.h2>
                  
                  <motion.div
                    className="text-sm uppercase tracking-wide opacity-90 mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {achievement.rarity} Achievement
                  </motion.div>
                </div>

                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-xl font-semibold mb-2">
                    {achievement.name}
                  </h3>
                  <p className="text-white/90 mb-4">
                    {achievement.description}
                  </p>
                  
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4" />
                      <span>{achievement.points} points</span>
                    </div>
                  </div>
                </motion.div>

                <motion.button
                  onClick={onClose}
                  className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}