// src/pages/OwnerPlaceForm.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import { getPlace, uploadPlaceImages, deletePlaceImage } from "../services/places";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";

// helper to match server-side rule: only Google Maps links allowed
function isGoogleMapsUrl(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (host === "maps.app.goo.gl") return true;
    if (host === "goo.gl" || host === "goo.gle") return u.pathname.startsWith("/maps");
    if (host.endsWith("google.com") || host.includes(".google.")) {
      return u.pathname.startsWith("/maps");
    }
    return false;
  } catch {
    return false;
  }
}

const PlaceSchema = Yup.object({
  name: Yup.string().trim().min(2, "At least 2 characters").required("Name is required"),
  description: Yup.string().trim().min(10, "At least 10 characters").required("Description is required"),
  location: Yup.string().trim().required("Location is required"),
  timings: Yup.string().trim().required("Timings are required"),
  price: Yup.number()
    .typeError("Price must be a number")
    .min(0, "Price cannot be negative")
    .max(10000000, "Price too large")
    .required("Price is required"),
  imageUrl: Yup.string().trim().url("Must be a valid URL").nullable().optional(),
  googleMapsUrl: Yup.string()
    .trim()
    .url("Enter a valid URL")
    .test("google-maps-only", "Please provide a Google Maps link (maps.google.com or maps.app.goo.gl).", (v) => !v || isGoogleMapsUrl(v))
    .optional(),
});

export default function OwnerPlaceForm({ edit = false }) {
  const { placeId } = useParams();
  const navigate = useNavigate();

  // initial values (reinitialized when editing)
  const [initialValues, setInitialValues] = useState({
    name: "",
    description: "",
    location: "",
    timings: "",
    price: 0,
    imageUrl: "",
    googleMapsUrl: "",
  });

  const [loading, setLoading] = useState(false);

  // Selected files to upload (works for both create & edit mode)
  const [selectedFiles, setSelectedFiles] = useState([]);
  const previews = useMemo(
    () => selectedFiles.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })),
    [selectedFiles]
  );

  // Existing images (edit mode)
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    if (edit && placeId) {
      (async () => {
        const p = await getPlace(placeId);
        setInitialValues({
          name: p.name ?? "",
          description: p.description ?? "",
          location: p.location ?? "",
          timings: p.timings ?? "",
          price: p.price ?? 0,
          imageUrl: p.imageUrl ?? "",
          googleMapsUrl: p.googleMapsUrl ?? "",
        });
        setExistingImages((p.images ?? []).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
      })();
    }
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [edit, placeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const onRemoveExisting = async (imgId) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await deletePlaceImage(placeId, imgId);
      setExistingImages((arr) => arr.filter((i) => i.placeImageId !== imgId));
      toast.success("Image deleted.");
    } catch (e) {
      toast.error(e?.response?.data || "Delete failed", { duration: 3000 });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{edit ? "Edit Place" : "Add Place"}</h2>

      <Formik
        initialValues={initialValues}
        validationSchema={PlaceSchema}
        enableReinitialize
        onSubmit={async (values, { setSubmitting }) => {
          try {
            setLoading(true);
            // 1) Create or update the place
            let id = placeId;
            const payload = {
              ...values,
              price: Number(values.price),
              imageUrl: values.imageUrl?.trim() || "",
              googleMapsUrl: values.googleMapsUrl?.trim() || "",
            };

            if (edit) {
              await toast.promise(api.put(`/Places/${placeId}`, payload), {
                loading: "Saving changes…",
                success: "Place updated.",
                error: (err) => err?.response?.data || "Failed to save",
              });
            } else {
              const { data } = await toast.promise(api.post(`/Places`, payload), {
                loading: "Creating place…",
                success: "Place created.",
                error: (err) => err?.response?.data || "Failed to create",
              });
              id = data.placeId;
            }

            // 2) If files selected, upload them all
            if (selectedFiles.length > 0 && id) {
              await toast.promise(uploadPlaceImages(id, selectedFiles), {
                loading: "Uploading images…",
                success: "Images uploaded.",
                error: (err) => err?.response?.data || "Image upload failed",
              });
            }

            navigate("/dashboard/owner");
          } catch (err) {
            // errors already toasted by toast.promise above; keep a safety toast:
            if (err && !err.__handled) {
              toast.error(err?.response?.data || "Failed to save");
            }
          } finally {
            setSubmitting(false);
            setLoading(false);
          }
        }}
      >
        {({ errors, touched, isSubmitting, values, handleChange }) => (
          <Form className="grid gap-4">
            <div>
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <Field
                name="name"
                className={`input input-bordered w-full ${touched.name && errors.name ? "input-error" : ""}`}
                placeholder="e.g., WonderLa Amusement Park"
              />
              {touched.name && errors.name && <div className="text-error text-xs mt-1">{errors.name}</div>}
            </div>

            <div>
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <Field
                as="textarea"
                name="description"
                className={`textarea textarea-bordered w-full ${touched.description && errors.description ? "textarea-error" : ""}`}
                minLength={10}
                placeholder="Describe the place, highlights, what to expect…"
              />
              {touched.description && errors.description && (
                <div className="text-error text-xs mt-1">{errors.description}</div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <span className="label-text">Location (text)</span>
                </label>
                <Field
                  name="location"
                  className={`input input-bordered w-full ${touched.location && errors.location ? "input-error" : ""}`}
                  placeholder="Bengaluru, Karnataka"
                />
                {touched.location && errors.location && <div className="text-error text-xs mt-1">{errors.location}</div>}
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Timings</span>
                </label>
                <Field
                  name="timings"
                  className={`input input-bordered w-full ${touched.timings && errors.timings ? "input-error" : ""}`}
                  placeholder="Mon–Sun, 10:00 AM – 6:00 PM"
                />
                {touched.timings && errors.timings && <div className="text-error text-xs mt-1">{errors.timings}</div>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <span className="label-text">Price (INR)</span>
                </label>
                <Field
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  className={`input input-bordered w-full ${touched.price && errors.price ? "input-error" : ""}`}
                  placeholder="999"
                />
                {touched.price && errors.price && <div className="text-error text-xs mt-1">{errors.price}</div>}
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Legacy Image URL (optional)</span>
                </label>
                <Field
                  name="imageUrl"
                  className={`input input-bordered w-full ${touched.imageUrl && errors.imageUrl ? "input-error" : ""}`}
                  placeholder="https://…"
                />
                {touched.imageUrl && errors.imageUrl && (
                  <div className="text-error text-xs mt-1">{errors.imageUrl}</div>
                )}
              </div>
            </div>

            {/* Google Maps link (server validates it's a Google Maps URL) */}
            <div>
              <label className="label">
                <span className="label-text">Google Maps link</span>
              </label>
              <Field
                name="googleMapsUrl"
                type="url"
                className={`input input-bordered w-full ${touched.googleMapsUrl && errors.googleMapsUrl ? "input-error" : ""}`}
                placeholder="https://maps.app.goo.gl/… or https://www.google.com/maps/…"
              />
              {touched.googleMapsUrl && errors.googleMapsUrl && (
                <div className="text-error text-xs mt-1">{errors.googleMapsUrl}</div>
              )}
              {values.googleMapsUrl && !errors.googleMapsUrl && (
                <a
                  href={values.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-primary mt-1 inline-block"
                >
                  Preview in Maps
                </a>
              )}
            </div>

            {/* Multi-image uploader (works in both create & edit) */}
            <div>
              <label className="label">
                <span className="label-text">Upload Images</span>
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                className="file-input file-input-bordered w-full"
                onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
              />
              {selectedFiles.length > 0 && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {previews.map((p) => (
                    <div key={p.url} className="rounded overflow-hidden border">
                      <img src={p.url} alt={p.name} className="w-full aspect-video object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Existing images (edit mode) */}
            {edit && existingImages.length > 0 && (
              <div>
                <div className="label">
                  <span className="label-text">Existing Images</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {existingImages.map((img) => (
                    <div key={img.placeImageId} className="relative rounded overflow-hidden border">
                      <img src={img.url} alt="" className="w-full aspect-video object-cover" />
                      <button
                        type="button"
                        onClick={() => onRemoveExisting(img.placeImageId)}
                        className="btn btn-xs btn-error text-white absolute right-2 top-2"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              className={`btn btn-primary ${loading || isSubmitting ? "loading" : ""}`}
              disabled={loading || isSubmitting}
              type="submit"
            >
              {edit ? "Save Changes" : "Create Place"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}