import sys
import os
import cv2
import numpy as np
import face_recognition
from PyQt5 import QtCore, QtGui, QtWidgets
from PyQt5.QtCore import QTimer, QThread, pyqtSignal
from PyQt5.QtGui import QImage, QPixmap
import time
import subprocess
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
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
import requests
from PIL import Image
import io
import base64
import textwrap
import subprocess

# Gemini AI Configuration
genai.configure(api_key="AIzaSyCjGZozlCwigt4S4Zn7kvuGMXDLyyFEAxI")
model = genai.GenerativeModel('gemini-1.5-flash')
image_model = genai.GenerativeModel('gemini-pro')

# Initialize text-to-speech engine
engine = pyttsx3.init()
voices = engine.getProperty('voices')
engine.setProperty('voice', voices[1].id)
engine.setProperty('rate', 180)

def speak(audio):
    engine.say(audio)
    engine.runAndWait()
class FaceAuthenticationWindow(QtWidgets.QMainWindow):
    def __init__(self, reference_image_path="face_reference.jpg"):
        super().__init__()
        self.reference_image_path = reference_image_path
        self.initUI()
        
    def initUI(self):
        self.setWindowTitle('JARVIS Security System')
        self.setGeometry(100, 100, 800, 600)
        self.setStyleSheet("background-color: #1E1E1E;")
        
        # Set window icon
        self.setWindowIcon(QtGui.QIcon("jarvis_icon.png"))
        
        # Central widget
        central_widget = QtWidgets.QWidget()
        self.setCentralWidget(central_widget)
        
        # Main layout
        main_layout = QtWidgets.QVBoxLayout(central_widget)
        main_layout.setContentsMargins(20, 20, 20, 20)
        
        # Title label
        title_label = QtWidgets.QLabel("JARVIS SECURITY AUTHENTICATION")
        title_label.setAlignment(QtCore.Qt.AlignCenter)
        title_label.setStyleSheet("color: #00A9F4; font-size: 24px; font-weight: bold; margin-bottom: 10px;")
        main_layout.addWidget(title_label)
        
        # Video frame with border
        video_frame = QtWidgets.QFrame()
        video_frame.setFrameShape(QtWidgets.QFrame.StyledPanel)
        video_frame.setStyleSheet("border: 2px solid #00A9F4; border-radius: 10px; padding: 5px; background-color: #2D2D30;")
        video_layout = QtWidgets.QVBoxLayout(video_frame)
        
        # Video display label
        self.video_label = QtWidgets.QLabel()
        self.video_label.setMinimumSize(700, 450)
        self.video_label.setAlignment(QtCore.Qt.AlignCenter)
        self.video_label.setStyleSheet("border: none;")
        video_layout.addWidget(self.video_label)
        
        main_layout.addWidget(video_frame)
        
        # Status label
        self.status_label = QtWidgets.QLabel("Initializing facial recognition system...")
        self.status_label.setStyleSheet("font-size: 18px; color: #00A9F4; margin-top: 10px;")
        self.status_label.setAlignment(QtCore.Qt.AlignCenter)
        main_layout.addWidget(self.status_label)
        
        # Start face recognition with voice prompt
        speak("Initializing security systems")
        QTimer.singleShot(1500, self.start_face_recognition)
    
    def start_face_recognition(self):
        speak("Beginning facial authentication")
        self.status_label.setText("Looking for your face...")
        # Create and start the face recognition thread
        self.face_thread = FaceRecognitionThread(self.reference_image_path)
        self.face_thread.update_frame.connect(self.update_frame)
        self.face_thread.authentication_result.connect(self.handle_authentication)
        self.face_thread.start()
    
    def update_frame(self, qt_image):
        pixmap = QPixmap.fromImage(qt_image)
        self.video_label.setPixmap(pixmap.scaled(self.video_label.width(), self.video_label.height(), QtCore.Qt.KeepAspectRatio))
    
    def handle_authentication(self, success):
        if success:
            self.status_label.setText("Authentication Successful! Launching JARVIS...")
            self.status_label.setStyleSheet("font-size: 18px; color: #00FF00; margin-top: 10px;")
            # Wait a moment to display the success message
            QTimer.singleShot(2000, self.launch_jarvis)
        else:
            self.status_label.setText("Authentication Failed! Access Denied.")
            self.status_label.setStyleSheet("font-size: 18px; color: #FF0000; margin-top: 10px;")
            # Wait a moment and then close the application
            QTimer.singleShot(3000, self.close)
    
    def launch_jarvis(self):
        # Close the authentication window
        self.close()
        # Launch the Jarvis application
        subprocess.Popen(["python", "final copy 2.py"])
    
    def closeEvent(self, event):
        # Stop the face recognition thread when closing the window
        if hasattr(self, 'face_thread'):
            self.face_thread.stop()
        event.accept()

class FaceRecognitionThread(QThread):
    update_frame = pyqtSignal(QImage)
    authentication_result = pyqtSignal(bool)
    
    def __init__(self, reference_image_path="face_reference.jpg"):
        super().__init__()
        self.reference_image_path = reference_image_path
        self.running = True
        
    def run(self):
        # Load reference image and encode it
        reference_image = face_recognition.load_image_file(self.reference_image_path)
        reference_encodings = face_recognition.face_encodings(reference_image)
        
        if len(reference_encodings) == 0:
            print("No face found in reference image.")
            self.authentication_result.emit(False)
            return
        
        reference_encoding = reference_encodings[0]
        
        # Access webcam
        cap = cv2.VideoCapture(1)
        if not cap.isOpened():
            print("Cannot open camera")
            self.authentication_result.emit(False)
            return
        
        face_detected_frames = 0
        required_frames = 10  # Require 10 matching frames to authenticate
        attempts = 0
        max_attempts = 100  # About 10 seconds of attempts
        
        while self.running and attempts < max_attempts:
            ret, frame = cap.read()
            if not ret:
                print("Can't receive frame. Exiting...")
                break
            
            # Convert frame to RGB for face recognition
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Detect face locations and encodings
            face_locations = face_recognition.face_locations(rgb_frame)
            face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
            
            for face_encoding in face_encodings:
                match = face_recognition.compare_faces([reference_encoding], face_encoding, tolerance=0.5)
                if match[0]:
                    face_detected_frames += 1
                else:
                    face_detected_frames = max(0, face_detected_frames - 1)
            
            # Authenticate after required frames
            if face_detected_frames >= required_frames:
                self.authentication_result.emit(True)
                cap.release()
                return
            
            attempts += 1
            time.sleep(0.1)
        
        cap.release()
        self.authentication_result.emit(False)

    def stop(self):
        self.running = False
        self.wait()

if __name__ == "__main__":
    app = QtWidgets.QApplication(sys.argv)
    window = FaceAuthenticationWindow()
    window.show()
    sys.exit(app.exec_())
