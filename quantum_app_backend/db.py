import pymongo
import gridfs
import os
import configparser
from collections import deque
import re

config = configparser.ConfigParser()
config_path = os.path.abspath(os.path.join("quantum_app_backend/.ini"))
config.read(config_path)
VARIABLES = {'tunneling': ['momentum', 'barrier', 'width'], 'interference': ['momentum', 'spacing', 'slit_separation']}

# Create a gridfs instance from a mongodb instance
class MongoGridFS:
    def __init__(self):
        self.client = pymongo.MongoClient(config['MONGO']['MONGO_URI'])
        self.db = self.client['models']
        self.tunneling_fs = gridfs.GridFSBucket(self.db, bucket_name='tunneling')
        self.interference_fs = gridfs.GridFSBucket(self.db, bucket_name='interference')
        self.tunneling_cache = deque()
        self.interference_cache = deque()

    def get_tunneling(self, barrier, width, momentum):
        # Read tunneling models from MongoDB using GridFS
        try:
            model = self.tunneling_fs.find({'filename':f'probs_{momentum}_{barrier}_{width}_3D.html'})
            if model:
                return model.sort('uploadDate', pymongo.DESCENDING).limit(1)[0]
        except IndexError as e:
            print(e)
            return None

    def get_interference(self, momentum, spacing, slit_separation):
        # Read interference models from MongoDB using GridFS
        try:
            model = self.interference_fs.find({'filename':f'probs_{momentum}_{spacing}_{slit_separation}_3D.html'})
            if model:
                return model.sort('uploadDate', pymongo.DESCENDING).limit(1)[0]
        except IndexError as e:
            print(e)
            return None

def extract_metadata(filename, variables):
    pattern = r"probs_(\d+(\.\d+)?)_(\d+(\.\d+)?)_(\d+(\.\d+)?)_3D\.html"
    match = re.match(pattern, filename)
    if match:
        return dict(zip(variables, [match.group(1), match.group(3), match.group(5)])) # To change hard code if handles more variables
    else:
        raise ValueError('Filename does not match the expected pattern')

def add_model(db, model_name, model_vars):
    bucket = gridfs.GridFSBucket(db, bucket_name=model_name)
    try:
        # Write all tunneling models from ./cache/tunneling to MongoDB using GridFS
        path = f"quantum_app_backend/cache/{model_name}"
        for file in os.listdir(path):
            print(f'{file}')
            try:
                dup = bucket.find({'filename': file}).sort('uploadDate', pymongo.DESCENDING)
                for old_file in dup:
                    print(f'Removing old {model_name} file')
                    bucket.delete(old_file._id)
            except gridfs.errors.NoFile:
                dup = None
            with open(f'{path}/{file}', 'rb') as f:
                print(f'Adding {model_name} file')
                metadata = extract_metadata(file, model_vars)
                bucket.upload_from_stream(file, f, metadata=metadata)
    except ValueError as e:
        return e

# Driver to write cache files to MongoDB
if __name__ == '__main__':
    client = pymongo.MongoClient(config['MONGO']['MONGO_URI'])
    db = client['models']
    for model, variables in VARIABLES.items():
        add_model(db, model, variables)