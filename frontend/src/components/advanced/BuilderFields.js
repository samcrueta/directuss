"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import styles from "./builderLab.module.css";

const HEX = /^#[0-9a-f]{6}$/i;

function safeId(path) {
  return `builder-${String(path).replace(/[^a-z0-9_-]/gi, "-")}`;
}

function emptyValue(field) {
  if (field.type === "boolean") return false;
  if (field.type === "number" || field.type === "range") return field.min ?? 0;
  if (field.type === "list" || field.type === "blocks") return [];
  if (field.type === "select") return field.options?.[0]?.value ?? "";
  return "";
}

function emptyObject(fields = []) {
  return fields.reduce((result, field) => {
    result[field.name] = emptyValue(field);
    return result;
  }, {});
}

function FieldLabel({ field, id }) {
  return (
    <label htmlFor={id} className={styles.fieldLabel}>
      <span>{field.label || field.name}</span>
      {field.required ? <span className={styles.required}>required</span> : null}
    </label>
  );
}

function TextField({ field, value, onChange, id }) {
  return (
    <div className={styles.field}>
      <FieldLabel field={field} id={id} />
      <input
        id={id}
        type="text"
        value={value ?? ""}
        maxLength={field.maxLength}
        placeholder={field.placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function TextareaField({ field, value, onChange, id }) {
  return (
    <div className={styles.field}>
      <FieldLabel field={field} id={id} />
      <textarea
        id={id}
        rows={field.rows || 3}
        value={value ?? ""}
        maxLength={field.maxLength}
        placeholder={field.placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function ColorField({ field, value, onChange, id }) {
  const text = typeof value === "string" ? value : "";
  const swatch = HEX.test(text) ? text : "#4f46e5";

  return (
    <div className={styles.field}>
      <FieldLabel field={field} id={id} />
      <div className={styles.colorRow}>
        <input
          type="color"
          aria-label={`${field.label || field.name} picker`}
          value={swatch}
          onChange={(event) => onChange(event.target.value)}
          className={styles.colorPicker}
        />
        <input
          id={id}
          type="text"
          value={text}
          spellCheck={false}
          placeholder="#4f46e5"
          onChange={(event) => onChange(event.target.value)}
          className={styles.colorText}
        />
        <span className={styles.colorSwatch} style={{ background: swatch }} aria-hidden="true" />
      </div>
      {!HEX.test(text) ? (
        <span className={styles.fieldHint}>Use a six-digit hex color, e.g. #4f46e5.</span>
      ) : null}
    </div>
  );
}

function NumberField({ field, value, onChange, id, range = false }) {
  const number = Number(value);
  const current = Number.isFinite(number) ? number : field.min ?? 0;

  if (range) {
    return (
      <div className={styles.field}>
        <div className={styles.fieldLabelRow}>
          <FieldLabel field={field} id={id} />
          <span className={styles.rangeValue}>{current}</span>
        </div>
        <input
          id={id}
          type="range"
          min={field.min ?? 0}
          max={field.max ?? 100}
          step={field.step ?? 1}
          value={current}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </div>
    );
  }

  return (
    <div className={styles.field}>
      <FieldLabel field={field} id={id} />
      <input
        id={id}
        type="number"
        min={field.min}
        max={field.max}
        step={field.step ?? 1}
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value === "" ? "" : Number(event.target.value))
        }
      />
    </div>
  );
}

function SelectField({ field, value, onChange, id }) {
  return (
    <div className={styles.field}>
      <FieldLabel field={field} id={id} />
      <select id={id} value={value ?? ""} onChange={(event) => onChange(event.target.value)}>
        {(field.options || []).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function BooleanField({ field, value, onChange, id }) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.checkRow}>
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>{field.label || field.name}</span>
      </label>
      {field.required ? <span className={styles.fieldHint}>Required for this component.</span> : null}
    </div>
  );
}

function ListField({ field, value, onChange, id }) {
  const items = Array.isArray(value) ? value : [];
  const minItems = field.minItems ?? 0;
  const maxItems = field.maxItems ?? 20;

  const updateItem = (index, next) => {
    const copy = items.slice();
    copy[index] = next;
    onChange(copy);
  };

  const addItem = () => {
    if (items.length >= maxItems) return;
    onChange([...items, emptyObject(field.itemFields || [])]);
  };

  const removeItem = (index) => {
    if (items.length <= minItems) return;
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className={styles.field}>
      <div className={styles.fieldLabelRow}>
        <span className={styles.fieldLabel}>{field.label || field.name}</span>
        <span className={styles.fieldCount}>{items.length}</span>
      </div>
      <div className={styles.itemList}>
        {items.map((item, index) => (
          <div key={index} className={styles.itemCard}>
            <div className={styles.itemHead}>
              <span>
                {field.itemLabel || "Item"} {index + 1}
              </span>
              <button
                type="button"
                className={styles.iconButton}
                aria-label={`Remove ${field.itemLabel || "item"} ${index + 1}`}
                onClick={() => removeItem(index)}
                disabled={items.length <= minItems}
              >
                <Trash2 size={13} />
              </button>
            </div>
            <BuilderFields
              fields={field.itemFields || []}
              value={item || {}}
              onChange={(next) => updateItem(index, next)}
              idPrefix={`${id}-${index}`}
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        className={styles.addButton}
        onClick={addItem}
        disabled={items.length >= maxItems}
      >
        <Plus size={13} /> Add {field.itemLabel || "item"}
      </button>
    </div>
  );
}

function BlocksField({ field, value, onChange, id }) {
  const blocks = Array.isArray(value) ? value : [];
  const definitions = Array.isArray(field.blocks) ? field.blocks : [];
  const minItems = field.minItems ?? 0;
  const maxItems = field.maxItems ?? 8;
  const [selectedBlock, setSelectedBlock] = useState(definitions[0]?.slug || "");

  const definitionFor = (blockType) =>
    definitions.find((definition) => definition.slug === blockType);

  const updateBlock = (index, next) => {
    const copy = blocks.slice();
    copy[index] = next;
    onChange(copy);
  };

  const moveBlock = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const copy = blocks.slice();
    const [item] = copy.splice(index, 1);
    copy.splice(target, 0, item);
    onChange(copy);
  };

  const removeBlock = (index) => {
    if (blocks.length <= minItems) return;
    onChange(blocks.filter((_, blockIndex) => blockIndex !== index));
  };

  const addBlock = () => {
    if (blocks.length >= maxItems) return;
    const definition = definitionFor(selectedBlock) || definitions[0];
    if (!definition) return;
    onChange([
      ...blocks,
      { blockType: definition.slug, ...emptyObject(definition.fields || []) }
    ]);
  };

  return (
    <div className={styles.field}>
      <div className={styles.fieldLabelRow}>
        <span className={styles.fieldLabel}>{field.label || field.name}</span>
        <span className={styles.fieldCount}>{blocks.length}</span>
      </div>
      <div className={styles.itemList}>
        {blocks.map((block, index) => {
          const definition = definitionFor(block?.blockType);
          return (
            <div key={index} className={styles.blockCard}>
              <div className={styles.itemHead}>
                <span>
                  {definition?.label || block?.blockType || "Block"} {index + 1}
                </span>
                <div className={styles.itemActions}>
                  <button
                    type="button"
                    className={styles.iconButton}
                    aria-label={`Move ${definition?.label || "block"} up`}
                    onClick={() => moveBlock(index, -1)}
                    disabled={index === 0}
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    className={styles.iconButton}
                    aria-label={`Move ${definition?.label || "block"} down`}
                    onClick={() => moveBlock(index, 1)}
                    disabled={index === blocks.length - 1}
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    type="button"
                    className={styles.iconButton}
                    aria-label={`Remove ${definition?.label || "block"}`}
                    onClick={() => removeBlock(index)}
                    disabled={blocks.length <= minItems}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {definition ? (
                <BuilderFields
                  fields={definition.fields || []}
                  value={block || {}}
                  onChange={(next) => updateBlock(index, { ...next, blockType: block.blockType })}
                  idPrefix={`${id}-${index}`}
                />
              ) : (
                <p className={styles.fieldHint}>Unknown block type.</p>
              )}
            </div>
          );
        })}
      </div>
      <div className={styles.addRow}>
        <select
          value={selectedBlock}
          onChange={(event) => setSelectedBlock(event.target.value)}
          aria-label="Block type to add"
        >
          {definitions.map((definition) => (
            <option key={definition.slug} value={definition.slug}>
              {definition.label || definition.slug}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={styles.addButton}
          onClick={addBlock}
          disabled={blocks.length >= maxItems || !definitions.length}
        >
          <Plus size={13} /> Add block
        </button>
      </div>
    </div>
  );
}

function RawJsonEditor({ value, onChange }) {
  const external = useMemo(() => JSON.stringify(value ?? {}, null, 2), [value]);
  const [text, setText] = useState(external);
  const [error, setError] = useState("");
  const lastEmitted = useRef(external);

  useEffect(() => {
    if (external !== lastEmitted.current) {
      lastEmitted.current = external;
      setText(external);
      setError("");
    }
  }, [external]);

  const handleChange = (next) => {
    setText(next);
    try {
      const parsed = JSON.parse(next);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Use a JSON object.");
      }
      lastEmitted.current = JSON.stringify(parsed, null, 2);
      onChange(parsed);
      setError("");
    } catch (parseError) {
      setError(parseError.message);
    }
  };

  return (
    <div className={styles.field}>
      <label htmlFor="builder-raw-json" className={styles.fieldLabel}>
        Content JSON
      </label>
      <textarea
        id="builder-raw-json"
        rows={14}
        className={styles.jsonEditor}
        value={text}
        spellCheck={false}
        onChange={(event) => handleChange(event.target.value)}
      />
      {error ? <span className={styles.fieldError}>JSON: {error}</span> : null}
    </div>
  );
}

function Field({ field, value, onChange, id }) {
  switch (field.type) {
    case "textarea":
      return <TextareaField field={field} value={value} onChange={onChange} id={id} />;
    case "color":
      return <ColorField field={field} value={value} onChange={onChange} id={id} />;
    case "number":
      return <NumberField field={field} value={value} onChange={onChange} id={id} />;
    case "range":
      return <NumberField field={field} value={value} onChange={onChange} id={id} range />;
    case "select":
      return <SelectField field={field} value={value} onChange={onChange} id={id} />;
    case "boolean":
      return <BooleanField field={field} value={value} onChange={onChange} id={id} />;
    case "list":
      return <ListField field={field} value={value} onChange={onChange} id={id} />;
    case "blocks":
      return <BlocksField field={field} value={value} onChange={onChange} id={id} />;
    case "text":
    default:
      return <TextField field={field} value={value} onChange={onChange} id={id} />;
  }
}

export default function BuilderFields({ fields, value, onChange, idPrefix = "fields" }) {
  const object = value && typeof value === "object" && !Array.isArray(value) ? value : {};

  if (!Array.isArray(fields) || fields.length === 0) {
    return <RawJsonEditor value={object} onChange={onChange} />;
  }

  return (
    <div className={styles.fieldGrid}>
      {fields.map((field) => {
        const id = safeId(`${idPrefix}-${field.name}`);
        return (
          <div
            key={field.name}
            className={
              field.type === "textarea" || field.type === "list" || field.type === "blocks"
                ? styles.fieldWide
                : undefined
            }
          >
            <Field
              field={field}
              value={object[field.name]}
              onChange={(next) => onChange({ ...object, [field.name]: next })}
              id={id}
            />
          </div>
        );
      })}
    </div>
  );
}
