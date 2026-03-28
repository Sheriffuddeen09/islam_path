import React, { useState, useEffect, useRef } from "react";
import api from "../../Api/axios";

export default function EditProductModal({ product, fetchProducts, setModal }) {
  const [selected, setSelected] = useState({});
  const [gallery, setGallery] = useState([]);
  const [keyFeatures, setKeyFeatures] = useState([]);
  const [specifications, setSpecifications] = useState([]);
  const [updating, setUpdating] = useState(false);

  const fileRef = useRef()

  const [initialized, setInitialized] = useState(false);

useEffect(() => {
  if (product) {
    setSelected({
      ...product,
      front_image: product.front_image || null,
      back_image: product.back_image || null,
      side_image: product.side_image || null,
      pdf_file: product.pdf_file || null,
    });

    // ✅ FIXED HERE
    setGallery(
      product.images?.map((img) => ({
        image_path: img.image_path
      })) || []
    );

    setKeyFeatures(product.key_features || []);
    setSpecifications(product.specifications || []);
  }
}, [product]);


  const updateProduct = async () => {
  try {
    setUpdating(true);
    const formData = new FormData();

    // Append all normal fields
    [
      "title",
      "author",
      "description",
      "price",
      "stock",
      "discount",
      "currency",
      "location",
      "delivery_time",
      "delivery_method",
      "delivery_price",
      "downloadable",
      "sale_type",
      "company_type",
      "company_available",
      "brand_name",
    ].forEach((key) => {
      const value = selected[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    // Append JSON fields if they exist
    if (keyFeatures.length > 0) {
      formData.append("key_features", JSON.stringify(keyFeatures));
    }
    if (specifications.length > 0) {
      formData.append("specifications", JSON.stringify(specifications));
    }

    // Append single file uploads
    ["front_image", "back_image", "side_image", "pdf_file"].forEach((key) => {
      const file = selected[key];
      if (file instanceof File) {
        formData.append(key, file);
      }
    });

    // Append gallery images (multiple)
   const newImages = gallery.filter((img) => img.file instanceof File);

    console.log("NEW IMAGES:", newImages);

    newImages.forEach((img, index) => {
      formData.append(`images[${index}]`, img.file);
    });
    console.log("GALLERY STATE:", gallery);

    gallery.forEach((img, index) => {
      if (img.file instanceof File) {
        formData.append("images[]", img.file); // ✅ IMPORTANT
      }
    });

    // Make API request
    await api.post(`/api/my-product/${selected.id}?_method=PUT`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    fetchProducts();
    setModal(false);
  } catch (err) {
    console.error(err);
  } finally {
    setUpdating(false);
  }
};


 const removeImage = (i) => {
    const newGallery = [...gallery];
    newGallery.splice(i, 1);
    setGallery(newGallery);
  };


  const fields = [
    { key: "title", label: "Title", type: "text" },
    { key: "author", label: "Author", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "price", label: "Price", type: "text" },
    { key: "stock", label: "Stock", type: "text" },
    { key: "discount", label: "Discount", type: "text" },
    { key: "currency", label: "Currency", type: "select", 
      options: [
        { label: "USD", value: "USD" },
        { label: "NGN", value: "NGN" },
        { label: "GBP", value: "GBP" },
        { label: "EUR", value: "EUR" }
      ]
     },
    { key: "location", label: "Location", type: "text" },
    { key: "delivery_method", label: "Delivery Method (Shipping, Courier, or Pickup Station)", type: "text" },
    {
      key: "downloadable",
      label: "Downloadable",
      type: "select",
      options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" }
      ]
    },
    {
      key: "sale_type",
      label: "Sale Type",
      type: "select",
      options: [
        { label: "Physical", value: "physical" },
        { label: "Download", value: "download" }
      ]
    },
    {
      key: "company_type",
      label: "Company Type",
      type: "select",
      options: [
        { label: "Manufacturer", value: "manufacturer" },
        { label: "Reseller", value: "reseller" }
      ]
    },
    {
      key: "company_available",
      label: "Availability",
      type: "select",
      options: [
        { label: "Available", value: "available" },
        { label: "Out of Stock", value: "out of stock" }
      ]
    },
    { key: "brand_name", label: "Brand Name", type: "text" },
  ];

  const addKeyFeature = () => setKeyFeatures([...keyFeatures, ""]);
  const updateKeyFeature = (i, val) => {
    const temp = [...keyFeatures];
    temp[i] = val;
    setKeyFeatures(temp);
  };
  const removeKeyFeature = (i) => setKeyFeatures(keyFeatures.filter((_, idx) => idx !== i));

  const addSpec = () => setSpecifications([...specifications, { key: "", value: "" }]);
  const updateSpec = (i, field, val) => {
    const temp = [...specifications];
    temp[i][field] = val;
    setSpecifications(temp);
  };
  const removeSpec = (i) => setSpecifications(specifications.filter((_, idx) => idx !== i));

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-10 z-50 overflow-auto">
      <div className="bg-white w-[650px] max-h-[90vh] overflow-y-auto p-6 rounded-xl shadow-lg space-y-4">

        <h2 className="text-xl font-bold">Edit Product</h2>

        {fields.map((field) => {
        const value = selected?.[field.key] ?? "";

        // ❌ hide if null
        if (selected?.[field.key] === null) return null;

        // ✅ hide downloadable + sale_type when NOT downloadable
        if (
          selected?.downloadable === "no" &&
          ["downloadable", "sale_type"].includes(field.key)
        ) {
          return null;
        }

        // ✅ NEW: hide delivery_method when downloadable is YES
        if (
          selected?.downloadable === "yes" &&
          field.key === "delivery_method"
        ) {
          return null;
        }

        // textarea
        if (field.type === "textarea") {
          return (
            <div key={field.key}>
              <label className="block font-medium">{field.label}</label>
              <textarea
                value={value}
                onChange={(e) =>
                  setSelected({ ...selected, [field.key]: e.target.value })
                }
                className="w-full border p-2 rounded"
              />
            </div>
          );
        }

        // select
        if (field.type === "select") {
          return (
            <div key={field.key}>
              <label className="block font-medium">{field.label}</label>

              <select
                value={selected[field.key] || ""}
                onChange={(e) =>
                  setSelected({ ...selected, [field.key]: e.target.value })
                }
                className="w-full border p-2 rounded"
              >
                <option value="">Select {field.label}</option>

                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        // input
        return (
          <div key={field.key}>
            <label className="block font-medium">{field.label}</label>
            <input
              type={field.type}
              value={value}
              onChange={(e) =>
                setSelected({ ...selected, [field.key]: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
          </div>
        );
      })}

       {keyFeatures.length > 0 && (
        <div>
          <h3 className="font-semibold">Key Features</h3>
          {keyFeatures.map((kf, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={kf}
                onChange={(e) => updateKeyFeature(i, e.target.value)}
                className="border p-1 flex-1"
              />
              <button
                onClick={() => removeKeyFeature(i)}
                className="bg-red-500 text-white px-2"
              >
                X
              </button>
            </div>
          ))}
          <button onClick={addKeyFeature} className="text-blue-600">
            + Add
          </button>
        </div>
      )}

        {specifications.length > 0 && (
        <div>
          <h3 className="font-semibold">Specifications</h3>
          {specifications.map((spec, i) => (
            <div key={i} className="flex gap-2">
              <input
                placeholder="Key"
                value={spec.key}
                onChange={(e) => updateSpec(i, "key", e.target.value)}
                className="border p-1 flex-1"
              />
              <input
                placeholder="Value"
                value={spec.value}
                onChange={(e) => updateSpec(i, "value", e.target.value)}
                className="border p-1 flex-1"
              />
              <button
                onClick={() => removeSpec(i)}
                className="bg-red-500 text-white px-2"
              >
                X
              </button>
            </div>
          ))}
          <button onClick={addSpec} className="text-blue-600">
            + Add
          </button>
        </div>
      )}
       {["front_image", "back_image", "side_image"].map((key) => {
        const inputId = `${key}-input`;

        return (
          <div key={key} className="mb-6">
            <label className="block mb-2 font-medium capitalize">
              {key.replace("_", " ")}
            </label>

            {selected[key] && (
              <img
                src={
                  selected[key] instanceof File
                    ? URL.createObjectURL(selected[key])
                    : `http://localhost:8000/storage/${selected[key]}`
                }
                className="w-32 h-32 object-cover mb-3 rounded"
              />
            )}

            <input
              type="file"
              id={inputId}
              className="hidden"
              onChange={(e) =>
                setSelected({ ...selected, [key]: e.target.files[0] })
              }
            />

            <label
              htmlFor={inputId}
              className="inline-block w-40 text-center whitespace-nowrap font-semibold capitalize text-black border-2 border-blue-600 border-dashed rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-50 transition"
            >
              Edit {key.replace("_", " ")}
            </label>
          </div>
        );
      })}

      {selected.pdf_file && (
        <div className="mb-6">
          <label className="block mb-2 font-medium">PDF File</label>

          {typeof selected.pdf_file === "string" && (
            <a
              href={`http://localhost:8000/storage/${selected.pdf_file}`}
              target="_blank"
              className="text-blue-600 underline block mb-2"
            >
              View Current PDF
            </a>
          )}

          <input
            type="file"
            id="pdf-input"
            className="hidden"
            onChange={(e) =>
              setSelected({ ...selected, pdf_file: e.target.files[0] })
            }
          />

          <label
            htmlFor="pdf-input"
            className="inline-block w-40 text-center font-bold border-2 border-blue-600 border-dashed rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-50"
          >
            Edit PDF
          </label>
        </div>
      )}

      <div className="mb-6">
        <h3 className="font-medium mb-2">Gallery</h3>

        <div className="flex gap-2 overflow-x-auto mb-3">
          {gallery.map((img, i) => (
            <img
              key={i}
              src={
                img.preview
                  ? img.preview
                  : `http://localhost:8000/storage/${img.image_path}`
              }
              className="w-24 h-24 object-cover rounded"
            />
          ))}
          
        </div>

        <input
          ref={fileRef}
          type="file"
          id="gallery-input"
          multiple
          className="hidden"
         onChange={(e) => {
            const files = Array.from(e.target.files).map(file => ({
              file,
              preview: URL.createObjectURL(file)
            }));

            setGallery(files); // ✅ replaces everything
          }}
        />

        <label
          htmlFor="gallery-input"
          className="inline-block w-48 text-center font-bold border-2 border-blue-600 border-dashed rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-50"
        >
          Edit Product Images
        </label>
      </div>
        <button
          onClick={updateProduct}
          disabled={updating}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          {updating ? <p className="inline-flex items-center sm:gap-4 gap-1 "><svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg> Updating</p> : "Update"}
        </button>

        <button
          onClick={() => setModal(false)}
          className="w-full bg-gray-300 p-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}