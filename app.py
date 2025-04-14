from flask import Flask, render_template, request, jsonify
import pickle
import pandas as pd

app=Flask(__name__)

pipe_lr=pickle.load(open('pipe.pkl','rb'))
pipe_rfc=pickle.load(open('pipe_rfc.pkl','rb'))

teams = ['Sunrisers Hyderabad', 'Mumbai Indians', 'Royal Challengers Bengaluru',
         'Kolkata Knight Riders', 'Punjab Kings', 'Chennai Super Kings',
         'Rajasthan Royals', 'Delhi Capitals', 'Lucknow Super Giants', 'Gujarat Titans']

cities = ['Bangalore', 'Chandigarh', 'Delhi', 'Kolkata', 'Jaipur',
          'Hyderabad', 'Chennai', 'Mumbai', 'Cape Town', 'Port Elizabeth',
          'Durban', 'Centurion', 'East London', 'Johannesburg', 'Kimberley',
          'Bloemfontein', 'Ahmedabad', 'Cuttack', 'Nagpur', 'Dharamsala',
          'Visakhapatnam', 'Pune', 'Raipur', 'Abu Dhabi', 'Ranchi',
          'Bengaluru', 'Indore', 'Dubai', 'Sharjah', 'Navi Mumbai',
          'Lucknow', 'Guwahati', 'Mohali']

@app.route('/')
def index():
    return render_template('index.html',teams=sorted(teams, reverse=True),cities=sorted(cities))

@app.route('/predict-lr',methods=['POST'])
def predict_lr():
    data=request.json
    target=int(data['target'])
    score = int(data['score'])
    overs = float(data['overs'])
    wickets_lost = int(data['wickets'])
    runs_left = target - score
    balls_left = 120 - (overs * 6)
    wickets = 10 - wickets_lost
    crr = score / overs
    rrr = (runs_left * 6) / balls_left

    input_df = pd.DataFrame({
        'batting_team': [data['batting_team']],
        'bowling_team': [data['bowling_team']],
        'city': [data['city']],
        'runs_left': [runs_left],
        'balls_left': [balls_left],
        'wickets': [wickets],
        'total_runs_x': [target],
        'crr': [crr],
        'rrr': [rrr],
    })

    result = pipe_lr.predict_proba(input_df)[0]
    return jsonify({
        'win': round(result[1] * 100),
        'loss': round(result[0] * 100)
    })

@app.route('/predict-rfc',methods=['POST'])
def predict_rfc():
    data=request.json
    target=int(data['target'])
    score = int(data['score'])
    overs = float(data['overs'])
    wickets_lost = int(data['wickets'])
    runs_left = target - score
    balls_left = 120 - (overs * 6)
    wickets = 10 - wickets_lost
    crr = score / overs
    rrr = (runs_left * 6) / balls_left

    input_df = pd.DataFrame({
        'batting_team': [data['batting_team']],
        'bowling_team': [data['bowling_team']],
        'city': [data['city']],
        'runs_left': [runs_left],
        'balls_left': [balls_left],
        'wickets': [wickets],
        'total_runs_x': [target],
        'crr': [crr],
        'rrr': [rrr],
    })

    result = pipe_rfc.predict_proba(input_df)[0]
    return jsonify({
        'win': round(result[1] * 100),
        'loss': round(result[0] * 100)
    })

if __name__ == '__main__':
    app.run(debug=True)