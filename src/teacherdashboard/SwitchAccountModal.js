import { useEffect, useState } from "react";

import {
  X,
  Plus,
  Check,
  Trash2,
  User,
  Loader2,
} from "lucide-react";

import api from "../Api/axios";

export default function SwitchAccountModal({
  open,
  onClose,
  navigate,
  showNotification,
}) {

  const [accounts, setAccounts] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [adding, setAdding] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [remember, setRemember] =
    useState(true);

  const [showPassword, setShowPassword ] = useState(false)
  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );

  // ================= LOAD ACCOUNTS =================
  useEffect(() => {

    const stored =
      JSON.parse(
        localStorage.getItem(
          "accounts"
        ) || "[]"
      );

    setAccounts(stored);

  }, [open]);

  // ================= ADD ACCOUNT =================
  const addAccount = async () => {

    if (!email || !password) {
      showNotification(
        "Email and password required",
        "error"
      );
      return;
    }

    try {

      setLoading(true);

      await api.get(
        "/sanctum/csrf-cookie"
      );

      const res = await api.post(
        "/api/login",
        {
          email,
          password,
          remember_me: remember,
        }
      );

      const newAccount = {
        token: res.data.token,
        user: res.data.user,
        expires_at:
          res.data.expires_at,
      };

      // 🔥 SAVE CURRENT USER
      localStorage.setItem(
        "token",
        res.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(
          res.data.user
        )
      );

      // 🔥 SAVE MULTIPLE ACCOUNTS
      const updated = [

        newAccount,

        ...accounts.filter(
          acc =>
            acc.user.id !==
            newAccount.user.id
        ),
      ];

      localStorage.setItem(
        "accounts",
        JSON.stringify(updated)
      );

      setAccounts(updated);

      setAdding(false);

      setEmail("");

      setPassword("");

      showNotification(
        "Account added successfully",
        "success"
      );

    } catch (err) {

      console.error(err);

      showNotification(
        "Invalid login credentials",
        "error"
      );

    } finally {

      setLoading(false);
    }
  };

  // ================= SWITCH ACCOUNT =================
  const switchAccount = account => {

    localStorage.setItem(
      "token",
      account.token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(
        account.user
      )
    );

    showNotification(
      `Switched to ${account.user.first_name}`,
      "success"
    );

    navigate(
      account.user.role ===
        "student"
        ? "/student/dashboard"
        : "/admin/dashboard"
    );

    window.location.reload();
  };

  // ================= REMOVE =================
  const removeAccount = id => {

    const updated =
      accounts.filter(
        acc => acc.user.id !== id
      );

    setAccounts(updated);

    localStorage.setItem(
      "accounts",
      JSON.stringify(updated)
    );

    showNotification(
      "Account removed",
      "success"
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">

      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">

        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b">

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Switch Account*
            </h2>

            <p className="text-sm text-gray-500">
              Manage your accounts
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <X size={22} />
          </button>
        </div>

        {/* ACCOUNT LIST */}
        <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">

          {accounts.map(account => (

            <div
              key={account.user.id}
              className="border rounded-2xl p-4 flex items-center justify-between hover:bg-gray-50 transition"
            >

              {/* LEFT */}
              <div className="flex items-center gap-3">

                {/* IMAGE */}
                {account.user.image ? (

                  <img
                    src={
                      account.user.image
                    }
                    alt=""
                    className="w-14 h-14 rounded-full object-cover"
                  />

                ) : (

                  <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">

                    <User size={26} />
                  </div>
                )}

                {/* INFO */}
                <div>

                  <h3 className="font-semibold text-gray-900">

                    {
                      account.user
                        .first_name
                    }{" "}

                    {
                      account.user
                        .last_name
                    }
                  </h3>

                  <p className="text-sm text-gray-500">
                    {
                      account.user
                        .email
                    }
                  </p>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-2">

                {currentUser?.id ===
                  account.user.id && (

                  <div className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center">

                    <Check size={16} />
                  </div>
                )}

                <button
                  onClick={() =>
                    switchAccount(
                      account
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                >
                  Switch
                </button>

                <button
                  onClick={() =>
                    removeAccount(
                      account.user.id
                    )
                  }
                  className="w-10 h-10 rounded-xl hover:bg-red-50 text-red-500 flex items-center justify-center"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          {/* EMPTY */}
          {!accounts.length && (

            <div className="text-center py-10 text-gray-500">

              No saved accounts
            </div>
          )}
        </div>

        {/* ADD ACCOUNT */}
        {adding ? (

          <div className="border-t p-5 space-y-4">

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e =>
                setEmail(
                  e.target.value
                )
              }
              className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
             <div className="mb-6 relative">
            <input
               type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e =>
                setPassword(
                  e.target.value
                )
              }
              className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
                
                <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-4 text-gray-500"
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.5 10.5a3 3 0 104.5 4.5M9.75 14.25l4.5-4.5" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zM12 9a3 3 0 100 6 3 3 0 000-6z" />
            </svg>
          )}
          </button>
          </div>

            {/* REMEMBER */}
            <label className="flex items-center gap-2 text-sm text-gray-700">

              <input
                type="checkbox"
                checked={remember}
                onChange={e =>
                  setRemember(
                    e.target.checked
                  )
                }
              />

              Remember Me
            </label>

            {/* ACTIONS */}
            <div className="flex gap-3">

              <button
                onClick={() =>
                  setAdding(false)
                }
                className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>

              <button
                disabled={loading}
                onClick={addAccount}
                className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Adding
                  </>
                ) : (
                  "Add Account"
                )}
              </button>
            </div>
          </div>

        ) : (

          <div className="border-t p-4">

            <button
              onClick={() =>
                setAdding(true)
              }
              className="w-full py-4 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold flex items-center justify-center gap-3"
            >
              <Plus size={20} />

              Add another account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}