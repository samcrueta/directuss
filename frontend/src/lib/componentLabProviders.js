import * as directusApi from "./studio";
import * as payloadApi from "./payloadComponents";
import * as keystoneApi from "./keystoneComponents";

const DIRECTUS_PROVIDER = {
  id: "directus",
  label: "Directus",
  healthUrl: "/api/lab/health",
  savedPreview: "server",
  supportsPublishing: false,
  labels: {
    checking: "Checking Directus",
    online: "Directus connected",
    offline: "Directus offline",
    offlineMessage:
      "Directus is offline. You can keep editing and previewing locally, but saving is unavailable.",
    save: "Save version",
    saving: "Saving…",
    publish: "Publish",
    publishing: "Publishing…",
    saved: "Directus",
    savedPreviewTitle: "Directus component preview",
    savedBadge: "Rendered by Directus",
    versionsSubtitle: "Stored in Directus for this lesson and this browser.",
    emptyVersions: "No saved versions yet. Save once to keep a version in Directus.",
    storageError: "Directus did not return the saved version.",
    adminNote:
      "This prototype stays in draft and is never published to the public showcase."
  },
  api: directusApi
};

const PAYLOAD_PROVIDER = {
  id: "payload",
  label: "Payload",
  healthUrl: "/api/lab/payload/health",
  savedPreview: "srcDoc",
  supportsPublishing: true,
  labels: {
    checking: "Checking Payload",
    online: "Payload connected",
    offline: "Payload offline",
    offlineMessage:
      "Payload is offline. You can keep editing and previewing locally, but saving and publishing are unavailable.",
    save: "Save draft",
    saving: "Saving draft…",
    publish: "Publish to showcase",
    publishing: "Publishing…",
    saved: "Payload",
    savedPreviewTitle: "Saved Payload component preview",
    savedBadge: "Saved in Payload",
    versionsSubtitle:
      "Saved in Payload for this lesson and this browser. Publish a version to show it in the public gallery.",
    emptyVersions:
      "No saved versions yet. Save a draft, then publish it when the component is ready.",
    storageError: "Payload did not return the saved version.",
    adminNote:
      "Real Payload admin views are React components. This prototype stays in draft and is never published to the public showcase."
  },
  api: payloadApi
};

const KEYSTONE_PROVIDER = {
  id: "keystone",
  label: "Keystone",
  healthUrl: "/api/lab/keystone/health",
  savedPreview: "srcDoc",
  supportsPublishing: true,
  labels: {
    checking: "Checking Keystone",
    online: "Keystone connected",
    offline: "Keystone offline",
    offlineMessage:
      "Keystone is offline. You can keep editing and previewing locally, but saving and publishing are unavailable.",
    save: "Save draft",
    saving: "Saving draft…",
    publish: "Publish to showcase",
    publishing: "Publishing…",
    saved: "Keystone",
    savedPreviewTitle: "Saved Keystone component preview",
    savedBadge: "Saved in Keystone",
    versionsSubtitle:
      "Saved in Keystone for this lesson and this browser. Publish a version to show it in the public gallery.",
    emptyVersions:
      "No saved versions yet. Save a draft, then publish it when the component is ready.",
    storageError: "Keystone did not return the saved version.",
    adminNote:
      "Real Keystone admin views are React components. This prototype stays in draft and is never published to the public showcase."
  },
  api: keystoneApi
};

const PROVIDERS = {
  directus: DIRECTUS_PROVIDER,
  payload: PAYLOAD_PROVIDER,
  keystone: KEYSTONE_PROVIDER
};

export function getComponentLabProvider(provider) {
  return PROVIDERS[provider] || DIRECTUS_PROVIDER;
}
