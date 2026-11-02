/* Talk It! scenario data. title/desc in Hungarian, goal = English instruction for the tutor. */
window.SCENARIOS = {
  A1: [
    { id: 'intro', ic: '👋', t: 'Bemutatkozás', d: 'Köszönj, mondd meg a neved és honnan jöttél.', role: 'a friendly new classmate named Emma in Chicago', goal: 'Get to know the learner: name, country, city, job, hobbies.', demo: true },
    { id: 'coffee', ic: '☕', t: 'Kávé rendelés', d: 'Rendelj egy kávét egy amerikai kávézóban.', role: 'a barista at a coffee shop in Seattle', goal: 'Take the learner\'s order: drink, size, milk, for here or to go, price.', demo: true },
    { id: 'directions', ic: '🗺️', t: 'Útbaigazítás', d: 'Kérdezd meg, hol van a múzeum vagy a metró.', role: 'a helpful local on a street in New York', goal: 'Help the learner find a place. Give very simple directions (left, right, straight).', demo: true },
    { id: 'store', ic: '🛒', t: 'Vásárlás a boltban', d: 'Keress termékeket, kérdezd meg az árat.', role: 'a store clerk in a small grocery store', goal: 'Help the learner buy food items, tell prices, ask about paying.', demo: true },
    { id: 'family', ic: '👨‍👩‍👧', t: 'Család', d: 'Beszélj a családodról.', role: 'a friendly neighbor', goal: 'Ask simple questions about the learner\'s family.' },
    { id: 'daily', ic: '⏰', t: 'Napi rutin', d: 'Mesélj a napodról: kelés, munka, este.', role: 'a curious new friend', goal: 'Ask about the learner\'s daily routine with simple present tense.' },
    { id: 'weather', ic: '🌤️', t: 'Időjárás', d: 'Egyszerű beszélgetés az időjárásról.', role: 'a person waiting at a bus stop', goal: 'Small talk about the weather and seasons.' }
  ],
  A2: [
    { id: 'restaurant', ic: '🍔', t: 'Étteremben', d: 'Asztalfoglalás, rendelés, számla kérése.', role: 'a waiter at an American diner', goal: 'Seat the learner, take a food and drink order, offer dessert, bring the check.', demo: true },
    { id: 'hotel', ic: '🏨', t: 'Bejelentkezés a hotelbe', d: 'Foglalás ellenőrzése, szoba, reggeli.', role: 'a hotel receptionist in Boston', goal: 'Check the learner in: name, reservation, nights, breakfast, wifi, room key.' },
    { id: 'doctor', ic: '🩺', t: 'Orvosnál', d: 'Mondd el, mi a panaszod.', role: 'a doctor at a walk-in clinic', goal: 'Ask about symptoms, how long, give simple advice.' },
    { id: 'phone', ic: '📞', t: 'Telefonos csevegés', d: 'Könnyed beszélgetés egy baráttal telefonon.', role: 'an American friend calling the learner', goal: 'Casual phone small talk: how are you, what are you doing, make a simple plan.' },
    { id: 'airport', ic: '✈️', t: 'Repülőtéren', d: 'Check-in, csomag, beszállókapu.', role: 'an airline check-in agent at JFK airport', goal: 'Check the learner in: passport, destination, bags, seat, gate and time.' },
    { id: 'shopping', ic: '👕', t: 'Ruhavásárlás', d: 'Méret, szín, felpróbálás, csere.', role: 'a sales assistant in a clothing store', goal: 'Help the learner find clothes: size, color, fitting room, price.' },
    { id: 'pastweekend', ic: '📅', t: 'Mit csináltál?', d: 'Mesélj a múlt hétvégédről (múlt idő).', role: 'a coworker on Monday morning', goal: 'Ask what the learner did last weekend. Practice simple past.' }
  ],
  B1: [
    { id: 'opinions', ic: '💭', t: 'Vélemények', d: 'Mondd el a véleményed és indokold.', role: 'a friendly discussion partner', goal: 'Discuss everyday topics (social media, city vs. countryside). Ask for reasons and examples.' },
    { id: 'weekend', ic: '🎒', t: 'Hétvégi tervek', d: 'Tervezz programot, egyeztess időpontot.', role: 'a friend who wants to make plans', goal: 'Make weekend plans together: suggestions, agreeing, disagreeing politely, future forms.' },
    { id: 'interview', ic: '💼', t: 'Állásinterjú alapok', d: 'Mutasd be a tapasztalatod és erősségeid.', role: 'a hiring manager at a US company', goal: 'Run a short, friendly job interview: tell me about yourself, strengths, experience, questions.' },
    { id: 'hobbies', ic: '⚽', t: 'Filmek, sport, sakk', d: 'Filmek, sport, sakk vagy akár a Liverpool!', role: 'an enthusiastic friend who loves movies, sports, chess and Premier League soccer (especially Liverpool FC)', goal: 'Chat about the learner\'s favorite movies, sports, chess, or Liverpool FC. Ask follow-up questions.' },
    { id: 'complaint', ic: '🎧', t: 'Ügyfélszolgálat', d: 'Oldj meg egy problémát: hibás termék, visszatérítés.', role: 'a customer service agent at an online store', goal: 'The learner has a problem with an order. Ask for details, offer solutions (refund, replacement).' },
    { id: 'travel', ic: '🌎', t: 'Utazási élmények', d: 'Mesélj egy emlékezetes utazásról.', role: 'a traveler you met in a hostel', goal: 'Talk about travel experiences, present perfect and past simple.' }
  ]
};
window.FREE_TOPICS = [
  ['🎬', 'Filmek és sorozatok', 'movies and TV series'], ['🎵', 'Zene', 'music'], ['🍳', 'Főzés és ételek', 'cooking and food'],
  ['⚽', 'Sport', 'sports'], ['♟️', 'Sakk', 'chess'], ['🔴', 'Liverpool FC', 'Liverpool FC and the Premier League'],
  ['💻', 'Technológia', 'technology and apps'], ['🐶', 'Háziállatok', 'pets'], ['🏖️', 'Utazás', 'travel'], ['📚', 'Könyvek', 'books'], ['🎲', 'Bármi', 'anything the learner wants']
];
window.TIPS = {
  A1: ['Rövid mondatokkal is teljesen rendben van. A lényeg, hogy beszélj!', 'Ha elakadsz, használd a javasolt válaszokat, és mondd ki őket hangosan.', 'Az amerikai „r” hangot mindig ejtsd ki, pl. car, water.'],
  A2: ['Próbálj meg minden válaszhoz egy plusz részletet hozzátenni (mert..., és...).', 'Múlt időnél figyelj a -ed végződésre: worked, played.', 'Kérdezz vissza te is: „And you?” Így élőbb a beszélgetés.'],
  B1: ['Indokold a véleményed: because, so, that\'s why.', 'Használj kötőszavakat: however, actually, on the other hand.', 'Ha nem jut eszedbe egy szó, írd körül: „It\'s a thing you use to...”']
};
/* Demo mode: scripted branching role-plays. Each node: tutor, hu, ex (expected learner answers), hint (Hungarian), next or br [[keywords], next]. */
window.DEMO = {
  intro: { vocab: [['nice to meet you', 'örülök, hogy megismerhetlek'], ['where are you from', 'honnan jöttél'], ['hobby', 'hobbi']], nodes: {
    s: { tutor: "Hi! I'm Emma. What's your name?", hu: 'Szia! Emma vagyok. Hogy hívnak?', ex: ["My name is Anna.", "I'm Peter."], hint: 'Mondd meg a neved: My name is ...', next: 'b' },
    b: { tutor: 'Nice to meet you! Where are you from?', hu: 'Örülök, hogy megismerhetlek! Honnan jöttél?', ex: ["I'm from Hungary.", "I'm from Budapest."], hint: 'I\'m from ... (Hungary)', next: 'c' },
    c: { tutor: 'Cool! Do you like sports or music?', hu: 'Klassz! Szereted a sportot vagy a zenét?', ex: ['I like sports.', 'I like music.'], hint: 'I like ...', br: [[['sport', 'soccer', 'football', 'chess'], 'd1'], [['music', 'song'], 'd2']], next: 'd2' },
    d1: { tutor: 'Me too! I love soccer. What is your favorite team?', hu: 'Én is! Imádom a focit. Melyik a kedvenc csapatod?', ex: ['My favorite team is Liverpool.', 'I like Liverpool.'], hint: 'My favorite team is ...', next: 'e' },
    d2: { tutor: 'Nice! I love music too. What music do you like?', hu: 'Szuper! Én is szeretem a zenét. Milyen zenét szeretsz?', ex: ['I like pop music.', 'I like rock.'], hint: 'I like ... music.', next: 'e' },
    e: { tutor: 'Great! It was nice to meet you. See you later!', hu: 'Nagyszerű! Örültem, hogy megismertelek. Később találkozunk!', ex: ['Nice to meet you too. Bye!', 'See you later!'], hint: 'Köszönj el: See you later!', end: true }
  } },
  coffee: { vocab: [['to go', 'elvitelre'], ['for here', 'helyben'], ['small / medium / large', 'kicsi / közepes / nagy']], nodes: {
    s: { tutor: 'Hi there! What can I get for you?', hu: 'Szia! Mit adhatok?', ex: ["Can I have a coffee, please?", "A latte, please."], hint: 'Can I have a ..., please?', next: 'b' },
    b: { tutor: 'Sure! What size? Small, medium, or large?', hu: 'Persze! Milyen méretben? Kicsi, közepes vagy nagy?', ex: ['Medium, please.', 'Large, please.'], hint: 'Medium, please.', next: 'c' },
    c: { tutor: 'For here or to go?', hu: 'Itt fogyasztod vagy elviszed?', ex: ['To go, please.', 'For here, please.'], hint: 'To go = elvitelre, For here = helyben', next: 'd' },
    d: { tutor: "OK. That's four fifty. Cash or card?", hu: 'Rendben. Négy ötven lesz. Készpénz vagy kártya?', ex: ['Card, please.', 'Cash.'], hint: 'Card, please.', next: 'e' },
    e: { tutor: 'Thank you! Have a nice day!', hu: 'Köszönöm! Szép napot!', ex: ['Thank you, you too!', 'Thanks, bye!'], hint: 'Thank you, you too!', end: true }
  } },
  directions: { vocab: [['turn left', 'fordulj balra'], ['go straight', 'menj egyenesen'], ['next to', 'mellett']], nodes: {
    s: { tutor: 'Hi! Do you need help?', hu: 'Szia! Segíthetek?', ex: ['Yes, please. Where is the museum?', 'Where is the subway?'], hint: 'Excuse me, where is the ...?', br: [[['subway', 'metro', 'station', 'train'], 'sub']], next: 'mus' },
    mus: { tutor: 'The museum? Go straight and turn left. It is next to the park.', hu: 'A múzeum? Menj egyenesen, és fordulj balra. A park mellett van.', ex: ['Is it far?', 'Thank you!'], hint: 'Is it far? = Messze van?', next: 'far' },
    sub: { tutor: 'The subway? Go straight two blocks. It is on the right.', hu: 'A metró? Menj egyenesen két háztömböt. A jobb oldalon van.', ex: ['Is it far?', 'Thank you!'], hint: 'Is it far? = Messze van?', next: 'far' },
    far: { tutor: 'No, it is not far. About five minutes.', hu: 'Nem, nincs messze. Körülbelül öt perc.', ex: ['Thank you very much!', 'Great, thanks!'], hint: 'Thank you very much!', next: 'e' },
    e: { tutor: "You're welcome! Have a good day!", hu: 'Szívesen! Legyen szép napod!', ex: ['You too. Bye!', 'Bye!'], hint: 'You too!', end: true }
  } },
  store: { vocab: [['how much', 'mennyibe kerül'], ['a bag', 'egy szatyor'], ['anything else', 'még valamit']], nodes: {
    s: { tutor: 'Hello! Can I help you?', hu: 'Helló! Segíthetek?', ex: ['Yes, I need some apples.', 'Where is the milk?'], hint: 'I need some ... / Where is the ...?', next: 'b' },
    b: { tutor: 'Sure. They are over there. Anything else?', hu: 'Persze. Ott vannak. Még valamit?', ex: ['No, thank you. How much is it?', 'Yes, some bread, please.'], hint: 'How much is it?', br: [[['bread', 'water', 'cheese', 'yes'], 'c']], next: 'd' },
    c: { tutor: 'OK, here you go. Anything else?', hu: 'Rendben, tessék. Még valamit?', ex: ['No, thank you. How much is it?'], hint: 'No, thank you. How much is it?', next: 'd' },
    d: { tutor: "That's six dollars. Do you need a bag?", hu: 'Hat dollár lesz. Kérsz szatyrot?', ex: ['Yes, please.', 'No, thanks.'], hint: 'Yes, please. / No, thanks.', next: 'e' },
    e: { tutor: 'Here is your receipt. Have a nice day!', hu: 'Itt a blokkod. Szép napot!', ex: ['Thank you, bye!'], hint: 'Thank you, bye!', end: true }
  } },
  restaurant: { vocab: [['a table for two', 'asztal két főre'], ['the check', 'a számla'], ['dessert', 'desszert']], nodes: {
    s: { tutor: 'Good evening! How many people?', hu: 'Jó estét! Hány főre?', ex: ['A table for two, please.', 'Just one, please.'], hint: 'A table for two, please.', next: 'b' },
    b: { tutor: 'Right this way. What would you like to drink?', hu: 'Erre tessék. Mit szeretnél inni?', ex: ["I'd like some water, please.", 'A Coke, please.'], hint: "I'd like ..., please.", next: 'c' },
    c: { tutor: 'Are you ready to order?', hu: 'Készen állsz a rendelésre?', ex: ["Yes, I'll have a burger, please.", "I'd like the chicken salad."], hint: "I'll have ..., please.", next: 'd' },
    d: { tutor: 'Great choice. Would you like dessert?', hu: 'Jó választás. Kérsz desszertet?', ex: ['No, thank you. Can I have the check, please?', 'Yes, apple pie, please.'], hint: 'Can I have the check, please?', br: [[['pie', 'cake', 'ice', 'yes'], 'f']], next: 'e' },
    f: { tutor: 'Sure! One apple pie. Anything else?', hu: 'Persze! Egy almás pite. Még valamit?', ex: ['Can I have the check, please?'], hint: 'Can I have the check, please?', next: 'e' },
    e: { tutor: 'Here is your check. Thank you for coming!', hu: 'Itt a számla. Köszönjük, hogy eljöttél!', ex: ['Thank you, it was delicious!', 'Thanks, have a good night!'], hint: 'It was delicious! = Nagyon finom volt!', end: true }
  } }
};
