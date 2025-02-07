# clause_extractor.py
import sys, json
import spacy

nlp = spacy.load("en_core_web_sm")

def extract_clauses(text):
    doc = nlp(text)
    clauses = []
    for sent in doc.sents:
        # Here, you could look for tokens with dependency labels that mark boundaries
        # For a very simple start, you might split on punctuation tokens or subordinate conjunctions.
        clause = []
        for token in sent:
            clause.append(token.text)
            if token.dep_ == "punct" and token.text in [';', ':']:
                clauses.append(" ".join(clause).strip())
                clause = []
        if clause:
            clauses.append(" ".join(clause).strip())
    return clauses

if __name__ == "__main__":
    text = sys.stdin.read()
    clauses = extract_clauses(text)
    print(json.dumps(clauses))
