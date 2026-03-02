import { defineConfig } from 'tinacms';

// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  'main';

export default defineConfig({
  branch,

  // Get this from tina.io
  clientId: process.env.TINA_CLIENT_ID,
  // Get this from tina.io
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'images',
      publicFolder: 'public',
    },
  },
  // See docs on content modeling for more info on how to setup new content models:
  // https://tina.io/docs/schema/
  schema: {
    collections: [
      {
        name: 'blog',
        label: 'Blog Posts',
        path: 'src/content/blog',
        format: 'md',
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Title',
            isTitle: true,
            required: true,
          },
          {
            type: 'datetime',
            name: 'date',
            label: 'Date',
            required: true,
          },
          {
            type: 'string',
            name: 'lang',
            label: 'Language',
            required: true,
            options: [
              { value: 'en', label: 'English' },
              { value: 'es', label: 'Español' },
            ],
          },
          {
            type: 'string',
            name: 'tags',
            label: 'Tags',
            list: true,
          },
          {
            type: 'boolean',
            name: 'draft',
            label: 'Draft',
          },
          {
            type: 'string',
            name: 'description',
            label: 'Description',
            required: true,
            ui: {
              component: 'textarea',
            },
          },
          {
            type: 'image',
            name: 'image',
            label: 'Cover Image',
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body',
            isBody: true,
            templates: [
              {
                name: 'VideoEmbed',
                label: 'Video Embed',
                fields: [
                  {
                    name: 'url',
                    label: 'Video URL (YouTube, Vimeo, or Cloudflare Stream embed URL)',
                    type: 'string',
                    required: true,
                  },
                  {
                    name: 'title',
                    label: 'Video Title (for accessibility)',
                    type: 'string',
                  },
                ],
              },
              {
                name: 'DocumentEmbed',
                label: 'Document Embed (PDF / PowerPoint)',
                fields: [
                  {
                    name: 'url',
                    label: 'Document URL (public link to PDF or PPT/PPTX file)',
                    type: 'string',
                    required: true,
                  },
                  {
                    name: 'type',
                    label: 'Document Type',
                    type: 'string',
                    options: [
                      { value: 'pdf', label: 'PDF' },
                      { value: 'ppt', label: 'PowerPoint (PPT / PPTX)' },
                    ],
                    required: true,
                  },
                  {
                    name: 'title',
                    label: 'Document Title (for accessibility)',
                    type: 'string',
                  },
                  {
                    name: 'height',
                    label: 'Embed Height (e.g. 600px)',
                    type: 'string',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: 'portfolio',
        label: 'Portfolio',
        path: 'src/content/portfolio',
        format: 'md',
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Title',
            isTitle: true,
            required: true,
          },
          {
            type: 'datetime',
            name: 'date',
            label: 'Date',
            required: true,
          },
          {
            type: 'string',
            name: 'lang',
            label: 'Language',
            required: true,
            options: [
              { value: 'en', label: 'English' },
              { value: 'es', label: 'Español' },
            ],
          },
          {
            type: 'string',
            name: 'client',
            label: 'Client',
          },
          {
            type: 'string',
            name: 'tags',
            label: 'Tags',
            list: true,
          },
          {
            type: 'image',
            name: 'image',
            label: 'Cover Image',
            required: true,
          },
          {
            type: 'boolean',
            name: 'featured',
            label: 'Featured',
          },
          {
            type: 'string',
            name: 'description',
            label: 'Description',
            required: true,
            ui: {
              component: 'textarea',
            },
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body',
            isBody: true,
            templates: [
              {
                name: 'VideoEmbed',
                label: 'Video Embed',
                fields: [
                  {
                    name: 'url',
                    label: 'Video URL (YouTube, Vimeo, or Cloudflare Stream embed URL)',
                    type: 'string',
                    required: true,
                  },
                  {
                    name: 'title',
                    label: 'Video Title (for accessibility)',
                    type: 'string',
                  },
                ],
              },
              {
                name: 'DocumentEmbed',
                label: 'Document Embed (PDF / PowerPoint)',
                fields: [
                  {
                    name: 'url',
                    label: 'Document URL (public link to PDF or PPT/PPTX file)',
                    type: 'string',
                    required: true,
                  },
                  {
                    name: 'type',
                    label: 'Document Type',
                    type: 'string',
                    options: [
                      { value: 'pdf', label: 'PDF' },
                      { value: 'ppt', label: 'PowerPoint (PPT / PPTX)' },
                    ],
                    required: true,
                  },
                  {
                    name: 'title',
                    label: 'Document Title (for accessibility)',
                    type: 'string',
                  },
                  {
                    name: 'height',
                    label: 'Embed Height (e.g. 600px)',
                    type: 'string',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
});
