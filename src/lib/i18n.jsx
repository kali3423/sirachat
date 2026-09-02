import React, { createContext, useContext, useEffect, useState } from "react";

const translations = {
  en: {
    nav: { chat: "Chats", chats: "Chats", study: "Study", explore: "Explore", notifications: "Alerts", profile: "Profile", todos: "To-Do", agenda: "Agenda", schedule: "Study Plan", drawing: "Drawing", notes: "Notes", subjects: "Subjects", timetable: "Timetable", relax: "Relax", recovery: "Recovery", settings: "Settings", signOut: "Sign out", more: "More", tools: "Tools" },
    common: { new: "New", add: "Add", save: "Save", share: "Share", cancel: "Cancel", edit: "Edit", delete: "Delete", close: "Close", saving: "Saving…", loading: "Loading…", retry: "Try again", send: "Send", upload: "Upload", download: "Download", clear: "Clear", signIn: "Sign in", you: "You", empty: "Nothing here yet", genericError: "Something went wrong. Please try again." },
    chat: { partner: "Your Study Partner", online: "● online" },
    todos: { title: "Shared To-Do", sub: "Tasks you and your partner tackle together" },
    agenda: { title: "Agenda", sub: "Shared events, exams & meetings" },
    schedule: { title: "Study Plan", sub: "Weekly schedule & progress tracking" },
    study: { title: "Study", sub: "Create a study rendezvous, start the timer, and earn points." },
    drawing: { title: "Drawing Board", sub: "Sketch concepts & share with your partner", namePh: "Name your sketch…", shared: "Shared sketches", logoHint: "Square image. Leave empty to use the monogram." },
    notes: { title: "Notes", sub: "Take and save study notes", new: "New note" },
    subjects: { title: "Subjects", sub: "Browse lessons and PDFs added by your admin" },
    relak: { title: "Relax", chatTitle: "Chill chat", games: "Games", messagePh: "Relax message…", chatEmpty: "Chill chat is empty — say hi! 👋", endGame: "End game", newRound: "New round", shuffle: "Shuffle", maxTime: "Max 15 minutes per game. Exceeding it costs 10 points.", penalty: "15 minutes reached — 10 points deducted from your balance.", twoPlayers: "2 players", solo: "Solo", round30: "30s round", classic: "Classic", brainTeaser: "Brain teaser", tapToFly: "Tap to fly", names: { ttt: "Tic-Tac-Toe", memory: "Memory Match", puzzle: "Sliding Puzzle", whack: "Whack-a-Mole", snake: "Snake", color: "Color Match", flappy: "Flappy Bird" }, g: { yourTurn: "Your turn", thinking: "Robot thinking…", youWin: "You win!", robotWins: "Robot wins!", draw: "It's a draw!", newRound: "New round", shuffle: "Shuffle", newGame: "New game", start: "Start", startGame: "Start Game", playAgain: "Play again", restart: "Restart", scoreN: "Score: {n}", roundScore: "Round {r}/{total} • Score: {n}", moves: "Moves: {n}", solvedIn: "Solved in {n} moves!", gameOver: "Game Over!", ready: "Ready? 30-second round", playState: "{n}s · Score {s}", whacked: "Time! You whacked {n}", snakeHint: "Use arrow keys to control the snake", flappyHint: "Click anywhere to jump!", colorTitle: "Color Match Challenge", colorRule: "Click the color of the TEXT, not the word!", example: "Example:", exampleAnswer: "Answer: {c} (color of the text)", whatColor: "What color is this text?", excellent: "Excellent!", goodJob: "Good job!", keepPracticing: "Keep practicing!", colors: { Red: "Red", Blue: "Blue", Green: "Green", Yellow: "Yellow", Purple: "Purple", Pink: "Pink" } } },
    recovery: { title: "Recovery", sub: "Mark each day green (clean) or red (relapse) and build your streak", streak: "Current streak", best: "Best streak", thisMonth: "Clean this month", legend: "Tap a day to toggle: none → clean → relapse. Green = clean, red = relapse.", howWasDay: "How was this day?", cleanDay: "Clean Day", relapse: "Relapse", clearDay: "Clear this day", plus10: "+10 points", zero: "0 points", tapHint: "Tap any day to mark it Clean or Relapse. Tap again to change or clear it.", cleanPts: "Clean (+10 pts)", relapsePts: "Relapse (0 pts)", balance: "Balance", perCleanDay: "+10 pts per clean day", recoveryPoints: "Recovery points", connecting: "Connecting…", connected: "Connected", offline: "Offline" },
    admin: { title: "Admin", sub: "Manage members and app settings", members: "Members", subjects: "Subjects", timetable: "Timetable", appSettings: "App settings", invite: "Invite", saveSettings: "Save settings", appLogo: "App logo", appLogoHint: "Square image. Leave empty to use the monogram.", appName: "App name", tagline: "Tagline", agora: "Agora App ID (calls)", agoraHint: "From the Agora console. Use a project with App ID-only authentication (no certificate) for now.", savedOk: "App settings saved.", saveError: "Could not save settings. Please try again.", logoError: "Logo upload failed." },
    settings: { title: "Settings", sub: "Manage your profile name and picture", save: "Save profile" },
    profile: { edit: "Edit", editProfile: "Edit profile", displayName: "Display name", displayNamePh: "Your name", bio: "Bio", bioPh: "A short line about you", changePhoto: "Change photo", progressToLegend: "Progress to Legend", ptsToNext: "{n} pts to the next tier.", topTier: "You've reached the top tier. 🔥", studyStats: "Study stats", sessions: "Sessions", studyTime: "Study time", pointsEarned: "Points earned", topSubjects: "Top subjects", updated: "Profile updated.", imgError: "Image upload failed. Please try another photo.", pts: "pts", min: "min", levels: { legend: "Legend", achiever: "Achiever", studious: "Studious", beginner: "Beginner" } },
    auth: { adminPanel: "Admin Panel", restricted: "Restricted area — sign in to continue", username: "Username", password: "Password", welcome: "Welcome to Sira Chat", subtitle: "Sign in to continue your learning journey", signingIn: "Signing in…", available: "Available users", tapToFill: "Tap to fill username" },
  },
  fr: {
    nav: { chat: "Chats", chats: "Chats", study: "Étude", explore: "Explorer", notifications: "Alertes", profile: "Profil", todos: "Tâches", agenda: "Agenda", schedule: "Plan d'étude", drawing: "Dessin", notes: "Notes", subjects: "Matières", timetable: "Emploi du temps", relax: "Détente", recovery: "Rétablissement", settings: "Paramètres", signOut: "Déconnexion", more: "Plus", tools: "Outils" },
    common: { new: "Nouveau", add: "Ajouter", save: "Enregistrer", share: "Partager", cancel: "Annuler", edit: "Modifier", delete: "Supprimer", close: "Fermer", saving: "Enregistrement…", loading: "Chargement…", retry: "Réessayer", send: "Envoyer", upload: "Téléverser", download: "Télécharger", clear: "Effacer", signIn: "Se connecter", you: "Vous", empty: "Rien pour l'instant", genericError: "Une erreur est survenue. Veuillez réessayer." },
    chat: { partner: "Votre partenaire d'étude", online: "● en ligne" },
    todos: { title: "Tâches partagées", sub: "Les tâches que vous faites ensemble" },
    agenda: { title: "Agenda", sub: "Événements, examens & réunions partagés" },
    schedule: { title: "Plan d'étude", sub: "Programme hebdomadaire & progression" },
    study: { title: "Étude", sub: "Créez un rendez-vous d'étude, lancez le chrono et gagnez des points." },
    drawing: { title: "Tableau de dessin", sub: "Esquissez et partagez avec votre partenaire", namePh: "Nommez votre croquis…", shared: "Croquis partagés", logoHint: "Image carrée. Laissez vide pour le monogramme." },
    notes: { title: "Notes", sub: "Prenez et enregistrez vos notes", new: "Nouvelle note" },
    subjects: { title: "Matières", sub: "Parcourez les leçons et PDF ajoutés par l'admin" },
    relak: { title: "Détente", chatTitle: "Chat détente", games: "Jeux", messagePh: "Message détente…", chatEmpty: "Le chat est vide — dites bonjour ! 👋", endGame: "Terminer", newRound: "Nouvelle manche", shuffle: "Mélanger", maxTime: "Max 15 min par jeu. Au-delà : -10 points.", penalty: "15 minutes atteintes — 10 points déduits de votre solde.", twoPlayers: "2 joueurs", solo: "Solo", round30: "Manche de 30s", classic: "Classique", brainTeaser: "Casse-tête", tapToFly: "Touchez pour voler", names: { ttt: "Morpion", memory: "Memory", puzzle: "Taquin", whack: "Tape-taupe", snake: "Snake", color: "Couleurs", flappy: "Flappy Bird" }, g: { yourTurn: "À vous", thinking: "Le robot réfléchit…", youWin: "Vous gagnez !", robotWins: "Le robot gagne !", draw: "Match nul !", newRound: "Nouvelle manche", shuffle: "Mélanger", newGame: "Nouvelle partie", start: "Démarrer", startGame: "Commencer", playAgain: "Rejouer", restart: "Recommencer", scoreN: "Score : {n}", roundScore: "Manche {r}/{total} • Score : {n}", moves: "Coups : {n}", solvedIn: "Résolu en {n} coups !", gameOver: "Partie terminée !", ready: "Prêt ? Manche de 30 s", playState: "{n}s · Score {s}", whacked: "Temps ! Score : {n}", snakeHint: "Utilisez les flèches pour diriger le serpent", flappyHint: "Cliquez pour sauter !", colorTitle: "Défi des couleurs", colorRule: "Cliquez sur la couleur du TEXTE, pas sur le mot !", example: "Exemple :", exampleAnswer: "Réponse : {c} (couleur du texte)", whatColor: "Quelle est la couleur de ce texte ?", excellent: "Excellent !", goodJob: "Bien joué !", keepPracticing: "Continuez à vous entraîner !", colors: { Red: "Rouge", Blue: "Bleu", Green: "Vert", Yellow: "Jaune", Purple: "Violet", Pink: "Rose" } } },
    recovery: { title: "Rétablissement", sub: "Marquez chaque jour en vert (clean) ou rouge (rechute) et progressez", streak: "Série actuelle", best: "Meilleure série", thisMonth: "Jours clean ce mois", legend: "Touchez un jour pour basculer : aucun → clean → rechute. Vert = clean, rouge = rechute.", howWasDay: "Comment s'est passée cette journée ?", cleanDay: "Jour clean", relapse: "Rechute", clearDay: "Effacer ce jour", plus10: "+10 points", zero: "0 point", tapHint: "Touchez un jour pour le marquer clean ou rechute. Touchez à nouveau pour changer ou effacer.", cleanPts: "Clean (+10 pts)", relapsePts: "Rechute (0 pt)", balance: "Solde", perCleanDay: "+10 pts par jour clean", recoveryPoints: "Points de rétablissement", connecting: "Connexion…", connected: "Connecté", offline: "Hors ligne" },
    admin: { title: "Admin", sub: "Gérez les membres et l'application", members: "Membres", subjects: "Matières", timetable: "Emploi du temps", appSettings: "Paramètres", invite: "Inviter", saveSettings: "Enregistrer", appLogo: "Logo de l'app", appLogoHint: "Image carrée. Laissez vide pour le monogramme.", appName: "Nom de l'app", tagline: "Slogan", agora: "ID Agora (appels)", agoraHint: "Depuis la console Agora. Utilisez un projet avec authentification par App ID uniquement (sans certificat) pour l'instant.", savedOk: "Paramètres enregistrés.", saveError: "Impossible d'enregistrer les paramètres. Réessayez.", logoError: "Échec du téléversement du logo." },
    settings: { title: "Paramètres", sub: "Gérez votre nom et photo de profil", save: "Enregistrer le profil" },
    profile: { edit: "Modifier", editProfile: "Modifier le profil", displayName: "Nom affiché", displayNamePh: "Votre nom", bio: "Bio", bioPh: "Une courte présentation", changePhoto: "Changer la photo", progressToLegend: "Progression vers Légende", ptsToNext: "{n} pts avant le palier suivant.", topTier: "Vous avez atteint le sommet. 🔥", studyStats: "Statistiques d'étude", sessions: "Sessions", studyTime: "Temps d'étude", pointsEarned: "Points gagnés", topSubjects: "Meilleures matières", updated: "Profil mis à jour.", imgError: "Échec du téléversement. Essayez une autre photo.", pts: "pts", min: "min", levels: { legend: "Légende", achiever: "Battant", studious: "Studieux", beginner: "Débutant" } },
    auth: { adminPanel: "Panneau admin", restricted: "Zone restreinte — connectez-vous pour continuer", username: "Nom d'utilisateur", password: "Mot de passe", welcome: "Bienvenue sur Sira Chat", subtitle: "Connectez-vous pour continuer votre apprentissage", signingIn: "Connexion…", available: "Utilisateurs disponibles", tapToFill: "Toucher pour remplir le nom" },
  },
  ar: {
    nav: { chat: "المحادثات", chats: "المحادثات", study: "الدراسة", explore: "استكشاف", notifications: "التنبيهات", profile: "الملف", todos: "المهام", agenda: "الأجندة", schedule: "خطة الدراسة", drawing: "الرسم", notes: "الملاحظات", subjects: "المواد", timetable: "جدول الحصص", relax: "الاسترخاء", recovery: "التعافي", settings: "الإعدادات", signOut: "تسجيل الخروج", more: "المزيد", tools: "الأدوات" },
    common: { new: "جديد", add: "إضافة", save: "حفظ", share: "مشاركة", cancel: "إلغاء", edit: "تعديل", delete: "حذف", close: "إغلاق", saving: "جارٍ الحفظ…", loading: "جارٍ التحميل…", retry: "إعادة المحاولة", send: "إرسال", upload: "رفع", download: "تنزيل", clear: "مسح", signIn: "تسجيل الدخول", you: "أنت", empty: "لا شيء هنا بعد", genericError: "حدث خطأ ما. يرجى المحاولة مرة أخرى." },
    chat: { partner: "شريكك في الدراسة", online: "● متصل" },
    todos: { title: "المهام المشتركة", sub: "المهام التي تنجزانها معاً" },
    agenda: { title: "الأجندة", sub: "الأحداث والامتحانات والاجتماعات المشتركة" },
    schedule: { title: "خطة الدراسة", sub: "الجدول الأسبوعي وتتبع التقدم" },
    study: { title: "الدراسة", sub: "أنشئ موعد دراسة، شغّل المؤقت واكسب النقاط." },
    drawing: { title: "لوحة الرسم", sub: "ارسم وشارك مع شريكك", namePh: "سمِّ رسمتك…", shared: "الرسمات المشتركة", logoHint: "صورة مربعة. اتركها فارغة لاستخدام الحرف." },
    notes: { title: "الملاحظات", sub: "دوّن واحفظ ملاحظاتك", new: "ملاحظة جديدة" },
    subjects: { title: "المواد", sub: "تصفّح الدروس وملفات PDF التي يضيفها المدير" },
    relak: { title: "الاسترخاء", chatTitle: "دردشة الاسترخاء", games: "الألعاب", messagePh: "رسالة استرخاء…", chatEmpty: "الدردشة فارغة — ألقِ التحية! 👋", endGame: "إنهاء اللعبة", newRound: "جولة جديدة", shuffle: "خلط", maxTime: "15 دقيقة كحد أقصى لكل لعبة. تجاوزها يكلّف 10 نقاط.", penalty: "بلغت 15 دقيقة — تم خصم 10 نقاط من رصيدك.", twoPlayers: "لاعبان", solo: "فردي", round30: "جولة 30 ثانية", classic: "كلاسيكي", brainTeaser: "لغز ذهني", tapToFly: "انقر للطيران", names: { ttt: "إكس-أو", memory: "مطابقة الذاكرة", puzzle: "أحجية الانزلاق", whack: "اضرب الخُلد", snake: "الثعبان", color: "مطابقة الألوان", flappy: "الطائر المرفرف" }, g: { yourTurn: "دورك", thinking: "الروبوت يفكّر…", youWin: "لقد فزت!", robotWins: "فاز الروبوت!", draw: "تعادل!", newRound: "جولة جديدة", shuffle: "خلط", newGame: "لعبة جديدة", start: "ابدأ", startGame: "ابدأ اللعبة", playAgain: "العب مجدداً", restart: "إعادة", scoreN: "النقاط: {n}", roundScore: "الجولة {r}/{total} • النقاط: {n}", moves: "الحركات: {n}", solvedIn: "حُلّت في {n} حركة!", gameOver: "انتهت اللعبة!", ready: "مستعد؟ جولة 30 ثانية", playState: "{n} ث · النقاط {s}", whacked: "انتهى الوقت! أصبت {n}", snakeHint: "استخدم مفاتيح الأسهم للتحكم بالثعبان", flappyHint: "انقر في أي مكان للقفز!", colorTitle: "تحدّي مطابقة الألوان", colorRule: "انقر على لون النص، لا على الكلمة!", example: "مثال:", exampleAnswer: "الإجابة: {c} (لون النص)", whatColor: "ما لون هذا النص؟", excellent: "ممتاز!", goodJob: "أحسنت!", keepPracticing: "واصل التدرّب!", colors: { Red: "أحمر", Blue: "أزرق", Green: "أخضر", Yellow: "أصفر", Purple: "بنفسجي", Pink: "وردي" } } },
    recovery: { title: "التعافي", sub: "علّم كل يوم بالأخضر (نظيف) أو الأحمر (انتكاس) وابنِ سلسلتك", streak: "السلسلة الحالية", best: "أفضل سلسلة", thisMonth: "أيام نظيفة هذا الشهر", legend: "انقر على يوم للتبديل: لا شيء ← نظيف ← انتكاس. الأخضر = نظيف، الأحمر = انتكاس.", howWasDay: "كيف كان هذا اليوم؟", cleanDay: "يوم نظيف", relapse: "انتكاسة", clearDay: "مسح هذا اليوم", plus10: "+10 نقاط", zero: "0 نقطة", tapHint: "انقر على أي يوم لتعليمه نظيفاً أو انتكاسة. انقر مجدداً للتغيير أو المسح.", cleanPts: "نظيف (+10 نقاط)", relapsePts: "انتكاسة (0 نقطة)", balance: "الرصيد", perCleanDay: "+10 نقاط لكل يوم نظيف", recoveryPoints: "نقاط التعافي", connecting: "جارٍ الاتصال…", connected: "متصل", offline: "غير متصل" },
    admin: { title: "الإدارة", sub: "إدارة الأعضاء وإعدادات التطبيق", members: "الأعضاء", subjects: "المواد", timetable: "الجدول", appSettings: "الإعدادات", invite: "دعوة", saveSettings: "حفظ الإعدادات", appLogo: "شعار التطبيق", appLogoHint: "صورة مربعة. اتركها فارغة لاستخدام الحرف.", appName: "اسم التطبيق", tagline: "الشعار", agora: "معرّف Agora (المكالمات)", agoraHint: "من لوحة Agora. استخدم مشروعاً بمصادقة App ID فقط (بدون شهادة) حالياً.", savedOk: "تم حفظ الإعدادات.", saveError: "تعذّر حفظ الإعدادات. حاول مجدداً.", logoError: "فشل رفع الشعار." },
    settings: { title: "الإعدادات", sub: "إدارة الاسم والصورة الشخصية", save: "حفظ الملف" },
    profile: { edit: "تعديل", editProfile: "تعديل الملف", displayName: "الاسم المعروض", displayNamePh: "اسمك", bio: "نبذة", bioPh: "سطر قصير عنك", changePhoto: "تغيير الصورة", progressToLegend: "التقدّم نحو أسطورة", ptsToNext: "{n} نقطة للوصول إلى المستوى التالي.", topTier: "لقد بلغت أعلى مستوى. 🔥", studyStats: "إحصائيات الدراسة", sessions: "الجلسات", studyTime: "وقت الدراسة", pointsEarned: "النقاط المكتسبة", topSubjects: "أبرز المواد", updated: "تم تحديث الملف.", imgError: "فشل رفع الصورة. جرّب صورة أخرى.", pts: "نقطة", min: "دقيقة", levels: { legend: "أسطورة", achiever: "منجِز", studious: "مجتهد", beginner: "مبتدئ" } },
    auth: { adminPanel: "لوحة الإدارة", restricted: "منطقة مقيّدة — سجّل الدخول للمتابعة", username: "اسم المستخدم", password: "كلمة المرور", welcome: "مرحباً بك في سيرا شات", subtitle: "سجّل الدخول لمواصلة رحلتك التعليمية", signingIn: "جارٍ تسجيل الدخول…", available: "المستخدمون المتاحون", tapToFill: "انقر لملء اسم المستخدم" },
  },
};

const I18nContext = createContext(null);
const ThemeContext = createContext(null);

export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "en");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const t = (path, vars) => {
    const parts = path.split(".");
    let val = translations[lang];
    for (const p of parts) val = val?.[p];
    if (val == null) {
      // Fall back to English before showing the raw key.
      let en = translations.en;
      for (const p of parts) en = en?.[p];
      val = en;
    }
    if (typeof val === "string" && vars) {
      return val.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : `{${k}}`));
    }
    return val ?? path;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir: lang === "ar" ? "rtl" : "ltr" }}>
      <ThemeContext.Provider value={{ theme, setTheme, toggle: () => setTheme((v) => (v === "dark" ? "light" : "dark")) }}>
        {children}
      </ThemeContext.Provider>
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
export const useTheme = () => useContext(ThemeContext);
