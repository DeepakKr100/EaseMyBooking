import { api } from "./api";

export async function getPlace(id) {
  const { data } = await api.get(`/Places/${id}`);
  return data;
}

export async function uploadPlaceImages(placeId, files) {
  const form = new FormData();
  for (const f of files) form.append("files", f);
  const { data } = await api.post(`/Places/${placeId}/images`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data; // [{ placeImageId, url, sortOrder }, ...]
}

export async function deletePlaceImage(placeId, imageId) {
  const { data } = await api.delete(`/Places/${placeId}/images/${imageId}`);
  return data;
}
