import hashlib
from django.conf import settings


SECRET_KEY = settings.SECRET_KEY

def create_hashed_code(id):
    data_to_hash = f"{str(id)}:{SECRET_KEY}"
    hashed_code = hashlib.sha256(data_to_hash.encode()).hexdigest()
    print(">> created: hashed_code: ", hashed_code)
    return hashed_code
