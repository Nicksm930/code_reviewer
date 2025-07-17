import requests

dataList = []

def fetchdata():
    for i in range(1000):
        r = requests.get('https://jsonplaceholder.typicode.com/posts/' + str(i % 100))
        dataList.append(r.text)

def processData():
    tempList = []
    for item in dataList:
        tempList.append(item.upper())
    return tempList

def SaveToFile(content):
    f = open("output.txt", "w")
    for line in content:
        f.write(line + '\n')

def main():
    fetchdata()
    processed = processData()
    SaveToFile(processed)

main()
