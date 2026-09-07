import { searchTmdb } from "@/app/api/search/search";

// /api/search/movie?query=dune
export async function GET(request: Request) {
  return searchTmdb(request, "movie");
}
