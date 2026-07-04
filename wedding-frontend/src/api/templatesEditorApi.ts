import axiosClient from './axiosClient';
import type { CanvasBlockPayload } from './cardsApi';

export interface SaveTemplateCanvasPayload {
  blocks: CanvasBlockPayload[];
  background?: object;
}

export const templatesEditorApi = {
  /** Load template + blocks để đưa vào editor (không giới hạn status) */
  getTemplateCanvas: async (templateId: string) => {
    const res = await axiosClient.get(`/admin/templates/${templateId}/canvas`);
    return res.data;
  },

  /** Lưu toàn bộ canvas (blocks + background) của template */
  saveTemplateCanvas: async (templateId: string, payload: SaveTemplateCanvasPayload) => {
    const res = await axiosClient.post(`/admin/templates/${templateId}/canvas`, payload);
    return res.data;
  },

  /** Upload thumbnail chụp từ canvas */
  uploadTemplateThumbnail: async (templateId: string, blob: Blob) => {
    const formData = new FormData();
    formData.append('file', blob, 'thumbnail.webp');
    const res = await axiosClient.post(`/admin/templates/${templateId}/thumbnail`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
