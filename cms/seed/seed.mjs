#!/usr/bin/env node
/**
 * Idempotent seed for the Advanced Directus course.
 *
 * Run it after Directus is healthy:
 *   docker compose exec directus node /seed/seed.mjs
 *
 * It creates the content collections, the three lab Flows, the public read
 * permission used by the WebSocket lab, and the twelve lessons.
 */
import fs from 'node:fs';
import path from 'node:path';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const TOKEN = process.env.DIRECTUS_TOKEN || process.env.ADMIN_TOKEN;

if (!TOKEN) {
  console.error('Missing DIRECTUS_TOKEN (or ADMIN_TOKEN).');
  process.exit(1);
}

const contentCandidates = [
  '/content/advanced.json',
  path.resolve(process.cwd(), '../frontend/content/advanced.json'),
  path.resolve(process.cwd(), 'frontend/content/advanced.json')
];
const contentPath = contentCandidates.find((candidate) => fs.existsSync(candidate));
if (!contentPath) {
  console.error('Could not find advanced.json. Tried:\n' + contentCandidates.join('\n'));
  process.exit(1);
}
const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json'
};

async function api(pathname, options = {}) {
  const response = await fetch(`${DIRECTUS_URL}${pathname}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) }
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!response.ok) {
    const message = body?.errors?.[0]?.message || body?.message || text;
    const error = new Error(`${options.method || 'GET'} ${pathname} -> ${response.status}: ${message}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body;
}

async function ensureCollection(collection, meta, fields) {
  const collections = await api('/collections?limit=-1');
  const found = (collections.data || []).some((item) => item.collection === collection);
  if (!found) {
    await api('/collections', {
      method: 'POST',
      body: JSON.stringify({ collection, meta, schema: {}, fields })
    });
    console.log(`created collection ${collection}`);
    return;
  }

  const current = await api(`/fields/${collection}`);
  const currentFields = new Set((current.data || []).map((field) => field.field));
  for (const field of fields) {
    if (currentFields.has(field.field)) continue;
    await api(`/fields/${collection}`, {
      method: 'POST',
      body: JSON.stringify(field)
    });
    console.log(`  added field ${collection}.${field.field}`);
  }
}

async function ensureRelation(relation) {
  const all = await api('/relations');
  const found = (all.data || []).some(
    (item) => item.collection === relation.collection && item.field === relation.field
  );
  if (found) return;
  await api('/relations', { method: 'POST', body: JSON.stringify(relation) });
  console.log(`created relation ${relation.collection}.${relation.field}`);
}

async function ensureFlow(flow) {
  const all = await api('/flows?limit=-1');
  const found = (all.data || []).some((item) => item.id === flow.id);
  if (found) {
    await api(`/flows/${flow.id}`, { method: 'PATCH', body: JSON.stringify(flow) });
    console.log(`updated flow ${flow.name}`);
  } else {
    await api('/flows', { method: 'POST', body: JSON.stringify(flow) });
    console.log(`created flow ${flow.name}`);
  }
}

async function ensureOperation(operation) {
  const all = await api('/operations?limit=-1');
  const found = (all.data || []).some((item) => item.id === operation.id);
  const { resolve: _resolve, reject: _reject, ...safeOperation } = operation;
  if (found) {
    await api(`/operations/${operation.id}`, {
      method: 'PATCH',
      body: JSON.stringify(safeOperation)
    });
  } else {
    await api('/operations', {
      method: 'POST',
      body: JSON.stringify({ ...safeOperation, resolve: null, reject: null })
    });
  }
  console.log(`  operation ${operation.key}`);
}

async function ensurePublicRead(collection) {
  const policies = await api('/policies');
  const publicPolicy = (policies.data || []).find((policy) => policy.name.includes('public_label'));
  if (!publicPolicy) {
    console.warn('public policy not found; skipping public read permission');
    return;
  }
  const permissions = await api(
    `/permissions?filter[policy][_eq]=${publicPolicy.id}&filter[collection][_eq]=${collection}&filter[action][_eq]=read`
  );
  if ((permissions.data || []).length > 0) return;
  await api('/permissions', {
    method: 'POST',
    body: JSON.stringify({
      policy: publicPolicy.id,
      collection,
      action: 'read',
      fields: ['*'],
      permissions: {},
      validation: null,
      presets: null
    })
  });
  console.log(`granted public read on ${collection}`);
}

const field = (name, type, meta = {}, schema = {}) => ({
  field: name,
  type,
  meta,
  schema
});

const idField = field(
  'id',
  'uuid',
  { hidden: true, readonly: true, interface: 'input', special: ['uuid'] },
  { is_primary_key: true, has_auto_increment: false }
);

await ensureCollection(
  'sections',
  { icon: 'layers', note: 'Advanced course sections', display_template: '{{title}}' },
  [
    idField,
    field('slug', 'string', { interface: 'input' }, { is_unique: true }),
    field('title', 'string', { interface: 'input' }),
    field('description', 'text', { interface: 'input-multiline' }),
    field('sort', 'integer', { interface: 'input' })
  ]
);

await ensureCollection(
  'lessons',
  { icon: 'menu_book', note: 'Concise advanced lessons', display_template: '{{title}}', sort_field: 'sort' },
  [
    idField,
    field('section', 'uuid', { interface: 'select-dropdown-m2o', special: ['m2o'] }),
    field('slug', 'string', { interface: 'input' }, { is_unique: true }),
    field('title', 'string', { interface: 'input' }),
    field('sort', 'integer', { interface: 'input' }),
    field(
      'track',
      'string',
      {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Automation & APIs', value: 'api' },
            { text: 'UI/UX Labs', value: 'ui' }
          ]
        }
      },
      { default_value: 'api' }
    ),
    field('outcome', 'text', { interface: 'input-multiline' }),
    field('mental_model', 'json', { interface: 'input-code', options: { language: 'json' } }),
    field('lab', 'json', { interface: 'input-code', options: { language: 'json' } }),
    field('takeaway', 'text', { interface: 'input-multiline' }),
    field('knowledge_check', 'json', { interface: 'input-code', options: { language: 'json' } }),
    field('deep_dive', 'json', { interface: 'input-code', options: { language: 'json' } }),
    field('published', 'boolean', { interface: 'toggle' }, { default_value: true })
  ]
);

await ensureRelation({
  collection: 'lessons',
  field: 'section',
  related_collection: 'sections',
  schema: { on_delete: 'SET NULL' },
  meta: {
    many_collection: 'lessons',
    many_field: 'section',
    one_collection: 'sections',
    one_field: null,
    one_deselect_action: 'nullify'
  }
});

await ensureCollection(
  'lab_notes',
  { icon: 'science', note: 'Sandbox notes created by learners', display_template: '{{title}}' },
  [
    idField,
    field('title', 'string', { interface: 'input' }),
    field('body', 'text', { interface: 'input-multiline' }),
    field(
      'status',
      'string',
      {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Draft', value: 'draft' },
            { text: 'Processed', value: 'processed' }
          ]
        }
      },
      { default_value: 'draft' }
    ),
    field('slug', 'string', { interface: 'input', readonly: true }),
    field('word_count', 'integer', { interface: 'input', readonly: true }),
    field('source', 'string', { interface: 'input', readonly: true }),
    field('payload', 'json', { interface: 'input-code', options: { language: 'json' }, readonly: true }),
    field('date_created', 'timestamp', {
      interface: 'datetime',
      readonly: true,
      special: ['date-created'],
      hidden: true
    })
  ]
);

await ensureCollection(
  'components',
  {
    icon: 'widgets',
    note: 'UI/UX lesson versions rendered by Directus',
    display_template: '{{name}}',
    sort_field: 'date_updated'
  },
  [
    idField,
    field('name', 'string', { interface: 'input' }, { is_unique: false }),
    field('description', 'text', { interface: 'input-multiline' }),
    field(
      'framework',
      'string',
      {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'HTML', value: 'html' },
            { text: 'Data table', value: 'data-table' }
          ]
        }
      },
      { default_value: 'html' }
    ),
    field('html', 'text', { interface: 'input-code', options: { language: 'html' } }),
    field('css', 'text', { interface: 'input-code', options: { language: 'css' } }),
    field('js', 'text', { interface: 'input-code', options: { language: 'javascript' } }),
    field('owner_session', 'string', { interface: 'input', readonly: true }, { is_indexed: true }),
    field('lesson_slug', 'string', { interface: 'input', readonly: true }, { is_indexed: true }),
    field('date_created', 'timestamp', {
      interface: 'datetime',
      readonly: true,
      special: ['date-created'],
      hidden: true
    }),
    field('date_updated', 'timestamp', {
      interface: 'datetime',
      readonly: true,
      special: ['date-updated'],
      hidden: true
    })
  ]
);

await ensurePublicRead('lab_notes');

const enrichCode = `module.exports = function(data) {
  const p = data.$trigger.payload;
  const title = (p.title || '').trim();
  const body = (p.body || '').trim();
  return {
    ...p,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    word_count: body ? body.split(/\\s+/).length : 0,
    status: p.status || 'draft',
    source: p.source || 'flow'
  };
};`;

const weatherResultCode = `module.exports = function(data) {
  return data.weather && data.weather.data ? data.weather.data : data.weather;
};`;

const orderValidationCode = `module.exports = function(data) {
  const order = data.$trigger.body;
  const total = Number(order.total);
  if (!order.id || !Number.isFinite(total) || total <= 0) {
    throw new Error('Order must include an id and a positive total.');
  }
  const rates = { gold: 0.15, silver: 0.1, bronze: 0.05 };
  const rate = rates[order.tier] || 0;
  const discount = Math.round(total * rate * 100) / 100;
  return {
    ...order,
    discount,
    total_after: Math.round((total - discount) * 100) / 100
  };
};`;

const orderSummaryCode = `module.exports = function(data) {
  const shipping = data.shipping && data.shipping.data ? data.shipping.data : data.shipping;
  const saved = Array.isArray(data.save) ? data.save[0] : data.save;
  return {
    order_id: data.validated.id,
    discount: data.validated.discount,
    total: data.validated.total_after,
    shipping,
    saved_note_id: saved || null
  };
};`;

const flows = [
  {
    flow: {
      id: 'f0000000-0000-4000-8000-000000000001',
      name: 'Lab: Weather',
      icon: 'cloud',
      color: '#3B82F6',
      description: 'Calls the local mock weather API and returns the response.',
      status: 'active',
      trigger: 'webhook',
      accountability: 'all',
      options: {
        method: 'POST',
        async: false,
        return: 'result',
        error_on_reject: false,
        cacheEnabled: false
      }
    },
    operations: [
      {
        id: 'a0000000-0000-4000-8000-000000000001',
        name: 'Call weather mock',
        key: 'weather',
        type: 'request',
        position_x: 20,
        position_y: 20,
        options: {
          method: 'GET',
          url: '{{$env.MOCK_API_URL}}/api/mock/weather?city={{$trigger.body.city}}&units={{$trigger.body.units}}',
          headers: [{ header: 'x-lab-secret', value: '{{$env.LAB_SECRET}}' }],
          body: ''
        }
      },
      {
        id: 'a0000000-0000-4000-8000-000000000007',
        name: 'Return forecast',
        key: 'result',
        type: 'exec',
        position_x: 260,
        position_y: 20,
        options: { code: weatherResultCode }
      }
    ]
  },
  {
    flow: {
      id: 'f0000000-0000-4000-8000-000000000002',
      name: 'Lab: Enrich note',
      icon: 'auto_awesome',
      color: '#10B981',
      description: 'Adds a slug and word count to a note before it is saved.',
      status: 'active',
      trigger: 'event',
      accountability: '$trigger',
      options: {
        type: 'filter',
        scope: ['items.create'],
        collections: 'lab_notes',
        return: '$last'
      }
    },
    operations: [
      {
        id: 'a0000000-0000-4000-8000-000000000002',
        name: 'Enrich payload',
        key: 'enrich',
        type: 'exec',
        position_x: 20,
        position_y: 20,
        options: { code: enrichCode }
      }
    ]
  },
  {
    flow: {
      id: 'f0000000-0000-4000-8000-000000000003',
      name: 'Lab: Order automation',
      icon: 'shopping_cart',
      color: '#F59E0B',
      description: 'Validates an order, applies a tier discount, calls shipping, saves a note, and returns a summary.',
      status: 'active',
      trigger: 'webhook',
      accountability: 'all',
      options: {
        method: 'POST',
        async: false,
        return: 'summary',
        error_on_reject: true,
        cacheEnabled: false
      }
    },
    operations: [
      {
        id: 'a0000000-0000-4000-8000-000000000003',
        name: 'Validate and discount',
        key: 'validated',
        type: 'exec',
        position_x: 20,
        position_y: 20,
        options: { code: orderValidationCode }
      },
      {
        id: 'a0000000-0000-4000-8000-000000000004',
        name: 'Call shipping mock',
        key: 'shipping',
        type: 'request',
        position_x: 260,
        position_y: 20,
        options: {
          method: 'POST',
          url: '{{$env.MOCK_API_URL}}/api/mock/shipping',
          headers: [
            { header: 'Content-Type', value: 'application/json' },
            { header: 'x-lab-secret', value: '{{$env.LAB_SECRET}}' }
          ],
          body: '{"order_id":"{{validated.id}}","total":{{validated.total_after}},"email":"{{validated.email}}"}'
        }
      },
      {
        id: 'a0000000-0000-4000-8000-000000000005',
        name: 'Save order note',
        key: 'save',
        type: 'item-create',
        position_x: 500,
        position_y: 20,
        options: {
          collection: 'lab_notes',
          permissions: '$full',
          emitEvents: false,
          payload: {
            title: 'Order {{validated.id}}',
            body: 'Automated order for {{validated.email}}',
            status: 'processed',
            source: 'order',
            slug: 'order-{{validated.id}}',
            payload: '{{shipping.data}}'
          }
        }
      },
      {
        id: 'a0000000-0000-4000-8000-000000000006',
        name: 'Build summary',
        key: 'summary',
        type: 'exec',
        position_x: 740,
        position_y: 20,
        options: { code: orderSummaryCode }
      }
    ]
  }
];

for (const entry of flows) {
  const flow = entry.flow;
  const operations = entry.operations.map((operation, index) => ({
    ...operation,
    flow: flow.id,
    resolve: entry.operations[index + 1]?.id || null,
    reject: null
  }));

  await ensureFlow(flow);
  for (const operation of operations) {
    await ensureOperation(operation);
  }
  for (const operation of operations) {
    await api(`/operations/${operation.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ resolve: operation.resolve, reject: operation.reject })
    });
  }
  await api(`/flows/${flow.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ operation: operations[0]?.id || null })
  });
  console.log(`  chained ${operations.length} operation(s)`);
}

const sections = await api('/items/sections?filter[slug][_eq]=advanced&limit=1');
let sectionId = sections.data?.[0]?.id;
if (sectionId) {
  await api(`/items/sections/${sectionId}`, {
    method: 'PATCH',
    body: JSON.stringify(content.section)
  });
} else {
  const created = await api('/items/sections', {
    method: 'POST',
    body: JSON.stringify(content.section)
  });
  sectionId = created.data.id;
}
console.log(`section ${content.section.slug} ready`);

for (const lesson of content.lessons) {
  const payload = {
    section: sectionId,
    slug: lesson.slug,
    title: lesson.title,
    sort: lesson.sort,
    track: lesson.track || 'api',
    outcome: lesson.outcome,
    mental_model: lesson.mental_model,
    lab: lesson.lab,
    takeaway: lesson.takeaway,
    knowledge_check: lesson.knowledge_check,
    deep_dive: lesson.deep_dive,
    published: true
  };
  const existing = await api(`/items/lessons?filter[slug][_eq]=${encodeURIComponent(lesson.slug)}&limit=1`);
  if (existing.data?.[0]?.id) {
    await api(`/items/lessons/${existing.data[0].id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  } else {
    await api('/items/lessons', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
  console.log(`lesson ${lesson.slug} ready`);
}

console.log('\nSeed complete.');
console.log(`Directus: ${DIRECTUS_URL}`);
console.log(`Lessons: ${content.lessons.length}`);
