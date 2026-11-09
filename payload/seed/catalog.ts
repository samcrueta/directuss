export type FieldDef = {
  name: string
  label: string
  type: 'text' | 'textarea' | 'color' | 'number' | 'range' | 'select' | 'boolean' | 'list' | 'blocks'
  required?: boolean
  placeholder?: string
  maxLength?: number
  rows?: number
  min?: number
  max?: number
  step?: number
  options?: { label: string; value: string }[]
  itemLabel?: string
  itemFields?: FieldDef[]
  minItems?: number
  maxItems?: number
  blocks?: { slug: string; label: string; fields: FieldDef[] }[]
}

export type KindDef = {
  slug: string
  label: string
  surface: 'public' | 'admin' | 'internal'
  description: string
  icon: string
  hidden?: boolean
  fields: FieldDef[]
  defaults: Record<string, unknown>
  defaultTokens?: Record<string, unknown>
}

export const TOKEN_DEFAULTS = {
  theme: 'light',
  accent: '#4f46e5',
  background: '#ffffff',
  foreground: '#0f172a',
  muted: '#64748b',
  radius: 14,
  spacing: 24,
  fontScale: 1,
  shadow: 'soft',
}

export const TOKEN_FIELDS: FieldDef[] = [
  {
    name: 'theme',
    label: 'Theme',
    type: 'select',
    options: [
      { label: 'Light', value: 'light' },
      { label: 'Dark', value: 'dark' },
    ],
  },
  { name: 'accent', label: 'Accent', type: 'color' },
  { name: 'background', label: 'Background', type: 'color' },
  { name: 'foreground', label: 'Foreground', type: 'color' },
  { name: 'muted', label: 'Muted text', type: 'color' },
  { name: 'radius', label: 'Corner radius', type: 'range', min: 0, max: 32, step: 1 },
  { name: 'spacing', label: 'Spacing', type: 'range', min: 8, max: 48, step: 2 },
  { name: 'fontScale', label: 'Type scale', type: 'range', min: 0.8, max: 1.4, step: 0.05 },
  {
    name: 'shadow',
    label: 'Shadow',
    type: 'select',
    options: [
      { label: 'None', value: 'none' },
      { label: 'Soft', value: 'soft' },
      { label: 'Strong', value: 'strong' },
    ],
  },
]

const heroFields: FieldDef[] = [
  { name: 'eyebrow', label: 'Eyebrow', type: 'text', maxLength: 48, placeholder: 'Page builder' },
  { name: 'title', label: 'Title', type: 'text', maxLength: 90, required: true },
  { name: 'body', label: 'Body', type: 'textarea', rows: 3, maxLength: 280 },
  { name: 'primaryLabel', label: 'Primary action', type: 'text', maxLength: 40 },
  { name: 'primaryHref', label: 'Primary link', type: 'text', maxLength: 200, placeholder: '#' },
  { name: 'secondaryLabel', label: 'Secondary action', type: 'text', maxLength: 40 },
  { name: 'secondaryHref', label: 'Secondary link', type: 'text', maxLength: 200, placeholder: '#' },
  {
    name: 'alignment',
    label: 'Alignment',
    type: 'select',
    options: [
      { label: 'Left', value: 'left' },
      { label: 'Center', value: 'center' },
    ],
  },
  {
    name: 'art',
    label: 'Artwork',
    type: 'select',
    options: [
      { label: 'None', value: 'none' },
      { label: 'Gradient', value: 'gradient' },
      { label: 'Grid', value: 'grid' },
    ],
  },
]

const featureItemFields: FieldDef[] = [
  { name: 'icon', label: 'Icon', type: 'text', maxLength: 4, placeholder: '◈' },
  { name: 'title', label: 'Title', type: 'text', maxLength: 60, required: true },
  { name: 'body', label: 'Body', type: 'textarea', rows: 2, maxLength: 180 },
]

const featureGridFields: FieldDef[] = [
  { name: 'heading', label: 'Heading', type: 'text', maxLength: 80, required: true },
  { name: 'description', label: 'Description', type: 'textarea', rows: 2, maxLength: 220 },
  {
    name: 'columns',
    label: 'Columns',
    type: 'select',
    options: [
      { label: 'Two', value: '2' },
      { label: 'Three', value: '3' },
      { label: 'Four', value: '4' },
    ],
  },
  {
    name: 'features',
    label: 'Features',
    type: 'list',
    itemLabel: 'Feature',
    minItems: 1,
    maxItems: 6,
    itemFields: featureItemFields,
  },
]

const testimonialFields: FieldDef[] = [
  { name: 'quote', label: 'Quote', type: 'textarea', rows: 4, maxLength: 320, required: true },
  { name: 'author', label: 'Author', type: 'text', maxLength: 60, required: true },
  { name: 'role', label: 'Role', type: 'text', maxLength: 80 },
  { name: 'company', label: 'Company', type: 'text', maxLength: 60 },
  { name: 'rating', label: 'Rating (1–5)', type: 'number', min: 1, max: 5 },
]

const ctaFields: FieldDef[] = [
  { name: 'heading', label: 'Heading', type: 'text', maxLength: 80, required: true },
  { name: 'body', label: 'Body', type: 'textarea', rows: 2, maxLength: 220 },
  { name: 'label', label: 'Button label', type: 'text', maxLength: 40 },
  { name: 'href', label: 'Button link', type: 'text', maxLength: 200, placeholder: '#' },
  {
    name: 'tone',
    label: 'Tone',
    type: 'select',
    options: [
      { label: 'Accent', value: 'accent' },
      { label: 'Quiet', value: 'quiet' },
    ],
  },
]

export const CATALOG_KINDS: KindDef[] = [
  {
    slug: 'card',
    label: 'Card',
    surface: 'public',
    description: 'A compact card with an eyebrow, headline, body, and one action.',
    icon: '▤',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text', maxLength: 48, placeholder: 'Level 7' },
      { name: 'title', label: 'Title', type: 'text', maxLength: 90, required: true },
      { name: 'body', label: 'Body', type: 'textarea', rows: 3, maxLength: 280 },
      { name: 'ctaLabel', label: 'Action label', type: 'text', maxLength: 40 },
      { name: 'ctaHref', label: 'Action link', type: 'text', maxLength: 200, placeholder: '#' },
      {
        name: 'align',
        label: 'Alignment',
        type: 'select',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
        ],
      },
    ],
    defaults: {
      eyebrow: 'Level 7',
      title: 'A component worth shipping',
      body: 'Payload stores the content. React renders the experience. This card is the bridge between the two.',
      ctaLabel: 'Read the lesson',
      ctaHref: '#',
      align: 'left',
    },
  },
  {
    slug: 'button',
    label: 'Button',
    surface: 'public',
    description: 'A primary action with size, variant, disabled, and loading states.',
    icon: '◉',
    fields: [
      { name: 'label', label: 'Label', type: 'text', maxLength: 40, required: true },
      {
        name: 'variant',
        label: 'Variant',
        type: 'select',
        options: [
          { label: 'Primary', value: 'primary' },
          { label: 'Secondary', value: 'secondary' },
          { label: 'Ghost', value: 'ghost' },
        ],
      },
      {
        name: 'size',
        label: 'Size',
        type: 'select',
        options: [
          { label: 'Small', value: 'sm' },
          { label: 'Medium', value: 'md' },
          { label: 'Large', value: 'lg' },
        ],
      },
      { name: 'icon', label: 'Icon', type: 'text', maxLength: 4, placeholder: '→' },
      { name: 'disabled', label: 'Disabled', type: 'boolean' },
      { name: 'loading', label: 'Loading', type: 'boolean' },
    ],
    defaults: {
      label: 'Save changes',
      variant: 'primary',
      size: 'md',
      icon: '→',
      disabled: false,
      loading: false,
    },
  },
  {
    slug: 'contactForm',
    label: 'Contact form',
    surface: 'public',
    description: 'A semantic form with labels, input types, validation, and a success state.',
    icon: '✉',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text', maxLength: 80, required: true },
      { name: 'description', label: 'Description', type: 'textarea', rows: 2, maxLength: 220 },
      { name: 'submitLabel', label: 'Submit label', type: 'text', maxLength: 40 },
      { name: 'showName', label: 'Show name field', type: 'boolean' },
      { name: 'showEmail', label: 'Show email field', type: 'boolean' },
      { name: 'showMessage', label: 'Show message field', type: 'boolean' },
      { name: 'successMessage', label: 'Success message', type: 'text', maxLength: 140 },
    ],
    defaults: {
      heading: 'Send a message',
      description: 'We usually reply within two working days.',
      submitLabel: 'Send message',
      showName: true,
      showEmail: true,
      showMessage: true,
      successMessage: 'Message sent. We will reply within two working days.',
    },
  },
  {
    slug: 'adminStatCard',
    label: 'Admin stat card',
    surface: 'admin',
    description: 'A dashboard card rendered inside the Payload admin panel.',
    icon: '◫',
    fields: [
      { name: 'label', label: 'Label', type: 'text', maxLength: 60, required: true },
      { name: 'value', label: 'Value', type: 'text', maxLength: 20, required: true },
      { name: 'delta', label: 'Delta', type: 'text', maxLength: 40, placeholder: '+12 this week' },
      {
        name: 'trend',
        label: 'Trend',
        type: 'select',
        options: [
          { label: 'Up', value: 'up' },
          { label: 'Down', value: 'down' },
          { label: 'Flat', value: 'flat' },
        ],
      },
      { name: 'footnote', label: 'Footnote', type: 'text', maxLength: 80 },
      { name: 'icon', label: 'Icon', type: 'text', maxLength: 4, placeholder: '◈' },
    ],
    defaults: {
      label: 'Published components',
      value: '128',
      delta: '+12 this week',
      trend: 'up',
      footnote: 'Across 17 lessons',
      icon: '◈',
    },
  },
  {
    slug: 'tokenField',
    label: 'Token field',
    surface: 'admin',
    description: 'A custom Payload field that edits a color token with a swatch and hex value.',
    icon: '◧',
    fields: [
      { name: 'label', label: 'Field label', type: 'text', maxLength: 60, required: true },
      { name: 'value', label: 'Value', type: 'color', required: true },
      { name: 'helper', label: 'Helper text', type: 'text', maxLength: 120 },
    ],
    defaults: {
      label: 'Accent color',
      value: '#4f46e5',
      helper: 'Used for primary actions and focus rings.',
    },
  },
  {
    slug: 'page',
    label: 'Page builder',
    surface: 'public',
    description: 'A page composed from typed blocks: hero, feature grid, testimonial, and call to action.',
    icon: '▥',
    fields: [
      { name: 'heading', label: 'Page heading', type: 'text', maxLength: 90, required: true },
      {
        name: 'sections',
        label: 'Sections',
        type: 'blocks',
        minItems: 1,
        maxItems: 8,
        blocks: [
          { slug: 'hero', label: 'Hero', fields: heroFields },
          { slug: 'featureGrid', label: 'Feature grid', fields: featureGridFields },
          { slug: 'testimonial', label: 'Testimonial', fields: testimonialFields },
          { slug: 'cta', label: 'Call to action', fields: ctaFields },
        ],
      },
    ],
    defaults: {
      heading: 'A page built from blocks',
      sections: [
        {
          blockType: 'hero',
          eyebrow: 'Page builder',
          title: 'Compose, do not hard-code',
          body: 'Every section is a typed block. Editors reorder them; developers render them.',
          primaryLabel: 'See the blocks',
          primaryHref: '#',
          secondaryLabel: '',
          secondaryHref: '',
          alignment: 'left',
          art: 'gradient',
        },
        {
          blockType: 'featureGrid',
          heading: 'Why blocks?',
          description: 'Blocks keep structure in the CMS and rendering in React.',
          columns: '3',
          features: [
            { icon: '◇', title: 'Typed', body: 'Each block has its own schema.' },
            { icon: '◈', title: 'Composable', body: 'Editors decide the order.' },
            { icon: '◉', title: 'Predictable', body: 'One block maps to one renderer.' },
          ],
        },
      ],
    },
  },
  {
    slug: 'pricing',
    label: 'Pricing table',
    surface: 'public',
    description: 'A three-plan pricing table with a highlighted plan and feature lists.',
    icon: '▦',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text', maxLength: 80, required: true },
      { name: 'description', label: 'Description', type: 'textarea', rows: 2, maxLength: 220 },
      {
        name: 'plans',
        label: 'Plans',
        type: 'list',
        itemLabel: 'Plan',
        minItems: 1,
        maxItems: 4,
        itemFields: [
          { name: 'name', label: 'Name', type: 'text', maxLength: 40, required: true },
          { name: 'price', label: 'Price', type: 'text', maxLength: 20, required: true },
          { name: 'period', label: 'Period', type: 'text', maxLength: 30 },
          { name: 'features', label: 'Features (one per line)', type: 'textarea', rows: 4, maxLength: 280 },
          { name: 'cta', label: 'Button label', type: 'text', maxLength: 40 },
          { name: 'featured', label: 'Highlight this plan', type: 'boolean' },
        ],
      },
    ],
    defaults: {
      heading: 'Simple pricing',
      description: 'Start small. Publish when you are ready.',
      plans: [
        {
          name: 'Starter',
          price: '$0',
          period: 'forever',
          features: 'One component\nPublic showcase\nCommunity support',
          cta: 'Start building',
          featured: false,
        },
        {
          name: 'Studio',
          price: '$24',
          period: 'per month',
          features: 'Unlimited components\nDraft previews\nFeatured placement',
          cta: 'Choose Studio',
          featured: true,
        },
        {
          name: 'Agency',
          price: '$79',
          period: 'per month',
          features: 'Team submissions\nModeration queue\nPriority support',
          cta: 'Talk to us',
          featured: false,
        },
      ],
    },
  },
  {
    slug: 'testimonial',
    label: 'Testimonial',
    surface: 'public',
    description: 'A quote with attribution, company, and rating.',
    icon: '❝',
    fields: testimonialFields,
    defaults: {
      quote: 'The lesson made the boundary between the CMS and the frontend click. I shipped my first component the same afternoon.',
      author: 'Ada Lovelace',
      role: 'Frontend engineer',
      company: 'Analytical Studio',
      rating: 5,
    },
  },
  {
    slug: 'hero',
    label: 'Hero block',
    surface: 'internal',
    hidden: true,
    description: 'A hero section used inside the page builder.',
    icon: '▬',
    fields: heroFields,
    defaults: {
      eyebrow: 'Page builder',
      title: 'Compose, do not hard-code',
      body: 'Every section is a typed block.',
      primaryLabel: 'See the blocks',
      primaryHref: '#',
      secondaryLabel: '',
      secondaryHref: '',
      alignment: 'left',
      art: 'gradient',
    },
  },
  {
    slug: 'featureGrid',
    label: 'Feature grid block',
    surface: 'internal',
    hidden: true,
    description: 'A feature grid used inside the page builder.',
    icon: '▦',
    fields: featureGridFields,
    defaults: {
      heading: 'Why blocks?',
      description: 'Blocks keep structure in the CMS and rendering in React.',
      columns: '3',
      features: [
        { icon: '◇', title: 'Typed', body: 'Each block has its own schema.' },
        { icon: '◈', title: 'Composable', body: 'Editors decide the order.' },
        { icon: '◉', title: 'Predictable', body: 'One block maps to one renderer.' },
      ],
    },
  },
  {
    slug: 'cta',
    label: 'Call to action block',
    surface: 'internal',
    hidden: true,
    description: 'A call to action used inside the page builder.',
    icon: '▶',
    fields: ctaFields,
    defaults: {
      heading: 'Ready to publish?',
      body: 'Ship a component to the showcase and see it rendered by Payload.',
      label: 'Open the showcase',
      href: '#',
      tone: 'accent',
    },
  },
]

export const SAMPLE_COMPONENTS = [
  {
    name: 'The bridge card',
    description: 'A clean card that explains the Payload-to-frontend boundary.',
    lessonSlug: 'components-two-worlds',
    kind: 'card',
    featured: true,
  },
  {
    name: 'Page builder demo',
    description: 'A page assembled from a hero, feature grid, quote, and call to action.',
    lessonSlug: 'blocks-and-the-page-builder',
    kind: 'page',
    featured: true,
  },
  {
    name: 'Studio pricing',
    description: 'A three-plan pricing table with the middle plan highlighted.',
    lessonSlug: 'drafts-preview-publish',
    kind: 'pricing',
    featured: false,
  },
  {
    name: 'A learner’s first publish',
    description: 'A testimonial from the first learner to publish to the gallery.',
    lessonSlug: 'capstone-the-showcase',
    kind: 'testimonial',
    featured: false,
  },
]
