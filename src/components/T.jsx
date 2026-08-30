import React from "react";
import { useI18n } from "@/lib/i18n";

export default function T({ k, children }) {
  const { t } = useI18n();
  return <>{t(k) || children}</>;
}