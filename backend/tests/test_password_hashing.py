import sys
import os

# Add the project root to sys.path
sys.path.append(os.getcwd())

from app.core.security import get_password_hash, verify_password

def test_password_hashing():
    print("Testing password hashing...")
    
    # Test cases: (name, password)
    test_cases = [
        ("Short password", "short_pwd"),
        ("72-byte password", "a" * 72),
        ("Long password (> 72 bytes)", "b" * 100),
        ("Very long password", "c" * 500),
    ]
    
    for name, pwd in test_cases:
        print(f"Running test: {name} (length: {len(pwd)})")
        try:
            hashed = get_password_hash(pwd)
            assert verify_password(pwd, hashed) is True, f"Verification failed for {name}"
            assert verify_password(pwd + "extra", hashed) is False, f"False positive for {name}"
            print(f"  OK: {name}")
        except ValueError as e:
            print(f"  FAILED: {name} - {e}")
            sys.exit(1)
        except Exception as e:
            print(f"  ERROR: {name} - {e}")
            sys.exit(1)

    print("\nAll tests passed successfully!")

if __name__ == "__main__":
    test_password_hashing()
