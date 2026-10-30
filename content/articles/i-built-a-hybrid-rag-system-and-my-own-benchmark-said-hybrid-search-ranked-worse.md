---
layout: layouts/article.njk
title: "Hybrid RAG vs Vector Search: RRF and Reranking Benchmarks"
slug: hybrid-rag-vector-keyword-search-rrf-reranking
description: Compare hybrid RAG with vector search using PostgreSQL, pgvector,
  RRF, and cross-encoder reranking. See benchmark results, failure cases, and
  tradeoffs.
excerpt: I compared vector search, PostgreSQL keyword search, RRF fusion, and
  cross-encoder reranking in SourceTrail. See the benchmark results, where
  hybrid retrieval fell short, and the fixes for exact identifiers, compound
  questions, and tables.
category: AI Engineering
date: 2026-10-13
readTime: 22 minute read.
image: /assets/articles/uploads/screenshot-2026-10-13-at-12.48.32.png
imageAlt: SourceTrail answering a question with numbered citations, the sources
  panel open beside it showing the cited passage highlighted.
projectUrl: https://github.com/Elijah-cod/sourcetrail-rag
projectLabel: SourceTrail on GitHub
---
Hybrid RAG combines vector search and keyword search, often using Reciprocal Rank Fusion (RRF) to merge their rankings. A cross-encoder can then rerank the retrieved passages before they reach the language model.

I built this pipeline in SourceTrail using PostgreSQL and pgvector, then compared vector-only, keyword-only, hybrid, and hybrid-plus-reranking retrieval on the same evaluation set.

On my 13 October evaluation of 39 answerable questions, vector search achieved an MRR of 0.854. Hybrid search with equal-weight RRF scored 0.762; adding a cross-encoder brought it to 0.852. Recall@5 was 0.97 for all three.

These results describe one small documentation corpus. They show why you should measure each retriever separately before assuming that combining them improves ranking. Below, I explain the implementation, the evaluation’s limits, and the failures involving exact identifiers, compound questions, and tables.

### Retrieval comparison: 13 October 2026

| Mode            | Recall@1 | Recall@5 | Recall@10 | MRR       |
| --------------- | -------- | -------- | --------- | --------- |
| Vector only     | **0.79** | 0.97     | **1.00**  | **0.854** |
| Keyword only    | 0.31     | 0.72     | 0.85      | 0.488     |
| Hybrid (RRF)    | 0.64     | 0.97     | 1.00      | 0.762     |
| Hybrid + rerank | **0.79** | 0.97     | 0.97      | 0.852     |

**Evaluation scope:** 39 answerable questions over SourceTrail’s demo collection; six additional questions tested refusal behavior. This is a project-specific evaluation, not a general benchmark of hybrid retrieval. Recall@k measures whether a correct chunk appears in the top k; MRR rewards ranking the first correct chunk higher. See the [evaluation script](https://github.com/Elijah-cod/sourcetrail-rag/blob/981eecd74a64d28a37aa82c313238881d307709e/backend/eval/run_eval.py) and [recorded results](https://github.com/Elijah-cod/sourcetrail-rag/blob/981eecd74a64d28a37aa82c313238881d307709e/backend/eval/results.md).

## Two sections, one character apart
﻿
﻿

Here is the question that taught me the most about retrieval:
﻿
﻿

> "What does SEC-014 say about data quality?"
﻿
﻿

The test document had 120 sections, SEC-001 through SEC-120. They were generated from twelve topic templates, so SEC-004 and SEC-014 had *identical* body text. They differed only in their ID, an evaluation marker, a few dates and a cross-reference.
﻿
﻿

To an embedding model, those two sections are the same point in space. To the cross-encoder reranker, they were both excellent matches: it scored every same-topic section at about 0.99. PostgreSQL's full-text search should have been the hero here, since exact tokens are its whole job, but its parser splits `SEC-014` into `sec` and `-014`. The right section *was* retrieved. So were five lookalikes, and one of them ranked above it.
﻿
﻿

That is the gap this article is about: the difference between text that **looks** relevant and text that **is** the answer. Every retriever I used is good at the first. None of them, alone, was reliable at the second.
﻿
﻿

## Why I built SourceTrail
﻿
﻿

Curiosity, mostly. I wanted to understand RAG by building every piece myself rather than wiring a framework together, and I wanted the result to be honest about where its answers came from.
﻿
﻿

That turned into a short list of constraints I wrote down before any code ([design spec](https://github.com/Elijah-cod/sourcetrail-rag/blob/main/docs/superpowers/specs/2026-10-02-sourcetrail-rag-design.md)):
﻿
﻿

* **Anyone can use it**: a public site, no login, upload your own files into a private, temporary workspace.
* **Every citation is inspectable**: document, page or section, and the chunk text itself.
* **It costs nothing to run**: CPU-only models, a free Postgres, a free-tier container host.
* **No LangChain or LlamaIndex**: chunking, fusion, reranking and citation logic written by hand "so every step is visible and explainable."
* **An evaluation that compares retrieval methods**: vector, keyword, hybrid, and hybrid plus reranker, on the same questions.
﻿
﻿

I wrote it with an AI pair-programmer. I set the direction and made the design calls (what to build, which tradeoffs to accept, when a fix was good enough); the AI wrote much of the code and did a lot of the digging when something broke. The testing was a mix of both: some test reports were mine, some came from an AI agent driving the live app in a browser.
﻿
﻿

## What is Hybrid RAG?
﻿
﻿

**Hybrid RAG is retrieval-augmented generation where more than one retrieval method finds candidate passages, and their results are merged before the language model writes an answer.** The most common pairing, and the one SourceTrail uses, is dense vector search (good at meaning and paraphrase) with lexical keyword search (good at exact names, codes and rare terms). Some systems add other retrievers, such as graph traversal over linked entities. SourceTrail does not; its design spec puts knowledge graphs out of scope.
﻿
﻿

**When is it useful?** When your questions mix two kinds of need. "How do I make my API accept requests from another domain?" is a meaning question; an embedding can find the CORS page even though the question never says "CORS." "What is the default for `hnsw.ef_search`?" is a token question; a keyword index can match the exact parameter name even when the embedding drifts toward other HNSW settings.
﻿
﻿

## Hybrid RAG architecture with PostgreSQL and pgvector
﻿

![SourceTrail hybrid RAG pipeline: documents are extracted, chunked and indexed in PostgreSQL; questions run vector and keyword search, RRF fusion and cross-encoder reranking before the system either refuses or generates and verifies a cited answer.](/assets/articles/uploads/sourcetrail-hybrid-rag-pipeline.png "SourceTrail hybrid RAG pipeline")
﻿

*SourceTrail’s hybrid RAG pipeline, from ingestion through citation verification.*
﻿

The stack, all of it verifiable in the repository:
﻿
﻿

| Concern            | Choice                                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| API                | Python 3.12, FastAPI, plain SQL through psycopg 3                                                                |
| Storage and search | PostgreSQL 17 with [pgvector](https://github.com/pgvector/pgvector) (HNSW, cosine) and built-in full-text search |
| Embeddings         | `BAAI/bge-small-en-v1.5`, 384 dimensions, via [FastEmbed](https://github.com/qdrant/fastembed) on CPU            |
| Reranker           | `ms-marco-MiniLM-L-6-v2` cross-encoder, also via FastEmbed                                                       |
| LLM                | Any OpenAI-compatible API; default `openai/gpt-oss-120b` on Groq                                                 |
| Hosting            | Google Cloud Run (scales to zero) and Neon Postgres                                                              |
﻿
﻿

### Ingestion: most retrieval bugs start here
﻿
﻿

Each file type has its own extractor ([`backend/app/ingest/`](https://github.com/Elijah-cod/sourcetrail-rag/tree/main/backend/app/ingest)). PDFs are rebuilt into light Markdown so headings and lists survive. Word files keep their tables, row by row. Text files are split at heading-like lines and around conditional paragraphs. CSVs are validated and stored a row or a few rows at a time. Web pages go through [trafilatura](https://trafilatura.readthedocs.io/) with a fallback converter.
﻿
﻿

Chunks are about 1,000 characters with 150 characters of overlap, cut at the nicest boundary available: paragraph, then line, then sentence, then word. Each chunk gets a stable ID like `annual-report-2024:p47:c003`, which is what a citation ultimately points to.
﻿
﻿

One small decision mattered more than I expected. The text that gets embedded is not the bare chunk:
﻿
﻿

```python
def text_for_embedding(doc: ExtractedDocument, chunk: Chunk) -> str:
    context = " — ".join(part for part in (doc.title, chunk.section) if part)
    return f"{context}\n\n{chunk.text}" if context else chunk.text
```
﻿
﻿

A chunk that says "It grew 12%" means nothing on its own. With "Annual Report 2024 — Revenue" in front, its vector knows what "it" is.
﻿
﻿

### Keyword search: one line that turns AND into OR
﻿
﻿

PostgreSQL's `plainto_tsquery` lowercases the question, drops stop words, stems what's left and joins the words with AND. That is fine for a search box and wrong for a question: "how do I configure CORS for my API" would demand that every content word appear in one chunk. So the query swaps AND for OR and lets the ranking function reward chunks that match more terms:
﻿
﻿

```sql
SELECT replace(plainto_tsquery('english', %(text)s)::text, ' & ', ' | ')::tsquery AS query
-- ...
ts_rank_cd(c.tsv, q.query, 32) AS score   -- 32: squash the score into 0..1
```
﻿
﻿

([`backend/app/search.py`](https://github.com/Elijah-cod/sourcetrail-rag/blob/main/backend/app/search.py)). SourceTrail uses PostgreSQL’s `ts_rank_cd` cover-density ranking for lexical retrieval. It does not implement BM25. [`ts_rank_cd`](https://www.postgresql.org/docs/current/textsearch-controls.html) is a cover-density ranking, and I chose it because it lives in the same database as the vectors, so one query stays one round trip.
﻿
﻿

### How does Hybrid RAG combine vector and keyword results?
﻿
﻿

**SourceTrail combines them with Reciprocal Rank Fusion (RRF): each list gives a chunk `1 / (k + rank)` points, the points are summed, and the highest total wins.** Raw scores are ignored entirely. Only positions matter.
﻿
﻿

```python
RRF_K = 60  # value from the original RRF paper (Cormack et al., 2009)
﻿
﻿

def rrf_fuse(ranked_lists, k=RRF_K, limit=FUSED_LIMIT):
    fused = {}
    for method, hits in ranked_lists.items():
        for rank, hit in enumerate(hits, start=1):
            key = (hit.document_id, hit.chunk_id)
            if key not in fused:
                fused[key] = replace(hit, score=0.0, ranks={})
            fused[key].score += 1.0 / (k + rank)
            fused[key].ranks[method] = rank
    ordered = sorted(fused.values(),
                     key=lambda h: (-h.score, min(h.ranks.values()), h.chunk_id))
    return ordered[:limit]
```
﻿
﻿

([`backend/app/retrieve.py`](https://github.com/Elijah-cod/sourcetrail-rag/blob/main/backend/app/retrieve.py)). A chunk ranked first by both lists gets `2/61 ≈ 0.033`. A chunk ranked first by one list and absent from the other gets `1/61 ≈ 0.016`. Ties go to the chunk with the best single rank, then to the chunk ID, so the order never changes between runs.
﻿
﻿

**Why RRF instead of weighted score fusion?** Weighted fusion (`α · vector_score + (1 − α) · keyword_score`) needs the two scores on comparable scales. They aren't: cosine similarity measures the angle between two vectors, while `ts_rank_cd` with normalization flag 32 is a squashed function of how densely the query terms appear. Normalizing them and then picking α is a tuning problem, and I had no labelled data yet to tune against. RRF sidesteps the problem and has one parameter, which I left at the paper's value of 60. [Cormack, Clarke and Büttcher (2009)](https://dl.acm.org/doi/10.1145/1571941.1572114) introduced it; it has since become a common default for hybrid search.
﻿
﻿

The honest caveat comes later: "no tuning needed" also means "no way to tell the fusion that one list is much better than the other."
﻿
﻿

### Why rerank with a cross-encoder?
﻿
﻿

**A cross-encoder reads the question and a passage together and outputs one relevance score, so it can judge whether the passage answers the question rather than whether the two are about the same topic.** Vector search compares two vectors that were made separately. Jointly scoring the query and passage can improve relevance judgments, but it adds computation. In SourceTrail’s later benchmark, reranking restored performance close to the vector-only baseline rather than exceeding it. That is why it only sees the 15 candidates fusion already picked. The approach goes back to [Nogueira and Cho (2019)](https://arxiv.org/abs/1901.04085); the model SourceTrail uses is a small MiniLM trained on [MS MARCO](https://microsoft.github.io/msmarco/) search queries.
﻿
﻿

```python
raw_scores = reranker.score(question, [passage_text(h) for h in hits])
rescored = [replace(hit, score=sigmoid(raw), ranks=dict(hit.ranks))
            for hit, raw in zip(hits, raw_scores, strict=True)]
rescored.sort(key=lambda h: -h.score)
```
﻿
﻿

The sigmoid turns raw logits like −9.3 or 7.1 into a 0–1 number. That conversion turned out to be the reranker's most valuable contribution, for a reason I didn't plan.
﻿
﻿

## Hybrid RAG vs vector search: benchmark results
﻿
﻿

I built an evaluation set over the demo collection (eight FastAPI documentation pages, the pgvector README, a PDF overview and a CSV): 39 answerable questions, each with the source and a phrase the correct chunk must contain, plus 6 questions the collection can't answer. The script runs all four retrieval modes on every question and reports Recall@k and Mean Reciprocal Rank ([`backend/eval/run_eval.py`](https://github.com/Elijah-cod/sourcetrail-rag/blob/main/backend/eval/run_eval.py)).
﻿
﻿

**Recall@k** is the share of questions with a correct chunk somewhere in the top k. **MRR** averages 1/rank of the first correct chunk, so it rewards putting the answer first.
﻿
﻿

The first run, on 6 October:
﻿
﻿

| Mode            | Recall@1 | Recall@5 | Recall@10 | MRR       |
| --------------- | -------- | -------- | --------- | --------- |
| Vector only     | 0.74     | 0.97     | 1.00      | 0.820     |
| Keyword only    | 0.33     | 0.77     | 0.90      | 0.522     |
| Hybrid (RRF)    | 0.67     | 0.97     | 1.00      | 0.785     |
| Hybrid + rerank | **0.79** | 0.95     | 0.97      | **0.850** |
﻿
﻿

That looks like the story every hybrid search tutorial promises, with one wrinkle: hybrid on its own was *below* vector only. The reranker carried the day.
﻿
﻿

The run from 13 October, after a week of ingestion and chunking work:
﻿
﻿

The 13 October results are shown in the comparison table at the start of this article.
﻿
﻿

Vector search improved by itself, and the reranker's lead disappeared. Three things are worth saying plainly.
﻿
﻿

**1. Fusion hurt first-place ranking, both times.** Keyword search is far weaker than vector search on this corpus (MRR 0.49 against 0.85), and unweighted RRF gives its vote the same weight. When keyword search ranks a near-miss chunk highly, that chunk can climb past the right answer. Recall@5 didn't move, because the right chunk is still nearby; it just stopped being first as often.
﻿
﻿

**2. The improvement in vector search probably came from ingestion, not retrieval.** Between those runs I changed how PDFs keep their headings, how titles are extracted and how passages are labelled, and the embedding text includes the title and section. I didn't run an ablation to prove which change did it, so treat that as my reading, not a result.
﻿
﻿

**3. This is a small, friendly corpus.** Thirty-nine questions over well-written documentation is where embeddings shine and exact tokens rarely matter. The questions that exercised keyword search hardest (codes, part numbers, IDs) were in different test sets, and on those, as the SEC-014 story shows, *neither* retriever was enough.
﻿
﻿

### Why equal-weight RRF reduced ranking quality in this benchmark
﻿
﻿

**A hybrid retriever is not automatically better than its best component.** Rank fusion helps when the lists make different, complementary mistakes and each is reasonably strong. When one list is much weaker on your data, equal-weight fusion can dilute the stronger one. Measure each retriever alone before you trust the combination.
﻿
﻿

## Cross-encoder reranking as an answerability filter
﻿
﻿

On 12 October a black-box test of the live site put the case against the reranker bluntly: on the built-in benchmark, vector only matched or beat it on every relevance metric, and in production the reranker added four to five seconds per answer. The suggestion was to make vector search the default.
﻿
﻿

I kept the reranker as the default, for a reason that doesn't show up in Recall@k. Its sigmoid scores separate answerable from unanswerable questions cleanly:
﻿
﻿

* Answerable questions: lowest top score **0.65**, median 0.997.
* Unanswerable questions: highest top score **0.13**, median 0.002.
﻿
﻿

That gap powers a relevance gate. If the best passage scores under 0.3, SourceTrail answers "I couldn't find an answer to that in the available documents" without calling the LLM at all, which saves free-tier quota and removes the chance of a confident answer built from irrelevant passages. My first threshold, 0.01, stopped 4 of the 6 unanswerable demo questions; raising it to 0.3 stopped all 6 and wrongly refused none of the 39 answerable ones.
﻿
﻿

I didn't test whether vector similarity could do the same job, but the reranker's gap was already wide and stable, so I built on it. The reranker also became the referee for several later layers, which judge whether a part of a question is covered by checking a reranked score against the same threshold.
﻿
﻿

The gate has limits, and they belong in this article. On the harder regression fixtures, it stopped only **3 of 10** unanswerable questions before the LLM. The other seven reached the model, which then had to refuse on its own (the prompt tells it to). The gate is a cheap first filter, not a guarantee.
﻿
﻿

The latency problem, meanwhile, turned out to be mostly a bug. More on that below.
﻿
﻿

## The failures that actually shaped the system
﻿
﻿

Almost everything after the textbook pipeline came from a specific wrong answer. I'll go through them roughly in the order they appeared.
﻿
﻿

### 1. Codes that semantic search can't tell apart
﻿
﻿

**What I expected:** keyword search would catch exact IDs like SEC-014.
**What happened:** the 120-section stress document. The right section came back with five lookalikes, the reranker scored them all about 0.99, and the PDF's document title had become "SEC-001: …" because the first heading on page one looked like a title.
**Why it was hard:** every retriever in the pipeline was doing its job. Semantically, the lookalikes *are* relevant. The problem was that the question had a constraint (this exact ID) that no relevance score represents.
**What changed:** identifiers became a third, literal lookup ([`backend/app/identifiers.py`](https://github.com/Elijah-cod/sourcetrail-rag/blob/main/backend/app/identifiers.py)). A regex finds codes in the question. Passages that *define* the code (it's their heading) come first, passages that *mention* it come next, and same-document lookalikes are dropped. If no document contains a dashed code at all, the answer says "None of the documents mention SEC-999," which is a different and more useful statement than "I couldn't find anything relevant."
﻿
﻿

The same change added the one graph-like step in the system. If a question asks what a section cross-references, the code IDs inside the defining passage are looked up too, one hop, at most two passages. "The section SEC-117 cross-references" now returns SEC-117 and then SEC-014. On a replay of eleven stress questions, every ID question returned the right section first, and the standard evaluation didn't move.
﻿
﻿

**Lesson:** when a question contains a hard constraint, handle the constraint with a lookup, and let relevance scoring rank only what survives it.
﻿
﻿

### 2. Compound questions that lost their smallest part
﻿
﻿

**What I expected:** one good search per question.
**What happened:** a test question read: *"During a conservation order, the back-pump fails and an amber alert is raised while a barge is in the chamber. What should the keeper do?"* The answer said the document didn't cover amber alerts. It did. The amber-alert rule matched only one part of the question, so against the question as a whole the reranker scored it 0.07 and it was cut.
**What changed:** compound questions are split into parts ("facets") with rules, not an extra LLM call: at sentence ends, semicolons, commas and joining words like "and," "while" and "but" ([`backend/app/facets.py`](https://github.com/Elijah-cod/sourcetrail-rag/blob/main/backend/app/facets.py)). Each part is searched and reranked on its own, and its best passage is guaranteed a place among the sources, up to ten. A part with nothing above the relevance threshold gets one wider retry, and if that fails it is reported to the model as uncovered, so the answer can say "the passages I found don't cover X" instead of "the document doesn't say X." On the regression set, part coverage went from 33/37 to 37/37 and fully covered compound questions from 5/8 to 8/8.
﻿
﻿

Rule-based splitting has a long tail, and I spent a lot of time in it. "Which team and count belong to Blue Heron" is one part, not two. "Show the arithmetic" is an instruction, not something to search for. "…, according to IANA" belongs to the part before it. "Its travel time" means nothing once it's separated from "the Vesper," so the names from the full question are put back in brackets before the reranker judges it. That last one moved the score of the correct passage from 0.0001 to 0.997.
﻿
﻿

**The six-part question.** On 13 October an end-to-end test asked one question spanning six documents: a text file, Markdown, a CSV, a Word file, a PDF and a web page. The answer cited four sources, missed the CSV and web page answers, and took 37.9 seconds. Both missing answers came back fine when asked alone, so the data was indexed. The cause was mundane: the facet splitter kept only the first **four** parts. Parts five and six never got a search of their own. Two more bugs hid behind it: "using all six sources" and "according to IANA" were treated as parts and then reported missing, and when the whole CSV table was added as a source, the source list was trimmed back to six, which pushed out the IANA page and the PDF. The cap is now eight, and the case is a regression test.
﻿
﻿

**Lesson:** a limit chosen for latency is also a correctness boundary. Write down what happens to the input that falls past it.
﻿
﻿

### 3. Totals that no single row looks like
﻿
﻿

"What is the total number of units?" over a CSV needs every row. Search returns the rows that look most like the question, and a total looks like no row in particular: each one scored about 0.001, so the question was refused. When an aggregate word ("total," "how many," "every," "highest") is followed closely by one of a small CSV's column names, SourceTrail now sends every row of that table, up to twelve chunks ([`backend/app/tables.py`](https://github.com/Elijah-cod/sourcetrail-rag/blob/main/backend/app/tables.py)).
﻿
﻿

**Lesson:** some questions are about a set, not a passage. Top-k retrieval can't answer them however good the ranking is.
﻿
﻿

### 4. A correct citation on a wrong number
﻿
﻿

This one worried me most, because it looks fine. An answer said a group of assets had **512** units and cited the right rows. The rows add up to **464**. A citation makes a sentence look supported whether or not it is.
﻿
﻿

The fix needs no second model ([`backend/app/verify.py`](https://github.com/Elijah-cod/sourcetrail-rag/blob/main/backend/app/verify.py)). Every token with a digit in a cited clause (464, 05:55, 2026-10-01, TG-203) is looked up in the cited sources. If it's in a different source, that source's citation is added. If it's in no source, the model gets one chance to correct it, and anything still unsupported is shown under the answer. Small counts, figures repeated from the question, and results the sentence shows how to calculate ("360 of the 1,200 hours, which is 30%") are left alone. Replaying 58 recorded answers flagged exactly one: the 512.
﻿
﻿

A sibling check came from an RFC. The model paraphrased SHOULD and SHOULD NOT as "must" and "must not," with correct citations. In [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) language those are different obligations, so SourceTrail now compares requirement words in each answer sentence with the ones in its cited sources and restores the source's wording.
﻿
﻿

**Lesson:** groundedness is checkable at the token level for the facts that hurt most: numbers, dates, codes and obligations.
﻿
﻿

### 5. "Not retrieved" is not "not in the document"
﻿
﻿

The model only sees a few passages, so when it says something isn't covered, it might just not have been given the passage. Two mechanisms handle that. If the answer names a missing part, SourceTrail searches once more for that part and regenerates only if it finds something new. If it finds nothing new but the claim is suspicious, the model is asked to re-read the sources it already has, told what its draft said was missing, and the second answer is kept only if it reports fewer gaps. That caught an answer claiming "the passages don't cover its travel time" while its own source said the Vesper "reaches Summit Gate after 47 minutes." The prompt also forbids the phrase "the document doesn't mention": the model may only say the *passages it was given* don't.
﻿
﻿

### 6. Documents that were accepted but empty
﻿
﻿

Two ingestion bugs from an 8 October test report produced confidently cited nonsense. A CSV without a header row was accepted and its first data row became the column names, so records read `North pier: East Lock` and `Ready: Overdue`. It's now rejected with a reason when the header looks like data. And the PEP 20 web page was accepted with its title and metadata but none of its aphorisms, because the extractor dropped the `<pre>` block that held them. Now the page's main content is measured directly, and if the extractor kept too little, a fallback converter takes over. A page with nothing but metadata is refused.
﻿
﻿

**Lesson:** "upload succeeded" should mean "useful text was indexed," and the system should check that, not assume it.
﻿
﻿

## Reducing cross-encoder latency on one CPU
﻿
﻿

The reranker's four-to-five-second cost in production looked like a design problem. It was mostly a configuration bug.
﻿
﻿

* **Threads.** ONNX Runtime started one thread per CPU on the *host* machine, while the Cloud Run container had one vCPU. Sixteen threads took turns on one core, and in my measurement ran sixteen times slower than one thread. The thread count now comes from the container's CPU quota, and `MODEL_THREADS=1` is set in the Dockerfile.
* **Candidates.** The reranker originally read 30 fused candidates. On the demo questions, 15 found the same passages (Recall@5 0.97 against 0.95, MRR 0.852 against 0.850) in about half the time, and kept the answerable/unanswerable gap.
* **Batch padding.** A batch is padded to its longest passage, so mixing a 100-character CSV row with a 1,000-character section wasted work. Sorting passages by length first cut reranking 30 passages from 1.16 s to 0.80 s on one CPU.
* **Memory.** With both models loaded, reranking 40 passages in batches of 32 took the process to 1.3 GB. Batches of 4 with ONNX's memory arena off used 0.4 GB at the same speed, and calling `malloc_trim` after requests stopped glibc from holding onto freed memory.
﻿
﻿

On the local evaluation, the hybrid + rerank mode went from about 1,050 ms on 6 October to about 410 ms by 13 October. I haven't yet measured live answer times on Cloud Run after the thread fix, so I won't quote one.
﻿
﻿

## What I learned, and what I can actually prove
﻿
﻿

| Proven in this project's measurements                                                                                             | Lessons and interpretations (not proven)                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Unweighted RRF ranked the right chunk first less often than vector search alone (Recall@1 0.64–0.67 vs 0.74–0.79) on the demo set | Fusion helps only when both retrievers are reasonably strong on your data                                |
| Reranker scores separated answerable (≥ 0.65) from unanswerable (≤ 0.13) demo questions                                           | A reranker can be worth its latency as a "should we answer?" signal even when it doesn't improve ranking |
| Facet search raised part coverage from 33/37 to 37/37; the full regression set now covers 95/95 parts                             | Rule-based decomposition is cheap and debuggable, but its edge cases never end                           |
| The figure check flagged 1 of 58 recorded answers, the wrong one                                                                  | The most damaging hallucinations are checkable without another model                                     |
| 16 ONNX threads on 1 vCPU ran 16x slower than 1 thread                                                                            | "The model is slow" deserves a profiler before an architecture change                                    |
﻿
﻿

Three broader things I believe more firmly now:
﻿
﻿

1. **Retrieval quality is mostly decided at ingestion.** The biggest jump in vector-search quality happened while I was working on PDF headings and titles, not on search.
2. **The interesting failures are constraint failures.** An exact ID, every part of a question, every row of a table, the exact obligation word. Similarity scores don't represent constraints, so each one needed its own small mechanism.
3. **A benchmark built from your own failures is a regression suite, not a quality score.** SourceTrail's regression set (95/95 parts, 55/55 questions) proves those bugs stay fixed. It doesn't prove the system is good on documents I haven't seen.
﻿
﻿

## What I'd investigate next, and how I'd know it worked
﻿
﻿

**An ablation of every layer.** Turn off identifier lookup, facet search, table expansion, neighbour context, gap search and the figure check one at a time, on both test sets. *Success looks like:* a table showing which layers carry their weight and which only fixed the case they were written for.
﻿
﻿

**Weighted RRF, measured instead of guessed.** Give each list a weight, `w · 1/(k + rank)`, and sweep the keyword weight and k on a held-out split. *Success looks like:* Recall@1 for hybrid at or above vector-only on the demo set without losing ground on the code-heavy fixtures. If it can't do both, routing by question type (codes go to exact lookup, everything else to vectors) may beat fusion entirely.
﻿
﻿

**A held-out evaluation set.** Questions written before looking at the system's answers, on documents it hasn't seen. *Success looks like:* numbers I can quote without the asterisk that the tests were built from the bugs.
﻿
﻿

**Answer-level grading as a routine.** The last graded run (8 October) passed 57 of 58 answers. Grading needs LLM calls, so it hasn't been rerun since. *Success looks like:* answer correctness and citation correctness tracked per release, next to retrieval metrics.
﻿
﻿

**Whether a graph would earn its place.** The cross-reference hop is the only graph-like behaviour in SourceTrail, and topic-wide questions ("all Observability sections") still find 6 of 10. A graph of explicit links between sections might help with both. *Success looks like:* a measurable gain on those question types that the one-hop lookup and a "list everything" query type can't match. Until then, it stays out.
﻿
﻿

**Live latency observability.** Each question already logs per-stage timings without the question text. *Success looks like:* a p95 answer time from production, not from my laptop.
﻿
﻿

## The question I started with
﻿
﻿

I set out to learn how hybrid retrieval works, and the textbook version was working within the first four days. Most of the eleven days went into the space between "this passage is about the question" and "this passage answers the question."
﻿
﻿

Vector search, keyword search, fusion and reranking are all ways of estimating the first. The second kept turning out to depend on something specific: an exact code, every part of a question, every row of a table, a number that has to match. What I understand better now is that a RAG system gets trustworthy less by finding a better similarity score and more by noticing when similarity is the wrong question to ask.
﻿
﻿

The next thing I want to know is how much of SourceTrail's behaviour survives a test set I didn't write my bugs into.
﻿
﻿

- - -
﻿
﻿

*SourceTrail is open source: [github.com/Elijah-cod/sourcetrail-rag](https://github.com/Elijah-cod/sourcetrail-rag). The evaluation results quoted here are in [`backend/eval/results.md`](https://github.com/Elijah-cod/sourcetrail-rag/blob/981eecd74a64d28a37aa82c313238881d307709e/backend/eval/results.md) and [`backend/eval/regression/results.md`](https://github.com/Elijah-cod/sourcetrail-rag/blob/main/backend/eval/regression/results.md), and the 6 October figures are in that file's history.*
﻿
﻿

### References
﻿
﻿

* Lewis et al. (2020), [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)
* Cormack, Clarke and Büttcher (2009), [Reciprocal Rank Fusion outperforms Condorcet and individual rank learning methods](https://dl.acm.org/doi/10.1145/1571941.1572114)
* Nogueira and Cho (2019), [Passage Re-ranking with BERT](https://arxiv.org/abs/1901.04085)
* Xiao et al. (2023), [C-Pack: Packaged Resources To Advance General Chinese Embedding](https://arxiv.org/abs/2309.07597) (the BGE embedding models)
* [pgvector](https://github.com/pgvector/pgvector) and [PostgreSQL text search ranking](https://www.postgresql.org/docs/current/textsearch-controls.html)
* [RFC 2119: Key words for use in RFCs to Indicate Requirement Levels](https://www.rfc-editor.org/rfc/rfc2119)
﻿
