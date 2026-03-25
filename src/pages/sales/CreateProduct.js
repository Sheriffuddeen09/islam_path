import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Notification from "../../Form/Notification";
import api from "../../Api/axios";

export default function CreateProduct() {
  const [form, setForm] = useState({
  type: "",
  category_id: "",
  title: "",
  author: "",
  description: "",
  price: "",
  currency: "",
  stock: "",
  discount:0,
  charges:5,
  // company info
  company_type: "",
  brand_name: "",
  location: "",
  delivery_time: "",
  delivery_method: "",
  company_available: "",

  // book fields
  sale_type: "",
  downloadable: "",
  is_digital: false,
  delivery_price: "",
  category_id: "",
  category_slug: "",
});



  const [step, setStep] = useState(1);
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [side, setSide] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notify, setNotify] = useState({ message: "", type: "" });
  const [categories, setCategories] = useState([]); // fetched from backend
  const [selectedParent, setSelectedParent] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [newParent, setNewParent] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");
 

  const [keyFeatures, setKeyFeatures] = useState([
    { key: "", value: "" }
  ]);

  const [specifications, setSpecifications] = useState([
    { key: "", value: "" }
  ]);

  // Add field
const addField = (type) => {
  if (type === "features") {
    setKeyFeatures([...keyFeatures, { key: "", value: "" }]);
  } else {
    setSpecifications([...specifications, { key: "", value: "" }]);
  }
};

// Remove field
const removeField = (index, type) => {
  if (type === "features") {
    const updated = [...keyFeatures];
    updated.splice(index, 1);
    setKeyFeatures(updated);
  } else {
    const updated = [...specifications];
    updated.splice(index, 1);
    setSpecifications(updated);
  }
};

// Update field
const updateField = (index, field, value, type) => {
  if (type === "features") {
    const updated = [...keyFeatures];
    updated[index][field] = value;
    setKeyFeatures(updated);
  } else {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  }
};

  const showNotification = (message, type = "success") => {
    setNotify({ message, type });
    setTimeout(() => setNotify({ message: "", type: "" }), 5000);
  };





  useEffect(()=>{

      const price = Number(form.price) || 0;
      const qty = Number(form.quantity) || 0;
      const discount = Number(form.discount) || 0;
      const chargePercent = Number(form.charges) || 0;

      const subtotal = price * qty;

      const discountAmount = subtotal * (discount/100);
      const afterDiscount = subtotal - discountAmount;

      const chargeAmount = afterDiscount * (chargePercent/100);

      const total = afterDiscount + chargeAmount;

      setForm(prev=>({...prev,total_price:total.toFixed(2)}));

      },[form.price,form.quantity,form.discount]);


  // Image gallery dropzone
  const onDrop = (acceptedFiles) => {
    const files = acceptedFiles.map(file =>
      Object.assign(file, { preview: URL.createObjectURL(file) })
    );
    setGallery(prev => [...prev, ...files]);
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] }
  });

  const removeImage = (index) => {
    const newGallery = [...gallery];
    newGallery.splice(index, 1);
    setGallery(newGallery);
  };

  // PDF dropzone for books
  const { getRootProps: getPdfRootProps, getInputProps: getPdfInputProps, isDragActive: isPdfDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) setPdf(acceptedFiles[0]);
    },
    accept: { 'application/pdf': [] },
    multiple: false
  });

  const submit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const data = new FormData();

    // Append form fields safely
    Object.keys(form).forEach((key) => {
      if (form[key] !== null && form[key] !== undefined) {
        data.append(key, form[key]);
      }
    });

    // Force correct data types
    data.set("currency", String(form.currency));
    data.set("quantity", parseInt(form.quantity || 1));
    data.set("total_price", parseFloat(form.total_price || 0));

    // Convert array → object
    const featuresObject = {};
    keyFeatures.forEach(item => {
      if (item.key) featuresObject[item.key] = item.value;
    });

    const specsObject = {};
    specifications.forEach(item => {
      if (item.key) specsObject[item.key] = item.value;
    });

    // Append to FormData
    keyFeatures.forEach((item, index) => {
        if (item.key && item.value) {
          data.append(`key_features[${index}][key]`, item.key);
          data.append(`key_features[${index}][value]`, item.value);
        }
      });

      specifications.forEach((item, index) => {
        if (item.key && item.value) {
          data.append(`specifications[${index}][key]`, item.key);
          data.append(`specifications[${index}][value]`, item.value);
        }
      });

    // Images
    if (front instanceof File) data.append("front_image", front);
    if (back instanceof File) data.append("back_image", back);
    if (side instanceof File) data.append("side_image", side);

     if (newParent) data.append("new_parent", newParent);
    if (newSubcategory) data.append("new_subcategory", newSubcategory);
    if (selectedParent?.id) data.append("parent_id", selectedParent.id);
    if (selectedChild?.id) data.append("category_id", selectedChild.id);

    if (!form.category_id && !newSubcategory) {
      showNotification("Please select a category", "error");
      setLoading(false);
      return;
    }

    if (form.category_id) {
        data.append("category_id", form.category_id);
      }
    // PDF
    if (pdf instanceof File) {
      data.append("pdf_file", pdf);
    }

    if (pdf) {
      data.append("is_digital", form.is_digital ? 1 : 0);
    } else {
      data.append("is_digital", 0);
    }

    // Gallery images
    gallery.forEach((img) => {
      if (img instanceof File) {
        data.append("images[]", img);
      }
    });

   await api.get("/sanctum/csrf-cookie", { withCredentials: true });

    await api.post("/api/products", data, {
      withCredentials: true, // important
      headers: { "Content-Type": "multipart/form-data" }, // no Authorization
    });

    
    showNotification("Product created successfully!", "success");

    // Reset form properly
    setForm({
      type: "",
      title: "",
      author: "",
      description: "",
      price: "",
      currency: "",
      stock: "",
      delivery_time: "",
      sale_type: "",
    });

    setFront(null);
    setBack(null);
    setSide(null);
    setGallery([]);
    setPdf(null);
    setStep(1)

  } catch (err) {
    console.error(err);
    showNotification("Error creating product!", "error");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  const fetchCategories = async () => {
    const res = await api.get("/api/categories");
    setCategories(res.data);
  };

  fetchCategories();
}, []);


const slugSort = selectedParent?.slug;
console.log("slug:", slugSort);


const toSlug = (text) =>
  text
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

const slug =
  selectedChild?.slug ||
  selectedParent?.slug ||
  toSlug(newSubcategory) ||
  toSlug(newParent);

console.log("slug:", slug);


  const parentSlug =
  selectedParent?.slug || toSlug(newParent);

const isGeneral =
  ["clothes", "accessory", "house-accessory", "others"].includes(parentSlug)
  || newParent; // 👈 ANY new category auto included



  return (
    <div className="min-h-screen bg-gray-100 sm:p-8 lg:ml-64">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-xl sm:p-8 p-3">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 pb-3 border-black">
          Create New Product
        </h2>
     {step === 1 && (
  <form onSubmit={submit} className="space-y-6">

    {/* Product Type */}
     <div>
  <label className="block text-sm font-semibold text-gray-700 mb-1">
    Product Category
  </label>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* ---------------- Parent Category ---------------- */}
    <div className="flex flex-col">
      <select
        className="border p-3 rounded-lg w-full text-base" // match input height
        value={selectedParent?.id || (newParent ? "new" : "")}
        onChange={(e) => {
          if (e.target.value === "new") {
            setSelectedParent(null);
            setSelectedChild(null);
            setForm({ ...form, category_id: "", category_slug: "" });
            return;
          }

          const parent = categories?.find((c) => c.id == e.target.value);
          setSelectedParent(parent || null);
          setSelectedChild(null);

          setForm({ ...form, category_id: "", category_slug: parent?.slug || "" });
        }}
      >
        <option value="">Select Category</option>
        {categories?.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
        <option value="new">+ Add New Parent</option>
      </select>

      {/* Input for adding new parent */}
      {!selectedParent && (
        <input
          type="text"
          placeholder="Add new parent category (e.g Electronics)"
          className="border p-3 rounded-lg w-full mt-2 text-base"
          value={newParent}
          onChange={(e) => setNewParent(e.target.value)}
        />
      )}
    </div>

    {/* ---------------- Child Category ---------------- */}
    <div className="flex flex-col">
      {(selectedParent || newParent) && (
        <>
          <select
            className="border p-3 rounded-lg w-full text-base"
            value={selectedChild?.id || (newSubcategory ? "new" : "")}
            onChange={(e) => {
              if (e.target.value === "new") {
                setSelectedChild(null);
                setForm({ ...form, category_id: "" });
                return;
              }

              const child = selectedParent?.children?.find(
                (c) => c.id == e.target.value
              );

              setSelectedChild(child);
              setForm({
                ...form,
                category_id: child?.id,
                category_slug: child?.slug,
              });
            }}
          >
            <option value="">Select Subcategory</option>
            {selectedParent?.children?.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
            <option value="new">+ Add New Subcategory</option>
          </select>

          {/* Input for adding new subcategory */}
          {!selectedChild && (
            <input
              type="text"
              placeholder="Add new subcategory (e.g Smart TV)"
              className="border p-3 rounded-lg w-full mt-2 text-base"
              value={newSubcategory}
              onChange={(e) => setNewSubcategory(e.target.value)}
            />
          )}
        </>
      )}
    </div>
  </div>

  {/* ---------------- Product Title & Stock  ---------------- */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        Product Title
      </label>
      <input
        placeholder="Enter product title"
        className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 w-full text-base"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
    </div>
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        Stock
      </label>
      <input
        placeholder="Stock"
        type="number"
        className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 w-full text-base"
        value={form.stock}
        onChange={(e) => setForm({ ...form, stock: e.target.value })}
      />
    </div>
  </div>
</div>

    {/* Currency, Price, Quantity */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Currency
        </label>
        <select
          value={form.currency}
          onChange={(e) => setForm({ ...form, currency: e.target.value })}
          className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 w-full"
        >
          <option value="">Currency</option>
          <option value="USD">$</option>
          <option value="EUR">€</option>
          <option value="GBP">£</option>
          <option value="NGN">₦</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Price
        </label>
        <input
          type="number"
          placeholder="Product price"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
          className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 w-full"
        />
      </div>

    </div>

    {/* Discount / Charge / Total */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Discount (%)
        </label>
        <input
          type="number"
          placeholder="Discount percentage"
          className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 w-full"
          value={form.discount}
          onChange={e => setForm({ ...form, discount: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Platform Charge (5%)
        </label>
        <input
          type="number"
          className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 w-full bg-gray-100"
          value={form.charges}
          disabled
        />
      </div>

    </div>

    {/* Description */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        Product Description
      </label>
      <textarea
        placeholder="Write product description..."
        className="border w-full p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
        rows="4"
        value={form.description}
        onChange={e => setForm({ ...form, description: e.target.value })}
      />
    </div>

          {/* Book Fields */}
          {slug === "islamic-content" && (
            <>
              <input
                placeholder="Author"
                className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 w-full"
                value={form.author}
                onChange={e => setForm({ ...form, author: e.target.value })}
              />

              {/* PDF Drag & Drop */}
              <div className="mt-4">
                <label className="block mb-2 font-medium text-gray-700">Upload PDF</label>
                <div
                  {...getPdfRootProps()}
                  className={`border-2 border-dashed p-6 rounded-lg text-center cursor-pointer transition
                    ${isPdfDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"}`}
                >
                  <input {...getPdfInputProps()} />
                  {pdf ? (
                    <div className="flex items-center justify-between mt-2 bg-gray-100 p-3 rounded-lg shadow-sm">
                      <div className="flex items-center gap-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-red-600"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M19 2H8c-1.1 0-2 .9-2 2v4h2V4h11v16H8v-4H6v4c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                          <path d="M10 12h4v2h-4z" />
                        </svg>
                        <div className="flex flex-col">
                          <span className="text-gray-700 font-medium truncate">{pdf.name}</span>
                          <span className="text-gray-500 text-sm">{(pdf.size / 1024).toFixed(2)} KB</span>
                        </div>
                      </div>
                      <button type="button" className="text-red-500 font-bold px-2 hover:text-red-700" onClick={() => setPdf(null)}>✕</button>
                    </div>
                  ) : (
                    <p className="text-gray-500 font-medium">Drag & drop a PDF here, or click to select</p>
                  )}
                </div>
              </div>
            </>
          )}

          


          {/* Images (Front/Back/Side) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[{ label: "Front Image", setter: setFront, file: front },
              { label: "Back Image", setter: setBack, file: back },
              { label: "Side Image", setter: setSide, file: side }].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <p className="font-medium mb-2">{item.label}</p>
                <label className="w-full p-4 border-2 border-blue-600 border-dashed rounded-lg text-center cursor-pointer hover:bg-blue-50 transition">
                  {item.file ? (
                    <img src={URL.createObjectURL(item.file)} className="h-32 mx-auto object-cover rounded" />
                  ) : (
                    <span className="text-gray-800 text-sm font-semibold">Upload {item.label}</span>
                  )}
                  <input type="file" className="hidden" onChange={e => item.setter(e.target.files[0])} />
                </label>
              </div>
            ))}
          </div>

          {/* Drag & Drop Gallery */}
          <div>
            <p className="font-semibold mb-2">Product Gallery</p>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed p-8 rounded-lg text-center cursor-pointer transition
                ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"}`}
            >
              <input {...getInputProps()} />
              <p className="text-gray-500 font-medium">
                Drag & drop images here or click to upload
              </p>
            </div>
          </div>

          {/* Gallery Preview */}
          {gallery.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
              {gallery.map((img, index) => (
                <div key={index} className="relative rounded-lg shadow overflow-hidden">
                  <img src={img.preview} className="h-28 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-2 shadow"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}



            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition"
              >
              Next
              </button>
        </form>
        )}

        {step === 2 && (

        
          <div className="space-y-6">

          <h3 className="text-xl font-bold border-b pb-2">
          Company / Delivery Information
          </h3>
        

          <input
          placeholder="Brand Name"
          className="border p-3 rounded-lg w-full"
          value={form.brand_name}
          onChange={e=>setForm({...form,brand_name:e.target.value})}
          />


          <input
          placeholder="Company Location"
          className="border p-3 rounded-lg w-full"
          value={form.location}
          onChange={e=>setForm({...form,location:e.target.value})}
          />

          
          <select
          className="border p-3 rounded-lg w-full"
          value={form.company_available}
          onChange={e=>setForm({...form,company_available:e.target.value})}
          >
          <option value="">Product Availability</option>
          <option value="available">Available</option>
          <option value="out_of_stock">Out of Stock</option>
          </select>

        

          {slugSort === "electronic" && (
       <>

          <select
          className="border p-3 rounded-lg w-full"
          value={form.company_type}
          onChange={e=>setForm({...form, company_type:e.target.value})}
          >
          <option value="">Company Type</option>
          <option value="manufacturer">Manufacturer</option>
          <option value="reseller">Reseller</option>
          </select>


          <input
          placeholder="Delivery Day (2-5 days)"
          className="border p-3 rounded-lg w-full"
          value={form.delivery_time}
          onChange={e=>setForm({...form, delivery_time:e.target.value})}
          />


          <select
          className="border p-3 rounded-lg w-full"
          value={form.delivery_method}
          onChange={e =>
            setForm({
              ...form,
              delivery_method: e.target.value,
              delivery_price: "" // reset when changed
            })
          }
        >
          <option value="">Delivery Method</option>
          <option value="door_delivery">Door Delivery</option>
          <option value="pickup">Pickup Station</option>
        </select>

        {/* ✅ SHOW DELIVERY PRICE */}
        {form.delivery_method && form.delivery_method !== "pickup" && (
          <input
            type="number"
            placeholder="Delivery Price (₦)"
            className="border p-3 rounded-lg w-full"
            value={form.delivery_price}
            onChange={e =>
              setForm({ ...form, delivery_price: e.target.value })
            }
          />
        )}

    {/* KEY FEATURES */}
    <div className="bg-white p-4 rounded-xl shadow space-y-3">
      <h2 className="font-bold text-lg">Key Features</h2>

      {keyFeatures.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            placeholder="Key (e.g Model)"
            className="border p-2 w-1/2 rounded"
            value={item.key}
            onChange={(e) =>
              updateField(index, "key", e.target.value, "features")
            }
          />

          <input
            placeholder="Value (e.g LP Smart TV)"
            className="border p-2 w-1/2 rounded"
            value={item.value}
            onChange={(e) =>
              updateField(index, "value", e.target.value, "features")
            }
          />

          <button
            type="button"
            onClick={() => removeField(index, "features")}
            className="bg-red-500 text-white px-2 rounded"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => addField("features")}
        className="bg-black text-white px-4 py-2 rounded"
      >
        + Add More Features
      </button>
    </div>

    {/* SPECIFICATIONS */}
    <div className="bg-white p-4 rounded-xl shadow space-y-3 mt-5">
      <h2 className="font-bold text-lg">Specifications</h2>

      {specifications.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            placeholder="Key (e.g SKU)"
            className="border p-2 w-1/2 rounded"
            value={item.key}
            onChange={(e) =>
              updateField(index, "key", e.target.value, "specs")
            }
          />

          <input
            placeholder="Value"
            className="border p-2 w-1/2 rounded"
            value={item.value}
            onChange={(e) =>
              updateField(index, "value", e.target.value, "specs")
            }
          />

          <button
            type="button"
            onClick={() => removeField(index, "specs")}
            className="bg-red-500 text-white px-2 rounded"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => addField("specs")}
        className="bg-black text-white px-4 py-2 rounded"
      >
        + Add More Specifications
      </button>
    </div>
  </>
)}

          {/* CLOTHES / SHOES */}

         {slugSort !== "electronic" && slugSort !== "islamic-content"   && (

          <>

          <select
          className="border p-3 rounded-lg w-full"
          value={form.company_type}
          onChange={e=>setForm({...form,company_type:e.target.value})}
          >
          <option value="">Company Type</option>
          <option value="manufacturer">Manufacturer</option>
          <option value="reseller">Reseller</option>
          </select>


          <input
          placeholder="Delivery Time (2-5 days)"
          className="border p-3 rounded-lg w-full"
          value={form.delivery_time}
          onChange={e=>setForm({...form,delivery_time:e.target.value})}
          />


          <select
          className="border p-3 rounded-lg w-full"
          value={form.delivery_method}
          onChange={e =>
            setForm({
              ...form,
              delivery_method: e.target.value,
              delivery_price: "" // reset when changed
            })
          }
        >
          <option value="">Delivery Method</option>
          <option value="door_delivery">Door Delivery</option>
          <option value="pickup">Pickup Station</option>
        </select>

        {/* ✅ SHOW DELIVERY PRICE */}
        {form.delivery_method && form.delivery_method !== "pickup" && (
          <input
            type="number"
            placeholder="Delivery Price (₦)"
            className="border p-3 rounded-lg w-full"
            value={form.delivery_price}
            onChange={e =>
              setForm({ ...form, delivery_price: e.target.value })
            }
          />
        )}
          {/* SPECIFICATIONS */}
    <div className="bg-white p-4 rounded-xl shadow space-y-3 mt-5">
      <h2 className="font-bold text-lg">Specifications</h2>

      {specifications.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            placeholder="Key (e.g SKU)"
            className="border p-2 w-1/2 rounded"
            value={item.key}
            onChange={(e) =>
              updateField(index, "key", e.target.value, "specs")
            }
          />

          <input
            placeholder="Value"
            className="border p-2 w-1/2 rounded"
            value={item.value}
            onChange={(e) =>
              updateField(index, "value", e.target.value, "specs")
            }
          />

          <button
            type="button"
            onClick={() => removeField(index, "specs")}
            className="bg-red-500 text-white px-2 rounded"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => addField("specs")}
        className="bg-black text-white px-4 py-2 rounded"
      >
        + Add More Specifications
      </button>
    </div>

          </>

          )}


          {/* BOOK upload */}

          {slugSort === "islamic-content" && (

          <>

          <select
          value={form.sale_type}
          className="border p-3 rounded-lg w-full"
          onChange={(e) => {
            const value = e.target.value;

            setForm(prev => ({
              ...prev,
              sale_type: value,
              delivery_time:
                value === "online" && prev.downloadable === "yes"
                  ? "Downloadable Book"
                  : prev.delivery_time
            }));
          }}
        >
          <option value="">Sales Type</option>
          <option value="online">Online Download</option>
          <option value="physical">Physical Delivery</option>
          </select>


          <select
          className="border p-3 rounded-lg w-full"
          value={form.downloadable}
          onChange={e=>setForm({...form,downloadable:e.target.value})}
          >
          <option value="">Downloadable</option>
          <option value="yes">Yes</option>
          <option value="no">Physical Book</option>
          </select>


         <input
          placeholder="Delivery Time (2-5 days)"
          className="border p-3 rounded-lg w-full"
          value={
            form.sale_type === "online" && form.downloadable === "yes"
              ? "Downloadable Book"
              : form.delivery_time
          }
          onChange={e =>
            setForm({ ...form, delivery_time: e.target.value })
          }
          disabled={form.sale_type === "online" && form.downloadable === "yes"}
        />


          <select
          className="border p-3 rounded-lg w-full"
          value={form.delivery_method}
          onChange={e =>
            setForm({
              ...form,
              delivery_method: e.target.value,
              delivery_price: "" // reset when changed
            })
          }
        >
          <option value="">Delivery Method</option>
          <option value="door_delivery">Door Delivery</option>
          <option value="pickup">Pickup Station</option>
          <option value="pickup">Online Download</option>
        </select>

        {/* ✅ SHOW DELIVERY PRICE */}
        {form.delivery_method && form.delivery_method !== "pickup" && (
          <input
            type="number"
            placeholder="Delivery Price (₦)"
            className="border p-3 rounded-lg w-full"
            value={form.delivery_price}
            onChange={e =>
              setForm({ ...form, delivery_price: e.target.value })
            }
          />
        )}


          {/* SPECIFICATIONS */}
    <div className="bg-white p-4 rounded-xl shadow space-y-3 mt-5">
      <h2 className="font-bold text-lg">Specifications</h2>

      {specifications.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            placeholder="Key (e.g SKU)"
            className="border p-2 w-1/2 rounded"
            value={item.key}
            onChange={(e) =>
              updateField(index, "key", e.target.value, "specs")
            }
          />

          <input
            placeholder="Value"
            className="border p-2 w-1/2 rounded"
            value={item.value}
            onChange={(e) =>
              updateField(index, "value", e.target.value, "specs")
            }
          />

          <button
            type="button"
            onClick={() => removeField(index, "specs")}
            className="bg-red-500 text-white px-2 rounded"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => addField("specs")}
        className="bg-black text-white px-4 py-2 rounded"
      >
        + Add More Specifications
      </button>
    </div>


          </>

          )}




          <div className="flex gap-4">

          <button
          onClick={()=>setStep(1)}
          className="w-1/2 bg-gray-400 hover:bg-gray-500 text-white py-3 rounded-lg"
          >
          Back
          </button>


          <button
          onClick={submit}
          disabled={loading}
          className="w-1/2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
          >
          {loading ? <p className="inline-flex items-center sm:gap-4 gap-1 "><svg
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
    </svg> Creating</p> : "Create Product"}
          </button>

          </div>

          </div>

          )}



      </div>

      {notify.message && (
        <Notification
          message={notify.message}
          type={notify.type} // "success" = green, "error" = red
          onClose={() => setNotify({ message: "", type: "" })}
        />
      )}
    </div>
  );
}