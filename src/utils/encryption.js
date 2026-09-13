export async function generateKeyPair() {

  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  const publicKey = await crypto.subtle.exportKey(
    "spki",
    keyPair.publicKey
  );

  const privateKey = await crypto.subtle.exportKey(
    "pkcs8",
    keyPair.privateKey
  );

  return {
    publicKey: btoa(
      String.fromCharCode(...new Uint8Array(publicKey))
    ),

    privateKey: btoa(
      String.fromCharCode(...new Uint8Array(privateKey))
    ),
  };
}

function base64ToBytes(base64) {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

export async function encryptMessage(text, chatKey) {

  const keyBytes = base64ToBytes(chatKey);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    "AES-GCM",
    false,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12)); // MUST BE 12 bytes

  const encoded = new TextEncoder().encode(text);

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    encoded
  );

  const encryptedBytes = new Uint8Array(encryptedBuffer);

  return {
    encrypted: btoa(String.fromCharCode(...encryptedBytes)),
    iv: btoa(String.fromCharCode(...iv))
  };
}

export async function decryptMessage  (incoming, chatId) {
  const chatKey = localStorage.getItem(
    `chat_key_${chatId}`
  );

  console.log("CHAT DECRYPT INFO:", {
    chatId,
    hasChatKey: !!chatKey,
    messageCount: incoming?.length,
  });

  if (!chatKey) {
    console.error(
      "NO CHAT KEY FOUND:",
      chatId
    );

    return incoming;
  }

  return Promise.all(
    (incoming || []).map(async (msg) => {
      const decryptedMsg = {
        ...msg,
      };

      // ------------------------------------------
      // MAIN MESSAGE
      // ------------------------------------------

      if (
        msg.message &&
        msg.iv
      ) {
        try {
          decryptedMsg.message =
            await decryptMessage(
              msg.message,
              msg.iv,
              chatKey
            );
        } catch (err) {
          console.error(
            "MESSAGE DECRYPT FAILED:",
            {
              id: msg.id,
              chatId,
              error: err,
            }
          );
        }
      }

      // ------------------------------------------
      // REPLY
      // ------------------------------------------

      if (
        msg.replied_to?.message &&
        msg.replied_to?.iv
      ) {
        try {
          decryptedMsg.replied_to = {
            ...msg.replied_to,

            message:
              await decryptMessage(
                msg.replied_to.message,
                msg.replied_to.iv,
                chatKey
              ),
          };
        } catch (err) {
          console.error(
            "REPLY DECRYPT FAILED:",
            {
              id: msg.id,
              error: err,
            }
          );
        }
      }

      return decryptedMsg;
    })
  );
};

export async function sha256(text) {

  const data = new TextEncoder().encode(text);

  const hash = await crypto.subtle.digest(
    "SHA-256",
    data
  );

  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}