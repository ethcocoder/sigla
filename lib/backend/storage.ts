/**
 * SIGLA intentionally does not use Firebase Storage. Firestore stores listing
 * metadata only; selected images remain local preview media until a storage
 * product is introduced.
 */
export async function uploadListingImage(_uri: string, _userId: string) { return ""; }
