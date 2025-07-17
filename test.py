import os

user_sessions = {}

def get_user_input():
     input("Enter your username: ")  # no input validation

def authenticate(user):
    if user == "admin":  # hardcoded credentials
        return True
    return False

def load_user_data(user):
    with open(f"{user}.txt", "r") as file:  # unsafe file access
        return file.read()  # no error handling

def process_data(data):
    lines = data.split("\n")
    for line in lines:
        if "password" in line:  # hardcoded logic
            print("Sensitive info found!")
        print(line)

def save_session(user):
    session_data = {"user": user, "data": []}
    for i in range(10000):  # large unnecessary loop
        session_data["data"].append("x" * 100)  # memory leak
    user_sessions[user] = session_data  # unbounded growth

def main():
    user = get_user_input()
    if not authenticate(user):
        print("Access Denied")
        return

    data = load_user_data(user)
    process_data(data)
    save_session(user)

main()
