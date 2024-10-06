from dotenv import load_dotenv
from flask import Flask, redirect, url_for, make_response, request, current_app, session, abort, Response
import json
import os
import secrets
import requests
from urllib.parse import urlencode
from datetime import datetime
import calendar
import jsonify

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'top secret!'
app.config['OAUTH2_PROVIDERS'] = {
    'google': {
        'client_id': os.environ.get('GOOGLE_CLIENT_ID'),
        'client_secret': os.environ.get('GOOGLE_CLIENT_SECRET'),
        'authorize_url': 'https://accounts.google.com/o/oauth2/auth',
        'token_url': 'https://accounts.google.com/o/oauth2/token',
        'userinfo': {
            'url': 'https://www.googleapis.com/oauth2/v3/userinfo',
            'email': lambda json: json['email'],
        },
        'scopes': ['https://www.googleapis.com/auth/userinfo.email'],
    },
    'github': {
        'client_id': os.environ.get('GITHUB_CLIENT_ID'),
        'client_secret': os.environ.get('GITHUB_CLIENT_SECRET'),
        'authorize_url': 'https://github.com/login/oauth/authorize',
        'token_url': 'https://github.com/login/oauth/access_token',
        'userinfo': {
            'url': 'https://api.github.com/user/emails',
            'email': lambda json: json[0]['email'],
        },
        'scopes': ['user:email', 'repo'],
    },
}

@app.route('/')
def index():
    return "Welcome to the index page!"

@app.route('/authorize/<provider>')
def oauth2_authorize(provider):
    print(f"Received request to verify OAuth2 for {provider}")

    provider_data = current_app.config['OAUTH2_PROVIDERS'].get(provider)
    if provider_data is None:
        abort(404)

    session['oauth2_state'] = secrets.token_urlsafe(16)
    
    print(url_for('oauth2_callback', provider=provider, _external=True))

    qs = urlencode({
        'client_id': provider_data['client_id'],
        'redirect_uri': url_for('oauth2_callback', provider=provider, _external=True),
        'response_type': 'code',
        'scope': ' '.join(provider_data['scopes']),
        'state': session['oauth2_state'],
    })

    return redirect(provider_data['authorize_url'] + '?' + qs)

from flask import render_template

@app.route('/callback/<provider>')
def oauth2_callback(provider):
    print(f"OAuth2 callback for {provider}")

    provider_data = current_app.config['OAUTH2_PROVIDERS'].get(provider)
    if provider_data is None:
        abort(404)

    if 'error' in request.args:
        for k, v in request.args.items():
            if k.startswith('error'):
                flash(f'{k}: {v}')
                print(f"OAuth2 error: {k}: {v}")
        return redirect(url_for('index'))

    if request.args['state'] != session.get('oauth2_state'):
        abort(401)

    if 'code' not in request.args:
        abort(401)

    response = requests.post(provider_data['token_url'], data={
        'client_id': provider_data['client_id'],
        'client_secret': provider_data['client_secret'],
        'code': request.args['code'],
        'grant_type': 'authorization_code',
        'redirect_uri': url_for('oauth2_callback', provider=provider, _external=True),
    }, headers={'Accept': 'application/json'})
    
    if response.status_code != 200:
        abort(401)
    
    oauth2_token = response.json().get('access_token')
    if not oauth2_token:
        abort(401)

    response = requests.get(provider_data['userinfo']['url'], headers={
        'Authorization': 'Bearer ' + oauth2_token,
        'Accept': 'application/json',
    })
    
    if response.status_code != 200:
        abort(401)
    
    email = provider_data['userinfo']['email'](response.json())
    print(f"OAuth2 callback successful, email: {email}")

    user_cookie_name = f'{provider}_user'
    user_info = request.cookies.get(user_cookie_name)

    if user_info:
        print(f"User found in cookies: {user_info}")
    else:
        print("No user found in cookies, setting a new one.")
        user_data = {
            'email': email,
            'provider': provider,
            'access_token': oauth2_token
        }
        response = make_response(render_template('callback.html', success=True))
        response.set_cookie(user_cookie_name, json.dumps(user_data), max_age=60*60*24*30)
        return response

    return render_template('callback.html', success=True)

@app.route('/get_commits', methods=['GET'])
def get_commits():
    # Get the GitHub OAuth2 token from the cookie
    github_user_cookie = request.cookies.get('github_user')

    if not github_user_cookie:
        return Response(json.dumps({'error': 'GitHub user not authenticated'}), status=401, mimetype='application/json')

    github_user_data = json.loads(github_user_cookie)
    access_token = github_user_data.get('access_token')

    if not access_token:
        return Response(json.dumps({'error': 'Access token not found in cookie'}), status=401, mimetype='application/json')

    # Hardcoded date range for this week (9th Sept 2024 to 15th Sept 2024)
    start_date = "2024-09-09T00:00:00Z"
    end_date = "2024-09-15T23:59:59Z"

    # Fetch the user's repositories (including private repos) from GitHub
    repos_url = "https://api.github.com/user/repos"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.github.v3+json"
    }

    repos_response = requests.get(repos_url, headers=headers)

    if repos_response.status_code != 200:
        return Response(json.dumps({'error': 'Failed to fetch repositories from GitHub'}), status=repos_response.status_code, mimetype='application/json')

    repos = repos_response.json()
    all_commits = {}

    # Fetch commits for each repository and its branches for the given date range
    for repo in repos:
        repo_name = repo['name']
        owner_login = repo['owner']['login']
        branches_url = f"https://api.github.com/repos/{owner_login}/{repo_name}/branches"

        branches_response = requests.get(branches_url, headers=headers)
        if branches_response.status_code != 200:
            print(f"Error fetching branches for repo {repo_name}: {branches_response.text}")
            continue

        branches = branches_response.json()
        branch_commits_dict = {}

        for branch in branches:
            branch_name = branch['name']
            commits_url = f"https://api.github.com/repos/{owner_login}/{repo_name}/commits"
            params = {
                "sha": branch_name,  # Specify branch name in the `sha` param to fetch commits for that branch
                "since": start_date,
                "until": end_date
            }

            commits_response = requests.get(commits_url, headers=headers, params=params)
            if commits_response.status_code == 200:
                branch_commits = commits_response.json()
                if branch_commits:  # Only add if branch has commits
                    commit_info_list = []
                    for commit in branch_commits:
                        commit_info_list.append({
                            'commit_name': commit['commit']['message'],
                            'commit_hash': commit['sha'],
                            'commit_link': commit['html_url']
                        })
                    branch_commits_dict[branch_name] = commit_info_list
                else:
                    continue

        if branch_commits_dict:  # Only add the repository if it has branches with commits
            all_commits[repo_name] = branch_commits_dict
        else:
            continue

    if not all_commits:
        return Response(json.dumps({'message': 'No commits found for the given week'}), status=200, mimetype='application/json')

    return Response(json.dumps(all_commits), status=200, mimetype='application/json')

@app.route('/last_three_months', methods=['GET'])
def last_three_months():
    today = datetime.today()
    months = []
    
    for i in range(1, 4):
        year = today.year
        month = today.month - i
        
        if month <= 0:
            month += 12
            year -= 1
        
        month_name = calendar.month_name[month]
        months.append(f"{month_name} {year}")
    
    return Response(json.dumps(months), mimetype='application/json')

# Private - debugs
@app.route('/private/reset')
def reset():
    resp = make_response("Cookie Deleted")
    resp.set_cookie('github_user', '', expires=0)
    return resp, 200

@app.route('/private/setup')
def setup():
    cookie_value = request.cookies.get('github_user')
    if cookie_value:
        return f"Cookie found: {cookie_value}", 200
    else:
        return "Cookie not found", 404

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)


