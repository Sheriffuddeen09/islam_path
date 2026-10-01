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
  if (!base64) {
    throw new Error("Missing base64 value");
  }

  return Uint8Array.from(
    atob(base64),
    (char) => char.charCodeAt(0)
  );
}

function bytesToBase64(bytes) {
  return btoa(
    String.fromCharCode(...new Uint8Array(bytes))
  );
}

 
export async function encryptMessage(text, chatKey) {
  if (!text) {
    throw new Error("Message text is empty");
  }

  if (!chatKey) {
    throw new Error("Chat encryption key is missing");
  }

  const keyBytes = base64ToBytes(chatKey);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    {
      name: "AES-GCM",
    },
    false,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(
    new Uint8Array(12)
  );

  const encoded = new TextEncoder().encode(text);

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    cryptoKey,
    encoded
  );

  return {
    encrypted: bytesToBase64(encryptedBuffer),
    iv: bytesToBase64(iv),
  };
}



export async function decryptMessage(
  encrypted,
  ivBase64,
  chatKey
) {
  if (!encrypted) {
    throw new Error("Encrypted message is missing");
  }

  if (!ivBase64) {
    throw new Error("Message IV is missing");
  }

  if (!chatKey) {
    throw new Error("Chat encryption key is missing");
  }

  const keyBytes = base64ToBytes(chatKey);
  const iv = base64ToBytes(ivBase64);
  const encryptedBytes = base64ToBytes(encrypted);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    {
      name: "AES-GCM",
    },
    false,
    ["decrypt"]
  );

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
    },
    cryptoKey,
    encryptedBytes
  );

  return new TextDecoder().decode(decryptedBuffer);
}



export async function decryptMessages(
  incoming,
  chatId
) {
  if (!Array.isArray(incoming)) {
    return [];
  }

  const chatKey = localStorage.getItem(
    `chat_key_${chatId}`
  );

  if (!chatKey) {
    console.error(
      "CHAT KEY NOT FOUND:",
      chatId
    );

    return incoming;
  }

  return Promise.all(
    incoming.map(async (msg) => {
      const decryptedMsg = {
        ...msg,
      };
 
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
        } catch (error) {
          console.error(
            "MESSAGE DECRYPT FAILED:",
            {
              messageId: msg.id,
              chatId,
              error,
            }
          );

          decryptedMsg.message =
            "Unable to decrypt message";
        }
      }
 
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
        } catch (error) {
          console.error(
            "REPLY DECRYPT FAILED:",
            {
              messageId: msg.id,
              chatId,
              error,
            }
          );

          decryptedMsg.replied_to = {
            ...msg.replied_to,
            message:
              "Unable to decrypt message",
          };
        }
      }

      return decryptedMsg;
    })
  );
}

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