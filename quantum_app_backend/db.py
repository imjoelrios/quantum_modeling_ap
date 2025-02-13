import pymongo
import gridfs
import os
import configparser
import re

config = configparser.ConfigParser()
config_path = os.path.abspath(os.path.join("quantum_app_backend/.ini"))
config.read(config_path)
VARIABLES = {'tunneling': ['momentum', 'barrier', 'width'], 
             'interference': ['momentum', 'spacing', 'slit_separation']}

class MongoConnector:
    def __init__(self):
        self.client = pymongo.MongoClient(config['MONGO']['MONGO_URI'])
        self.db = self.client['models']
        self.model = ''

    def set_collection(self, model):
        self.collection = self.db[model]
        self.model = model

    def get(self, parameters):
        for param, value in parameters.items():
            if param not in VARIABLES[self.model]:
                raise ValueError(f'{param} is not a valid parameter for model {self.model}')
            if not isinstance(value, (int, float)):
                raise ValueError(f'{value} is not a valid value for parameter {param}')
        
        try:
            res = self.collection.find({'parameters': parameters})
            if res:
                document = res.sort('uploadDate', pymongo.DESCENDING).limit(1)[0]
                return document['animation'].decode('utf-8')
            else:
                return None
        except IndexError as e:
            print(e)
            return None
        
    def upload_model(self, parameters, animation):
        try:
            self.collection.insert_one({'parameters': parameters, 'animation': animation.encode('utf-8')})
        except ValueError as e:
            print(e)
            return None

def parse_parameters(filename, variables):
    pattern = r"probs_(\d+(\.\d+)?)_(\d+(\.\d+)?)_(\d+(\.\d+)?)_3D\.html"
    match = re.match(pattern, filename)
    if match:
        return dict(zip(variables, [match.group(1), match.group(3), match.group(5)])) # To change hard code if handles more variables
    else:
        raise ValueError('Filename does not match the expected pattern')

# Driver to write cache files to MongoDB
if __name__ == '__main__':
    client = pymongo.MongoClient(config['MONGO']['MONGO_URI'])
    db = client['models']
    
