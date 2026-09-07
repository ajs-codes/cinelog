import { searchTmdb } from "@/app/api/search/search";

// /api/search/series?query=breaking+bad
export async function GET(request: Request) {
  return searchTmdb(request, "tv");
}
