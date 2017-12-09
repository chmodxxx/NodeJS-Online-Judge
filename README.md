# Node-Online-Judge
Online judge application backend written in node , ajax for small validations , minimal styling so far , and using docker containers for each submission to compile user code
# How does the compiler work 
The client can either upload file or paste his code, which is then set in a JSON object with the specified language, and other data from the database such as the time limit, then this JSON is sent to the API which will compile the code in a docker container, and send us back the results, if no error it will test STDIN & STDOUT of the challenge with the return output of the API,
for installation and more infos about the API , please check https://github.com/remoteinterview/compilebox
