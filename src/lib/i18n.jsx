import React, { createContext, useContext, useEffect, useState } from "react";

const translations = {
  en: {
    nav: { chat: "Chat", todos: "To-Do", agenda: "Agenda", schedule: "Study Plan", study: "Study", drawing: "Drawing", notes: "Notes", subjects: "Subjects", timetable: "Timetable", relax: "Relax", recovery: "Recovery", settings: "Settings", signOut: "Sign out" },
    common: { new: "New", add: "Add", save: "Save", share: "Share" },
    chat: { partner: "Your Study Partner", online: "● online" },
    todos: { title: "Shared To-Do", sub: "Tasks you and your partner tackle together" },
    agenda: { title: "Agenda", sub: "Shared events, exams & meetings" },
    schedule: { title: "Study Plan", sub: "Weekly schedule & progress tracking" },
    study: { title: "Study", sub: "Create a study rendezvous, start the timer, and earn points." },
    drawing: { title: "Drawing Board", sub: "Sketch concepts & share with your partner" },
    notes: { title: "Notes", sub: "Take and save study notes", new: "New note" },
    subjects: { title: "Subjects", sub: "Browse lessons and PDFs added by your admin" },
    relak: { title: "Relax", chatTitle: "Chill chat", games: "Games" },
    recovery: { title: "Recovery", sub: "Mark each day green (clean) or red (relapse) and build your streak", streak: "Current streak", best: "Best streak", thisMonth: "Clean this month", legend: "Tap a day to toggle: none → clean → relapse. Green = clean, red = relapse." },
    admin: { title: "Admin", sub: "Manage members and app settings", members: "Members", subjects: "Subjects", timetable: "Timetable", appSettings: "App settings", invite: "Invite", saveSettings: "Save settings" },
    settings: { title: "Settings", sub: "Manage your profile name and picture", save: "Save profile" },
  },
  fr: {
    nav: { chat: "Chat", todos: "Tâches", agenda: "Agenda", schedule: "Plan d'étude", study: "Étude", drawing: "Dessin", notes: "Notes", subjects: "Matières", timetable: "Emploi du temps", relax: "Détente", recovery: "Rétablissement", settings: "Paramètres", signOut: "Déconnexion" },
    common: { new: "Nouveau", add: "Ajouter", save: "Enregistrer", share: "Partager" },
    chat: { partner: "Votre partenaire d'étude", online: "● en ligne" },
    todos: { title: "Tâches partagées", sub: "Les tâches que vous faites ensemble" },
    agenda: { title: "Agenda", sub: "Événements, examens & réunions partagés" },
    schedule: { title: "Plan d'étude", sub: "Programme hebdomadaire & progression" },
    study: { title: "Étude", sub: "Créez un rendez-vous d'étude, lancez le chrono et gagnez des points." },
    drawing: { title: "Tableau de dessin", sub: "Esquissez et partagez avec votre partenaire" },
    notes: { title: "Notes", sub: "Prenez et enregistrez vos notes", new: "Nouvelle note" },
    subjects: { title: "Matières", sub: "Parcourez les leçons et PDF ajoutés par l'admin" },
    relak: { title: "Détente", chatTitle: "Chat détente", games: "Jeux" },
    recovery: { title: "Rétablissement", sub: "Marquez chaque jour en vert (clean) ou rouge (rechute) et progressez", streak: "Série actuelle", best: "Meilleure série", thisMonth: "Jours clean ce mois", legend: "Touchez un jour pour basculer : aucun → clean → rechute. Vert = clean, rouge = rechute." },
    admin: { title: "Admin", sub: "Gérez les membres et l'application", members: "Membres", subjects: "Matières", timetable: "Emploi du temps", appSettings: "Paramètres", invite: "Inviter", saveSettings: "Enregistrer" },
    settings: { title: "Paramètres", sub: "Gérez votre nom et photo de profil", save: "Enregistrer le profil" },
  },
  ar: {
    nav: { chat: "المحادثة", todos: "المهام", agenda: "الأجندة", schedule: "خطة الدراسة", study: "الدراسة", drawing: "الرسم", notes: "الملاحظات", subjects: "المواد", timetable: "جدول الحصص", relax: "الاسترخاء", recovery: "التعافي", settings: "الإعدادات", signOut: "تسجيل الخروج" },
    common: { new: "جديد", add: "إضافة", save: "حفظ", share: "مشاركة" },
    chat: { partner: "شريكك في الدراسة", online: "● متصل" },
    todos: { title: "المهام المشتركة", sub: "المهام التي تنجزانها معاً" },
    agenda: { title: "الأجندة", sub: "الأحداث والامتحانات والاجتماعات المشتركة" },
    schedule: { title: "خطة الدراسة", sub: "الجدول الأسبوعي وتتبع التقدم" },
    study: { title: "الدراسة", sub: "أنشئ موعد دراسة، شغّل المؤقت واكسب النقاط." },
    drawing: { title: "لوحة الرسم", sub: "ارسم وشارك مع شريكك" },
    notes: { title: "الملاحظات", sub: "دوّن واحفظ ملاحظاتك", new: "ملاحظة جديدة" },
    subjects: { title: "المواد", sub: "تصفّح الدروس وملفات PDF التي يضيفها المدير" },
    relak: { title: "الاسترخاء", chatTitle: "دردشة الاسترخاء", games: "الألعاب" },
    recovery: { title: "التعافي", sub: "علّم كل يوم بالأخضر (نظيف) أو الأحمر (انتكاس) وابنِ سلسلتك", streak: "السلسلة الحالية", best: "أفضل سلسلة", thisMonth: "أيام نظيفة هذا الشهر", legend: "انقر على يوم للتبديل: لا شيء ← نظيف ← انتكاس. الأخضر = نظيف، الأحمر = انتكاس." },
    admin: { title: "الإدارة", sub: "إدارة الأعضاء وإعدادات التطبيق", members: "الأعضاء", subjects: "المواد", timetable: "الجدول", appSettings: "الإعدادات", invite: "دعوة", saveSettings: "حفظ الإعدادات" },
    settings: { title: "الإعدادات", sub: "إدارة الاسم والصورة الشخصية", save: "حفظ الملف" },
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

  const t = (path) => {
    const parts = path.split(".");
    let val = translations[lang];
    for (const p of parts) val = val?.[p];
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