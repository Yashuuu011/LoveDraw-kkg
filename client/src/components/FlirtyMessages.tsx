import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const FLIRTY_MESSAGES = [
  "Ketuu babyy, looking this cute should be illegal 😩❤️",
  "My love, how do you manage to steal my heart every single time? 🫠💋",
  "Shona, you're not just my favorite person, you're my favorite distraction 😏❤️",
  "Raja babu, come here… your queen is missing you 👑😘",
  "Cutie pie, stop being so adorable, I'm already obsessed 🥹❤️",
  "Ohh mere humsafar, bas tum saath raho, aur kya chahiye mujhe? 🫶🏻💞",
  "Dilruba, dil toh pehle hi le gaye, ab jaan bhi loge kya? 😩❤️🔥",
  "Janeman, tumhe dekhte hi meri smile automatically aa jaati hai 🫠💕",
  "Jannu, you're my favorite notification, favorite person, favorite everything 🥰",
  "Husband, looking this handsome without my permission? 😏💍❤️",
  "Baby, you're seriously making it impossible for me to behave 😭😏❤️",
  "Raja babu, ek baar smile kar do… phir main poora din tumpe fida rahungi 😏❤️",
  "Dilruba, tum photo daalte ho ya mera sukoon churaane aate ho? 🫠💋",
  "Jannu, warning de diya karo… itna handsome dekh ke heart attack aa sakta hai 😭❤️🔥",
  "Husband, looking at you like “haan ji, ye mera hai” 😌💍",
  "Baby, pretty sure you owe me a kiss for looking this good 😏💋",
  "Mere humsafar, duniya chahe jitni beautiful ho, meri nazar toh tumpe hi rukti hai ❤️",
  "Ketuu babyy, tum mere ho… bas ye reminder dene aayi thi 😌❤️🔥",
  // NEW ADDITIONS
  "Shona, are you a magician? Because whenever I look at you, everyone else disappears 🪄❤️",
  "Janeman, if kisses were snowflakes, I'd send you a blizzard ❄️💋",
  "Dilruba, your smile is literally the cutest thing I've ever seen in my life 🥺💕",
  "Husband, stop living in my head rent-free and come cuddle me already 😤🧸❤️",
  "Ketuu babyy, I must be a museum because I'm totally admiring a masterpiece right now 🖼️😏❤️",
  "Raja babu, you're my favorite reason to lose sleep 🌙💭",
  "Baby, do you have a Band-Aid? I just scraped my knee falling for you again 🩹😂❤️",
  "Jannu, meri har duaa mein bas tumhara hi naam hota hai 🤲🏻💖",
  "Mere humsafar, you're the peanut butter to my jelly 🥜🍓❤️",
  "Cutie pie, seeing your name pop up is the best part of my day 📱🥰"
];

// Fisher-Yates shuffle to guarantee true randomness without repeats
const shuffleArray = (array: string[]) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const FlirtyMessages: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const messageQueue = useRef<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    let intervalId: ReturnType<typeof setInterval>;

    const triggerMessage = () => {
      // If queue is empty, shuffle all messages and fill the queue
      if (messageQueue.current.length === 0) {
        messageQueue.current = shuffleArray(FLIRTY_MESSAGES);
      }
      
      // Pop the next unique message from the queue
      const nextMsg = messageQueue.current.pop();
      if (nextMsg) {
        showToast(nextMsg, 'love');
      }
    };

    // Trigger the first message after a short 5-second delay to delight the user immediately
    timeoutId = setTimeout(() => {
      triggerMessage();

      // Then continue to send a message every 10 minutes (600,000 ms)
      intervalId = setInterval(triggerMessage, 10 * 60 * 1000);
    }, 5000);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAuthenticated, showToast]);

  return null; // This is a logic-only component
};

export default FlirtyMessages;
