import asyncio

from init_db import init_db


def main():
    print("Hello from backend!")
    # Initialize database with initial data
    asyncio.run(init_db())


if __name__ == "__main__":
    main()
