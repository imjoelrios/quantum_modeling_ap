import flask
from flask import Flask, jsonify
from flask_restx import Api
from flask_cors import CORS
from model_generators.tunneling import Wave_Packet3D as t_wp, Animator3D as t_ani
from model_generators.interference import Wave_Packet3D as i_wp, Animator3D as i_ani
from model_generators.Qgate1 import Qgate1
import matplotlib.pyplot as plt
import time
from db import MongoConnector

#set swagger info
api: Api = Api(
    title='quantum_modeling',
    version='1.0',
    description='v1.0',
    prefix='/v1'
)

app = Flask(__name__)
api.init_app(app)
CORS(app, resources={r"/*": {"origins": "*"}})
mongo = MongoConnector()

@app.route('/receive_data/tunneling/<barrier>/<width>/<momentum>', methods=['GET'])
def Qtunneling(barrier, width, momentum):
    print("You evoked the tunneling API successfully")
    
    barrier = float(barrier)
    width = float(width)
    momentum = float(momentum)

    mongo.set_collection('tunneling')

    parameters = {'momentum': momentum, 'barrier': barrier, 'width': width}

    tunneling_model = mongo.get(parameters)
    if tunneling_model:
        return tunneling_model
    else:
        return jsonify({'error': 'Model not found'}), 404


@app.route('/receive_data/interference/<spacing>/<slit_separation>/<int:momentum>', methods=['GET'])
def Qinterference(spacing, slit_separation, momentum):
    print("You evoked the interference API successfully")

    momentum = float(momentum)
    spacing = float(spacing)
    slit_separation = float(slit_separation)

    mongo.set_collection('interference')
    
    parameters = {'momentum': momentum, 'spacing': spacing, 'slit_separation': slit_separation}
    interference_model = mongo.get(parameters)
    if interference_model:
        return interference_model
    else:
        return jsonify({'error': 'Model not found'}), 404

@app.route('/receive_data/evotrace/<int:gate>/<int:init_state>/<int:mag>/<t2>', methods=['GET'])
def Qtrace(gate, init_state, mag, t2):
    t2 = float(t2)
    print("You evoked the API successfully")
    plt.close('all')
    plt.switch_backend('Agg')

    start_time = time.time()  # Record the start time
    qg = Qgate1()
    qg.run(gate=gate, init_state=init_state, mag_f_B=mag, t2=t2)
    GifRes = qg.plot_evo()
    
    end_time = time.time()  # Record the end time
    elapsed_time = end_time - start_time
    print(f"Elapsed 3D generator time: {elapsed_time} seconds")

    return {'GifRes': GifRes}
    
if __name__ == '__main__':
    app.debug = True
    #run backend server at port 3001
    app.run(host="0.0.0.0", port=3001, threaded=False, debug=True)