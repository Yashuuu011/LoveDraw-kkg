import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ROMANTIC_CATEGORIES = [
  'Good morning',
  'Good night',
  'Cute',
  'Romantic',
  'Long-distance',
  'Missing you',
  'Appreciation',
  'Anniversary',
  'Motivation',
  'Soulmate',
  'Funny',
  'Deep love'
];

// Helper to generate 365 unique romantic quotes across categories
function generate365Messages() {
  const templates: { category: string; quotes: string[] }[] = [
    {
      category: 'Good morning',
      quotes: [
        "Good morning my love. Waking up knowing you exist makes every sunrise breathtaking. 🌅❤️",
        "May your morning be as bright and beautiful as your unforgettable smile. 💖",
        "Every morning brings a new reason to fall in love with you all over again. ☕✨",
        "Sunlight filters through, but nothing lights up my world quite like you do. 💕",
        "Good morning, sweetheart! Sending you a pocket full of warm hugs and soft kisses. 🌸",
        "Waking up with you in my heart is the sweetest luxury of life. 💌",
        "Good morning! Just a gentle reminder that you are loved beyond words today. ☀️❤️",
        "The best part of my morning is thinking about you. Have a wonderful day! 💞",
        "May your day be filled with quiet joy, sweet coffee, and endless thoughts of us. 🌷",
        "Good morning to the one who makes my heart beat a little faster every single day. 💕",
        "Rise and shine, my darling! The world is waiting for your warmth. 🌞❤️",
        "Good morning! Loving you is as natural as breathing, and just as vital. 💖",
        "Morning light arrives, but your love remains my favourite warmth. ☕💕",
        "Wishing a glowing morning to the person who holds my heart in their hands. ✨❤️",
        "Good morning, my happiness. Thank you for making life feel like a sweet song. 🎶❤️",
        "Every sunrise whispers your name to my soul. Have a magical morning! 🌸",
        "Good morning, beautiful! You are the first thought in my mind and the sweetest. 💕",
        "Sending you a warm morning embrace across the distance. Love you endlessly. 💖",
        "Good morning! Every new day is a blank canvas, and I want to paint it with our love. 🎨❤️",
        "May your morning coffee be hot and your thoughts of me be warm and sweet. ☕✨",
        "Good morning, my heart! May peace and love wrap around you like a soft blanket today. 💕",
        "Starting another day feeling incredibly lucky to have you in my story. ❤️",
        "Good morning! Remember that no matter how busy the day gets, you are my priority. 💗",
        "May your day be as gentle as your touch and as sweet as your voice. 🌸❤️",
        "Good morning to my favourite view in the world: your radiant smile. ✨💕",
        "Wake up, my love! Another day to dream together and build our forever. 🏡❤️",
        "Good morning! Your laughter is my absolute favourite melody. 🎶💞",
        "Sending a gentle breeze of morning kisses straight to your cheek. 💋💕",
        "Good morning! In the book of my life, you are my happiest chapter. 📖❤️",
        "May your morning bring you clarity, quiet delight, and the reassurance of my love. 💖"
      ]
    },
    {
      category: 'Good night',
      quotes: [
        "Good night, my love. Sleep softly and dream of the beautiful future waiting for us. 🌙✨",
        "May the stars watch over you tonight just as my thoughts surround you with warmth. 🌌❤️",
        "Close your eyes, darling. Tomorrow brings another day for me to love you even more. 💤💕",
        "Good night! I'll be looking for you in my sweetest dreams tonight. 🌠💖",
        "Rest easy, my heart. You are safe, cherished, and deeply adored. 🌙💕",
        "The moon is shining bright, but not nearly as bright as your place in my soul. ✨❤️",
        "Good night to the person who makes all my quiet evening thoughts peaceful. 🛋️💗",
        "May the night sky blanket you with peace and sweet serenity. Good night, love. 🌌🌸",
        "Sleeping feels so much sweeter knowing I get to wake up loving you. 💤❤️",
        "Good night, my sweetest sanctuary. Sending soft night kisses your way. 💋🌙",
        "As the day comes to an end, my gratitude for your love only grows deeper. 💖",
        "May your dreams be filled with warm breezes, starlight, and gentle happiness. 🌠💕",
        "Good night, darling. Thank you for being my constant comfort through every dusk. 🛋️❤️",
        "Count the stars, but remember each star is just one fraction of how much I care. 🌌✨",
        "Good night, my soul. Until tomorrow's sunrise, stay cozy and rest deeply. 💤💗",
        "The day was long, but knowing you exist makes every shadow soft. Good night. 🌙❤️",
        "May the silence of the night soothe your tired mind. Sleep peacefully, my love. 🌸💕",
        "Good night! Wrap yourself in blankets and feel my arms around you in spirit. 🧸💖",
        "Whispering a gentle 'I love you' into the moonlight for you to find in your sleep. 🌌💋",
        "Good night! Every night spent holding you in my thoughts is a peaceful night. 💤❤️",
        "May your sleep be restorative and your dreams filled with endless warmth. 🌙✨",
        "Good night, my love. May the night lullaby bring you tranquil rest. 🎶💖",
        "Closing my eyes with a smile because you are the last thought in my heart tonight. 💕",
        "Good night! Distance cannot stop my love from keeping you warm tonight. 🌌❤️",
        "Sleep sweet, my treasure. Another sunrise awaits us tomorrow. 🌅💗",
        "Good night! Thinking of your voice is my favourite lullaby. 🎶💕",
        "May the nighttime skies bring you calm and gentle dreams of us. 🌠❤️",
        "Good night, my love. Forever and always, my heart rests with yours. 🛋️💖",
        "Sending you infinite quiet hugs through the night air. Sleep tight. 🌌💋",
        "Good night, sweetheart. Sleep well knowing you are deeply loved beyond measures. 🌙✨"
      ]
    },
    {
      category: 'Cute',
      quotes: [
        "Some people make your life better simply by being in it. ❤️",
        "You are my favorite notification, my favorite distraction, and my favorite hello. 📱💕",
        "If holding your hand was a full-time job, I'd be the most dedicated worker ever. 🤝💖",
        "You're like hot cocoa on a snowy day—warm, sweet, and comforting. ☕❄️❤️",
        "I love you more than pizza, and that is saying a whole lot! 🍕💗",
        "You have no idea how fast my heart races whenever I see your name pop up. 💓✨",
        "Are you a camera? Because every time I look at you, I smile! 📷💕",
        "I might not be a photographer, but I can definitely picture us together forever. 🖼️❤️",
        "My heart skips a beat when I'm with you—or maybe that's just all the coffee! ☕💓",
        "You are the butter to my bread and the breath to my life. 🍞💖",
        "I'd pause my favorite game/show just to cuddle with you. 🎮🛋️❤️",
        "You're my favourite reason to lose sleep and my favourite reason to wake up. 😴✨",
        "If you were a vegetable, you'd be a cute-cumber! 🥒💕",
        "I'm 100% committed to being your professional huggiver for life. 🫂💖",
        "You make my heart do little happy dances all day long. 💃❤️",
        "You are my favourite human being in the entire universe! 🌌💓",
        "Can I borrow a kiss? I promise I'll give it right back! 💋✨",
        "You make life feel like a romantic comedy where everything turns out great. 🎬💖",
        "I like you a liiiiittle bit more than I originally planned. 😉💕",
        "My heart made a choice, and it chose you every single time. 🎯❤️",
        "You're cute, I'm cute... together we're double cute! 👯‍♂️💖",
        "Even on a bad day, one glance at you fixes everything. 🌈💕",
        "I love you more than cats love cardboard boxes! 📦🐱❤️",
        "If smiles were pennies, you'd make me the richest person alive. 💰💖",
        "You are the marshmallows in my hot chocolate! ☕🍡❤️",
        "I think you're suffering from a lack of ME in your day! 😉💕",
        "I'm wearing the smile you gave me! 😃💖",
        "You are my favorite plot twist in this crazy journey called life. 📖❤️",
        "If love was a song, you'd be the catchy chorus I repeat forever. 🎶💕",
        "You're basically my favorite person to annoy for the rest of my life! 😜❤️"
      ]
    },
    {
      category: 'Romantic',
      quotes: [
        "In a room full of art, I would still stare at you. 🎨❤️",
        "I fell in love with the way you touched my soul without using your hands. ✨💖",
        "If I had a flower for every time I thought of you, I could walk through my garden forever. 🌸❤️",
        "I love you not only for who you are, but for who I am when I am with you. 💞",
        "You are the song that my heart has been trying to sing all along. 🎶❤️",
        "My love for you is a journey starting at forever and ending at never. 🌌💖",
        "You are my sun, my moon, and all of my stars. ☀️🌙✨",
        "Every single moment spent with you is like a beautiful dream come true. 💭❤️",
        "I look at you and see the rest of my life before my eyes. 💍💖",
        "To love and be loved by you is to feel the warmth of the sun from both sides. ☀️💕",
        "You are the answer to every prayer I ever whispered to the night sky. 🌌❤️",
        "I never knew what true grace looked like until I met you. ✨💖",
        "With you, even the quietest silence feels like a rich melody. 🎶❤️",
        "I choose you. And I'll choose you over and over, without pause or doubt. 💘",
        "Your love is the gentle anchor that grounds my stormy days. ⚓❤️",
        "If my heart was a compass, every direction would point straight to you. 🧭💖",
        "You are the poetry I never knew how to write. ✍️❤️",
        "Meeting you was fate, becoming your partner was a choice, but falling in love was out of my control. 💫",
        "Your embrace is the only place in the world where I feel completely at home. 🏡❤️",
        "I want all of my tomorrows to start with you holding my hand. 🤝💖",
        "Love isn't something you find; love is something that finds you with open arms. 🌸❤️",
        "You turn ordinary moments into timeless treasures. 💎💖",
        "In your eyes, I found a reflection of the love I've searched for all my life. 👁️❤️",
        "You are my today and all of my tomorrows. 🌅💖",
        "Every love story is beautiful, but ours is my absolute favorite. 📖❤️",
        "I love you more than words can express and deeper than oceans can measure. 🌊💖",
        "When I hold your hand, I hold my world. 🌍❤️",
        "Your love is like a soft flame that warms without ever burning out. 🔥💖",
        "You are the piece of my heart I didn't know was missing. 🧩❤️",
        "Whatever our souls are made of, yours and mine are carved from the same light. ✨💖"
      ]
    },
    {
      category: 'Long-distance',
      quotes: [
        "Distance means so little when someone means so much. ✈️❤️",
        "No matter how many miles separate us, we are under the very same sky. 🌌💖",
        "Distance tests our endurance, but our love proves it's unbreakable. 🔗❤️",
        "I carry your heart with me everywhere I go, across every ocean and city. 💼💕",
        "Miles may lay between us, but you're only a heartbeat away in my mind. 💓✨",
        "True love doesn't mean being inseparable; it means being separated and nothing changes. 💖",
        "Every kilometer between us is just a future memory waiting to be celebrated together. 📍❤️",
        "The thought of holding you again makes every day apart worth enduring. 🫂💖",
        "We are connected by love, not geography. 🌐❤️",
        "Distance is just a physical boundary; our souls walk side by side. 👣💕",
        "Whenever I miss you, I look up at the moon and remember you're seeing it too. 🌙❤️",
        "Counting down the days until 'I miss you' turns into 'I'm home with you'. ⏳💖",
        "You are worth every single mile between us and every single minute of waiting. ⏱️❤️",
        "Long distance gives us a reason to love harder than ever before. 💗",
        "The ocean separates shores, but it cannot divide two hearts bound by destiny. 🌊❤️",
        "Distance gives us space to realize just how deeply we belong together. 🌌💖",
        "My heart flies across time zones just to be near you tonight. ✈️💕",
        "Though we are miles apart, you are the closest person to my soul. 💓❤️",
        "One day soon, we won't have to say goodbye, only goodnight. 🛋️💖",
        "Love knows no distance, no border, and no limit. 🗺️❤️",
        "Every message from you is a warm breeze from home. 📱🌸",
        "We might be apart physically, but in my heart, you've never left. 💖",
        "The best part of long distance is knowing that the best hugs are still to come. 🫂❤️",
        "No matter where I go, the road always leads back to you. 🛣️💖",
        "You're my favourite hello across the screen and my hardest goodbye. 💻💕",
        "Distance only makes our eventual reunion sweeter. 🍬❤️",
        "I don't mind waiting for you because I know you're the one worth waiting for. ⏳💖",
        "Our love story spans miles, maps, and moments of anticipation. 🗺️❤️",
        "Sending my heart across the miles to wrap you in love. 💌💖",
        "Together or apart, you are my forever home. 🏡❤️"
      ]
    },
    {
      category: 'Missing you',
      quotes: [
        "I miss you in ways that even words cannot understand. 💔❤️",
        "Every corner of my room reminds me of your gentle laughter. 🛋️💕",
        "My heart calls your name whenever the room grows quiet. 🤫💖",
        "Thinking of your smile is my favourite cure for missing you. 😊❤️",
        "I wish I could tele-transport straight into your arms right now. ⚡🫂",
        "Days without you feel like sentences without vowels. 📝💔",
        "Missing you comes in waves, and tonight I'm drowning in your memory. 🌊❤️",
        "I miss the sound of your voice whispering sweet nonsense into my ear. 👂💖",
        "If missing you was an art, I'd be a masterpiece painter. 🎨💕",
        "My days are spent waiting for the moment I get to see you again. ⏳❤️",
        "You left your footprint on my heart, and now everything reminds me of you. 👣💖",
        "Missing you isn't just a thought—it's a physical ache in my chest. 💓",
        "I miss the cozy silence we share when we don't even need to speak. ☕❤️",
        "Every song on the radio feels like it was written about missing you. 🎶💖",
        "I wish you were here to share this cup of coffee and this quiet moment. ☕💕",
        "Missing your warmth is a constant reminder of how deeply I care. 🔥❤️",
        "Come back soon, my heart is operating at half capacity without you! 🔌💖",
        "I miss your hugs—the kind that make everything else disappear. 🫂❤️",
        "Without you here, even the brightest colors seem a bit dim. 🎨💕",
        "Missing you is my heart's way of reminding me how much I love you. 💓❤️",
        "I catch myself smiling at old photos of us whenever I miss your face. 📸💖",
        "You have no idea how much I wish you were standing right next to me. 🧍‍♂️🧍‍♀️❤️",
        "The house feels too big and quiet when you aren't around. 🏠💕",
        "I miss your hand holding mine while we walk through the world. 🤝❤️",
        "My favorite place to be is inside your embrace, and I miss it terribly. 🫂💖",
        "Missing you is a habit my heart refuses to break. 💓❤️",
        "I wish I could fast-forward time until I can see you again. ⏩💕",
        "You are missing from every scene of my day. 🎥💔",
        "I miss the way you look at me like I'm the only person in the universe. 🌌❤️",
        "Counting down the hours until I can hold you again. ⏰💖"
      ]
    },
    {
      category: 'Appreciation',
      quotes: [
        "Thank you for being my constant calm in a chaotic world. 🌊❤️",
        "I appreciate the little things you do that no one else notices. 🔍💖",
        "Thank you for loving me even on the days I am hard to love. 🌿❤️",
        "Your kindness inspires me to be a better person every day. 🌟💖",
        "Thank you for choosing to walk through this life by my side. 👣❤️",
        "I appreciate how you listen with your whole heart and never judge. 👂💖",
        "Thank you for making our home feel like heaven on earth. 🏡❤️",
        "I appreciate your patience, your grace, and your endless laughter. 😄💖",
        "Thank you for holding my hand when the path gets steep. 🏔️❤️",
        "I appreciate the sacrifices you make for us every single day. 🎁💖",
        "Thank you for believing in my dreams even when I doubted myself. 🌈❤️",
        "I appreciate your warm hugs when the world feels cold. 🫂💖",
        "Thank you for being my anchor, my sail, and my harbour. ⛵❤️",
        "I appreciate the way you make even grocery shopping feel like an adventure. 🛒💖",
        "Thank you for making space for my feelings without question. 🛋️❤️",
        "I appreciate your gentle soul and your fierce loyalty. 🛡️💖",
        "Thank you for bringing out the absolute best version of me. 💎❤️",
        "I appreciate every laugh, every cup of tea, and every shared glance. ☕💖",
        "Thank you for being the person I can always rely on, no matter what. 🧱❤️",
        "I appreciate how you turn mundane days into sweet memories. 📸💖",
        "Thank you for giving me a safe place to land whenever I fail. 🛬❤️",
        "I appreciate the way your hand fits perfectly inside mine. 🤝💖",
        "Thank you for all the silent ways you show your deep love. 🤫❤️",
        "I appreciate your sense of humour and how you light up any room. 💡💖",
        "Thank you for accepting all my flaws and loving me anyway. 🧩❤️",
        "I appreciate your soft voice when I need reassurance. 🗣️💖",
        "Thank you for building a life with me brick by brick, memory by memory. 🧱❤️",
        "I appreciate your genuine warmth in a world that often forgets to care. ☀️💖",
        "Thank you for being my greatest cheerleader and soul partner. 📣❤️",
        "I appreciate you today, tomorrow, and for all the days to come. 🗓️💖"
      ]
    },
    {
      category: 'Anniversary',
      quotes: [
        "Happy Anniversary! Another year of loving you, and it feels like just the beginning. 🥂❤️",
        "Years pass by, but my heart stays captivated by you just like day one. 💍💖",
        "Happy Anniversary to my favorite journey, my favorite person, and my forever love. 🗺️❤️",
        "Growing old with you is my favourite adventure of all. 👵👴💖",
        "Happy Anniversary! We are living proof that true love exists and flourishes. 🌸❤️",
        "Every year with you is sweeter than the last. Cheers to us! 🍷💖",
        "Happy Anniversary! Thank you for another 365 days of unconditional love. 📅❤️",
        "Looking back at our story makes me excited for all our chapters ahead. 📖💖",
        "Happy Anniversary, my soulmate. I'd choose you in every lifetime. 💫❤️",
        "From our first kiss to this moment, loving you has been pure magic. 🪄💖",
        "Happy Anniversary! May our bond grow stronger with every passing season. 🍂🌸❤️",
        "You are my greatest achievement and my sweetest gift. Happy Anniversary! 🎁💖",
        "Happy Anniversary! Loving you is easy, staying together is sweet, and growing together is bliss. 🌱❤️",
        "Thank you for another year of shared laughter and quiet comfort. 🛋️💖",
        "Happy Anniversary to the one who still gives me butterflies after all this time. 🦋❤️",
        "We've made so many memories, yet I know our best days are still to come. 🌅💖",
        "Happy Anniversary, my darling. You are my anchor and my inspiration. ⚓❤️",
        "Another year around the sun with you is the greatest privilege of my life. ☀️💖",
        "Happy Anniversary! Our love story is my absolute favorite masterpiece. 🎨❤️",
        "Thank you for standing by me through every season of life. Happy Anniversary! 🍁💖",
        "Happy Anniversary! Every day with you feels like a romantic holiday. 🏝️❤️",
        "Here's to us, our dreams, and our unbreakable bond. Happy Anniversary! 🥂💖",
        "Happy Anniversary! You are the best decision I've ever made. 💘❤️",
        "Through thick and thin, our love only shines brighter. Happy Anniversary! 💡💖",
        "Happy Anniversary to my partner in crime, in love, and in life. 🕶️❤️",
        "Another year down, a lifetime left to go. Happy Anniversary! ♾️💖",
        "Happy Anniversary! You still make my heart race with just a smile. 🏎️❤️",
        "May our anniversary be a celebration of past joy and future adventures. 🗺️💖",
        "Happy Anniversary, my love. Forever is not long enough with you. ⏳❤️",
        "Here's to a lifetime of love, laughter, and endless coffee dates together. ☕💖"
      ]
    },
    {
      category: 'Motivation',
      quotes: [
        "You are capable of amazing things, and I'll be right here rooting for you! 🌟❤️",
        "Never doubt how strong, resilient, and brilliant you are, my love. 💪💖",
        "Whatever challenges today brings, remember we conquer them together as a team. 🛡️❤️",
        "Your hard work and dedication inspire me every single day. 🚀💖",
        "Take a deep breath. You've got this, and I've got you! 🌬️❤️",
        "Believe in yourself as much as I believe in you, and you will be unstoppable. ⚡💖",
        "The world is brighter because of your passion. Keep shining! 💡❤️",
        "Even on tough days, your courage shines through. So proud of you! 🏆💖",
        "Remember how far you've come. I am so honored to stand beside you. 🛤️❤️",
        "Your dreams are worth fighting for, and I will be your biggest supporter always. 📣💖",
        "Don't worry about perfection; just be your amazing self today. 🌿❤️",
        "Step by step, goal by goal, you are building a magnificent life. 🏗️💖",
        "Rest if you must, but never give up. I'm holding your hand through it all. 🤝❤️",
        "You possess a mind of brilliance and a heart of gold. Go conquer today! 👑💖",
        "No matter what storm comes, your strength will weather it, and I'll keep you warm. ☔❤️",
        "Your potential is limitless. Go show the world what you can do! 🌌💖",
        "I believe in your vision and your power to make it a reality. 🔮❤️",
        "Be gentle with yourself today. You are doing fantastic! 🌸💖",
        "Every small victory counts. Celebrating you today and every day! 🎉❤️",
        "You are stronger than any obstacle in your path. I love you! 🧱💖",
        "Keep pushing forward, my darling. Great things take time and heart. ⏳❤️",
        "Your light cannot be dimmed by temporary shadows. Shine on! ☀️💖",
        "I admire your courage, your work ethic, and your tender heart. 💖",
        "When you feel overwhelmed, close your eyes and remember my arms around you. 🫂❤️",
        "You turn obstacles into stepping stones. So proud of your spirit! 🧗‍♂️💖",
        "Dream big, my love. I am right behind you every step of the way. 👣❤️",
        "Your determination is breathtaking. Go make today count! 🎯💖",
        "You are a force of nature—kind, driven, and unstoppable. 🌊❤️",
        "Never forget how deeply loved and supported you are while chasing your dreams. 🌈💖",
        "Today is a brand new opportunity to shine. I love you endlessly! 🌟❤️"
      ]
    },
    {
      category: 'Soulmate',
      quotes: [
        "In a sea of people, my eyes will always search for you. 🌊👁️❤️",
        "Our souls recognized each other long before our eyes ever met. 🌌💖",
        "A soulmate isn't someone who completes you, but someone who inspires you to complete yourself. ✨❤️",
        "I recognized you in an instant; our souls must have loved each other in past lives. ⌛💖",
        "You are my mirror, my opposite, my home, and my soulmate. 🏡❤️",
        "When I am with you, my mind feels at absolute peace. 🕊️💖",
        "Finding you felt like finding the missing key to a lock I didn't know existed. 🔑❤️",
        "We are two halves of the same spirit floating through time together. 🕊️💖",
        "You feel like home in a world that is constantly changing. 🏠❤️",
        "My heart knew it belonged to you the second you smiled at me. 😊💖",
        "Our connection is beyond explanation—it's written in the stars. 🌌❤️",
        "With you, love isn't a struggle; it's as natural as inhaling air. 🌬️💖",
        "You are the person I was made to love and protect. 🛡️❤️",
        "I never believed in destiny until our paths crossed seamlessly. 🛤️💖",
        "You understand my silence just as deeply as my words. 🤫❤️",
        "We aren't just partners; we are soulmates navigating existence together. 🚀💖",
        "Loving you feels like remembering a beautiful song I've known forever. 🎶❤️",
        "My soul felt safe the moment you stepped into my life. 🛡️💖",
        "You are the calm in my chaos and the light in my darkness. 💡❤️",
        "We were crafted for each other's peace and happiness. 🧩💖",
        "Meeting you was like returning home after a very long journey. 🏡❤️",
        "No matter where life takes us, our souls remain entwined. 🧵💖",
        "You are my forever person, my confidant, and my deepest truth. 💎❤️",
        "Our love doesn't age; it simply deepens with every breath. ⏳💖",
        "You hold the key to my heart, and I never want it back. 🔑❤️",
        "In your presence, all my anxieties melt into quiet joy. 🧘‍♂️💖",
        "We are bound by something far stronger than words or distance. 🔗❤️",
        "You are the twin flame that lights up my entire destiny. 🔥💖",
        "I loved you yesterday, I love you today, and my soul will love you forever. ♾️❤️",
        "Soulmates are rare, and finding you is my life's greatest blessing. 🙏💖"
      ]
    },
    {
      category: 'Funny',
      quotes: [
        "I love you even when you steal all the blankets at 3 AM! 🛌😂❤️",
        "I love you more than coffee, but please don't test me before my first cup! ☕😜💖",
        "Are you a magician? Because whenever I look at you, everyone else disappears (or maybe I need glasses)! 👓😆❤️",
        "I love you with all my belly. I would say heart, but my belly is bigger! 🍔🤪💖",
        "You're the only person I would share my fries with... well, maybe 3 fries! 🍟😆❤️",
        "I love you so much I'd even listen to you talk about your fantasy league! 🏈🤣💖",
        "You are my favourite person to annoy for the rest of my life! 😜❤️",
        "I love you like a nerd loves video games. Totally obsessed! 🎮🤪💖",
        "I'd still love you even if you turned into a giant worm! 🐛😂❤️",
        "You're the reason I look down at my phone and smile... and then walk into a wall! 📱💥🤣",
        "I love you more than lazy Sundays... and that is serious business! 🛋️😜❤️",
        "We go together like copy and paste! 💻😆💖",
        "I love you enough to let you have the last bite of dessert! 🍰🤪❤️",
        "You're my favourite weirdo in the whole world! 🤪💖",
        "I promise to always love you, even when you leave empty milk cartons in the fridge! 🥛🤣❤️",
        "I love you like a fat kid loves cake! 🎂😜💖",
        "You are the cheese to my macaroni, even if you are a bit cheesy sometimes! 🧀😆❤️",
        "If you were a burger at McDonald's, you'd be the McGorgeous! 🍔🤣💖",
        "I love you more than I love complaining about the weather! ☀️🌧️😜❤️",
        "You're the only one I'd survive a zombie apocalypse with! 🧟‍♂️🤣💖",
        "I love you even though you snore like a tractor! 🚜😴❤️",
        "I love you more than my bed, and that's saying something! 🛏️😜💖",
        "You're my favorite human to be socially awkward with! 🧍‍♂️🧍‍♀️🤣❤️",
        "I'm yours! No refunds or exchanges allowed! 🏷️🤪💖",
        "I love you so much I don't even mind when you spoil the movie ending! 🎬😆❤️",
        "You're the ketchup to my fries—messy but essential! 🍟😜💖",
        "I love you even when you take 40 minutes to choose what to eat on Swiggy! 🍕🤣❤️",
        "I love you more than sleeping in on a Monday morning! ⏰😜💖",
        "You are the highlight of my day and the main culprit of my distraction! 💡😆❤️",
        "Thanks for being as weird as I am! 🤪💖"
      ]
    },
    {
      category: 'Deep love',
      quotes: [
        "My love for you is not a fleeting feeling; it is the fundamental truth of my life. 🏛️❤️",
        "You have reshaped my understanding of grace, commitment, and devotion. ✨💖",
        "To love you is to experience heaven in human form. ☁️❤️",
        "If I could give you one thing in life, I would give you the ability to see yourself through my eyes. 👁️💖",
        "Our connection is rooted in the quiet depths of our shared values and dreams. 🌳❤️",
        "I carry your happiness in my chest like a sacred responsibility. 🛡️💖",
        "You are my safe space, my highest truth, and my greatest blessing. 🙏❤️",
        "My soul knew peace the instant you held my hand. 🤝💖",
        "Loving you has taught me what it truly means to live selflessly. 🕊️❤️",
        "You are the quiet sanctuary where my heart goes to heal and rest. 🛋️💖",
        "I love you not for what you have, but for the profound beauty of who you are inside. 💎❤️",
        "Through every hardship and joy, my devotion to you remains unwavering. 🧱💖",
        "You are the light that gently guides me out of my darkest thoughts. 💡❤️",
        "My heart belongs to you completely, without reservation or fear. 💓💖",
        "Every breath I draw feels richer because I share this world with you. 🌬️❤️",
        "You are the home I searched for across a thousand wandering paths. 🏡💖",
        "In your eyes, I see the past, present, and eternal promise of our love. 🌌❤️",
        "My love for you grows stronger with every test and deeper with every silent night. 🌙💖",
        "You are the masterpiece of my life's story. 🎨❤️",
        "I promise to honor, respect, and cherish your heart as long as I live. 🤝💖",
        "Your love is the foundation upon which I build all my hopes. 🏗️❤️",
        "You make me feel whole, seen, and profoundly understood. 🪞💖",
        "I choose you in times of joy, in times of sorrow, and in every quiet moment between. 🕊️❤️",
        "My heart beats in harmony with yours, forming a sacred rhythm of life. 🎶💖",
        "You are my compass, guiding me toward love, patience, and truth. 🧭❤️",
        "Loving you is the easiest and most meaningful thing I have ever done. 🌿💖",
        "You are the anchor that keeps me steady when life's tides grow rough. ⚓❤️",
        "My soul is forever intertwined with yours in grace and devotion. 🧵💖",
        "Thank you for showing me what unconditional, pure love truly feels like. 🌸❤️",
        "I am yours, completely and eternally, through every universe and lifespan. 🌌💖",
        "Every morning I wake up and realize you are my dream come true. 🌅❤️",
        "Your love gives me wings to fly and a solid ground to return to. 🦅💖",
        "With you, I have found everything my heart ever sought. 💘❤️",
        "You are my heart's quiet home and my soul's loud victory. 🏆💖",
        "Forever is just the beginning of how long I intend to love you. ♾️❤️"
      ]
    }
  ];

  const allMessages: { message: string; category: string }[] = [];

  // Add template quotes
  templates.forEach(t => {
    t.quotes.forEach(q => {
      allMessages.push({ message: q, category: t.category });
    });
  });

  // Supplement up to 365+ unique messages
  let index = 1;
  while (allMessages.length < 368) {
    const cat = ROMANTIC_CATEGORIES[(index - 1) % ROMANTIC_CATEGORIES.length];
    allMessages.push({
      message: `Love Note #${index}: "Every single moment spent by your side turns life into an unforgettable masterpiece. 💕"`,
      category: cat
    });
    index++;
  }

  return allMessages;
}

async function main() {
  console.log('🌱 Starting LoveDraw database seeding...');

  // Clean existing database
  await prisma.auditLog.deleteMany();
  await prisma.winner.deleteMany();
  await prisma.entry.deleteMany();
  await prisma.memory.deleteMany();
  await prisma.draw.deleteMany();
  await prisma.favoriteMessage.deleteMany();
  await prisma.dailyMessage.deleteMany();
  await prisma.user.deleteMany();
  await prisma.admin.deleteMany();

  console.log('🧹 Cleaned existing database tables.');

  // Create Admin
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.create({
    data: {
      username: 'admin',
      email: 'admin@lovedraw.com',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN'
    }
  });
  console.log(`👤 Created Admin: ${admin.email}`);

  // Create Users
  const userPasswordHash = await bcrypt.hash('user123', 10);

  const user1 = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah@lovedraw.com',
      passwordHash: userPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    }
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'alex@lovedraw.com',
      passwordHash: userPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    }
  });

  const demoUser = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'user@lovedraw.com',
      passwordHash: userPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    }
  });

  console.log(`👥 Created ${3} demo users.`);

  // Create 365 Daily Messages
  const messagesData = generate365Messages();
  await prisma.dailyMessage.createMany({
    data: messagesData.map(m => ({
      message: m.message,
      category: m.category,
      active: true
    }))
  });
  console.log(`💌 Seeded ${messagesData.length} unique romantic daily messages.`);

  // Create Draws
  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const pastDrawDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const septemberDraw = await prisma.draw.create({
    data: {
      title: 'September Love Draw ❤️',
      description: 'Win a romantic luxury getaway photoshoot package for two, complete with custom framed memory canvas!',
      type: 'MONTHLY',
      startDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      endDate: thirtyDaysLater,
      drawDate: thirtyDaysLater,
      status: 'ACTIVE',
      prizeTitle: 'Luxury Couple Photoshoot & Memory Canvas',
      prizeDescription: 'A 3-hour professional sunset couple session with custom photo album and 24x36 high-definition canvas print delivered to your home.',
      prizeImage: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80',
      entryPriceINR: 99
    }
  });

  const weeklyDraw = await prisma.draw.create({
    data: {
      title: 'Romantic Stargazing Picnic Box ✨',
      description: 'Win a gourmet candlelit picnic hamper with artisan chocolates, sparkling cider, and personal constellation map.',
      type: 'WEEKLY',
      startDate: now,
      endDate: sevenDaysLater,
      drawDate: sevenDaysLater,
      status: 'ACTIVE',
      prizeTitle: 'Gourmet Candlelit Stargazing Picnic Set',
      prizeDescription: 'Deluxe velvet picnic blanket, Bluetooth speaker, wine glasses, gourmet snacks, and starry sky projector.',
      prizeImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80',
      entryPriceINR: 49
    }
  });

  const completedDraw = await prisma.draw.create({
    data: {
      title: 'August Sunset Romance Draw 🌅',
      description: 'Exclusive couple fine dining voucher & personalized silver lockets.',
      type: 'MONTHLY',
      startDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      endDate: pastDrawDate,
      drawDate: pastDrawDate,
      status: 'COMPLETED',
      prizeTitle: '5-Course Sunset Fine Dining & Silver Locket Set',
      prizeDescription: 'Romantic dinner overlooking the ocean with custom engraved sterling silver couple lockets.',
      prizeImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
      entryPriceINR: 99
    }
  });

  console.log(`🎲 Seeded 3 Draws (2 Active, 1 Completed).`);

  // Create Entries for active and completed draws
  const entry1 = await prisma.entry.create({
    data: {
      userId: user1.id,
      drawId: septemberDraw.id,
      referenceCode: 'LD-2026-09-000101',
      status: 'COMPLETED',
      paymentMode: 'DEMO'
    }
  });

  const entry2 = await prisma.entry.create({
    data: {
      userId: user2.id,
      drawId: septemberDraw.id,
      referenceCode: 'LD-2026-09-000102',
      status: 'COMPLETED',
      paymentMode: 'DEMO'
    }
  });

  const entryDemo = await prisma.entry.create({
    data: {
      userId: demoUser.id,
      drawId: septemberDraw.id,
      referenceCode: 'LD-2026-09-000103',
      status: 'COMPLETED',
      paymentMode: 'DEMO'
    }
  });

  const completedEntry = await prisma.entry.create({
    data: {
      userId: user1.id,
      drawId: completedDraw.id,
      referenceCode: 'LD-2026-08-000088',
      status: 'COMPLETED',
      paymentMode: 'DEMO'
    }
  });

  console.log(`🎟️ Seeded demo entries.`);

  // Create Winner for completed draw
  const winner = await prisma.winner.create({
    data: {
      drawId: completedDraw.id,
      entryId: completedEntry.id,
      userId: user1.id,
      announcementNote: 'Congratulations to Sarah & Mark! May your love shine forever brighter than the sunset! ❤️'
    }
  });

  // Create Audit Log
  await prisma.auditLog.create({
    data: {
      drawId: completedDraw.id,
      action: 'SELECT_WINNER',
      metadata: JSON.stringify({
        winnerUserId: user1.id,
        entryId: completedEntry.id,
        totalEntries: 1,
        selectedBy: 'SYSTEM_FAIR_RNG',
        timestamp: pastDrawDate.toISOString()
      })
    }
  });

  // Create Memories
  await prisma.memory.createMany({
    data: [
      {
        title: 'Sunset Beach Embrace 🌅',
        description: 'August Winner Sarah & Mark enjoying their beachside fine dining experience under romantic golden rays.',
        imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80',
        date: pastDrawDate,
        drawId: completedDraw.id,
        winnerName: 'Sarah & Mark'
      },
      {
        title: 'Starry Sky Picnic Night ✨',
        description: 'A cozy evening under the milky way, celebrating true connection and warmth.',
        imageUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&auto=format&fit=crop&q=80',
        date: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
        winnerName: 'Alex & Elena'
      },
      {
        title: 'Mountain Top Proposal ⛰️❤️',
        description: 'Captured moment when two hearts promised forever amidst snow-capped peaks.',
        imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80',
        date: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
        winnerName: 'David & Sophia'
      },
      {
        title: 'Cozy Morning Coffee in Bed ☕',
        description: 'Soft lighting, warm blankets, and endless laughs to start another romantic month.',
        imageUrl: 'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=800&auto=format&fit=crop&q=80',
        date: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        winnerName: 'Rohan & Ananya'
      }
    ]
  });

  console.log(`🖼️ Seeded memories gallery.`);

  console.log('✅ LoveDraw database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
