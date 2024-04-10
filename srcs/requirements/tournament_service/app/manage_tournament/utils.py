import hashlib

SECRET_KEY = settings.SECRET_KEY

def create_hashed_code(id):
    data_to_hash = f"{id}:{SECRET_KEY}"
    hashed_code = hashlib.sha256(data_to_hash.encode()).hexdigest()

    return hashed_code
