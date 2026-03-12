import sys
import pyttsx3
import speech_recognition as sr
import random
import webbrowser
import datetime
from datetime import datetime
from plyer import notification
import pyautogui
import wikipedia
import pywhatkit as pwk
import google.generativeai as genai
from PyQt5 import QtCore, QtGui, QtWidgets
from PyQt5.QtCore import QThread
import os
# Gemini AI Configuration
genai.configure(api_key="AIzaSyCjGZozlCwigt4S4Zn7kvuGMXDLyyFEAxI")
model = genai.GenerativeModel('gemini-1.5-flash')

# Initialize Text-to-Speech
engine = pyttsx3.init()
voices = engine.getProperty('voices')
engine.setProperty('voice', voices[1].id)
engine.setProperty('rate', 180)

def speak(audio):
    engine.say(audio)
    engine.runAndWait()

def load_history():
    try:
        with open("conversation_history.txt", "r") as file:
            return file.read()
    except FileNotFoundError:
        return ""

def save_history(user_input, ai_response):
    with open("conversation_history.txt", "a") as file:
        file.write(f"User: {user_input}\nAI: {ai_response}\n\n")

def clear_history():
    open("conversation_history.txt", "w").close()
    speak("Conversation history has been cleared.")

def command():
    r = sr.Recognizer()
    with sr.Microphone() as source:
        print("Listening...")
        audio = r.listen(source)
    try:
        content = r.recognize_google(audio, language='en-in')
        print("You said:", content)
        return content.lower()
    except Exception:
        speak("Please try again")
        return ""

def gemini_response(query):
    try:
        past_conversation = load_history()
        prompt = f"Previous conversation:\n{past_conversation}\nUser: {query}\nResponse:"
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return "I am sorry, I could not process that."

class JarvisThread(QThread):
    update_signal = QtCore.pyqtSignal(str)

    def run(self):
        speak("Hello, I am Jarvis. How can I help you?")
        while True:
            request = command()
            now = datetime.now()
            send_time_hour = now.hour
            send_time_minute = now.minute + 1
            
            if "stop" in request:
                self.update_signal.emit("Jarvis stopped.")
                break
            elif "what's the time" in request:
                t = now.strftime("%H:%M")
                speak("Current time: " + t)
            elif "what's the date" in request:
                t = now.strftime("%d-%m-%Y")
                speak("Current date: " + t)
            elif "new task" in request:
                task = request.replace("new task", "").strip()
                if task:
                    with open("todo.txt", "a") as file:
                        file.write(task + "\n")
                    speak("Task added: " + task)
            elif "introduce yourself"  in request:
               ppt_file = "Presentation1.pptx"  # Change this to your actual file name
               if os.path.exists(ppt_file):
                    speak(f"SURE let me open this just to make you easy to understand myself ")
                    os.startfile(ppt_file)  # Open the PPT file
                    speak("Hello! I am Jarvis, your personal AI assistant, designed to make your digital experience seamless and efficient. Developed by Viraj Shinde, Vedant Surve, Shwet Kadam, and Saheem Nakhwa, I am here to handle all your PC tasks with just your voice.From opening applications, searching the web, and playing your favorite music to managing task lists and sending WhatsApp messages, I do it all. I also provide real-time updates on weather, stock market trends, and much more. And for intelligent, dynamic conversations, I am powered by Gemini AI, ensuring that no query goes unanswered.Your commands drive my actions, making your workflow smarter and faster. So, what can I do for you today?")
               else:
                    speak("PowerPoint file not found in the code directory.")

            elif "tell my task" in request:
                with open("todo.txt", "r") as file:
                    speak("Today's tasks: " + file.read())
            elif "show my task" in request:
                with open("todo.txt", "r") as file:
                    tasks = file.read()
                    notification.notify(title="Today's Tasks", message=tasks)
            elif "open youtube" in request:
                webbrowser.open("www.youtube.com")
            elif "play " in request:
                song_name = request.replace("jarvis play ", "").strip()
                if song_name:
                    speak(f"Playing {song_name} on YouTube")
                    pwk.playonyt(song_name)
                else:
                     speak("Please specify a song name.")

            elif "open" in request:
                query = request.replace("jarvis open", "").strip()
                speak("opening {query}")
                pyautogui.press("super")
                pyautogui.typewrite(query)
                pyautogui.sleep(1)
                pyautogui.press("enter")
            elif "take screenshot" in request:
                speak("Taking screenshot")
                pyautogui.screenshot("my_screenshot.png")
            elif "wikipedia" in request:
                search_query = request.replace("jarvis search wikipedia about", "").strip()
                result = wikipedia.summary(search_query, sentences=3)
                
                speak("searching wikipedia about {search_query}")
                self.update_signal.emit(result)
                speak(result)
            elif "search google" in request:
                search_query = request.replace("jarvis search google about ", "").strip()
                speak("searching google")
                webbrowser.open(f"https://www.google.com/search?q={search_query}")
            elif "send whatsapp" in request:
                pwk.sendwhatmsg("+918308352443", "Hi, I am sending this message.", send_time_hour, send_time_minute)
                speak("Sending message")
            
            elif "show history" in request:
                history = load_history()
                speak("Reading conversation history.")
                speak(history)
            elif "clear history" in request:
                clear_history()
            else:
                response = gemini_response(request)
                self.update_signal.emit(f"You: {request}\nJarvis: {response}")
                speak(response)
                save_history(request, response)

class Ui_MainWindow(object):
    def setupUi(self, MainWindow):
        MainWindow.setObjectName("MainWindow")
        MainWindow.resize(1317, 806)
        self.centralwidget = QtWidgets.QWidget(MainWindow)
        self.label = QtWidgets.QLabel(self.centralwidget)
        self.label.setGeometry(QtCore.QRect(0, -60, 1341, 851))
        self.label.setPixmap(QtGui.QPixmap("gui.gif"))
        self.label.setScaledContents(True)
        self.textBrowser_2 = QtWidgets.QTextBrowser(self.centralwidget)
        self.textBrowser_2.setGeometry(QtCore.QRect(530, 251, 471, 361))
        self.pushButton_2 = QtWidgets.QPushButton("RUN", self.centralwidget)
        self.pushButton_2.setGeometry(QtCore.QRect(530, 640, 101, 31))
        self.pushButton_3 = QtWidgets.QPushButton("STOP", self.centralwidget)
        self.pushButton_3.setGeometry(QtCore.QRect(900, 640, 101, 31))
        self.textBrowser_3 = QtWidgets.QTextBrowser(self.centralwidget)
        self.textBrowser_3.setGeometry(QtCore.QRect(140, 10, 191, 31))
        self.textBrowser_3.setStyleSheet("background:transparent;")
        self.textBrowser_4 = QtWidgets.QTextBrowser(self.centralwidget)
        self.textBrowser_4.setGeometry(QtCore.QRect(1070, 10, 191, 31))
        self.textBrowser_4.setStyleSheet("background:transparent;")
        MainWindow.setCentralWidget(self.centralwidget)
        self.pushButton_2.clicked.connect(self.start_jarvis)
        self.pushButton_3.clicked.connect(self.stop_jarvis)
        self.timer = QtCore.QTimer()
        self.timer.timeout.connect(self.update_time)
        self.timer.start(1000)
        self.jarvis_thread = None
    
    def update_time(self):
        self.textBrowser_3.setText(datetime.now().strftime("%H:%M:%S"))
        self.textBrowser_4.setText(datetime.now().strftime("%d-%m-%Y"))
    
    def start_jarvis(self):
        self.textBrowser_2.append("Jarvis started...")
        self.jarvis_thread = JarvisThread()
        self.jarvis_thread.update_signal.connect(self.textBrowser_2.append)
        self.jarvis_thread.start()
    
    def stop_jarvis(self):
        if self.jarvis_thread:
            self.jarvis_thread.terminate()
        speak("Shutting down")
        QtWidgets.qApp.quit()

if __name__ == "__main__":
    app = QtWidgets.QApplication(sys.argv)
    MainWindow = QtWidgets.QMainWindow()
    ui = Ui_MainWindow()
    ui.setupUi(MainWindow)
    MainWindow.show()
    sys.exit(app.exec_())