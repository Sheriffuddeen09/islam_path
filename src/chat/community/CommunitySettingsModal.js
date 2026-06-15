import { useState, useEffect } from "react";
import {
  Camera,
  X,
  Loader2,
} from "lucide-react";
import api from "../../Api/axios";
import { toast } from "react-hot-toast";

export default function CommunitySettingsModal({
  community,
  setActiveCommunity,
  setShowModal,
}) {

  const [name, setName] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [image, setImage] =
    useState(null);

  const [preview, setPreview] =
    useState(null);

  const [
    onlyAdminCanMessage,
    setOnlyAdminCanMessage,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);


    const getImage = (path) => {

  if (!path) return null;

  if (
    path.startsWith("http")
  ) {

    return path;

  }

  return `http://localhost:8000/storage/${path}`;

};

  useEffect(() => {

    if (!community) return;

    setName(
        community.community_name || ""
    );

    setDescription(
        community.community_description || ""
    );

    setPreview(
        community.community_image
        ? getImage(
            community.community_image
            )
        : null
    );

    setOnlyAdminCanMessage(
        Boolean(
        community.only_admin_can_message
        )
    );

    }, [community]);


  const handleImageChange =
    (file) => {

      if (!file) return;

      setImage(file);

      setPreview(
        URL.createObjectURL(file)
      );

    };

  const handleUpdate =
    async () => {

      try {

        setLoading(true);

        const formData =
          new FormData();

        formData.append(
          "community_name",
          name
        );

        formData.append(
          "community_description",
          description
        );

        formData.append(
          "only_admin_can_message",
          onlyAdminCanMessage
            ? 1
            : 0
        );

        if (image) {

          formData.append(
            "community_image",
            image
          );

        }

        const { data } =
          await api.post(

            `/api/communities/${community.id}/update`,

            formData,

            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }

          );

        setActiveCommunity(
            (prev) => ({

                ...prev,

                ...data.community,

                community_image:
                data.community.community_image,

                members:
                prev.members,

            })
            );

        toast.success(
          data.message
        );

        setShowModal(false);

      } catch (err) {

        console.error(err);

        toast.error(
          err.response?.data
            ?.message ||
          "Failed to update channel"
        );

      } finally {

        setLoading(false);

      }

    };

  return (

    <div className="
      fixed inset-0 z-50
      bg-black/50
      backdrop-blur-md
      flex items-center
      justify-center
    ">

      <div className="
        w-full max-w-sm
        rounded-2xl
        bg-white
        p-5
        shadow-xl
        space-y-4
      ">

        <div className="
          flex items-center
          justify-between
        ">

          <h2 className="
            text-lg
            font-semibold
          ">

            Edit Channel

          </h2>

          <button
            onClick={() =>
              setShowModal(false)
            }
          >

            <X size={22} />

          </button>

        </div>

        <div className="
          flex flex-col
          items-center
          gap-2
        ">

          <div className="
            relative
          ">

            <div className="
              w-24 h-24
              rounded-full
              overflow-hidden
              bg-gray-200
            ">

              {preview ? (

                <img
                  src={preview}
                  alt="edit image"
                  className="
                    w-full
                    h-full
                    object-cover
                  "
                />

              ) : (

                <div
                className="
                    w-full
                    h-full
                    flex
                    items-center
                    justify-center
                    bg-gray-200
                    text-2xl
                    font-bold
                    text-gray-700
                "
                >
                {community?.community_name?.charAt(0)?.toUpperCase() || "?"}
                </div>

              )}

            </div>

            <label className="
              absolute
              bottom-0
              right-0
              p-2
              rounded-full
              bg-blue-600
              text-white
              cursor-pointer
            ">

              <Camera size={16} />

              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleImageChange(
                    e.target.files[0]
                  )
                }
              />

            </label>

          </div>

        </div>

        <div>

          <label>
            Channel Name
          </label>

          <input
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
            className="
              w-full
              mt-1
              border
              rounded-lg
              px-3
              py-2
            "
          />

        </div>

        <div>

          <label>
            Description
          </label>

          <textarea
            rows={3}
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            className="
              w-full
              mt-1
              border
              rounded-lg
              px-3
              py-2
            "
          />

        </div>

        <div className="
          flex
          justify-between
          items-center
        ">

          <span>

            Only admins can send messages

          </span>

          <input
            type="checkbox"
            checked={
              onlyAdminCanMessage
            }
            onChange={() =>
              setOnlyAdminCanMessage(
                (prev) => !prev
              )
            }
          />

        </div>

        <div className="
          flex gap-2
        ">

          <button
            onClick={() =>
              setShowModal(false)
            }
            className="
              flex-1
              py-2
              border
              rounded-lg
            "
          >

            Cancel

          </button>

          <button
            onClick={
              handleUpdate
            }
            disabled={loading}
            className="
              flex-1
              py-2
              rounded-lg
              bg-blue-600
              text-white
              flex
              items-center
              justify-center
              gap-2
            "
          >

            {loading && (

              <Loader2
                className="
                  w-4 h-4
                  animate-spin
                "
              />

            )}

            {loading
              ? "Updating"
              : "Update"}

          </button>

        </div>

      </div>

    </div>

  );

}