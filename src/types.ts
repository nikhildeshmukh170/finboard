// src/types.ts
export interface WidgetField {
  label: string;
  path: string;
  type: "string" | "number" | "array" | "boolean" | "object";
}
