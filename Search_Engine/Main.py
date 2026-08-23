from exa_py import Exa
import os

# Read API key from API.txt (same directory as this script)
_key_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'API.txt')
with open(_key_path, 'r') as _f:
    _api_key = _f.read().strip()

# Initialize Exa with your API key
exa = Exa(_api_key)

# Take input query
query = input("🔍 Search here: ")

# Ask user how many results they want
try:
    num_results = int(input("📌 How many results do you want? (default 3): ") or 3)
except ValueError:
    num_results = 3

# Ask user for domainS
domain = input("🌐 Enter domain (default: instagram.com): ") or "instagram.com"

# Perform the search
try:
    response = exa.search(
        query,
        num_results=num_results,
        type='keyword',
        include_domains=[domain]
    )

    if not response.results:
        print("\n⚠️ No results found.")
    else:
        print(f"\n✅ Top {len(response.results)} results from {domain}:\n")
        for idx, result in enumerate(response.results, start=1):
            print(f"{idx}. {result.title}")
            print(f"   🔗 {result.url}\n")

except Exception as e:
    print("\n❌ Error while fetching results:", e)
