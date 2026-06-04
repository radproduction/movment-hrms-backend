import { Types } from 'mongoose';

/**
 * Type Adapter Layer for MongoDB
 * 
 * This module provides utilities to convert between MongoDB's ObjectId format
 * and the frontend's expected string/number ID format for backward compatibility.
 */

// Type for documents with both _id and id fields
export type AdaptedDocument<T> = Omit<T, '_id'> & { id: string };

/**
 * Converts a single MongoDB document to frontend-compatible format
 * Adds 'id' field (string) from '_id' (ObjectId)
 */
export function adaptDocument<T extends { _id?: Types.ObjectId | any }>(
  doc: T | null | undefined
): AdaptedDocument<T> | null {
  if (!doc) return null;
  
  const plain = doc as any;
  const { _id, __v, ...rest } = plain;
  
  return {
    ...rest,
    id: _id?.toString() || '',
  } as AdaptedDocument<T>;
}

/**
 * Converts an array of MongoDB documents to frontend-compatible format
 */
export function adaptDocuments<T extends { _id?: Types.ObjectId | any }>(
  docs: T[]
): AdaptedDocument<T>[] {
  return docs.map(doc => adaptDocument(doc)).filter((doc): doc is AdaptedDocument<T> => doc !== null);
}

/**
 * Converts frontend ID (string/number) to MongoDB ObjectId
 * Handles both string ObjectIds and legacy integer IDs
 */
export function toMongoId(id: string | number | Types.ObjectId | undefined | null): Types.ObjectId | undefined {
  if (!id) return undefined;
  
  // Already an ObjectId
  if (id instanceof Types.ObjectId) return id;
  
  // Integer ID (legacy support)
  if (typeof id === 'number') {
    // Create a deterministic ObjectId from integer
    // Pad to 24 hex characters (12 bytes)
    const hexId = id.toString(16).padStart(24, '0');
    try {
      return new Types.ObjectId(hexId);
    } catch {
      return undefined;
    }
  }
  
  // String ID
  try {
    return new Types.ObjectId(id);
  } catch {
    return undefined;
  }
}

/**
 * Safely converts any ID format to string
 */
export function toStringId(id: string | number | Types.ObjectId | undefined | null): string | undefined {
  if (!id) return undefined;
  if (id instanceof Types.ObjectId) return id.toString();
  return id.toString();
}

/**
 * Checks if a string is a valid MongoDB ObjectId
 */
export function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id);
}

/**
 * Creates a new MongoDB ObjectId
 */
export function createObjectId(): Types.ObjectId {
  return new Types.ObjectId();
}
