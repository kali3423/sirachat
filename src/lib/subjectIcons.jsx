import {
  Compass, FlaskConical, Leaf, Languages, Feather, Globe, Star, Brain, BookOpen, Atom, Sigma, Calculator, Music, Palette, History,
} from "lucide-react";

export const ICONS = {
  compass: Compass,
  flask: FlaskConical,
  leaf: Leaf,
  languages: Languages,
  feather: Feather,
  globe: Globe,
  star: Star,
  brain: Brain,
  book: BookOpen,
  atom: Atom,
  sigma: Sigma,
  calculator: Calculator,
  music: Music,
  palette: Palette,
  history: History,
};

export const COLORS = [
  "#D94639", "#1D78C1", "#3F8E4D", "#F18625",
  "#10B981", "#A8326D", "#7C3AED", "#0891B2",
];

export const getIcon = (name) => ICONS[name] || BookOpen;