import React from "react";
import { useI18n } from "@/lib/i18n";

export default function T({ k, vars, children }) {
  const { t } = useI18n();
  const val = t(k, vars);
  return <>{val != null ? val : children}</>;
}
