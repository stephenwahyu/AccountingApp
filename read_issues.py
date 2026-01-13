import json
import sys

def read_issues(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    for issue in data['issues']:
        print(f"File: {issue.get('component', 'N/A')}")
        print(f"Line: {issue.get('line', 'N/A')}")
        print(f"Rule: {issue.get('rule', 'N/A')}")
        print(f"Message: {issue.get('message', 'N/A')}")
        print("---")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        read_issues(sys.argv[1])
    else:
        print("Please provide a filename.")