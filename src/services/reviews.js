import { api } from "./api";

export async function addReview(placeId, rating, comment) {
  const { data } = await api.post("/Reviews", { placeId, rating, comment });
  return data; // { reviewId, rating, comment, createdAt, userName }
}

export async function getPlaceReviews(placeId) {
  const { data } = await api.get(`/Reviews/place/${placeId}`);
  return data;
}
