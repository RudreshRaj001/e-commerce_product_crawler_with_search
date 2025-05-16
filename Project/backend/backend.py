from flask import Flask, request, jsonify
from elasticsearch import Elasticsearch
from flask_cors import CORS # Import CORS

app = Flask(__name__)
CORS(app) # Initialize CORS for your app, allowing all origins by default

# Elasticsearch connection parameters
ES_HOST = "https://localhost:9200"  # Use HTTPS here
ES_USER = "elastic"
ES_PASS = "OZSevqpq3n6RTbD8ew-_"  # Replace with your actual password

es = Elasticsearch(
        ES_HOST,
        basic_auth=(ES_USER, ES_PASS),
        verify_certs=False  # Use True in production with valid SSL cert
    )

INDEX = "products"

# @app.route("/api/products", methods=["GET"])
# def get_products():
#     query = request.args.get("q", "")
#     category = request.args.get("category")
#     availability = request.args.get("availability")
#     min_price = request.args.get("min_price")
#     max_price = request.args.get("max_price")
    
#     # Pagination params
#     skip = int(request.args.get("skip", 0))
#     limit = int(request.args.get("limit", 10))

#     es_query = {
#         "bool": {
#             # 'must' clause is for scoring queries, 'filter' is for exact matches without scoring
#             # For a search bar (q), 'match' is appropriate for 'must'.
#             "must": [], 
#             "filter": []
#         }
#     }

#     # Add query if present (for 'name' field)
#     if query:
#         es_query["bool"]["must"].append({"match": {"name": query}})
#     # If no query is provided, but we want to return all results (with filters),
#     # we can add a match_all to 'must' if 'must' is empty
#     if not es_query["bool"]["must"] and not es_query["bool"]["filter"]:
#         es_query["bool"]["must"].append({"match_all": {}})


#     if category:
#         # Using .keyword for exact match on 'category' as it's defined as 'keyword' type in ES mapping
#         es_query["bool"]["filter"].append({"term": {"category.keyword": category}})
#     if availability:
#         # Using .keyword for exact match on 'availability' as it's defined as 'keyword' type in ES mapping
#         es_query["bool"]["filter"].append({"term": {"availability.keyword": availability}})
#     if min_price or max_price:
#         price_range = {}
#         if min_price:
#             try:
#                 price_range["gte"] = float(min_price)
#             except ValueError:
#                 return jsonify({"error": "min_price must be a valid number"}), 400
#         if max_price:
#             try:
#                 price_range["lte"] = float(max_price)
#             except ValueError:
#                 return jsonify({"error": "max_price must be a valid number"}), 400
#         es_query["bool"]["filter"].append({"range": {"price": price_range}})

#     try:
#         response = es.search(
#             index=INDEX,
#             body={"query": es_query},
#             from_=skip,
#             size=limit
#         )

#         results = [hit["_source"] for hit in response["hits"]["hits"]]
#         return jsonify(results)
#     except Exception as e:
#         app.logger.error(f"Elasticsearch search error: {e}")
#         return jsonify({"error": "Could not perform search due to an internal error."}), 500

@app.route("/api/products", methods=["GET"])
def get_products():
    query = request.args.get("q", "")
    category = request.args.get("category")
    availability = request.args.get("availability")
    min_price = request.args.get("min_price")
    max_price = request.args.get("max_price")
    
    # Pagination
    skip = int(request.args.get("skip", 0))
    limit = int(request.args.get("limit", 10))

    es_query = {
        "bool": {
            "must": [],
            "filter": []
        }
    }

    # Add text search
    if query:
        es_query["bool"]["must"].append({"match": {"name": query}})
    else:
        es_query["bool"]["must"].append({"match_all": {}})

    # Exact match filters
    if category:
        es_query["bool"]["filter"].append({"term": {"category.keyword": category}})
    if availability:
        es_query["bool"]["filter"].append({"term": {"availability.keyword": availability}})

    # Price range filter
    if min_price or max_price:
        price_range = {}
        if min_price:
            try:
                price_range["gte"] = float(min_price)
            except ValueError:
                return jsonify({"error": "min_price must be a number"}), 400
        if max_price:
            try:
                price_range["lte"] = float(max_price)
            except ValueError:
                return jsonify({"error": "max_price must be a number"}), 400
        es_query["bool"]["filter"].append({"range": {"price": price_range}})

    try:
        response = es.search(
            index=INDEX,
            body={"query": es_query},
            from_=skip,
            size=limit
        )

        results = [hit["_source"] for hit in response["hits"]["hits"]]
        return jsonify(results)
    except Exception as e:
        app.logger.error(f"Elasticsearch error: {e}")
        return jsonify({"error": "Search failed"}), 500


@app.route("/")
def health():
    return "✅ Product Search API is running."

if __name__ == "__main__":
    # Ensure Elasticsearch is running and reachable before starting Flask
    try:
        es.ping()
        print("Connected to Elasticsearch successfully!")
    except Exception as e:
        print(f"Could not connect to Elasticsearch: {e}")
        print("Please ensure Elasticsearch is running on http://localhost:9200")
        exit(1) # Exit if cannot connect to ES

    app.run(debug=True)
