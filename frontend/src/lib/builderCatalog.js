export const TOKEN_DEFAULTS = {
  theme: "light",
  accent: "#4f46e5",
  background: "#ffffff",
  foreground: "#0f172a",
  muted: "#64748b",
  radius: 14,
  spacing: 24,
  fontScale: 1,
  shadow: "soft"
};

export const TOKEN_FIELDS = [
  {
    name: "theme",
    label: "Theme",
    type: "select",
    options: [
      { label: "Light", value: "light" },
      { label: "Dark", value: "dark" }
    ]
  },
  { name: "accent", label: "Accent", type: "color" },
  { name: "background", label: "Background", type: "color" },
  { name: "foreground", label: "Foreground", type: "color" },
  { name: "muted", label: "Muted text", type: "color" },
  { name: "radius", label: "Corner radius", type: "range", min: 0, max: 32, step: 1 },
  { name: "spacing", label: "Spacing", type: "range", min: 8, max: 48, step: 2 },
  { name: "fontScale", label: "Type scale", type: "range", min: 0.8, max: 1.4, step: 0.05 },
  {
    name: "shadow",
    label: "Shadow",
    type: "select",
    options: [
      { label: "None", value: "none" },
      { label: "Soft", value: "soft" },
      { label: "Strong", value: "strong" }
    ]
  }
];

export const DATASET_DEFAULTS = {
  title: "Weekly active learners",
  caption: "A small numeric table saved in this browser and reused by the Level 8 chart.",
  unit: "learners",
  rows: [
    { label: "Mon", value: 120 },
    { label: "Tue", value: 168 },
    { label: "Wed", value: 142 },
    { label: "Thu", value: 196 },
    { label: "Fri", value: 231 },
    { label: "Sat", value: 184 }
  ]
};

export const DATASET_FIELDS = [
  {
    name: "title",
    label: "Table title",
    type: "text",
    required: true,
    maxLength: 90,
    placeholder: "Weekly active learners"
  },
  {
    name: "caption",
    label: "Caption",
    type: "textarea",
    rows: 2,
    maxLength: 240,
    placeholder: "What does this table measure?"
  },
  {
    name: "unit",
    label: "Unit",
    type: "text",
    maxLength: 16,
    placeholder: "learners"
  },
  {
    name: "rows",
    label: "Number rows",
    type: "list",
    itemLabel: "Row",
    minItems: 1,
    maxItems: 12,
    itemFields: [
      {
        name: "label",
        label: "Label",
        type: "text",
        required: true,
        maxLength: 40,
        placeholder: "Mon"
      },
      {
        name: "value",
        label: "Value",
        type: "number",
        required: true,
        step: 1
      }
    ]
  }
];

export const DATASET_KIND = "dataTable";

export function datasetKind(catalog) {
  return catalog?.kinds?.find((kind) => kind.slug === DATASET_KIND) || null;
}

export function defaultComponentName(lesson) {
  return String(lesson?.title || "CMS component").slice(0, 90);
}

export function defaultComponentDescription(lesson) {
  return String(lesson?.outcome || lesson?.lab?.brief || "").slice(0, 500);
}

export function tokenFieldsFromCatalog(catalog) {
  const fields = catalog?.tokenFields;
  return Array.isArray(fields) && fields.length ? fields : TOKEN_FIELDS;
}

export function defaultTokensFromCatalog(catalog) {
  const defaults = catalog?.tokenDefaults;
  return defaults && typeof defaults === "object"
    ? { ...TOKEN_DEFAULTS, ...defaults }
    : { ...TOKEN_DEFAULTS };
}
