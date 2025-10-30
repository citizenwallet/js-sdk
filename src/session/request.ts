import { Wallet, getBytes, hexlify } from "ethers";
import { CommunityConfig } from "../config";
import {
  generateSessionSalt,
  generateSessionRequestHash,
  generateSessionHash,
} from "./index";

export interface SessionRequestResult {
  txHash: string;
  hash: string;
}

export class BadRequestException extends Error {
  constructor(message?: string) {
    super(message || "Bad Request");
    this.name = "BadRequestException";
  }
}

export class InvalidChallengeException extends Error {
  constructor(message?: string) {
    super(message || "Invalid Challenge");
    this.name = "InvalidChallengeException";
  }
}

/**
 * Creates a session request by generating the necessary cryptographic signatures
 * and submitting them to the backend API.
 *
 * @param {string} url - The API endpoint URL (e.g., 'https://api.example.com')
 * @param {CommunityConfig} community - Instance of CommunityConfig containing provider address
 * @param {Wallet} privateKey - The wallet instance to sign the session request
 * @param {string} source - The source identifier (e.g., phone number for SMS sessions)
 * @param {string} sessionType - The type of session (e.g., 'sms', 'email', etc.)
 * @returns {Promise<SessionRequestResult | null>} Object containing transaction hash and request hash, or null on failure
 * @throws {InvalidChallengeException} If the request is rejected as a bad request
 */
export const sendSessionRequest = async (
  url: string,
  community: CommunityConfig,
  privateKey: Wallet,
  source: string,
  sessionType: string
): Promise<SessionRequestResult | null> => {
  try {
    const sessionOwner = privateKey.address;

    // Generate expiry timestamp (current time + 365 days in seconds)
    const expiry = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365; // 365 days

    // Generate salt
    const salt = generateSessionSalt({ source, type: sessionType });

    // Generate hash
    const hash = generateSessionRequestHash({
      community,
      sessionOwner,
      salt,
      expiry,
    });

    // Sign the hash
    const signature = await privateKey.signMessage(getBytes(hash));

    // Create request body
    const requestBody = {
      provider: community.primarySessionConfig.provider_address,
      owner: sessionOwner,
      source: source,
      type: sessionType,
      expiry: expiry,
      signature: signature,
    };

    // Send POST request
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status === 400) {
        throw new BadRequestException();
      }
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.message;
      if (errorMessage) {
        throw new Error(`Backend error: ${errorMessage}`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    const txHash = responseData.sessionRequestTxHash;

    if (txHash == null) {
      // Check if there's an error message from the backend
      const errorMessage = responseData.error || responseData.message;
      if (errorMessage) {
        throw new Error(`Backend error: ${errorMessage}`);
      }
      throw new Error(
        "There may already be a pending code for this number. Please check your messages or wait a moment before trying again."
      );
    }

    return {
      txHash: txHash as string,
      hash: hash,
    };
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw new InvalidChallengeException();
    }
    console.error("Failed to create session request:", error);
    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);
    }
    return null;
  }
};

/**
 * Confirms a session request by signing the session hash and submitting it to the backend API.
 *
 * @param {string} url - The API endpoint URL (e.g., 'https://api.example.com')
 * @param {CommunityConfig} community - Instance of CommunityConfig containing provider address
 * @param {Wallet} privateKey - The wallet instance to sign the session confirmation
 * @param {string} sessionRequestHash - The session request hash (hex string with 0x prefix)
 * @param {number | string} challenge - The challenge number received from the session request
 * @returns {Promise<string | null>} The transaction hash of the confirmation, or null on failure
 */
export const confirmSessionRequest = async (
  url: string,
  community: CommunityConfig,
  privateKey: Wallet,
  sessionRequestHash: string,
  challenge: number | string
): Promise<string | null> => {
  try {
    const sessionOwner = privateKey.address;

    // Generate session hash using the challenge
    const sessionHash = generateSessionHash({
      sessionRequestHash,
      challenge,
    });

    // Sign the session hash
    const signedSessionHash = await privateKey.signMessage(
      getBytes(sessionHash)
    );

    // Create request body
    const requestBody = {
      provider: community.primarySessionConfig.provider_address,
      owner: sessionOwner,
      sessionRequestHash: sessionRequestHash,
      sessionHash: sessionHash,
      signedSessionHash: signedSessionHash,
    };

    // Send PATCH request
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.message;
      if (errorMessage) {
        throw new Error(`Backend error: ${errorMessage}`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData.sessionConfirmTxHash as string;
  } catch (error) {
    console.error("Failed to update session:", error);
    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);
    }
    return null;
  }
};
