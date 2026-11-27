# StudyDesk RAG setup

## What this adds
StudyDesk uses Gemini File Search as a managed Retrieval-Augmented Generation (RAG) index. Gemini handles PDF ingestion, chunking, embeddings, semantic retrieval, and grounding. The API uses the store only for curriculum questions and returns any source annotations that Gemini provides.

## One-time indexing (16 official PDFs)
### Easiest: GitHub Actions
1. Open the StudyDesk GitHub repository → Settings → Secrets and variables → Actions.
2. Create a **New repository secret** named `GEMINI_API_KEY`, using the Gemini API key already used by the Vercel backend. Never paste the key into a chat or commit it to the repository.
3. Open the **Actions** tab → **Build StudyDesk RAG index** → **Run workflow**.
4. Wait for the run to finish. In the run log, find the printed `fileSearchStores/...` store name. The workflow creates a new store and indexes the manifest PDFs.
5. In Vercel → StudyDesk backend → Settings → Environment Variables, add `GEMINI_FILE_SEARCH_STORE` with that exact store name. Keep `GEMINI_API_KEY` configured.
6. Redeploy the Vercel backend.

### Alternative: run locally
Use Node.js 18 or newer, set `GEMINI_API_KEY` in your terminal environment, then run `node scripts/ingest-rag.js` from the repository folder. The script prints the store name when it creates the store.

To add/update the index later, run the script again with `GEMINI_FILE_SEARCH_STORE` set to the existing store name. The script currently adds documents; it does not delete existing documents.

## Scope and honest coverage
The initial manifest includes 16 Ministry-hosted first-secondary 2026–2027 Term 1 PDFs for the subjects with verified official URLs already catalogued in StudyDesk. This includes Arabic, English, Mathematics Arabic, Integrated Science Arabic, History, Philosophy and Logic, Programming and AI Arabic, religion books, second-language books (English/French/Spanish/German/Italian), the Antarah story, and the general grammar reference.

It does **not** claim complete language-track coverage for English-medium Mathematics, Integrated Science, or Programming: verified official PDFs for those exact tracks are not currently in the manifest. Add their official Ministry URLs to `rag-books.json` when verified. Other grades, Term 2, and future years are not indexed by this first batch.

## Verification
After deployment, ask the StudyDesk AI a question whose answer is directly in one of the indexed books. The response should use retrieved textbook content. If retrieval returns no evidence, the assistant is instructed to say that the indexed sources do not contain enough information rather than inventing a textbook citation.
