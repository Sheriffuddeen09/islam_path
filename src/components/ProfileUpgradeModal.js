import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  X,
  BadgeCheck,
  UserRound,
  BookOpen,
  Store,
  Link2,
  RefreshCw,
  Check,
  Loader2,
  Tags,
} from "lucide-react";

const PROFILE_TYPES = [
  {
    value: "none",
    label: "None",
    description: "Upgrade your name without special profile features.",
    icon: UserRound,
  },
  {
    value: "author",
    label: "Author",
    description: "Create a profile for followers and subscribers.",
    icon: BookOpen,
  },
  {
    value: "marketer",
    label: "Marketer",
    description: "Promote your business and services.",
    icon: Store,
  },
  {
    value: "question_page",
    label: "Question Page",
    description: "Receive and answer questions in selected categories.",
    icon: BookOpen,
  },
];

export default function ProfileUpgradeModal({
  onClose,
  currentUser,
  onUpgradeSaved,
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);

  const [badgeBalance, setBadgeBalance] = useState(0);
  const [upgradeCost, setUpgradeCost] = useState(20);

  const [hasUpgrade, setHasUpgrade] = useState(false);
  const [upgrade, setUpgrade] = useState(null);

  const [upgradeName, setUpgradeName] = useState("");

  const [profileType, setProfileType] = useState("none");

  const [tagEnabled, setTagEnabled] = useState(false);

  const [categories, setCategories] = useState([]);

  const [availableCategories, setAvailableCategories] =
    useState([]);

  const [businessDescription, setBusinessDescription] =
    useState("");

  const [subscriptionUrl, setSubscriptionUrl] =
    useState("");

  useEffect(() => {
    loadUpgrade();
  }, []);

  const loadUpgrade = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "/api/profile-upgrade",
        {
          withCredentials: true,
        }
      );

      const data = response.data;

      setUpgrade(data.upgrade || null);

      setHasUpgrade(Boolean(data.has_upgrade));

      setBadgeBalance(Number(data.badge_balance || 0));

      setUpgradeCost(Number(data.upgrade_cost || 20));

      setAvailableCategories(data.categories || []);

      setUpgradeName(
        data.current_name ||
        `${currentUser?.first_name || ""} ${currentUser?.last_name || ""}`.trim()
      );

      if (data.upgrade) {
        setProfileType(
          data.upgrade.profile_type || "none"
        );

        setTagEnabled(
          Boolean(data.upgrade.tag_enabled)
        );

        setCategories(
          data.upgrade.question_categories || []
        );

        setBusinessDescription(
          data.upgrade.business_description || ""
        );

        setSubscriptionUrl(
          data.upgrade.subscription_url || ""
        );
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
        "Unable to load profile upgrade."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category) => {
    setCategories((previous) =>
      previous.includes(category)
        ? previous.filter((item) => item !== category)
        : [...previous, category]
    );
  };

  const handleSave = async () => {
    if (!upgradeName.trim()) {
      toast.error("Enter your upgrade name.");
      return;
    }

    if (
      profileType === "question_page" &&
      categories.length === 0
    ) {
      toast.error("Select at least one question category.");
      return;
    }

    if (
      !hasUpgrade &&
      badgeBalance < upgradeCost
    ) {
      toast.error(
        `You need ${upgradeCost} badges to upgrade.`
      );
      return;
    }

    try {
      setSaving(true);

      const response = await axios.post(
        "/api/profile-upgrade",
        {
          upgrade_name: upgradeName.trim(),
          profile_type: profileType,
          tag_enabled: tagEnabled,
          question_categories: categories,
          business_description:
            profileType === "marketer"
              ? businessDescription
              : null,
        },
        {
          withCredentials: true,
        }
      );

      setUpgrade(response.data.upgrade);

      setHasUpgrade(true);

      setBadgeBalance(
        Number(response.data.badge_balance)
      );

      setSubscriptionUrl(
        response.data.upgrade?.subscription_url || ""
      );

      /*
       * Update the current user in your React context
       * if the parent provides this callback.
       */
      onUpgradeSaved?.(response.data.user);

      toast.success(response.data.message);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
        "Unable to save profile upgrade."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateLink = async () => {
    if (!hasUpgrade || upgrade?.profile_type !== "author") {
      toast.error("Save your profile as Author first.");
      return;
    }

    try {
      setGeneratingLink(true);

      const response = await axios.post(
        "/api/profile-upgrade/generate-author-link",
        {},
        {
          withCredentials: true,
        }
      );

      setSubscriptionUrl(
        response.data.subscription_url
      );

      setUpgrade(response.data.upgrade);

      toast.success("Author link generated successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Unable to generate author link."
      );
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleCopyLink = async () => {
    if (!subscriptionUrl) {
      toast.error("Generate your author link first.");
      return;
    }

    try {
      await navigator.clipboard.writeText(subscriptionUrl);

      toast.success("Link copied!");
    } catch {
      toast.error("Unable to copy link.");
    }
  };

  const selectedType = PROFILE_TYPES.find(
    (item) => item.value === profileType
  );

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}

        <div className="flex items-center justify-between border-b border-gray-200 p-5 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Profile Upgrade
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Upgrade your name and unlock profile features.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={22} />
          </button>
        </div>

        {loading ? (
          <div className="flex h-72 items-center justify-center">
            <Loader2
              size={32}
              className="animate-spin text-green-600"
            />
          </div>
        ) : (
          <>
            <div className="max-h-[70vh] overflow-y-auto p-5">

              {/* Badge balance */}

              <div className="mb-5 flex items-center justify-between rounded-xl bg-green-50 p-4 dark:bg-green-950/30">
                <div>
                  <p className="text-sm text-gray-500">
                    Badge Balance
                  </p>

                  <p className="text-2xl font-bold text-green-600">
                    {badgeBalance}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {hasUpgrade
                      ? "Upgrade status"
                      : "Upgrade cost"}
                  </p>

                  <p className="font-semibold">
                    {hasUpgrade
                      ? "Already upgraded"
                      : `${upgradeCost} badges`}
                  </p>
                </div>
              </div>

              {/* Name */}

              <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold">
                  Upgrade Name
                </label>

                <input
                  type="text"
                  value={upgradeName}
                  onChange={(event) =>
                    setUpgradeName(event.target.value)
                  }
                  maxLength={100}
                  placeholder="Enter your new name"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />

                <p className="mt-1 text-xs text-gray-500">
                  This changes your actual first and last name.
                </p>
              </div>

              {/* Profile Type */}

              <div className="mb-5">
                <label className="mb-3 block text-sm font-semibold">
                  Profile Type
                </label>

                <div className="space-y-2">
                  {PROFILE_TYPES.map((type) => {
                    const Icon = type.icon;

                    const selected =
                      profileType === type.value;

                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() =>
                          setProfileType(type.value)
                        }
                        className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${
                          selected
                            ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
                          <Icon size={20} />
                        </div>

                        <div className="flex-1">
                          <p className="font-semibold">
                            {type.label}
                          </p>

                          <p className="text-xs text-gray-500">
                            {type.description}
                          </p>
                        </div>

                        {selected && (
                          <Check
                            size={20}
                            className="text-green-600"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tagging */}

              <div className="mb-5 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Tags size={18} />

                      <span className="font-semibold">
                        Enable User Tagging
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                      Allow friends to tag you in posts and products.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setTagEnabled((value) => !value)
                    }
                    className={`relative h-6 w-11 rounded-full ${
                      tagEnabled
                        ? "bg-green-600"
                        : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                        tagEnabled
                          ? "left-6"
                          : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Question Page */}

              {profileType === "question_page" && (
                <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
                  <h3 className="mb-2 font-semibold">
                    Question Categories
                  </h3>

                  <p className="mb-3 text-sm text-gray-500">
                    Select the topics you want to receive questions about.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {availableCategories.map((category) => {
                      const selected =
                        categories.includes(category);

                      return (
                        <button
                          type="button"
                          key={category}
                          onClick={() =>
                            toggleCategory(category)
                          }
                          className={`rounded-full border px-3 py-2 text-sm ${
                            selected
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800"
                          }`}
                        >
                          {category}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Marketer */}

              {profileType === "marketer" && (
                <div className="mb-5">
                  <label className="mb-2 block font-semibold">
                    Business Description
                  </label>

                  <textarea
                    value={businessDescription}
                    onChange={(event) =>
                      setBusinessDescription(event.target.value)
                    }
                    rows={4}
                    maxLength={2000}
                    placeholder="Describe your business, products, services and why people should trade with you."
                    className="w-full rounded-xl border border-gray-300 bg-white p-3 outline-none focus:border-green-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />

                  <p className="text-right text-xs text-gray-500">
                    {businessDescription.length}/2000
                  </p>
                </div>
              )}

              {/* Author */}

              {profileType === "author" && (
                <div className="mb-5 rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-950/20">
                  <h3 className="font-semibold">
                    Author Link
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Generate a unique link for people to follow or subscribe to your profile.
                  </p>

                  {subscriptionUrl && (
                    <div className="mt-3 break-all rounded-lg bg-white p-3 text-sm dark:bg-gray-800">
                      {subscriptionUrl}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleGenerateLink}
                      disabled={
                        generatingLink ||
                        !hasUpgrade ||
                        upgrade?.profile_type !== "author"
                      }
                      className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {generatingLink ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <RefreshCw size={16} />
                      )}

                      Generate Link
                    </button>

                    {subscriptionUrl && (
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="flex items-center gap-2 rounded-lg border border-purple-300 px-4 py-2 text-sm font-semibold"
                      >
                        <Link2 size={16} />
                        Copy
                      </button>
                    )}
                  </div>

                  {!hasUpgrade && (
                    <p className="mt-2 text-xs text-purple-600">
                      Save your Author profile before generating your link.
                    </p>
                  )}
                </div>
              )}

              {/* Preview */}

              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
                  Preview
                </p>

                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">
                    {upgradeName || "Your Name"}
                  </span>

                  <BadgeCheck
                    size={22}
                    className="fill-green-100 text-green-600"
                  />
                </div>

                <p className="mt-1 text-xs text-gray-500">
                  {selectedType?.label}
                </p>
              </div>
            </div>

            {/* Footer */}

            <div className="flex items-center justify-between gap-3 border-t border-gray-200 p-4 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold dark:border-gray-700"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving && (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                )}

                {hasUpgrade
                  ? "Update Upgrade"
                  : `Upgrade (${upgradeCost} badges)`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}