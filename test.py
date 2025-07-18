from collections import OrderedDict
from threading import Lock
import time
import random


class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = OrderedDict()
        self.lock = Lock()

    def put(self, key: str, value: str):
        with self.lock:
            if key in self.cache:
                print(f"[UPDATE] Key '{key}' updated. New Value: {value}")
                self.cache.move_to_end(key)
            else:
                print(f"[INSERT] Key '{key}' added. Value: {value}")
            self.cache[key] = value

            if len(self.cache) > self.capacity:
                evicted_key, evicted_value = self.cache.popitem(last=False)
                print(f"[EVICT] Capacity exceeded. Removed least recently used item: {evicted_key} -> {evicted_value}")

    def display(self):
        with self.lock:
            print("Current Cache State:")
            for key, value in self.cache.items():
                print(f"  {key}: {value}")
            print("-" * 40)


# Example usage
if __name__ == "__main__":
    cache = LRUCache(capacity=3)

    def simulate_access():
        keys = ['a', 'b', 'c', 'd', 'e']
        for _ in range(10):
            key = random.choice(keys)
            if random.random() > 0.5:
                cache.put(key, f"value_of_{key}")
            else:
                cache.get(key)
            cache.display()
            time.sleep(1)

    simulate_access()
