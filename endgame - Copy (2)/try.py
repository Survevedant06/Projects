`                                                                                                                                                               from PyQt5 import QtCore, QtGui, QtWidgets

class Ui_MainWindow(object):
    def setupUi(self, MainWindow):
        MainWindow.setObjectName("MainWindow")
        MainWindow.resize(1317, 806)
        self.centralwidget = QtWidgets.QWidget(MainWindow)

        # Background GIF
        self.label = QtWidgets.QLabel(self.centralwidget)
        self.label.setGeometry(QtCore.QRect(0, -60, 1341, 851))
        self.movie = QtGui.QMovie("gui.gif")  # Ensure gui.gif is in the same folder
        self.label.setMovie(self.movie)
        self.movie.start()
        self.label.setScaledContents(True)

        # Chat display area
        self.textBrowser_2 = QtWidgets.QTextBrowser(self.centralwidget)
        self.textBrowser_2.setGeometry(QtCore.QRect(530, 251, 471, 361))
        self.textBrowser_2.setStyleSheet("""
            background: transparent;
            color: #00FF00;  /* Green text for visibility */
            font-size: 16px;
            border: none;  /* Removes border */
            padding: 5px;
            font-family: Arial, sans-serif;
            text-align: center;
        """)
        self.textBrowser_2.setAlignment(QtCore.Qt.AlignCenter)  # Center text

        # RUN and STOP buttons aligned horizontally
        self.pushButton_2 = QtWidgets.QPushButton("RUN", self.centralwidget)
        self.pushButton_2.setGeometry(QtCore.QRect(650, 640, 130, 40))  # Adjusted position
        self.pushButton_2.setStyleSheet("""
            QPushButton {
                background-color: #28a745;
                color: white;
                font-size: 16px;
                font-weight: bold;
                border-radius: 10px;
                border: 2px solid #218838;
            }
            QPushButton:hover {
                background-color: #218838;
            }
            QPushButton:pressed {
                background-color: #1e7e34;
            }
        """)

        self.pushButton_3 = QtWidgets.QPushButton("STOP", self.centralwidget)
        self.pushButton_3.setGeometry(QtCore.QRect(800, 640, 130, 40))  # Slightly right to RUN button
        self.pushButton_3.setStyleSheet("""
            QPushButton {
                background-color: #dc3545;
                color: white;
                font-size: 16px;
                font-weight: bold;
                border-radius: 10px;
                border: 2px solid #c82333;
            }
            QPushButton:hover {
                background-color: #c82333;
            }
            QPushButton:pressed {
                background-color: #a71d2a;
            }
        """)

        # Transparent top text areas (Time and Date display)
        self.textBrowser_3 = QtWidgets.QTextBrowser(self.centralwidget)
        self.textBrowser_3.setGeometry(QtCore.QRect(140, 10, 191, 31))
        self.textBrowser_3.setStyleSheet("background:transparent; border: none; color: white; font-size: 14px;")
        self.textBrowser_3.setAlignment(QtCore.Qt.AlignCenter)  # Left side for time

        self.textBrowser_4 = QtWidgets.QTextBrowser(self.centralwidget)
        self.textBrowser_4.setGeometry(QtCore.QRect(1070, 10, 191, 31))
        self.textBrowser_4.setStyleSheet("background:transparent; border: none; color: white; font-size: 14px;")
        self.textBrowser_4.setAlignment(QtCore.Qt.AlignCenter)  # Right side for date

        MainWindow.setCentralWidget(self.centralwidget)

        # Button functionality
        self.pushButton_2.clicked.connect(self.start_jarvis)
        self.pushButton_3.clicked.connect(self.stop_jarvis)

        # Timer for updating time and date
        self.timer = QtCore.QTimer()
        self.timer.timeout.connect(self.update_time)
        self.timer.start(1000)

    def start_jarvis(self):
        self.textBrowser_2.append("Jarvis Started...")

    def stop_jarvis(self):
        self.textBrowser_2.append("Jarvis Stopped.")

    def update_time(self):
        current_time = QtCore.QTime.currentTime().toString("hh:mm:ss")
        current_date = QtCore.QDate.currentDate().toString("dddd, dd MMMM yyyy")
        self.textBrowser_3.setText(current_time)  # Updating time on left
        self.textBrowser_4.setText(current_date)  # Updating date on right

if __name__ == "__main__":
    import sys
    app = QtWidgets.QApplication(sys.argv)
    MainWindow = QtWidgets.QMainWindow()
    ui = Ui_MainWindow()
    ui.setupUi(MainWindow)
    MainWindow.show()
    sys.exit(app.exec_())