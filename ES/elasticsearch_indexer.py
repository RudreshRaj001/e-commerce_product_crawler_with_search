from elasticsearch import Elasticsearch, exceptions
import json
import urllib3

# Suppress only the single InsecureRequestWarning from urllib3 needed for verify_certs=False
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Elasticsearch connection parameters
ES_HOST = "https://localhost:9200"  # Use HTTPS here
ES_USER = "elastic"
ES_PASS = "OZSevqpq3n6RTbD8ew-_"  # Replace with your actual password

# Connect to Elasticsearch with authentication and disable SSL cert verification (for development)
try:
    es = Elasticsearch(
        ES_HOST,
        basic_auth=(ES_USER, ES_PASS),
        verify_certs=False  # Use True in production with valid SSL cert
    )
    
    # Test connection
    if not es.ping():
        raise ValueError("Connection failed")
    print("✅ Connected to Elasticsearch")
except exceptions.ConnectionError as e:
    print(f"❌ Elasticsearch connection error: {e}")
    exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)

# Index name and mapping
index_name = "products"
mapping = {
    "mappings": {
        "properties": {
            "name": {"type": "text"},
            "price": {"type": "float"},
            "description": {"type": "text"},
            "rating": {"type": "float"},
            "category": {"type": "keyword"},
            "availability": {"type": "keyword"},
            "image_url": {"type": "keyword"}
        }
    }
}

# Delete old index if exists
if es.indices.exists(index=index_name):
    print(f"Deleting existing index '{index_name}'...")
    es.indices.delete(index=index_name)

# Create new index with mapping
print(f"Creating index '{index_name}'...")
es.indices.create(index=index_name, body=mapping)

# Load products data from JSON file
try:
    with open("apniroots_products_partial.json", "r", encoding="utf-8") as f:
        products = json.load(f)
except FileNotFoundError:
    print("❌ File 'apniroots_products_partial.json' not found")
    exit(1)
except json.JSONDecodeError as e:
    print(f"❌ JSON decode error: {e}")
    exit(1)

# Index each product document
for i, product in enumerate(products):
    try:
        es.index(index=index_name, id=i, body=product)
    except Exception as e:
        print(f"❌ Failed to index product {i}: {e}")

print("✅ Indexed all products!")
